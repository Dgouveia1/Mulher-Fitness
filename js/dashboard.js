import { appStore, API } from './api.js';
import { Utils } from './utils.js';
import { CalendarModule } from './calendar.js';

export const DashboardModule = {
    render(view, container) {
        const state = appStore.get();
        const appointments = state.data.appointments;

        if (view === 'dashboard') {
            container.innerHTML = this.getDashboardTemplate(appointments);
        } else if (view === 'confirmations') {
            container.innerHTML = this.getConfirmationsTemplate(appointments);
            this.bindFilterEvents(); // Ativa os listeners dos filtros
        }
    },

    // Função para extrair métricas do Dashboard (Solicitação #2)
    calculateMetrics(appointments) {
        const today = new Date().toISOString().split('T')[0];
        const currentMonth = new Date().getMonth();
        
        const todayApps = appointments.filter(a => a.date === today);
        const monthApps = appointments.filter(a => new Date(a.date).getMonth() === currentMonth);
        const pendingCount = appointments.filter(a => a.status === 'pending').length;
        const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;
        const conversionRate = monthApps.length ? Math.round((confirmedCount / appointments.length) * 100) : 0;

        return {
            todayApps,
            monthApps,
            pendingCount,
            conversionRate
        };
    },

    getDashboardTemplate(appointments) {
        const metrics = this.calculateMetrics(appointments);
        const { todayApps, monthApps, pendingCount, conversionRate } = metrics;

        return `
            <div class="space-y-6 animate-fade-in pb-10">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 metric-card">
                        <div class="flex justify-between items-start">
                            <div>
                                <p class="text-xs font-bold text-gray-500 uppercase tracking-wide">Hoje</p>
                                <h3 class="text-2xl font-bold text-gray-800 mt-1">${todayApps.length}</h3>
                            </div>
                            <div class="p-2 bg-brand-50 text-brand-600 rounded-lg"><i class="fa-solid fa-calendar-day"></i></div>
                        </div>
                        <div class="mt-2 text-xs text-gray-400">Agendamentos do dia</div>
                    </div>

                    <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 metric-card">
                        <div class="flex justify-between items-start">
                            <div>
                                <p class="text-xs font-bold text-gray-500 uppercase tracking-wide">Pendentes</p>
                                <h3 class="text-2xl font-bold text-amber-600 mt-1">${pendingCount}</h3>
                            </div>
                            <div class="p-2 bg-amber-50 text-amber-600 rounded-lg"><i class="fa-regular fa-clock"></i></div>
                        </div>
                        <div class="mt-2 text-xs text-gray-400">Aguardando confirmação</div>
                    </div>

                    <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 metric-card">
                        <div class="flex justify-between items-start">
                            <div>
                                <p class="text-xs font-bold text-gray-500 uppercase tracking-wide">Taxa Confirmação</p>
                                <h3 class="text-2xl font-bold text-blue-600 mt-1">${conversionRate}%</h3>
                            </div>
                            <div class="p-2 bg-blue-50 text-blue-600 rounded-lg"><i class="fa-solid fa-chart-line"></i></div>
                        </div>
                        <div class="mt-2 text-xs text-gray-400">Performance geral do mês</div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div class="p-5 border-b border-gray-100 flex justify-between items-center">
                            <h3 class="font-bold text-gray-800">Próximos Atendimentos</h3>
                            <button class="text-xs font-bold text-brand-600 hover:text-brand-700" onclick="App.navigate('agenda')">Ver Agenda</button>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left">
                                <tbody class="divide-y divide-gray-100">
                                    ${todayApps.length ? todayApps.map(app => `
                                        <tr class="hover:bg-gray-50 transition cursor-pointer" onclick="CalendarModule.editAppointment(${app.id})">
                                            <td class="px-5 py-4 w-20 text-center border-r border-gray-50">
                                                <div class="font-bold text-gray-800">${app.time}</div>
                                            </td>
                                            <td class="px-5 py-4">
                                                <div class="font-bold text-sm text-gray-800">${app.client_name}</div>
                                                <div class="text-xs text-gray-500">${app.type === 'fisica' ? 'Avaliação Física' : 'Consulta Nutricional'}</div>
                                            </td>
                                            <td class="px-5 py-4 text-right">
                                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${app.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                                                    ${app.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                                                </span>
                                            </td>
                                        </tr>
                                    `).join('') : `
                                        <tr>
                                            <td colspan="3" class="px-6 py-10 text-center text-gray-400 flex flex-col items-center">
                                                <i class="fa-regular fa-calendar-xmark text-3xl mb-2 opacity-50"></i>
                                                <p>Sem agendamentos para hoje.</p>
                                            </td>
                                        </tr>
                                    `}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <h3 class="font-bold text-gray-800 mb-6">Distribuição por Tipo</h3>
                        <div class="space-y-6">
                            <div>
                                <div class="flex justify-between text-sm mb-1">
                                    <span class="text-gray-600 font-medium"><i class="fa-solid fa-heart-pulse text-brand-500 mr-1"></i> Física</span>
                                    <span class="font-bold text-gray-800">${monthApps.filter(a => a.type === 'fisica').length}</span>
                                </div>
                                <div class="chart-bar-container">
                                    <div class="chart-bar-fill bg-brand-500" style="width: ${monthApps.length ? (monthApps.filter(a => a.type === 'fisica').length / monthApps.length) * 100 : 0}%"></div>
                                </div>
                            </div>
                            <div>
                                <div class="flex justify-between text-sm mb-1">
                                    <span class="text-gray-600 font-medium"><i class="fa-solid fa-apple-whole text-purple-500 mr-1"></i> Nutricional</span>
                                    <span class="font-bold text-gray-800">${monthApps.filter(a => a.type === 'nutri').length}</span>
                                </div>
                                <div class="chart-bar-container">
                                    <div class="chart-bar-fill bg-purple-500" style="width: ${monthApps.length ? (monthApps.filter(a => a.type === 'nutri').length / monthApps.length) * 100 : 0}%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    getConfirmationsTemplate(appointments) {
        // Inicialmente mostra os pendentes, mas permite filtrar tudo
        const pending = appointments.filter(a => a.status === 'pending').sort((a,b) => a.date.localeCompare(b.date));
        
        return `
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in h-full flex flex-col">
                <div class="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-amber-50">
                    <div>
                        <h3 class="font-bold text-gray-800 text-lg">Central de Confirmações</h3>
                        <p class="text-sm text-gray-500">Gerencie e filtre os agendamentos</p>
                    </div>
                    
                    <!-- Filtros (Solicitação #3) -->
                    <div class="flex gap-2 items-center flex-wrap justify-end">
                        <input type="date" id="filter-date" class="px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-brand-500" placeholder="Data">
                        <input type="text" id="filter-name" class="px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-brand-500" placeholder="Nome...">
                        <input type="text" id="filter-phone" class="px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-brand-500" placeholder="Telefone...">
                        <button id="btn-apply-filters" class="bg-brand-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-brand-700 transition"><i class="fa-solid fa-filter"></i></button>
                    </div>
                </div>
                
                <div class="overflow-x-auto flex-1 custom-scroll">
                    <table class="w-full text-left" id="table-confirmations">
                        <thead class="bg-gray-50 text-gray-400 text-xs uppercase font-medium sticky top-0">
                            <tr>
                                <th class="px-6 py-3">Data</th>
                                <th class="px-6 py-3">Cliente</th>
                                <th class="px-6 py-3">Status</th>
                                <th class="px-6 py-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100" id="tbody-confirmations">
                            ${this.renderTableRows(pending)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    bindFilterEvents() {
        const btn = document.getElementById('btn-apply-filters');
        if(!btn) return;

        const applyFilters = () => {
            const date = document.getElementById('filter-date').value;
            const name = document.getElementById('filter-name').value.toLowerCase();
            const phone = document.getElementById('filter-phone').value;
            
            const appointments = appStore.get().data.appointments;
            
            // Filtra
            const filtered = appointments.filter(a => {
                const matchDate = !date || a.date === date;
                const matchName = !name || a.client_name.toLowerCase().includes(name);
                const matchPhone = !phone || (a.client_phone && a.client_phone.includes(phone));
                return matchDate && matchName && matchPhone;
            });

            document.getElementById('tbody-confirmations').innerHTML = this.renderTableRows(filtered);
        };

        btn.addEventListener('click', applyFilters);
        // Opcional: filtrar ao digitar
        document.getElementById('filter-name').addEventListener('keyup', applyFilters);
        document.getElementById('filter-phone').addEventListener('keyup', applyFilters);
    },

    renderTableRows(data) {
        if (data.length === 0) return '<tr><td colspan="4" class="p-8 text-center text-gray-400">Nenhum agendamento encontrado.</td></tr>';

        return data.map(app => `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-6 py-4">
                    <div class="font-bold text-gray-800">${new Date(app.date).toLocaleDateString('pt-BR')}</div>
                    <div class="text-xs text-brand-600 font-bold">${app.time} (${app.duration || 60}m)</div>
                </td>
                <td class="px-6 py-4">
                    <div class="font-medium text-gray-900">${app.client_name}</div>
                    <div class="text-xs text-gray-400">${app.type}</div>
                </td>
                <td class="px-6 py-4">
                     <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${app.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}">
                        ${app.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <div class="flex justify-end gap-2">
                        <button onclick="DashboardModule.sendWhatsapp(${app.id})" class="p-2 rounded-lg text-green-600 bg-green-50 hover:bg-green-100 transition" title="WhatsApp">
                            <i class="fa-brands fa-whatsapp"></i>
                        </button>
                        ${app.status !== 'confirmed' ? `
                        <button onclick="DashboardModule.quickConfirm(${app.id})" class="p-2 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 transition" title="Confirmar">
                            <i class="fa-solid fa-check"></i>
                        </button>` : ''}
                        <button onclick="CalendarModule.editAppointment(${app.id})" class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition" title="Editar">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    async quickConfirm(id) {
        Utils.showConfirm(
            'Confirmar Presença?',
            'Deseja marcar este agendamento como confirmado?',
            async () => {
                const success = await API.saveAppointment({ id, status: 'confirmed' });
                // Atualiza a tabela mantendo filtros (re-renderiza a view completa por simplicidade, ou poderia recarregar só a tabela)
                if (success) DashboardModule.render('confirmations', document.getElementById('view-container'));
            }
        );
    },

    sendWhatsapp(id) {
        const app = appStore.get().data.appointments.find(a => a.id === id);
        if (!app?.client_phone) return Utils.showToast('Sem telefone cadastrado', 'error');
        
        const msg = `Olá ${app.client_name}! Confirmamos seu agendamento para dia ${new Date(app.date).toLocaleDateString()} às ${app.time}?`;
        const url = `https://wa.me/55${app.client_phone.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
    }
};

window.DashboardModule = DashboardModule;