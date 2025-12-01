import { API, State, showToast, appStore, supabaseClient } from './api.js'; 
import { Utils } from './utils.js';

export const ChatModule = {
    subscription: null, 
    isOpen: false,
    initialized: false,
    notificationSound: new Audio('sons/notification.mp3'), 
    audioUnlocked: false,
    unlockHandler: null,

    init() {
        if (this.initialized) return;
        this.initialized = true;

        document.getElementById('btn-toggle-chat')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleState();
        });

        document.getElementById('chat-header')?.addEventListener('click', () => {
            if (this.isOpen) {
                this.minimize();
            } else {
                this.expand();
            }
        });

        document.getElementById('btn-minimize-chat')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.minimize();
        });

        document.getElementById('chat-form')?.addEventListener('submit', (e) => this.send(e));

        // Corrigido: manter referência da função para poder removê-la depois
        this.unlockHandler = () => {
            this.unlockAudio();
            if (this.unlockHandler) {
                document.removeEventListener('click', this.unlockHandler);
                document.removeEventListener('keydown', this.unlockHandler);
            }
        };
        document.addEventListener('click', this.unlockHandler);
        document.addEventListener('keydown', this.unlockHandler);

        this.minimize();
        
        // Corrigido: aguardar fetch antes de configurar realtime para evitar race condition
        this.fetchAndRender().then(() => {
            this.setupRealtime();
        });
    },

    unlockAudio() {
        if (this.audioUnlocked) return;
        
        this.notificationSound.play().then(() => {
            this.notificationSound.pause();
            this.notificationSound.currentTime = 0;
            this.audioUnlocked = true;
            console.log('[Chat] Áudio desbloqueado para notificações em background');
        }).catch((e) => {
            console.warn('[Chat] Falha ao desbloquear áudio:', e);
        });
    },

    setupRealtime() {
        if (this.subscription) {
            console.log('[Chat] Realtime já está conectado');
            return;
        }

        console.log('[Chat] Conectando ao Realtime...');
        
        try {
            this.subscription = supabaseClient
                .channel('public:messages')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                    if (payload && payload.new) {
                        this.handleRealtimeMessage(payload.new);
                    }
                })
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        console.log('[Chat] Conexão Realtime estabelecida!');
                    } else if (status === 'CHANNEL_ERROR') {
                        console.error('[Chat] Erro na conexão Realtime');
                        showToast('Erro na conexão do chat em tempo real', 'error');
                    }
                });
        } catch (error) {
            console.error('[Chat] Erro ao configurar Realtime:', error);
            showToast('Erro ao conectar chat em tempo real', 'error');
        }
    },

    handleRealtimeMessage(newMessage) {
        if (!newMessage || !newMessage.id) {
            console.warn('[Chat] Mensagem inválida recebida:', newMessage);
            return;
        }

        const currentMessages = appStore.get().data.messages || [];
        
        // Corrigido: verificação mais robusta para evitar duplicatas
        const messageExists = currentMessages.some(m => m.id === newMessage.id);
        if (messageExists) {
            console.log('[Chat] Mensagem duplicada ignorada:', newMessage.id);
            return;
        }

        // Adiciona mensagem no final e mantém ordem cronológica
        const updatedMessages = [...currentMessages, newMessage].sort((a, b) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateA - dateB;
        });
        
        appStore.set(s => ({
            ...s,
            data: { ...s.data, messages: updatedMessages }
        }));

        this.render();

        // Corrigido: verificação mais segura do usuário
        const myId = appStore.get().user?.id;
        
        if (myId && newMessage.sender_id && newMessage.sender_id !== myId) {
            this.playNotificationSound();
            this.handleNewMessageNotification();
        }
    },

    playNotificationSound() {
        try {
            this.notificationSound.volume = 0.6;
            this.notificationSound.currentTime = 0;
            
            const playPromise = this.notificationSound.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn('Autoplay bloqueado.', error);
                });
            }
        } catch (e) {
            console.error('Erro ao tocar som:', e);
        }
    },

    toggleState() {
        if (this.isOpen) this.minimize();
        else this.expand();
    },

    expand() {
        const widget = document.getElementById('chat-widget');
        if (!widget) {
            console.warn('[Chat] Widget não encontrado');
            return;
        }
        
        widget.classList.remove('chat-minimized');
        widget.classList.add('chat-expanded');
        this.isOpen = true;
        
        const statusDot = document.querySelector('#chat-header .status-dot');
        if (statusDot) statusDot.classList.remove('animate-ping');

        const container = document.getElementById('chat-messages');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }

        // Corrigido: foco seguro com verificação
        setTimeout(() => {
            const input = document.getElementById('chat-input');
            if (input) {
                input.focus();
            }
        }, 300);
    },

    minimize() {
        const widget = document.getElementById('chat-widget');
        if (!widget) {
            console.warn('[Chat] Widget não encontrado');
            return;
        }
        
        widget.classList.remove('chat-expanded');
        widget.classList.add('chat-minimized');
        this.isOpen = false;
    },

    handleNewMessageNotification() {
        if (!this.isOpen) {
            const statusDot = document.querySelector('#chat-header .status-dot');
            if (statusDot) statusDot.classList.add('animate-ping');
            
            showToast('Nova mensagem no chat da equipe!', 'info');
        }
    },

    async fetchAndRender() {
        try {
            await API.fetchMessages();
            this.render();
        } catch (error) {
            console.error('[Chat] Erro ao buscar mensagens:', error);
            showToast('Erro ao carregar mensagens', 'error');
        }
    },

    getNameColor(name) {
        if (!name) return 'text-brand-600';
        
        const colors = [
            'text-pink-600', 'text-purple-600', 'text-indigo-600',
            'text-blue-600', 'text-cyan-600', 'text-teal-600',
            'text-emerald-600', 'text-orange-600', 'text-red-600'
        ];

        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    },

    render() {
        const container = document.getElementById('chat-messages');
        if (!container) {
            console.warn('[Chat] Container de mensagens não encontrado');
            return;
        }

        // Corrigido: busca o elemento background mas não falha se não existir
        const bg = container.querySelector('.absolute');
        
        // Remove todas as mensagens (filhos diretos), mantendo apenas o background se existir
        const childrenToRemove = [];
        for (let i = 0; i < container.children.length; i++) {
            const child = container.children[i];
            if (child !== bg) {
                childrenToRemove.push(child);
            }
        }
        childrenToRemove.forEach(child => child.remove());

        const messages = appStore.get().data.messages || [];
        const myId = appStore.get().user?.id;

        messages.forEach(msg => {
            if (!msg || !msg.id) return; // Validação adicional

            const isMe = msg.sender_id === myId;
            const div = document.createElement('div');
            
            // Corrigido: tratamento seguro para data inválida
            let time = '--:--';
            try {
                if (msg.created_at) {
                    time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                }
            } catch (e) {
                console.warn('[Chat] Erro ao formatar data:', e);
            }
            
            // Lógica para separar Nome e Unidade
            const rawSender = msg.sender_name || 'Usuário';
            let displayName = rawSender;
            let displayUnit = '';

            // Se a mensagem vier no novo formato "Nome | Unidade", separa
            if (rawSender.includes('|')) {
                const parts = rawSender.split('|');
                displayName = parts[0].trim();
                displayUnit = parts[1] ? parts[1].trim() : '';
            }

            const nameColorClass = this.getNameColor(displayName);
            
            div.className = `flex w-full ${isMe ? 'justify-end' : 'justify-start'} z-10 animate-fade-in mb-1`;
            div.innerHTML = `
                <div class="msg-bubble ${isMe ? 'msg-out' : 'msg-in'} shadow-sm">
                    ${!isMe ? `
                        <div class="flex items-baseline gap-1 mb-0.5 leading-none">
                            <span class="text-[11px] font-bold ${nameColorClass}">${Utils.escapeHTML(displayName)}</span>
                            ${displayUnit ? `<span class="text-[9px] text-gray-400 font-normal">(${Utils.escapeHTML(displayUnit)})</span>` : ''}
                        </div>
                    ` : ''}
                    <div class="text-gray-800 text-[13px] leading-relaxed">${Utils.escapeHTML(msg.content || '')}</div>
                    <div class="msg-meta">
                        ${Utils.escapeHTML(time)}
                        ${isMe ? '<i class="fa-solid fa-check-double text-blue-500 ml-1"></i>' : ''}
                    </div>
                </div>
            `;
            container.appendChild(div);
        });

        // Corrigido: scroll seguro
        setTimeout(() => {
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        }, 0);
    },

    async send(e) {
        e.preventDefault();
        const input = document.getElementById('chat-input');
        
        // Corrigido: validação de elemento
        if (!input) {
            console.warn('[Chat] Input não encontrado');
            return;
        }
        
        const text = input.value.trim();
        
        if (!text) return;
        
        // Limpa o input imediatamente para feedback visual
        input.value = '';
        input.disabled = true; // Previne múltiplos envios

        try {
            const { error } = await API.sendMessage(text);
            if (error) {
                showToast('Erro ao enviar mensagem', 'error');
                input.value = text; // Restaura texto em caso de erro
            }
        } catch (error) {
            console.error('[Chat] Erro ao enviar mensagem:', error);
            showToast('Erro ao enviar mensagem', 'error');
            input.value = text; // Restaura texto em caso de erro
        } finally {
            input.disabled = false;
            input.focus();
        }
    },

    // Corrigido: método para limpar recursos (prevenir memory leaks)
    cleanup() {
        // Remove subscription do Realtime
        if (this.subscription) {
            try {
                // Corrigido: usa unsubscribe() do canal ao invés de removeChannel
                supabaseClient.removeChannel(this.subscription);
            } catch (error) {
                console.warn('[Chat] Erro ao remover canal:', error);
            }
            this.subscription = null;
        }

        // Remove event listeners de áudio
        if (this.unlockHandler) {
            document.removeEventListener('click', this.unlockHandler);
            document.removeEventListener('keydown', this.unlockHandler);
            this.unlockHandler = null;
        }

        this.initialized = false;
        this.isOpen = false;
        console.log('[Chat] Recursos limpos');
    }
};