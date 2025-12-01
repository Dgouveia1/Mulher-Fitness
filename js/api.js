/* --- SUPABASE & API CONFIG --- */
import { CONFIG } from './config.js';

const { createClient } = window.supabase;
export const supabaseClient = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);

// --- STORE PATTERN (State Management) ---
class Store {
    constructor() {
        this.state = {
            user: null,
            profile: null,
            data: {
                appointments: [],
                messages: [],
                clients: [],
                holidays: CONFIG.HOLIDAYS
            },
            ui: {
                loading: false,
                lastFetch: 0
            }
        };
        this.listeners = [];
    }

    get() {
        return this.state;
    }

    set(updater) {
        const oldState = { ...this.state };
        if (typeof updater === 'function') {
            this.state = updater(this.state);
        } else {
            this.state = { ...this.state, ...updater };
        }
        this.notify(oldState);
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify(oldState) {
        this.listeners.forEach(l => l(this.state, oldState));
    }
}

export const appStore = new Store();
export const State = appStore.state;

// --- API WRAPPER & ERROR HANDLING ---
export const API = {
    async logAction(action, details = {}) {
        const user = appStore.get().user;
        if (!user) return;

        supabaseClient.from('audit_logs').insert({
            user_id: user.id,
            user_email: user.email,
            action: action,
            details: details
        }).then(({ error }) => {
            if (error) console.warn('[API] Log warning:', error.message);
        });
    },

    // Auxiliar para converter formato Time (HH:MM:SS) para Minutos (Int)
    parseDurationToMinutes(timeStr) {
        if (!timeStr) return 60; // Padrão
        try {
            const [h, m] = timeStr.split(':').map(Number);
            return (h * 60) + m;
        } catch (e) {
            return 60;
        }
    },

    // Auxiliar para converter Minutos (Int) para Time (HH:MM:00)
    formatMinutesToTime(minutes) {
        const m = parseInt(minutes);
        if (isNaN(m)) return '01:00:00';
        
        const hours = Math.floor(m / 60);
        const mins = m % 60;
        
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
    },

    async fetchAppointments(force = false) {
        const now = Date.now();
        const { ui } = appStore.get();

        if (!force && (now - ui.lastFetch < 60000)) {
            console.log('[API] Using cached appointments');
            return true;
        }

        console.log('[API] Fetching appointments...');
        appStore.set(s => ({ ...s, ui: { ...s.ui, loading: true } }));

        try {
            const { data, error } = await supabaseClient.from('appointments').select('*').limit(1000);
            if (error) throw error;

            // [CORREÇÃO] Normalização dos dados vindos do banco
            const normalizedData = data.map(app => ({
                ...app,
                // Mapeia a coluna 'telefone' para 'client_phone' usado na aplicação
                client_phone: app.telefone || app.client_phone || '', 
                // Converte o formato TIME (01:00:00) do banco para INT (60) da aplicação
                duration: this.parseDurationToMinutes(app.duration)
            }));

            appStore.set(s => ({
                ...s,
                data: { ...s.data, appointments: normalizedData },
                ui: { ...s.ui, loading: false, lastFetch: now }
            }));
            return true;
        } catch (error) {
            console.error('[API] Error fetching appointments:', error);
            showToast('Erro ao carregar agendamentos.', 'error');
            appStore.set(s => ({ ...s, ui: { ...s.ui, loading: false } }));
            return false;
        }
    },

    async fetchClients() {
        try {
            const { data, error } = await supabaseClient.from('clients').select('*').order('name', { ascending: true });
            
            if (error) {
                // Silencia erro se a tabela não existir ainda, para não travar o app
                console.warn('[API] Info: Tabela de clientes indisponível ou vazia.'); 
                return;
            }

            if (data) {
                appStore.set(s => ({
                    ...s,
                    data: { ...s.data, clients: data }
                }));
            }
        } catch (error) {
            console.warn('[API] Erro fetch clients:', error);
        }
    },

    async syncClientData(clientData) {
        if (!clientData.name) return;

        try {
            // Verifica se a tabela existe tentando um select simples primeiro
            const { error: checkError } = await supabaseClient.from('clients').select('id').limit(1);
            if (checkError && checkError.code === '42P01') return; // Tabela não existe

            const { data: existingClients } = await supabaseClient
                .from('clients')
                .select('id')
                .ilike('name', clientData.name)
                .limit(1);

            const payload = {
                name: clientData.name,
                phone: clientData.phone,
                last_visit: new Date().toISOString().split('T')[0]
            };

            if (existingClients && existingClients.length > 0) {
                await supabaseClient.from('clients').update(payload).eq('id', existingClients[0].id);
            } else {
                await supabaseClient.from('clients').insert(payload);
            }
            
            this.fetchClients();

        } catch (error) {
            console.warn('[API] Sync client error:', error);
        }
    },

    async fetchMessages() {
        try {
            const { data, error } = await supabaseClient.from('messages').select('*').order('created_at', { ascending: true }).limit(50);
            if (error) throw error;

            if (data) {
                appStore.set(s => ({
                    ...s,
                    data: { ...s.data, messages: data }
                }));
            }
        } catch (error) {
            console.error('[API] Error fetching messages:', error);
        }
    },

    async sendMessage(text) {
        let { user, profile } = appStore.get(); 
        if (!user) return { error: 'Usuário não autenticado' };

        if (!profile) {
            const { data } = await supabaseClient.from('profiles').select('*').eq('id', user.id).single();
            if (data) {
                profile = data;
                appStore.set(s => ({ ...s, profile: data }));
            }
        }

        const userName = user.email.split('@')[0];
        const unitName = profile?.unit || 'Sem Unidade';
        const senderComposite = `${userName} | ${unitName}`;

        try {
            const result = await supabaseClient.from('messages').insert({
                content: text,
                sender_id: user.id,
                sender_name: senderComposite
            });
            if (result.error) throw result.error;
            return { data: result.data, error: null };
        } catch (error) {
            console.error('[API] Error sending message:', error);
            return { data: null, error };
        }
    },

    async saveAppointment(appointmentData) {
        appStore.set(s => ({ ...s, ui: { ...s.ui, loading: true } }));
        try {
            const query = supabaseClient.from('appointments');
            let result;

            const clientInfo = {
                name: appointmentData.client_name,
                phone: appointmentData.client_phone
            };

            // Prepara o payload para corresponder ao Schema do Banco
            const payload = { 
                date: appointmentData.date,
                time: appointmentData.time,
                client_name: appointmentData.client_name,
                type: appointmentData.type,
                status: appointmentData.status,
                unit: appointmentData.unit,
                // [CORREÇÃO] Mapeia client_phone para telefone
                telefone: appointmentData.client_phone, 
                // [CORREÇÃO] Converte INT (60) para TIME (01:00:00)
                duration: this.formatMinutesToTime(appointmentData.duration)
            };
            
            // Remove campos que não existem no banco
            // 'professional' foi removido pois não consta no schema CSV
            // 'client_phone' foi mapeado para 'telefone'

            if (appointmentData.id) {
                result = await query.update(payload).eq('id', appointmentData.id);
            } else {
                result = await query.insert(payload);
            }

            if (result.error) {
                console.error('[API] Supabase Error:', result.error); // Log detalhado
                throw result.error;
            }

            await this.syncClientData(clientInfo);

            appStore.set(s => ({ ...s, ui: { ...s.ui, lastFetch: 0 } }));
            await this.fetchAppointments(true);

            showToast('Agendamento salvo com sucesso!', 'success');
            return true;
        } catch (error) {
            console.error('[API] Error saving appointment:', error);
            let msg = 'Erro ao salvar agendamento.';
            if (error.code === '22007') msg = 'Formato de hora inválido.';
            if (error.code === 'PGRST204') msg = 'Erro de coluna no banco de dados.';
            showToast(msg, 'error');
            return false;
        } finally {
            appStore.set(s => ({ ...s, ui: { ...s.ui, loading: false } }));
        }
    },

    async deleteAppointment(id) {
        appStore.set(s => ({ ...s, ui: { ...s.ui, loading: true } }));
        try {
            const { error } = await supabaseClient.from('appointments').delete().eq('id', id);
            if (error) throw error;

            appStore.set(s => ({ ...s, ui: { ...s.ui, lastFetch: 0 } }));
            await this.fetchAppointments(true);

            showToast('Agendamento excluído.', 'success');
            return true;
        } catch (error) {
            console.error('[API] Error deleting appointment:', error);
            showToast('Erro ao excluir agendamento.', 'error');
            return false;
        } finally {
            appStore.set(s => ({ ...s, ui: { ...s.ui, loading: false } }));
        }
    }
};

export function showToast(msg, type = 'info') {
    const c = document.getElementById('toast-container');
    if (!c) return;

    const t = document.createElement('div');
    let color = "bg-gray-800";
    let icon = "fa-info-circle";

    if (type === 'success') { color = "bg-green-600"; icon = "fa-check-circle"; }
    if (type === 'error') { color = "bg-red-600"; icon = "fa-exclamation-circle"; }
    if (type === 'warning') { color = "bg-orange-500"; icon = "fa-exclamation-triangle"; }

    t.className = `${color} text-white px-4 py-3 rounded-lg shadow-xl text-sm flex items-center gap-3 animate-fade-in transition-all z-50`;
    t.innerHTML = `<i class="fa-solid ${icon}"></i> ${msg}`;
    c.appendChild(t);
    setTimeout(() => {
        t.style.opacity = '0';
        t.style.transform = 'translateY(-10px)';
        setTimeout(() => t.remove(), 300);
    }, 3000);
}