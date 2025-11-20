/* --- DADOS DO PROTÓTIPO (MOCK DB) --- */
const DB = {
    users: {
        'Recepção Central': { id: 1, unit: 'Central', color: 'text-brand-600' },
        'Unidade Norte': { id: 2, unit: 'Norte', color: 'text-blue-600' },
        'Unidade Sul': { id: 3, unit: 'Sul', color: 'text-purple-600' }
    },
    appointments: [
        { id: 1, date: '2025-11-14', time: '09:00', name: 'Juliana Costa', type: 'fisica', status: 'confirmed', unit: 'Central' },
        { id: 2, date: '2025-11-14', time: '14:00', name: 'Carla Dias', type: 'nutri', status: 'pending', unit: 'Central' },
        { id: 3, date: '2025-11-21', time: '10:00', name: 'Mariana Silva', type: 'fisica', status: 'confirmed', unit: 'Sul' },
        { id: 4, date: '2025-11-18', time: '08:00', name: 'Patrícia Lima', type: 'fisica', status: 'confirmed', unit: 'Norte' },
        { id: 5, date: '2025-11-19', time: '11:00', name: 'Fernanda Oliveira', type: 'fisica', status: 'pending', unit: 'Central' },
        { id: 6, date: '2025-11-19', time: '15:00', name: 'Beatriz Santos', type: 'nutri', status: 'pending', unit: 'Central' },
    ],
    holidays: ['2025-11-02', '2025-11-15', '2025-11-20'], // Feriados bloqueados
    messages: [
        { id: 1, text: "Bom dia! A aluna Mariana da unidade Norte confirmou?", sender: "Unidade Norte", type: "in", time: "08:15" },
        { id: 2, text: "Sim, já liberei na agenda.", sender: "Eu", type: "out", time: "08:20" },
        { id: 3, text: "Precisamos de mais fichas de anamnese na Sul.", sender: "Unidade Sul", type: "in", time: "09:30" }
    ]
};

/* --- ESTADO DA APLICAÇÃO --- */
const State = {
    currentUser: DB.users['Recepção Central'],
    currentView: 'dashboard',
    agendaFilter: 'all', // all, fisica, nutri
    agendaView: 'month', // 'month' or 'week'
    currentDate: new Date(2025, 10, 14), // Data Base simulada (14 Nov 2025)
    sidebarCollapsed: false,
    chatOpen: false
};

/* --- ROTEADOR & COMPONENTES --- */
const Router = {
    navigate(view) {
        State.currentView = view;
        
        // Atualiza Menu Ativo
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('bg-brand-50', 'text-brand-600', 'active'));
        const navBtn = document.getElementById(`nav-${view}`);
        if(navBtn) navBtn.classList.add('bg-brand-50', 'text-brand-600');

        // Renderiza Conteúdo
        const container = document.getElementById('view-container');
        container.innerHTML = ''; // Limpa
        container.classList.remove('animate-fade-in');
        void container.offsetWidth; // Trigger reflow para animação
        container.classList.add('animate-fade-in');

        document.getElementById('page-title').innerText = 
            view === 'dashboard' ? 'Dashboard Operacional' :
            view === 'agenda' ? 'Agenda Integrada' : 'Gestão de Confirmações';

        if(view === 'dashboard') container.innerHTML = Components.dashboard();
        else if(view === 'agenda') { container.innerHTML = Components.agenda(); App.renderCalendar(); }
        else if(view === 'confirmacoes') container.innerHTML = Components.confirmations();
    }
};

