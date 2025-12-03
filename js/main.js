import { API, appStore, showToast, supabaseClient } from './api.js';
import { CalendarModule } from './calendar.js';
import { DashboardModule } from './dashboard.js';
import { ChatModule } from './chat.js';
import { ClientsModule } from './clients.js';
import { SettingsModule } from './settings.js'; // Novo Módulo

const App = {
    async init() {
        console.log('[App] Starting...');
        
        supabaseClient.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                appStore.set(s => ({ ...s, user: session.user }));
                App.loadApp();
            } else if (event === 'SIGNED_OUT') {
                appStore.set(s => ({ ...s, user: null }));
                ChatModule.cleanup();
                App.showLogin();
            }
        });

        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
            appStore.set(s => ({ ...s, user: session.user }));
            App.loadApp();
        } else {
            App.showLogin();
        }

        App.bindEvents();
    },

    async loadApp() {
        document.getElementById('login-view').classList.add('hidden');
        document.getElementById('app-layout').classList.remove('hidden');
        setTimeout(() => document.getElementById('app-layout').classList.remove('opacity-0'), 100);

        const user = appStore.get().user;
        if (user) {
            const { data } = await supabaseClient.from('profiles').select('*').eq('id', user.id).single();
            if (data) {
                appStore.set(s => ({ ...s, profile: data }));

                document.getElementById('user-name').innerText = user.email.split('@')[0];
                document.getElementById('user-role').innerText = data.role === 'admin_user' ? 'Administrador' : 'Operacional';

                // Mostrar menu Admin
                if (data.role === 'admin_user') {
                    document.getElementById('nav-settings').classList.remove('hidden');
                }
            }
        }

        // Initialize Modules
        CalendarModule.init();
        ChatModule.init();

        // Load Initial Data
        await Promise.all([
            API.fetchAppointments(),
            API.fetchMessages(),
            API.fetchClients(),
            API.fetchBlockedDays(), // Novo
            API.fetchUsersList() // Para Chat
        ]);

        setInterval(() => {
            const now = new Date();
            document.getElementById('clock').innerText = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        }, 1000);

        App.navigate('dashboard');
    },

    showLogin() {
        document.getElementById('app-layout').classList.add('hidden');
        document.getElementById('login-view').classList.remove('hidden');
    },

    navigate(view) {
        appStore.set(s => ({ ...s, currentView: view }));

        document.querySelectorAll('.nav-item').forEach(el => {
            if (el.dataset.view === view) {
                el.classList.add('bg-brand-50', 'text-brand-600');
                el.classList.remove('text-gray-500');
            } else if (el.dataset.view) {
                el.classList.remove('bg-brand-50', 'text-brand-600');
                el.classList.add('text-gray-500');
            }
        });

        if (window.innerWidth < 768) {
            document.getElementById('sidebar').classList.add('-translate-x-full');
            document.getElementById('sidebar-backdrop').classList.add('hidden');
        }

        const container = document.getElementById('view-container');
        let title = 'Painel';
        
        // Render View
        if (view === 'agenda') {
            title = 'Agenda';
            CalendarModule.render(container);
        } else if (view === 'clients') {
            title = 'Clientes';
            ClientsModule.render(container);
        } else if (view === 'settings') {
            title = 'Configurações';
            SettingsModule.render(container);
        } else if (view === 'confirmations') {
            title = 'Confirmações';
            DashboardModule.render(view, container);
        } else {
            title = 'Dashboard';
            DashboardModule.render('dashboard', container);
        }
        
        document.getElementById('page-title').innerText = title;
    },

    bindEvents() {
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = btn.dataset.view;
                if (view === 'logout') {
                    supabaseClient.auth.signOut();
                } else if (view) {
                    App.navigate(view);
                }
            });
        });

        document.getElementById('login-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const btn = document.getElementById('btn-login');

            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

            const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
            if (error) {
                document.getElementById('login-error').classList.remove('hidden');
                document.getElementById('login-error-text').innerText = 'Email ou senha incorretos.';
                btn.disabled = false;
                btn.innerHTML = '<span>Entrar</span> <i class="fa-solid fa-arrow-right"></i>';
            }
        });

        document.getElementById('btn-toggle-mobile')?.addEventListener('click', () => {
            document.getElementById('sidebar').classList.remove('-translate-x-full');
            document.getElementById('sidebar-backdrop').classList.remove('hidden');
            document.getElementById('sidebar-backdrop').classList.remove('opacity-0');
        });

        document.getElementById('sidebar-backdrop')?.addEventListener('click', () => {
            document.getElementById('sidebar').classList.add('-translate-x-full');
            document.getElementById('sidebar-backdrop').classList.add('hidden');
        });
    }
};

window.App = App;
document.addEventListener('DOMContentLoaded', App.init);

window.addEventListener('beforeunload', () => {
    ChatModule.cleanup();
});