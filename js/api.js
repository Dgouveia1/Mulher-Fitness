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
                users_list: [], // Para o chat
                clients: [],
                blocked_days: [] // Feriados e dias fechados
            },
            ui: {
                loading: false,
                lastFetch: 0,
                activeChatUser: null // null = Global, ID = Chat Privado
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

    parseDurationToMinutes(timeStr) {
        if (!timeStr) return 30; // Padrão alterado para 30 min
        try {
            const [h, m] = timeStr.split(':').map(Number);
            return (h * 60) + m;
        } catch (e) {
            return 30;
        }
    },

    formatMinutesToTime(minutes) {
        const m = parseInt(minutes);
        if (isNaN(m)) return '00:30:00';
        
        const hours = Math.floor(m / 60);
        const mins = m % 60;
        
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
    },

    // --- AGENDAMENTOS ---
    async fetchAppointments(force = false) {
        const now = Date.now();
        const { ui } = appStore.get();

        if (!force && (now - ui.lastFetch < 60000)) return true;

        appStore.set(s => ({ ...s, ui: { ...s.ui, loading: true } }));

        try {
            const { data, error } = await supabaseClient.from('appointments').select('*').limit(1000);
            if (error) throw error;

            const normalizedData = data.map(app => ({
                ...app,
                client_phone: app.telefone || app.client_phone || '', 
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
            appStore.set(s => ({ ...s, ui: { ...s.ui, loading: false } }));
            return false;
        }
    },

    // Validação de Conflito de Horário
    checkAppointmentConflict(date, time, duration, ignoreId = null) {
        const appointments = appStore.get().data.appointments;
        const blockedDays = appStore.get().data.blocked_days || [];

        // 1. Verificar se o dia está bloqueado
        const isBlocked = blockedDays.some(d => d.date === date);
        if (isBlocked) return { conflict: true, message: 'Este dia está fechado para agendamentos.' };

        // Converter novo horário para minutos
        const [h, m] = time.split(':').map(Number);
        const newStart = (h * 60) + m;
        const newEnd = newStart + duration;

        // 2. Verificar conflito com outros agendamentos
        const hasConflict = appointments.some(app => {
            if (app.date !== date) return false; // Outro dia
            if (ignoreId && app.id == ignoreId) return false; // Mesmo agendamento (edição)
            if (app.status === 'cancelled') return false; // Ignorar cancelados

            const [ah, am] = app.time.split(':').map(Number);
            const appStart = (ah * 60) + am;
            const appEnd = appStart + app.duration;

            // Lógica de sobreposição: (StartA < EndB) e (EndA > StartB)
            return (newStart < appEnd && newEnd > appStart);
        });

        if (hasConflict) return { conflict: true, message: 'Horário indisponível (conflito com outro agendamento).' };

        return { conflict: false };
    },

    async saveAppointment(appointmentData) {
        // Forçar duração de 30 minutos conforme requisito
        appointmentData.duration = 30;

        // Validar conflitos antes de enviar ao banco
        const validation = this.checkAppointmentConflict(
            appointmentData.date, 
            appointmentData.time, 
            appointmentData.duration, 
            appointmentData.id
        );

        if (validation.conflict) {
            showToast(validation.message, 'warning');
            return false;
        }

        appStore.set(s => ({ ...s, ui: { ...s.ui, loading: true } }));
        try {
            const query = supabaseClient.from('appointments');
            let result;

            const clientInfo = {
                name: appointmentData.client_name,
                phone: appointmentData.client_phone
            };

            const payload = { 
                date: appointmentData.date,
                time: appointmentData.time,
                client_name: appointmentData.client_name,
                type: appointmentData.type,
                status: appointmentData.status,
                unit: appointmentData.unit,
                telefone: appointmentData.client_phone, 
                duration: this.formatMinutesToTime(appointmentData.duration)
            };
            
            if (appointmentData.id) {
                result = await query.update(payload).eq('id', appointmentData.id);
            } else {
                result = await query.insert(payload);
            }

            if (result.error) throw result.error;

            await this.syncClientData(clientInfo);

            appStore.set(s => ({ ...s, ui: { ...s.ui, lastFetch: 0 } }));
            await this.fetchAppointments(true);

            showToast('Agendamento salvo com sucesso!', 'success');
            return true;
        } catch (error) {
            console.error('[API] Error saving appointment:', error);
            showToast('Erro ao salvar agendamento.', 'error');
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
    },

    // --- CLIENTES ---
    async fetchClients() {
        try {
            const { data, error } = await supabaseClient.from('clients').select('*').order('name', { ascending: true });
            if (!error && data) {
                appStore.set(s => ({ ...s, data: { ...s.data, clients: data } }));
            }
        } catch (error) { console.warn('[API] Erro fetch clients:', error); }
    },

    async syncClientData(clientData) {
        if (!clientData.name) return;
        try {
            const { error: checkError } = await supabaseClient.from('clients').select('id').limit(1);
            if (checkError && checkError.code === '42P01') return; 

            const { data: existingClients } = await supabaseClient
                .from('clients').select('id').ilike('name', clientData.name).limit(1);

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
        } catch (error) { console.warn('[API] Sync client error:', error); }
    },

    // --- CHAT (Global + Privado) ---
    async fetchUsersList() {
        try {
            // Traz perfis para montar a lista de chat
            const { data, error } = await supabaseClient.from('profiles').select('id, email, role, unit');
            if (!error && data) {
                appStore.set(s => ({ ...s, data: { ...s.data, users_list: data } }));
            }
        } catch (e) { console.error('Erro users list', e); }
    },

    async fetchMessages() {
        try {
            const { user } = appStore.get();
            if (!user) return;

            // Busca mensagens onde (recipient_id IS NULL) OR (sender_id = ME) OR (recipient_id = ME)
            const { data, error } = await supabaseClient
                .from('messages')
                .select('*')
                .or(`recipient_id.is.null,sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
                .order('created_at', { ascending: true })
                .limit(200);

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

    async sendMessage(text, recipientId = null) {
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
            const payload = {
                content: text,
                sender_id: user.id,
                sender_name: senderComposite,
                recipient_id: recipientId // Novo campo
            };

            const result = await supabaseClient.from('messages').insert(payload);
            if (result.error) throw result.error;
            return { data: result.data, error: null };
        } catch (error) {
            console.error('[API] Error sending message:', error);
            return { data: null, error };
        }
    },

    // --- CONFIGURAÇÕES / DIAS BLOQUEADOS ---
    async fetchBlockedDays() {
        try {
            const { data, error } = await supabaseClient.from('blocked_days').select('*').order('date', { ascending: true });
            if (!error && data) {
                appStore.set(s => ({ ...s, data: { ...s.data, blocked_days: data } }));
            }
        } catch (e) { console.error('Error fetching blocked days', e); }
    },

    async saveBlockedDay(date, reason, type = 'closed') {
        try {
            const { error } = await supabaseClient.from('blocked_days').insert({ date, reason, type });
            if (error) throw error;
            await this.fetchBlockedDays();
            showToast('Data bloqueada com sucesso', 'success');
            return true;
        } catch (e) {
            showToast('Erro ao bloquear data', 'error');
            console.error(e);
            return false;
        }
    },

    async deleteBlockedDay(id) {
        try {
            const { error } = await supabaseClient.from('blocked_days').delete().eq('id', id);
            if (error) throw error;
            await this.fetchBlockedDays();
            showToast('Bloqueio removido', 'success');
            return true;
        } catch (e) {
            showToast('Erro ao remover bloqueio', 'error');
            return false;
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