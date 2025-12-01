import { API, appStore, showToast, supabaseClient } from './api.js';
import { Utils } from './utils.js';

export const CalendarModule = {
    currentDate: new Date(),
    viewMode: 'week', 
    startHour: 6, 
    endHour: 22,
    initialized: false, 

    init() {
        console.log('[Calendar] Init');
        if (this.initialized) return; 
        this.initialized = true;

        this.bindEvents();
    },

    bindEvents() {
        document.getElementById('btn-save-appointment')?.addEventListener('click', () => this.saveAppointment());
        document.getElementById('btn-delete')?.addEventListener('click', () => this.deleteAppointment());
        
        // Adiciona listener para fechar modal ao clicar no backdrop
        const backdrop = document.getElementById('modal-backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', () => this.closeModal());
        }
        
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.type-btn').forEach(b => {
                    b.classList.remove('bg-brand-50', 'ring-2', 'ring-brand-500', 'text-brand-600');
                    b.classList.add('text-gray-500');
                });
                btn.classList.add('bg-brand-50', 'ring-2', 'ring-brand-500', 'text-brand-600');
                btn.classList.remove('text-gray-500');
                document.getElementById('app-type').value = btn.dataset.value;
            });
        });
    },

    render(container) {
        if (!container) container = document.getElementById('view-container');
        if (!container) return;
        
        // Toolbar
        const toolbarHtml = `
            <div class="flex flex-col md:flex-row justify-between items-center mb-4 gap-4 p-4 md:p-0">
                <div class="flex items-center gap-2 bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                    <button class="px-3 py-1.5 text-sm font-medium rounded-md ${this.viewMode === 'week' ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'}" onclick="CalendarModule.switchView('week')">Semana</button>
                    <button class="px-3 py-1.5 text-sm font-medium rounded-md ${this.viewMode === 'month' ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'}" onclick="CalendarModule.switchView('month')">Mês</button>
                </div>

                <div class="flex items-center gap-4">
                    <button onclick="CalendarModule.changeDate(-1)" class="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-600"><i class="fa-solid fa-chevron-left"></i></button>
                    <h2 class="text-lg font-bold text-gray-800 capitalize min-w-[200px] text-center">
                        ${this.getHeaderTitle()}
                    </h2>
                    <button onclick="CalendarModule.changeDate(1)" class="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-600"><i class="fa-solid fa-chevron-right"></i></button>
                </div>
                
                <button onclick="CalendarModule.goToToday()" class="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Hoje</button>
            </div>
            <div id="calendar-content" class="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden h-[calc(100vh-180px)]"></div>
        `;
        
        container.innerHTML = toolbarHtml;
        const content = document.getElementById('calendar-content');

        if (this.viewMode === 'week') {
            this.renderWeekView(content);
        } else {
            this.renderMonthView(content);
        }
    },

    switchView(mode) {
        this.viewMode = mode;
        this.render();
    },

    goToToday() {
        this.currentDate = new Date();
        this.render();
    },

    changeDate(delta) {
        if (this.viewMode === 'week') {
            this.currentDate.setDate(this.currentDate.getDate() + (delta * 7));
        } else {
            this.currentDate.setMonth(this.currentDate.getMonth() + delta);
        }
        this.render();
    },

    getHeaderTitle() {
        const options = { month: 'long', year: 'numeric' };
        if (this.viewMode === 'week') {
            const curr = new Date(this.currentDate);
            const first = curr.getDate() - curr.getDay(); 
            const firstDay = new Date(curr.setDate(first));
            const lastDay = new Date(curr.setDate(curr.getDate() + 6));
            
            if (firstDay.getMonth() === lastDay.getMonth()) {
                return firstDay.toLocaleDateString('pt-BR', options);
            } else {
                return `${firstDay.toLocaleDateString('pt-BR', { month: 'short' })} - ${lastDay.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}`;
            }
        }
        return this.currentDate.toLocaleDateString('pt-BR', options);
    },

    renderMonthView(container) {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        let html = `
            <div class="flex flex-col h-full">
                <div class="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                    ${['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => 
                        `<div class="py-2 text-center text-xs font-bold text-gray-500 uppercase">${d}</div>`
                    ).join('')}
                </div>
                <div class="calendar-month-grid flex-1 overflow-y-auto">
        `;

        for (let i = 0; i < startingDay; i++) {
            html += `<div class="calendar-day-cell bg-gray-50/50"></div>`;
        }

        const appointments = appStore.get().data.appointments;

        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
            const isToday = new Date().toISOString().split('T')[0] === dateStr;
            const dayApps = appointments.filter(a => a.date === dateStr).sort((a,b) => a.time.localeCompare(b.time));

            html += `
                <div class="calendar-day-cell hover:bg-gray-50 transition cursor-pointer" onclick="CalendarModule.openModal('${dateStr}')">
                    <div class="text-center p-1">
                        <span class="day-number ${isToday ? 'today' : 'text-gray-700'}">${i}</span>
                    </div>
                    <div class="flex-1 overflow-hidden px-1 space-y-1">
                        ${dayApps.slice(0, 3).map(app => `
                            <div class="calendar-event-chip ${app.type === 'fisica' ? 'chip-fisica' : 'chip-nutri'}"
                                 onclick="event.stopPropagation(); CalendarModule.editAppointment(${app.id})">
                                ${app.time} ${app.client_name.split(' ')[0]}
                            </div>
                        `).join('')}
                        ${dayApps.length > 3 ? `<div class="text-[10px] text-gray-500 font-medium pl-1">+${dayApps.length - 3} mais</div>` : ''}
                    </div>
                </div>
            `;
        }

        html += `</div></div>`;
        container.innerHTML = html;
    },

    renderWeekView(container) {
        const curr = new Date(this.currentDate);
        const first = curr.getDate() - curr.getDay();
        const weekStart = new Date(curr.setDate(first));
        const weekDays = [];
        
        for (let i=0; i<7; i++) {
            weekDays.push(new Date(weekStart.getTime() + (i * 24 * 60 * 60 * 1000)));
        }

        const appointments = appStore.get().data.appointments;
        const totalHours = this.endHour - this.startHour;
        const hourHeight = 60; // 60px por hora = 1px por minuto

        let html = `
            <div class="week-view-container">
                <div class="week-header bg-white">
                    ${weekDays.map(d => {
                        const isToday = d.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
                        return `
                        <div class="week-header-cell ${isToday ? 'bg-brand-50' : ''}">
                            <div class="text-[10px] font-bold text-gray-400 uppercase">${d.toLocaleDateString('pt-BR', {weekday: 'short'})}</div>
                            <div class="text-xl font-heading font-bold ${isToday ? 'text-brand-600' : 'text-gray-800'}">${d.getDate()}</div>
                        </div>`;
                    }).join('')}
                </div>
                <div class="week-body custom-scroll">
                    <div class="time-column">
                        ${Array.from({length: totalHours + 1}, (_, i) => this.startHour + i).map(h => 
                            `<div class="time-slot-label">${h.toString().padStart(2, '0')}:00</div>`
                        ).join('')}
                    </div>
                    <div class="days-grid" style="height: ${(totalHours + 1) * hourHeight}px">
        `;

        weekDays.forEach((day, index) => {
            const dateStr = day.toISOString().split('T')[0];
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            const dayApps = appointments.filter(a => a.date === dateStr);

            html += `<div class="day-column ${isToday ? 'bg-brand-50/20' : ''}" data-date="${dateStr}">`;
            
            if (isToday) {
                const now = new Date();
                const currentHour = now.getHours() + (now.getMinutes()/60);
                if (currentHour >= this.startHour && currentHour <= this.endHour) {
                    const top = (currentHour - this.startHour) * hourHeight;
                    html += `<div class="current-time-indicator" style="top: ${top}px"></div>`;
                }
            }

            dayApps.forEach(app => {
                const [h, m] = app.time.split(':').map(Number);
                const eventTime = h + (m/60);
                
                // Calcula duração e altura
                const durationMinutes = app.duration || 60;
                const height = (durationMinutes / 60) * hourHeight;

                if (eventTime >= this.startHour && eventTime < this.endHour) {
                    const top = (eventTime - this.startHour) * hourHeight;
                    const colorClass = app.type === 'fisica' 
                        ? 'bg-pink-100 border-pink-500 text-pink-900' 
                        : 'bg-purple-100 border-purple-500 text-purple-900';

                    html += `
                        <div class="week-event ${colorClass}" 
                             style="top: ${top}px; height: ${height}px;"
                             onclick="event.stopPropagation(); CalendarModule.editAppointment(${app.id})">
                             <div class="font-bold leading-tight flex justify-between">
                                <span>${app.time}</span>
                                <span class="text-[9px] opacity-75">${durationMinutes}m</span>
                             </div>
                             <div class="truncate text-xs mt-0.5">${app.client_name}</div>
                        </div>
                    `;
                }
            });

            Array.from({length: totalHours}, (_, i) => this.startHour + i).forEach(h => {
                const top = (h - this.startHour) * hourHeight;
                html += `
                    <div class="absolute w-full hover:bg-gray-100/50 cursor-pointer transition" 
                         style="top: ${top}px; height: ${hourHeight}px; z-index: 1;"
                         onclick="CalendarModule.openModal('${dateStr}', '${h.toString().padStart(2,'0')}:00')">
                    </div>
                `;
            });

            html += `</div>`;
        });

        html += `</div></div></div>`;
        container.innerHTML = html;
    },

    openModal(date = '', time = '') {
        const modal = document.getElementById('appointment-modal');
        if (!modal) {
            console.error('[Calendar] Modal não encontrado');
            return;
        }

        const formDate = document.getElementById('app-date');
        const formTime = document.getElementById('app-time');
        const formDuration = document.getElementById('app-duration'); // Opcional - pode não existir
        
        const appId = document.getElementById('app-id');
        const appClient = document.getElementById('app-client');
        const appPhone = document.getElementById('app-phone');
        const modalTitle = document.getElementById('modal-title');
        const btnDelete = document.getElementById('btn-delete');
        const modalConfirmed = document.getElementById('modal-confirmed');
        
        // Corrigido: validação de elementos antes de usar
        if (appId) appId.value = '';
        if (appClient) appClient.value = '';
        if (appPhone) appPhone.value = '';
        if (modalTitle) modalTitle.innerText = 'Novo Agendamento';
        if (btnDelete) btnDelete.classList.add('hidden');
        if (modalConfirmed) modalConfirmed.checked = false;
        
        if (date && formDate) formDate.value = date;
        if (time && formTime) formTime.value = time;
        if (formDuration) formDuration.value = "60"; // Padrão - só se elemento existir
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    },

    closeModal() {
        const modal = document.getElementById('appointment-modal');
        if (!modal) {
            console.warn('[Calendar] Modal não encontrado para fechar');
            return;
        }
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    },

    editAppointment(id) {
        const app = appStore.get().data.appointments.find(a => a.id === id);
        if (!app) {
            console.warn('[Calendar] Agendamento não encontrado:', id);
            return;
        }

        const modal = document.getElementById('appointment-modal');
        if (!modal) {
            console.error('[Calendar] Modal não encontrado');
            return;
        }

        const appId = document.getElementById('app-id');
        const appDate = document.getElementById('app-date');
        const appTime = document.getElementById('app-time');
        const formDuration = document.getElementById('app-duration');
        const appClient = document.getElementById('app-client');
        const appPhone = document.getElementById('app-phone');
        const modalConfirmed = document.getElementById('modal-confirmed');
        const modalTitle = document.getElementById('modal-title');
        const btnDelete = document.getElementById('btn-delete');

        // Corrigido: validação de elementos antes de usar
        if (appId) appId.value = app.id;
        if (appDate) appDate.value = app.date;
        if (appTime) appTime.value = app.time;
        if (formDuration) formDuration.value = app.duration || 60; // Só se elemento existir
        if (appClient) appClient.value = app.client_name;
        if (appPhone) appPhone.value = app.client_phone || '';
        if (modalConfirmed) modalConfirmed.checked = app.status === 'confirmed';
        
        const typeBtn = document.querySelector(`.type-btn[data-value="${app.type}"]`);
        if (typeBtn) typeBtn.click();

        if (modalTitle) modalTitle.innerText = 'Editar Agendamento';
        if (btnDelete) btnDelete.classList.remove('hidden');

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    },

    async saveAppointment() {
        const btn = document.getElementById('btn-save-appointment');
        if (!btn) {
            console.error('[Calendar] Botão salvar não encontrado');
            return;
        }

        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Salvando...';

        const appId = document.getElementById('app-id');
        const appDate = document.getElementById('app-date');
        const appTime = document.getElementById('app-time');
        const formDuration = document.getElementById('app-duration');
        const appClient = document.getElementById('app-client');
        const appPhone = document.getElementById('app-phone');
        const appType = document.getElementById('app-type');
        const modalConfirmed = document.getElementById('modal-confirmed');
        const modalUnit = document.getElementById('modal-unit');

        // Corrigido: validação e valores padrão seguros
        const id = appId ? appId.value : '';
        const payload = {
            date: appDate ? appDate.value : '',
            time: appTime ? appTime.value : '',
            duration: formDuration ? (parseInt(formDuration.value) || 60) : 60,
            client_name: appClient ? appClient.value : '',
            client_phone: appPhone ? appPhone.value : '',
            type: appType ? appType.value : 'fisica',
            status: modalConfirmed && modalConfirmed.checked ? 'confirmed' : 'pending',
            unit: modalUnit ? modalUnit.value : 'Central'
        };

        if (!payload.date || !payload.time || !payload.client_name) {
            showToast('Preencha os campos obrigatórios', 'warning');
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-regular fa-floppy-disk"></i> Salvar';
            return;
        }

        const success = await API.saveAppointment({ ...payload, id: id ? id : undefined });
        
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-regular fa-floppy-disk"></i> Salvar';

        if (success) {
            this.closeModal();
            this.render(); 
        }
    },

    async deleteAppointment() {
        const id = document.getElementById('app-id').value;
        if (!id) return;

        Utils.showConfirm(
            'Excluir Agendamento?',
            'Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.',
            async () => {
                const success = await API.deleteAppointment(id);
                if (success) {
                    this.closeModal();
                    this.render();
                }
            }
        );
    }
};

window.CalendarModule = CalendarModule;