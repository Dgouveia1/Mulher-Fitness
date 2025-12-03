import { API, appStore, showToast, supabaseClient } from './api.js'; 
import { Utils } from './utils.js';

export const ChatModule = {
    subscription: null,
    initialized: false,
    openChats: [], // Array de objetos { id, name, minimized }
    notificationSound: new Audio('sons/notification.mp3'),
    isDockOpen: false,

    init() {
        if (this.initialized) return;
        this.initialized = true;

        // Renderiza o Dock inicial (fechado)
        this.renderDock();

        // Bind global events
        document.getElementById('btn-toggle-chat-dock')?.addEventListener('click', () => this.toggleDock());

        // Carrega dados iniciais
        API.fetchUsersList().then(() => this.renderDockList());
        API.fetchMessages().then(() => {
            this.setupRealtime();
        });
    },

    // --- DOCK (Lista de Contatos) ---
    toggleDock() {
        const dockList = document.getElementById('chat-dock-list');
        const btnIcon = document.querySelector('#btn-toggle-chat-dock i');
        
        if (this.isDockOpen) {
            dockList.classList.add('hidden');
            btnIcon.classList.remove('fa-chevron-down');
            btnIcon.classList.add('fa-chevron-up');
        } else {
            dockList.classList.remove('hidden');
            btnIcon.classList.remove('fa-chevron-up');
            btnIcon.classList.add('fa-chevron-down');
            // Remove notificação visual ao abrir
            document.querySelector('#btn-toggle-chat-dock .status-dot')?.classList.add('hidden');
        }
        this.isDockOpen = !this.isDockOpen;
    },

    renderDock() {
        // A estrutura HTML do dock já deve estar no index.html ou ser injetada aqui.
        // Vamos assumir que o container 'chat-dock-container' existe.
        this.renderDockList();
    },

    renderDockList() {
        const listContainer = document.getElementById('chat-dock-users');
        if (!listContainer) return;

        const users = appStore.get().data.users_list || [];
        const myId = appStore.get().user?.id;

        let html = `
            <div class="p-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b border-gray-100 transition"
                 onclick="ChatModule.openChatWindow('global', 'Chat Geral')">
                <div class="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-white text-xs">
                    <i class="fa-solid fa-users"></i>
                </div>
                <div>
                    <p class="text-sm font-bold text-gray-700">Equipe (Geral)</p>
                    <p class="text-[10px] text-gray-400">Todos os membros</p>
                </div>
            </div>
        `;

        users.forEach(u => {
            if (u.id === myId) return;
            const name = u.email.split('@')[0];
            const role = u.role === 'admin_user' ? 'Admin' : 'Staff';
            
            html += `
                <div class="p-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b border-gray-100 transition"
                     onclick="ChatModule.openChatWindow('${u.id}', '${name}')">
                    <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-xs">
                        ${name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p class="text-sm font-bold text-gray-700">${Utils.escapeHTML(name)}</p>
                        <p class="text-[10px] text-gray-400">${role}</p>
                    </div>
                </div>
            `;
        });

        listContainer.innerHTML = html;
    },

    // --- JANELAS DE CHAT ---
    openChatWindow(id, name) {
        // Verifica se já está aberto
        const existing = this.openChats.find(c => c.id === id);
        
        if (existing) {
            // Se estiver minimizado, restaura
            if (existing.minimized) {
                this.toggleMinimizeChat(id);
            }
            // Foca no input
            setTimeout(() => {
                const input = document.getElementById(`input-${id}`);
                if (input) input.focus();
            }, 100);
            return;
        }

        // Limite de janelas (ex: 3) para não quebrar layout
        if (this.openChats.length >= 3) {
            const toClose = this.openChats[0];
            this.closeChat(toClose.id);
        }

        // Adiciona ao estado
        this.openChats.push({ id, name, minimized: false });
        this.createChatDOM(id, name);
    },

    createChatDOM(id, name) {
        const container = document.getElementById('chat-windows-container');
        if (!container) return;

        const div = document.createElement('div');
        div.id = `chat-window-${id}`;
        div.className = "chat-window bg-white rounded-t-lg shadow-xl border border-gray-200 flex flex-col w-[280px] h-[360px] bg-[#efeae2] relative pointer-events-auto transition-transform duration-200";
        
        div.innerHTML = `
            <!-- Header -->
            <div class="bg-brand-600 text-white p-2 px-3 rounded-t-lg flex justify-between items-center cursor-pointer select-none"
                 onclick="ChatModule.toggleMinimizeChat('${id}')">
                <div class="flex items-center gap-2 overflow-hidden">
                    <span class="w-2 h-2 rounded-full bg-green-400"></span>
                    <span class="font-bold text-sm truncate max-w-[150px]">${Utils.escapeHTML(name)}</span>
                </div>
                <div class="flex items-center gap-2">
                    <button class="hover:text-gray-200" onclick="event.stopPropagation(); ChatModule.toggleMinimizeChat('${id}')">
                        <i class="fa-solid fa-minus text-xs"></i>
                    </button>
                    <button class="hover:text-red-200" onclick="event.stopPropagation(); ChatModule.closeChat('${id}')">
                        <i class="fa-solid fa-times text-xs"></i>
                    </button>
                </div>
            </div>

            <!-- Messages Area -->
            <div id="msgs-${id}" class="flex-1 overflow-y-auto p-2 flex flex-col gap-2 custom-scroll bg-[#efeae2] relative">
                <div class="absolute inset-0 opacity-[0.06] pointer-events-none" style="background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png');"></div>
                <!-- Msgs injetadas aqui -->
            </div>

            <!-- Input Area -->
            <form class="p-2 bg-gray-50 border-t border-gray-200 flex gap-2" onsubmit="ChatModule.handleSend(event, '${id}')">
                <input type="text" id="input-${id}" class="flex-1 text-xs border border-gray-300 rounded-full px-3 py-2 outline-none focus:border-brand-500" placeholder="Digite..." autocomplete="off">
                <button type="submit" class="text-brand-600 hover:text-brand-800 px-1">
                    <i class="fa-solid fa-paper-plane"></i>
                </button>
            </form>
        `;

        container.appendChild(div);
        this.renderMessagesForWindow(id);
    },

    closeChat(id) {
        this.openChats = this.openChats.filter(c => c.id !== id);
        const el = document.getElementById(`chat-window-${id}`);
        if (el) el.remove();
    },

    toggleMinimizeChat(id) {
        const chat = this.openChats.find(c => c.id === id);
        if (!chat) return;

        const el = document.getElementById(`chat-window-${id}`);
        const msgs = document.getElementById(`msgs-${id}`);
        const input = el.querySelector('form');

        if (chat.minimized) {
            // Maximizar
            chat.minimized = false;
            el.style.transform = "translateY(0)";
            el.style.height = "360px";
            if (msgs) msgs.style.display = 'flex';
            if (input) input.style.display = 'flex';
        } else {
            // Minimizar
            chat.minimized = true;
            el.style.height = "auto"; // Apenas header
            if (msgs) msgs.style.display = 'none';
            if (input) input.style.display = 'none';
        }
    },

    // --- MENSAGENS E REALTIME ---

    renderMessagesForWindow(windowId) {
        const container = document.getElementById(`msgs-${windowId}`);
        if (!container) return;

        // Limpa (mantendo bg)
        const bg = container.querySelector('.absolute');
        container.innerHTML = '';
        if (bg) container.appendChild(bg);

        const allMessages = appStore.get().data.messages || [];
        const myId = appStore.get().user?.id;

        // Filtra mensagens para ESTA janela
        const msgs = allMessages.filter(msg => {
            if (windowId === 'global') {
                return !msg.recipient_id; // Global
            } else {
                // Privado: Eu e Ele OU Ele e Eu
                return (msg.sender_id === myId && msg.recipient_id === windowId) ||
                       (msg.sender_id === windowId && msg.recipient_id === myId);
            }
        });

        msgs.forEach(msg => {
            this.appendMessageToDOM(container, msg, myId, windowId === 'global');
        });

        setTimeout(() => container.scrollTop = container.scrollHeight, 0);
    },

    appendMessageToDOM(container, msg, myId, isGlobal) {
        const isMe = msg.sender_id === myId;
        const div = document.createElement('div');
        const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        let senderName = msg.sender_name || 'Anônimo';
        if (senderName.includes('|')) senderName = senderName.split('|')[0].trim();

        div.className = `flex w-full ${isMe ? 'justify-end' : 'justify-start'} z-10 mb-2`;
        
        // Layout compacto para janelas pequenas
        div.innerHTML = `
            <div class="relative px-2 py-1.5 rounded-lg shadow-sm max-w-[85%] ${isMe ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'} text-xs">
                ${(!isMe && isGlobal) ? `<div class="font-bold text-brand-600 mb-0.5 text-[10px]">${Utils.escapeHTML(senderName)}</div>` : ''}
                <div class="text-gray-800 break-words">${Utils.escapeHTML(msg.content)}</div>
                <div class="text-[9px] text-gray-400 text-right mt-0.5 leading-none">${time}</div>
            </div>
        `;
        container.appendChild(div);
    },

    setupRealtime() {
        if (this.subscription) return;
        const myId = appStore.get().user?.id;
        
        this.subscription = supabaseClient
            .channel('public:messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                const newMsg = payload.new;
                
                const isGlobal = !newMsg.recipient_id;
                const isForMe = newMsg.recipient_id === myId;
                const isFromMe = newMsg.sender_id === myId;

                if (isGlobal || isForMe || isFromMe) {
                    this.handleRealtimeMessage(newMsg);
                }
            })
            .subscribe();
    },

    handleRealtimeMessage(newMessage) {
        // Atualiza Store
        const currentMessages = appStore.get().data.messages || [];
        if (currentMessages.some(m => m.id === newMessage.id)) return;
        const updatedMessages = [...currentMessages, newMessage].sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        appStore.set(s => ({ ...s, data: { ...s.data, messages: updatedMessages } }));

        const myId = appStore.get().user?.id;
        
        // Lógica de Janelas
        let targetWindowId = null;
        if (!newMessage.recipient_id) targetWindowId = 'global';
        else if (newMessage.sender_id === myId) targetWindowId = newMessage.recipient_id; // Enviei
        else targetWindowId = newMessage.sender_id; // Recebi

        const windowContainer = document.getElementById(`msgs-${targetWindowId}`);
        
        // Se a janela está aberta, adiciona msg e scrolla
        if (windowContainer) {
            this.appendMessageToDOM(windowContainer, newMessage, myId, targetWindowId === 'global');
            windowContainer.scrollTop = windowContainer.scrollHeight;
            
            // Som se não fui eu
            if (newMessage.sender_id !== myId) this.playNotificationSound();
        } 
        // Se a janela está fechada e eu recebi
        else if (newMessage.sender_id !== myId) {
            this.playNotificationSound();
            showToast(`Nova mensagem de ${newMessage.sender_name?.split('|')[0] || 'Alguém'}`, 'info');
            
            // Notificação no Dock
            document.querySelector('#btn-toggle-chat-dock .status-dot')?.classList.remove('hidden');
        }
    },

    async handleSend(e, windowId) {
        e.preventDefault();
        const input = document.getElementById(`input-${windowId}`);
        const text = input.value.trim();
        if (!text) return;

        input.value = '';
        input.focus();

        const recipientId = windowId === 'global' ? null : windowId;
        
        try {
            const { error } = await API.sendMessage(text, recipientId);
            if (error) throw error;
        } catch (error) {
            showToast('Erro ao enviar', 'error');
            input.value = text;
        }
    },

    cleanup() {
        if (this.subscription) supabaseClient.removeChannel(this.subscription);
        this.openChats = [];
        document.getElementById('chat-windows-container').innerHTML = '';
        this.initialized = false;
    }
};

window.ChatModule = ChatModule;