const Components = {
    dashboard() {
        const todayStr = '2025-11-14';
        const todayApps = DB.appointments.filter(a => a.date === todayStr);
        const confirmedCount = todayApps.filter(a => a.status === 'confirmed').length;
        
        // Removido o card de Novas Alunas, ajustado grid para 2 colunas
        return `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- KPIs -->
                <div class="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
                        <div>
                            <p class="text-xs text-gray-500 font-bold uppercase">Atendimentos Hoje</p>
                            <h3 class="text-3xl font-heading font-bold text-gray-800 mt-1">${todayApps.length}</h3>
                        </div>
                        <div class="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 text-2xl"><i class="fa-solid fa-calendar-day"></i></div>
                    </div>
                    <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
                        <div>
                            <p class="text-xs text-gray-500 font-bold uppercase">Confirmados</p>
                            <h3 class="text-3xl font-heading font-bold text-green-600 mt-1">${confirmedCount}</h3>
                        </div>
                        <div class="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-2xl"><i class="fa-solid fa-check-circle"></i></div>
                    </div>
                </div>

                <!-- Próximos Atendimentos -->
                <div class="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div class="p-5 border-b border-gray-100 flex justify-between items-center">
                        <h3 class="font-bold text-gray-800">Fila de Hoje</h3>
                        <button onclick="Router.navigate('agenda')" class="text-xs font-bold text-brand-600 hover:underline">VER AGENDA</button>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm text-left">
                            <thead class="bg-gray-50 text-gray-500 font-bold text-xs uppercase">
                                <tr><th class="px-5 py-3">Hora</th><th class="px-5 py-3">Aluna</th><th class="px-5 py-3">Status</th><th class="px-5 py-3 text-right">WhatsApp</th></tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                ${todayApps.map(app => `
                                    <tr class="hover:bg-gray-50 transition cursor-pointer" onclick="App.editAppointment(${app.id})">
                                        <td class="px-5 py-3 font-bold text-gray-900">${app.time}</td>
                                        <td class="px-5 py-3">
                                            ${app.name}
                                            <div class="text-[10px] text-gray-400">${app.type === 'fisica' ? 'Avaliação Física' : 'Nutricional'}</div>
                                        </td>
                                        <td class="px-5 py-3">
                                            ${app.status === 'confirmed' 
                                                ? '<span class="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase bg-green-100 text-green-700"><i class="fa-solid fa-check"></i> Confirmado</span>' 
                                                : '<span class="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-600"><i class="fa-regular fa-clock"></i> Pendente</span>'}
                                        </td>
                                        <td class="px-5 py-3 text-right">
                                            <button onclick="event.stopPropagation(); App.generateWhatsapp('${app.name}','${app.date}','${app.time}')" class="text-green-500 hover:bg-green-50 p-2 rounded-full transition" title="Enviar WhatsApp">
                                                <i class="fa-brands fa-whatsapp text-lg"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Atalhos -->
                <div class="lg:col-span-3 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl p-6 text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-center shadow-lg gap-4">
                    <div class="relative z-10">
                        <h3 class="text-xl font-bold mb-1">Acesso Rápido</h3>
                        <p class="text-brand-100 text-sm">Gerencie a unidade com agilidade.</p>
                    </div>
                    <div class="flex gap-3 w-full md:w-auto relative z-10">
                        <button onclick="Router.navigate('agenda')" class="flex-1 md:flex-none px-6 py-3 bg-white text-brand-600 font-bold rounded-xl shadow hover:bg-brand-50 transition flex items-center justify-center gap-2">
                            <i class="fa-solid fa-plus"></i> Novo Agendamento
                        </button>
                        <button onclick="Router.navigate('confirmacoes')" class="flex-1 md:flex-none px-6 py-3 bg-brand-800/50 border border-white/20 text-white font-bold rounded-xl hover:bg-brand-800 transition flex items-center justify-center gap-2">
                            <i class="fa-solid fa-list-check"></i> Confirmações
                        </button>
                    </div>
                    <!-- Decor -->
                    <div class="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                    <div class="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-purple-500/40 rounded-full blur-xl"></div>
                </div>
            </div>
        `;
    },

    agenda() {
        return `
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[calc(100vh-140px)]">
                <!-- Toolbar -->
                <div class="p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    
                    <!-- Switch View (Mes/Semana) -->
                    <div class="flex bg-gray-100 p-1 rounded-lg">
                         <button onclick="App.switchView('month')" id="view-month" class="px-4 py-2 text-xs font-bold rounded-md shadow-sm bg-white text-brand-600 transition-all">Mês</button>
                         <button onclick="App.switchView('week')" id="view-week" class="px-4 py-2 text-xs font-medium rounded-md text-gray-500 hover:text-brand-600 transition-all">Semana</button>
                    </div>

                    <!-- Navegação Data -->
                    <div class="flex items-center gap-4">
                        <button onclick="App.changeDate(-1)" class="p-2 hover:bg-gray-100 rounded-full transition"><i class="fa-solid fa-chevron-left"></i></button>
                        <h3 class="text-lg font-bold text-gray-800 w-48 text-center" id="agenda-period">...</h3>
                        <button onclick="App.changeDate(1)" class="p-2 hover:bg-gray-100 rounded-full transition"><i class="fa-solid fa-chevron-right"></i></button>
                    </div>

                    <!-- Filtros -->
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-gray-400 font-bold uppercase mr-1">Filtro:</span>
                        <button onclick="App.filterAgenda('all')" id="filter-all" class="px-3 py-1 text-xs font-bold rounded-full bg-brand-100 text-brand-700 border border-brand-200">Todos</button>
                        <button onclick="App.filterAgenda('fisica')" id="filter-fisica" class="px-3 py-1 text-xs font-medium rounded-full text-gray-500 hover:bg-gray-100">Física</button>
                        <button onclick="App.filterAgenda('nutri')" id="filter-nutri" class="px-3 py-1 text-xs font-medium rounded-full text-gray-500 hover:bg-gray-100">Nutri</button>
                    </div>
                </div>

                <!-- Legenda -->
                <div class="px-4 py-2 bg-gray-50 text-[10px] flex gap-4 border-b border-gray-200 text-gray-500 overflow-x-auto">
                    <div class="flex items-center gap-1"><span class="w-2 h-2 bg-pink-500 rounded-full"></span> Avaliação</div>
                    <div class="flex items-center gap-1"><span class="w-2 h-2 bg-purple-500 rounded-full"></span> Nutricional</div>
                    <div class="flex items-center gap-1"><i class="fa-solid fa-check-circle text-green-500"></i> Confirmado</div>
                    <div class="flex items-center gap-1"><i class="fa-solid fa-check-circle text-gray-300"></i> Pendente</div>
                    <div class="flex items-center gap-1 ml-auto text-red-400 font-bold">🚫 Feriado</div>
                </div>

                <!-- Grid (Container) -->
                <div class="flex-1 overflow-y-auto custom-scroll p-4 bg-white" id="calendar-container">
                    <!-- Injected by JS -->
                </div>
            </div>
        `;
    },

    confirmations() {
        // Filtra agendamentos futuros (>= hoje) que não estão confirmados
        const todayStr = '2025-11-14'; // Mock today
        const pendingApps = DB.appointments.filter(a => a.status !== 'confirmed' && a.date >= todayStr).sort((a,b) => a.date.localeCompare(b.date));

        return `
            <div class="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col h-[calc(100vh-140px)] overflow-hidden">
                <div class="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 class="font-bold text-gray-800"><i class="fa-solid fa-clipboard-check mr-2 text-brand-500"></i>Agendamentos Pendentes (Próximos Dias)</h3>
                    <span class="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold">${pendingApps.length} pendentes</span>
                </div>
                <div class="flex-1 overflow-auto">
                    ${pendingApps.length === 0 ? 
                        `<div class="flex flex-col items-center justify-center h-full text-gray-400">
                            <i class="fa-solid fa-check-circle text-4xl mb-3 text-green-200"></i>
                            <p>Tudo certo! Nenhuma confirmação pendente.</p>
                        </div>` 
                        :
                        `<table class="w-full text-sm text-left">
                            <thead class="bg-white text-gray-500 font-bold text-xs uppercase sticky top-0 shadow-sm">
                                <tr>
                                    <th class="px-6 py-3">Data</th>
                                    <th class="px-6 py-3">Hora</th>
                                    <th class="px-6 py-3">Aluna</th>
                                    <th class="px-6 py-3">Tipo</th>
                                    <th class="px-6 py-3 text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                ${pendingApps.map(app => `
                                    <tr class="hover:bg-gray-50 transition cursor-pointer" onclick="App.editAppointment(${app.id})">
                                        <td class="px-6 py-4 font-medium text-brand-600">${app.date.split('-').reverse().join('/')}</td>
                                        <td class="px-6 py-4 font-bold text-gray-900">${app.time}</td>
                                        <td class="px-6 py-4 font-medium text-gray-900">${app.name}</td>
                                        <td class="px-6 py-4">
                                            <span class="px-2 py-1 rounded text-xs font-bold uppercase ${app.type === 'fisica' ? 'bg-pink-100 text-pink-700' : 'bg-purple-100 text-purple-700'}">
                                                ${app.type === 'fisica' ? 'Avaliação' : 'Nutricional'}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 text-right flex justify-end gap-2">
                                            <button onclick="event.stopPropagation(); App.generateWhatsapp('${app.name}','${app.date}','${app.time}')" class="flex items-center gap-2 bg-green-50 text-green-600 px-3 py-1.5 rounded-lg border border-green-100 hover:bg-green-100 transition font-bold text-xs">
                                                <i class="fa-brands fa-whatsapp text-base"></i> ENVIAR MENSAGEM
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>`
                    }
                </div>
            </div>
        `;
    }
};

/* --- APP LOGIC CONTROLLER --- */
const App = {
    // Sidebar
    toggleSidebar() {
        State.sidebarCollapsed = !State.sidebarCollapsed;
        document.getElementById('sidebar').classList.toggle('sidebar-collapsed');
        document.getElementById('sidebar').classList.toggle('w-72');
        document.getElementById('sidebar').classList.toggle('w-20');
        document.getElementById('collapse-icon').classList.toggle('rotate-180');
    },

    // Chat
    toggleChatState() {
        const widget = document.getElementById('chat-widget');
        if(widget.classList.contains('hidden-widget')) {
            widget.classList.remove('hidden-widget'); // Abrir
        } else if (widget.style.height === '60px') {
            this.minimizeChat(); // Restaurar
        } else {
            widget.classList.add('hidden-widget'); // Fechar
        }
    },
    toggleChat() {
        const widget = document.getElementById('chat-widget');
        widget.classList.remove('hidden-widget');
        widget.style.height = '450px'; // Garante aberto e full
        this.renderChat();
    },
    closeChat() {
        document.getElementById('chat-widget').classList.add('hidden-widget');
    },
    minimizeChat() {
        const widget = document.getElementById('chat-widget');
        const isMin = widget.style.height === '60px';
        widget.style.height = isMin ? '450px' : '60px';
    },
    renderChat() {
        const container = document.getElementById('chat-messages');
        container.innerHTML = '';
        DB.messages.forEach(msg => {
            const isMe = msg.type === 'out';
            container.innerHTML += `
                <div class="flex ${isMe ? 'justify-end' : 'justify-start'}">
                    <div class="max-w-[85%] ${isMe ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200'} p-3 rounded-2xl text-sm shadow-sm">
                        ${!isMe ? `<p class="text-xs font-bold mb-1 ${DB.users[msg.sender]?.color || 'text-gray-500'}">${msg.sender}</p>` : ''}
                        <p>${msg.text}</p>
                        <p class="text-[10px] mt-1 text-right ${isMe ? 'text-pink-200' : 'text-gray-400'}">${msg.time}</p>
                    </div>
                </div>
            `;
        });
        container.scrollTop = container.scrollHeight;
    },
    sendChatMessage(e) {
        e.preventDefault();
        const input = document.getElementById('chat-input');
        if(!input.value.trim()) return;
        
        DB.messages.push({ 
            id: Date.now(), 
            text: input.value, 
            sender: "Eu", 
            type: "out", 
            time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) 
        });
        
        input.value = '';
        this.renderChat();
        
        setTimeout(() => {
            DB.messages.push({ 
                id: Date.now(), 
                text: "Recebido na Unidade Sul. Verificando...", 
                sender: "Unidade Sul", 
                type: "in", 
                time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) 
            });
            if(!document.getElementById('chat-widget').classList.contains('hidden-widget')) {
                this.renderChat();
            } else {
                this.showToast("Nova mensagem de Unidade Sul");
            }
        }, 2000);
    },

    // Agenda Logic
    filterAgenda(type) {
        State.agendaFilter = type;
        // Update Buttons UI
        ['all', 'fisica', 'nutri'].forEach(t => {
            const btn = document.getElementById(`filter-${t}`);
            if(type === t) {
                btn.className = "px-3 py-1 text-xs font-bold rounded-full bg-brand-100 text-brand-700 border border-brand-200 transition";
            } else {
                btn.className = "px-3 py-1 text-xs font-medium rounded-full text-gray-500 hover:bg-gray-100 transition";
            }
        });
        this.renderCalendar();
    },
    switchView(view) {
        State.agendaView = view;
        // Update Buttons UI
        const btnM = document.getElementById('view-month');
        const btnW = document.getElementById('view-week');
        if(view === 'month') {
            btnM.className = "px-4 py-2 text-xs font-bold rounded-md shadow-sm bg-white text-brand-600 transition-all";
            btnW.className = "px-4 py-2 text-xs font-medium rounded-md text-gray-500 hover:text-brand-600 transition-all";
        } else {
            btnW.className = "px-4 py-2 text-xs font-bold rounded-md shadow-sm bg-white text-brand-600 transition-all";
            btnM.className = "px-4 py-2 text-xs font-medium rounded-md text-gray-500 hover:text-brand-600 transition-all";
        }
        this.renderCalendar();
    },
    changeDate(delta) {
        const d = State.currentDate;
        if(State.agendaView === 'month') {
            d.setMonth(d.getMonth() + delta);
        } else {
            d.setDate(d.getDate() + (delta * 7)); // Pula semanas
        }
        State.currentDate = new Date(d); // Force reactivity
        this.renderCalendar();
    },
    renderCalendar() {
        const container = document.getElementById('calendar-container');
        if(!container) return;
        
        const d = State.currentDate;
        const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        
        if(State.agendaView === 'month') {
            document.getElementById('agenda-period').innerText = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
            this.renderMonthView(container);
        } else {
            // Calcular inicio da semana (Domingo)
            const startOfWeek = new Date(d);
            startOfWeek.setDate(d.getDate() - d.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            
            // Se a semana cruza meses, mostrar ambos
            let label = `${startOfWeek.getDate()} ${monthNames[startOfWeek.getMonth()].substr(0,3)}`;
            if(startOfWeek.getMonth() !== endOfWeek.getMonth()) {
                label += ` - ${endOfWeek.getDate()} ${monthNames[endOfWeek.getMonth()].substr(0,3)}`;
            } else {
                label += ` - ${endOfWeek.getDate()}`;
            }
            document.getElementById('agenda-period').innerText = label;
            this.renderWeekView(container, startOfWeek);
        }
    },
    renderMonthView(container) {
        const d = State.currentDate;
        const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
        const firstDay = new Date(d.getFullYear(), d.getMonth(), 1).getDay();

        let html = `
            <div class="grid grid-cols-7 gap-1 mb-1">
                ${['DOM','SEG','TER','QUA','QUI','SEX','SÁB'].map(d => `<div class="text-center text-[10px] font-bold text-gray-400 py-1">${d}</div>`).join('')}
            </div>
            <div class="calendar-grid">
        `;
        
        // Empty slots
        for(let i=0; i<firstDay; i++) html += '<div class="calendar-cell bg-gray-50"></div>';

        // Days
        for(let i=1; i<=daysInMonth; i++) {
            const dateStr = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${i.toString().padStart(2,'0')}`;
            const isHoliday = DB.holidays.includes(dateStr);
            
            // Filter appointments
            const apps = DB.appointments.filter(a => {
                if(a.date !== dateStr) return false;
                if(State.agendaFilter !== 'all' && a.type !== State.agendaFilter) return false;
                return true;
            });

            html += `
                <div class="calendar-cell p-1 border-b border-r border-gray-100 flex flex-col relative group ${isHoliday ? 'holiday' : 'cursor-pointer hover:bg-brand-50'}" onclick="${!isHoliday ? `Modals.open('${dateStr}')` : ''}">
                    <span class="text-xs font-bold p-1 ${isHoliday ? 'text-red-400' : 'text-gray-700'}">${i}</span>
                    <div class="flex-1 overflow-y-auto custom-scroll space-y-1 p-0.5">
                        ${apps.map(a => `
                            <div class="flex items-center justify-between text-[10px] px-1 py-0.5 rounded border cursor-pointer hover:opacity-80 transition ${a.type==='fisica' ? 'bg-pink-50 text-pink-700 border-pink-100' : 'bg-purple-50 text-purple-700 border-purple-100'}" onclick="event.stopPropagation(); App.editAppointment(${a.id})">
                                <span class="truncate max-w-[60px]"><b>${a.time}</b> ${a.name.split(' ')[0]}</span>
                                <i class="fa-solid fa-check-circle text-[8px] ${a.status === 'confirmed' ? 'text-green-500' : 'text-gray-300'}"></i>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        html += '</div>';
        container.innerHTML = html;
    },
    renderWeekView(container, startOfWeek) {
        // Gerar dias da semana
        const weekDays = [];
        for(let i=0; i<7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            weekDays.push(day);
        }

        const timeSlots = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'];

        let html = `
            <div class="grid grid-cols-8 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                <!-- Header -->
                <div class="bg-gray-50 text-center py-2 text-[10px] font-bold text-gray-400">HORA</div>
                ${weekDays.map(day => {
                    const dateStr = `${day.getFullYear()}-${(day.getMonth()+1).toString().padStart(2,'0')}-${day.getDate().toString().padStart(2,'0')}`;
                    const isHoliday = DB.holidays.includes(dateStr);
                    return `<div class="bg-white text-center py-2 text-[10px] font-bold ${isHoliday ? 'text-red-400 bg-red-50' : 'text-gray-600'}">
                        ${['DOM','SEG','TER','QUA','QUI','SEX','SÁB'][day.getDay()]}<br>
                        <span class="text-lg ${isHoliday ? 'text-red-500' : 'text-gray-800'}">${day.getDate()}</span>
                    </div>`;
                }).join('')}
        `;

        // Time Slots Rows
        timeSlots.forEach(time => {
            html += `<div class="bg-white text-center text-[10px] font-medium text-gray-400 py-2 border-t border-gray-100">${time}</div>`;
            
            weekDays.forEach(day => {
                const dateStr = `${day.getFullYear()}-${(day.getMonth()+1).toString().padStart(2,'0')}-${day.getDate().toString().padStart(2,'0')}`;
                const isHoliday = DB.holidays.includes(dateStr);
                
                // Find apps
                const apps = DB.appointments.filter(a => a.date === dateStr && a.time === time && (State.agendaFilter === 'all' || a.type === State.agendaFilter));

                html += `<div class="bg-white min-h-[50px] border-t border-l border-gray-100 p-1 relative group ${isHoliday ? 'bg-red-50' : 'hover:bg-gray-50 cursor-pointer'}" onclick="${!isHoliday ? `Modals.open('${dateStr}', '${time}')` : ''}">`;
                
                if(isHoliday) {
                    html += `<div class="text-[9px] text-red-300 font-bold rotate-45 absolute top-4 left-2 select-none">FERIADO</div>`;
                } else {
                    apps.forEach(a => {
                        html += `
                            <div class="text-[9px] p-1 rounded mb-1 border flex items-center justify-between cursor-pointer hover:scale-[1.02] transition ${a.type==='fisica' ? 'bg-pink-100 text-pink-800 border-pink-200' : 'bg-purple-100 text-purple-800 border-purple-200'}" onclick="event.stopPropagation(); App.editAppointment(${a.id})">
                                <span class="truncate font-bold">${a.name.split(' ')[0]}</span>
                                <i class="fa-solid fa-check-circle text-[8px] ${a.status === 'confirmed' ? 'text-green-600' : 'text-gray-400'}"></i>
                            </div>
                        `;
                    });
                }
                html += `</div>`;
            });
        });

        html += `</div>`;
        container.innerHTML = html;
    },

    // Appointment Editing Logic
    editAppointment(id) {
        const app = DB.appointments.find(a => a.id === id);
        if(!app) return;

        // Preenchimento do modal
        document.getElementById('modal-id').value = app.id;
        document.getElementById('modal-title').innerText = "Editar Agendamento";
        document.getElementById('modal-date-display').innerText = app.date.split('-').reverse().join('/');
        document.getElementById('modal-time').value = app.time;
        document.getElementById('modal-name').value = app.name;
        
        // Tipo
        this.setModalType(app.type);
        
        // Status
        document.getElementById('modal-confirmed').checked = (app.status === 'confirmed');
        this.toggleConfirmationUI();
        
        // Abrir
        document.getElementById('modal-appointment').classList.remove('hidden');
    },

    // Whatsapp Generator
    generateWhatsapp(name, date, time) {
        let n = name || document.getElementById('modal-name').value;
        let d = date || document.getElementById('modal-date-display').innerText;
        let t = time || document.getElementById('modal-time').value;
        let p = document.getElementById('modal-professional')?.value || "Profissional";
        let u = "Unidade Central"; 

        if(!n) { this.showToast("Preencha o nome da aluna"); return; }

        // Clean Date
        if(d.includes('-')) d = d.split('-').reverse().join('/');

        const msg = `Olá ${n}! Confirmamos seu agendamento no Espaço Mulher.\n📅 Data: ${d}\n⏰ Horário: ${t}\n👩‍⚕️ Profissional: ${p}\n📍 Unidade: ${u}`;
        
        const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
        this.showToast("WhatsApp aberto com a mensagem!");
    },

    // Utilities
    showToast(msg) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = "bg-gray-800 text-white px-4 py-3 rounded-lg shadow-xl text-sm flex items-center gap-3 animate-fade-in";
        toast.innerHTML = `<i class="fa-solid fa-check text-green-400"></i> ${msg}`;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    // Modal Logic
    setModalType(type) {
        const btnF = document.getElementById('btn-type-fisica');
        const btnN = document.getElementById('btn-type-nutri');
        if(type === 'fisica') {
            btnF.className = "py-2 rounded-lg text-sm font-bold transition-all shadow-sm bg-white text-brand-600 border border-gray-200";
            btnN.className = "py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-purple-600 transition-all";
        } else {
            btnN.className = "py-2 rounded-lg text-sm font-bold transition-all shadow-sm bg-white text-purple-600 border border-gray-200";
            btnF.className = "py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-brand-600 transition-all";
        }
    },
    toggleConfirmationUI() {
        const checkbox = document.getElementById('modal-confirmed');
        const icon = document.getElementById('status-icon');
        const text = document.getElementById('status-text');
        const container = document.getElementById('status-container');
        
        if(checkbox.checked) {
            icon.className = "fa-solid fa-circle-check text-green-500";
            text.className = "text-sm font-bold text-green-600";
            text.innerText = "Confirmado";
            container.classList.replace('bg-yellow-50', 'bg-green-50');
            container.classList.replace('border-yellow-200', 'border-green-200');
        } else {
            icon.className = "fa-solid fa-circle-check text-gray-400";
            text.className = "text-sm font-bold text-gray-500";
            text.innerText = "Pendente de Confirmação";
            container.classList.replace('bg-green-50', 'bg-yellow-50');
            container.classList.replace('border-green-200', 'border-yellow-200');
        }
    },
    saveAppointment() {
        // Lógica simulada para atualizar o objeto no array se for edição
        const id = document.getElementById('modal-id').value;
        if(id) {
            const appIndex = DB.appointments.findIndex(a => a.id == id);
            if(appIndex > -1) {
                // Atualiza status apenas como exemplo
                DB.appointments[appIndex].status = document.getElementById('modal-confirmed').checked ? 'confirmed' : 'pending';
                DB.appointments[appIndex].name = document.getElementById('modal-name').value;
                DB.appointments[appIndex].time = document.getElementById('modal-time').value;
                // Nota: Em app real atualizaria tudo
            }
        }
        
        this.showToast("Dados salvos com sucesso!");
        Modals.close();
        
        // Re-renderiza a view atual para mostrar mudanças
        if(State.currentView === 'agenda') App.renderCalendar();
        if(State.currentView === 'confirmacoes') Router.navigate('confirmacoes');
        if(State.currentView === 'dashboard') Router.navigate('dashboard');
    }
};

const Modals = {
    open(date, time) {
        // Reset para novo agendamento
        document.getElementById('modal-id').value = '';
        document.getElementById('modal-title').innerText = "Novo Agendamento";
        document.getElementById('modal-name').value = '';
        
        if(date) document.getElementById('modal-date-display').innerText = date.split('-').reverse().join('/');
        if(time) document.getElementById('modal-time').value = time;
        
        // Reset Confirmation
        document.getElementById('modal-confirmed').checked = false;
        App.toggleConfirmationUI();
        
        document.getElementById('modal-appointment').classList.remove('hidden');
    },
    close() {
        document.getElementById('modal-appointment').classList.add('hidden');
    }
};

/* --- INIT --- */
document.addEventListener('DOMContentLoaded', () => {
    
    // Login
    const loginForm = document.getElementById('login-form');
    if(loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = document.getElementById('login-btn');
            btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i>`;
            setTimeout(() => {
                document.getElementById('login-view').style.opacity = '0';
                setTimeout(() => {
                    document.getElementById('login-view').style.display = 'none';
                    const app = document.getElementById('app-view');
                    app.classList.remove('hidden');
                    void app.offsetWidth;
                    app.style.opacity = '1';
                    Router.navigate('dashboard');
                    App.showToast("Login realizado: Recepção Central");
                }, 500);
            }, 1000);
        });
    }

    // Clock
    setInterval(() => {
        const now = new Date();
        const time = now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
        const el = document.getElementById('clock');
        if(el) el.innerText = time;
    }, 1000);

});