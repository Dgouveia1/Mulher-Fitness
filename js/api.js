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
                clients: [], // Novo array de clientes
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

    // Atualiza o estado e notifica ouvintes
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
// Compatibilidade com código antigo que acessa State diretamente
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

    async fetchAppointments(force = false) {
        const now = Date.now();
        const { ui } = appStore.get();

        // Cache simples: evita fetch se dados tem menos de 1 minuto e não foi forçado
        if (!force && (now - ui.lastFetch < 60000)) {
            console.log('[API] Using cached appointments');
            return true;
        }

        console.log('[API] Fetching appointments...');
        appStore.set(s => ({ ...s, ui: { ...s.ui, loading: true } }));

        try {
            const { data, error } = await supabaseClient.from('appointments').select('*').limit(1000);
            if (error) throw error;

            // [FIX] Mapeamento Reverso: professional -> client_phone
            // Como a coluna client_phone não existe, usamos professional para ler o telefone
            const normalizedData = data.map(app => ({
                ...app,
                client_phone: app.client_phone || app.professional || '',
                // Normaliza duração se existir no banco (no futuro campo 'duration') ou default 60
                duration: app.duration || 60
            }));

            appStore.set(s => ({
                ...s,
                data: { ...s.data, appointments: normalizedData },
                ui: { ...s.ui, loading: false, lastFetch: now }
            }));
            return true;
        } catch (error) {
            console.error('[API] Error fetching appointments:', error);
            showToast('Erro ao carregar agendamentos. Tente novamente.', 'error');
            appStore.set(s => ({ ...s, ui: { ...s.ui, loading: false } }));
            return false;
        }
    },

    async fetchClients() {
        try {
            // Tenta buscar da tabela clients. Se não existir, vai dar erro, mas tratamos.
            const { data, error } = await supabaseClient.from('clients').select('*').order('name', { ascending: true });
            
            if (error) {
                console.warn('[API] Tabela clientes não encontrada ou erro:', error.message);
                return;
            }

            if (data) {
                appStore.set(s => ({
                    ...s,
                    data: { ...s.data, clients: data }
                }));
            }
        } catch (error) {
            console.warn('[API] Erro ao buscar clientes (feature opcional se tabela nao existir):', error);
        }
    },

    // Nova função para sincronizar dados do cliente após agendamento
    async syncClientData(clientData) {
        if (!clientData.name) return;

        try {
            // Verifica se cliente existe pelo nome (simplificado)
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
                // Atualiza (segundo agendamento)
                console.log('[API] Atualizando cliente existente:', clientData.name);
                await supabaseClient.from('clients').update(payload).eq('id', existingClients[0].id);
            } else {
                // Insere (novo cliente)
                console.log('[API] Criando novo cliente:', clientData.name);
                await supabaseClient.from('clients').insert(payload);
            }
            
            // Atualiza lista local
            this.fetchClients();

        } catch (error) {
            console.warn('[API] Erro ao sincronizar cliente:', error);
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
            console.log('[API] Perfil não encontrado na store, buscando...');
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
            let query = supabaseClient.from('appointments');
            let result;

            // Extrai dados do cliente para sincronizar depois
            const clientInfo = {
                name: appointmentData.client_name,
                phone: appointmentData.client_phone
            };

            const payload = { ...appointmentData };
            
            // Map phone to professional column (Workaround for schema mismatch)
            if (payload.client_phone) {
                payload.professional = payload.client_phone;
            }
            delete payload.client_phone;
            
            // Se o schema do banco não tiver 'duration', isso pode dar erro se não tratado no Supabase
            // Mas vamos enviar assumindo que o usuário vai adicionar a coluna ou aceitar o erro silencioso se for strict
            // Para evitar crash, se não tiver certeza do schema, pode remover, mas o usuário pediu para inserir a regra.
            // Vamos manter.

            if (payload.id) {
                // Update
                const id = payload.id;
                delete payload.id; 
                result = await query.update(payload).eq('id', id);
            } else {
                // Insert
                delete payload.id; 
                result = await query.insert(payload);
            }

            if (result.error) throw result.error;

            // --- Sincroniza Cliente ---
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