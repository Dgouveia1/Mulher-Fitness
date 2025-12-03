import { API, appStore, showToast } from './api.js';

export const SettingsModule = {
    render(container) {
        const { user, profile } = appStore.get();
        
        // Validação de Segurança (Apenas Admin)
        if (!profile || profile.role !== 'admin_user') {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full text-gray-400">
                    <i class="fa-solid fa-lock text-4xl mb-4"></i>
                    <h2 class="text-xl font-bold">Acesso Negado</h2>
                    <p>Apenas administradores podem acessar esta área.</p>
                </div>
            `;
            return;
        }

        // Garante que dados estejam carregados
        if (!appStore.get().data.blocked_days.length) {
            API.fetchBlockedDays().then(() => this.renderContent(container));
        } else {
            this.renderContent(container);
        }
    },

    renderContent(container) {
        const blockedDays = appStore.get().data.blocked_days || [];

        container.innerHTML = `
            <div class="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 class="text-xl font-bold text-gray-800 mb-2"><i class="fa-solid fa-calendar-xmark text-brand-600 mr-2"></i>Gerenciar Dias Fechados</h2>
                    <p class="text-sm text-gray-500 mb-6">Cadastre feriados ou dias em que a clínica não abrirá. Estes dias ficarão bloqueados na agenda.</p>

                    <form id="form-blocked-day" class="flex flex-col md:flex-row gap-4 items-end bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div class="flex-1 w-full">
                            <label class="text-xs font-bold text-gray-500 uppercase block mb-1">Data</label>
                            <input type="date" id="block-date" class="w-full p-2.5 rounded-lg border border-gray-300 outline-none focus:border-brand-500" required>
                        </div>
                        <div class="flex-1 w-full">
                            <label class="text-xs font-bold text-gray-500 uppercase block mb-1">Motivo</label>
                            <input type="text" id="block-reason" placeholder="Ex: Feriado Nacional" class="w-full p-2.5 rounded-lg border border-gray-300 outline-none focus:border-brand-500" required>
                        </div>
                        <div class="w-full md:w-auto">
                             <button type="submit" class="w-full md:w-auto px-6 py-2.5 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition">
                                <i class="fa-solid fa-plus mr-1"></i> Bloquear
                             </button>
                        </div>
                    </form>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div class="p-4 border-b border-gray-100 bg-gray-50">
                        <h3 class="font-bold text-gray-700">Dias Bloqueados Registrados</h3>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left">
                            <thead class="bg-gray-50 text-gray-400 text-xs uppercase font-medium">
                                <tr>
                                    <th class="px-6 py-3">Data</th>
                                    <th class="px-6 py-3">Motivo</th>
                                    <th class="px-6 py-3 text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                ${blockedDays.length ? blockedDays.map(day => `
                                    <tr class="hover:bg-gray-50 transition">
                                        <td class="px-6 py-4 font-mono text-sm text-brand-600 font-bold">
                                            ${new Date(day.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                        </td>
                                        <td class="px-6 py-4 text-gray-700">${day.reason}</td>
                                        <td class="px-6 py-4 text-right">
                                            <button onclick="SettingsModule.deleteDay('${day.id}')" class="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition" title="Remover">
                                                <i class="fa-solid fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('') : `
                                    <tr><td colspan="3" class="p-8 text-center text-gray-400">Nenhum dia bloqueado.</td></tr>
                                `}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('form-blocked-day').addEventListener('submit', async (e) => {
            e.preventDefault();
            const date = document.getElementById('block-date').value;
            const reason = document.getElementById('block-reason').value;
            
            if (date && reason) {
                const success = await API.saveBlockedDay(date, reason);
                if (success) this.render(container); // Refresh
            }
        });
    },

    async deleteDay(id) {
        if (confirm('Tem certeza que deseja desbloquear esta data?')) {
            const success = await API.deleteBlockedDay(id);
            if (success) {
                const container = document.getElementById('view-container');
                this.render(container);
            }
        }
    }
};

window.SettingsModule = SettingsModule;