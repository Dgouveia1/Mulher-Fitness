// --- NOVO MÓDULO: Gerenciamento de Clientes (Solicitação #3) ---
import { appStore, API } from './api.js';

export const ClientsModule = {
    render(container) {
        // Garante que temos a lista de clientes atualizada
        if (!appStore.get().data.clients.length) {
            API.fetchClients();
        }
        
        // Listener para atualizar a tela quando os dados chegarem
        this.unsubscribe = appStore.subscribe((newState, oldState) => {
            if (newState.data.clients !== oldState.data.clients) {
                this.renderContent(container);
            }
        });

        this.renderContent(container);
    },

    cleanup() {
        if (this.unsubscribe) this.unsubscribe();
    },

    renderContent(container) {
        const clients = appStore.get().data.clients || [];

        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in h-full flex flex-col">
                <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-purple-50">
                    <div>
                        <h3 class="font-bold text-gray-800 text-lg">Base de Clientes</h3>
                        <p class="text-sm text-gray-500">Histórico e contatos</p>
                    </div>
                    
                    <div class="flex gap-2">
                        <input type="text" id="client-search" class="px-4 py-2 rounded-lg border border-gray-200 outline-none focus:border-purple-500 w-64" placeholder="Buscar cliente...">
                    </div>
                </div>
                
                <div class="overflow-x-auto flex-1 custom-scroll">
                    <table class="w-full text-left">
                        <thead class="bg-gray-50 text-gray-400 text-xs uppercase font-medium sticky top-0">
                            <tr>
                                <th class="px-6 py-3">Nome</th>
                                <th class="px-6 py-3">Telefone</th>
                                <th class="px-6 py-3">Email</th>
                                <th class="px-6 py-3">Última Visita</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100" id="clients-tbody">
                            ${this.renderRows(clients)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        document.getElementById('client-search')?.addEventListener('keyup', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = clients.filter(c => c.name.toLowerCase().includes(term));
            document.getElementById('clients-tbody').innerHTML = this.renderRows(filtered);
        });
    },

    renderRows(clients) {
        if (clients.length === 0) return '<tr><td colspan="4" class="p-8 text-center text-gray-400">Nenhum cliente registrado. Agende um horário para criar registros automaticamente.</td></tr>';

        return clients.map(client => `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-6 py-4 font-bold text-gray-800">${client.name}</td>
                <td class="px-6 py-4 font-mono text-sm text-gray-600">${client.phone || '-'}</td>
                <td class="px-6 py-4 text-sm text-gray-600">${client.email || '-'}</td>
                <td class="px-6 py-4 text-sm text-gray-500">
                    ${client.last_visit ? new Date(client.last_visit).toLocaleDateString('pt-BR') : 'N/A'}
                </td>
            </tr>
        `).join('');
    }
};