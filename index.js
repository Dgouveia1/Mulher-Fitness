// --- START OF CONSTANTS ---
const View = {
    Dashboard: 'DASHBOARD',
    Gym: 'GYM',
    Home: 'HOME',
    Profile: 'PROFILE',
  };
  
  const MOCK_USER = {
    name: 'Ana Souza',
    avatarUrl: 'https://picsum.photos/seed/user2/200/200',
    membership: 'Premium',
    joinDate: '2023-03-20',
    stats: {
      workoutsCompleted: 65,
      hoursTrained: 95,
      weightLifted: 12400,
    },
  };
  
  const MOCK_WORKOUT_PLAN = {
    name: 'Plano de Fortalecimento e Definição',
    description: 'Um plano de 4 dias focado em fortalecer e tonificar os músculos, combinando exercícios de força com foco na forma.',
    days: [
      {
        day: 'A',
        focus: 'Membros Inferiores (Foco Glúteos)',
        exercises: [
          { name: 'Agachamento com Barra', sets: '4', reps: '8-12', rest: '60', imageUrl: 'https://picsum.photos/seed/squat/400/300', videoUrl: 'https://example.com/squat-video' },
          { name: 'Levantamento Terra Romeno', sets: '3', reps: '10-12', rest: '60', imageUrl: 'https://picsum.photos/seed/rdl/400/300', videoUrl: 'https://example.com/rdl-video' },
          { name: 'Elevação Pélvica (Hip Thrust)', sets: '4', reps: '12-15', rest: '45', imageUrl: 'https://picsum.photos/seed/hipthrust/400/300', videoUrl: 'https://example.com/hipthrust-video' },
          { name: 'Cadeira Abdutora', sets: '3', reps: '15-20', rest: '45', imageUrl: 'https://picsum.photos/seed/abductor/400/300', videoUrl: 'https://example.com/abductor-video' },
          { name: 'Cadeira Extensora', sets: '3', reps: '12-15', rest: '45', imageUrl: 'https://picsum.photos/seed/legextension/400/300', videoUrl: 'https://example.com/legextension-video' },
        ],
      },
      {
        day: 'B',
        focus: 'Membros Superiores (Foco Costas e Ombros)',
        exercises: [
          { name: 'Puxada Frontal (Pulley)', sets: '4', reps: '10-12', rest: '60', imageUrl: 'https://picsum.photos/seed/latpulldown/400/300', videoUrl: 'https://example.com/latpulldown-video' },
          { name: 'Remada Curvada com Halteres', sets: '4', reps: '10-12', rest: '60', imageUrl: 'https://picsum.photos/seed/dbrow/400/300', videoUrl: 'https://example.com/dbrow-video' },
          { name: 'Desenvolvimento com Halteres', sets: '3', reps: '10-12', rest: '60', imageUrl: 'https://picsum.photos/seed/shoulderpress/400/300', videoUrl: 'https://example.com/shoulderpress-video' },
          { name: 'Elevação Lateral', sets: '3', reps: '12-15', rest: '45', imageUrl: 'https://picsum.photos/seed/latraise/400/300', videoUrl: 'https://example.com/latraise-video' },
          { name: 'Face Pull', sets: '3', reps: '15-20', rest: '45', imageUrl: 'https://picsum.photos/seed/facepull/400/300', videoUrl: 'https://example.com/facepull-video' },
        ],
      },
       {
        day: 'C',
        focus: 'Membros Inferiores (Foco Quadríceps)',
        exercises: [
          { name: 'Leg Press 45°', sets: '4', reps: '10-12', rest: '90', imageUrl: 'https://picsum.photos/seed/legpress/400/300', videoUrl: 'https://example.com/legpress-video' },
          { name: 'Agachamento Hack', sets: '4', reps: '10-12', rest: '60', imageUrl: 'https://picsum.photos/seed/hacksquat/400/300', videoUrl: 'https://example.com/hacksquat-video' },
          { name: 'Afundo com Halteres', sets: '3', reps: '12-15', rest: '45', imageUrl: 'https://picsum.photos/seed/lunges/400/300', videoUrl: 'https://example.com/lunges-video' },
          { name: 'Mesa Flexora', sets: '3', reps: '12-15', rest: '45', imageUrl: 'https://picsum.photos/seed/legcurl/400/300', videoUrl: 'https://example.com/legcurl-video' },
          { name: 'Panturrilha em Pé', sets: '5', reps: '15-20', rest: '30', imageUrl: 'https://picsum.photos/seed/calfraise/400/300', videoUrl: 'https://example.com/calfraise-video' },
        ],
      },
       {
        day: 'D',
        focus: 'Membros Superiores (Foco Peito e Braços)',
        exercises: [
          { name: 'Supino Inclinado com Halteres', sets: '4', reps: '10-12', rest: '60', imageUrl: 'https://picsum.photos/seed/inclinepress/400/300', videoUrl: 'https://example.com/inclinepress-video' },
          { name: 'Crucifixo na Máquina (Peck Deck)', sets: '3', reps: '12-15', rest: '45', imageUrl: 'https://picsum.photos/seed/peckdeck/400/300', videoUrl: 'https://example.com/peckdeck-video' },
          { name: 'Tríceps na Polia com Corda', sets: '3', reps: '12-15', rest: '45', imageUrl: 'https://picsum.photos/seed/tricepsrope/400/300', videoUrl: 'https://example.com/tricepsrope-video' },
          { name: 'Rosca Direta na Polia', sets: '3', reps: '12-15', rest: '45', imageUrl: 'https://picsum.photos/seed/bicepcurl/400/300', videoUrl: 'https://example.com/bicepcurl-video' },
          { name: 'Prancha', sets: '3', reps: 'Até a falha', rest: '60', imageUrl: 'https://picsum.photos/seed/plank/400/300', videoUrl: 'https://example.com/plank-video' },
        ],
      },
    ],
  };
  
  const MOCK_HOME_VIDEOS = [
    {
      title: 'Desafio 30 Dias: Core Forte',
      videos: Array.from({ length: 6 }, (_, i) => ({
        id: `core_${i + 1}`,
        title: `Dia ${i + 1}: Core e Abdômen`,
        duration: '25 min',
        thumbnailUrl: `https://picsum.photos/seed/core${i}/400/225`,
        type: 'collection-item',
      })),
    },
    {
      title: 'Sessões de Yoga para Relaxar',
      videos: Array.from({ length: 6 }, (_, i) => ({
        id: `yoga_${i + 1}`,
        title: `Yoga Flow Vinyasa ${i+1}`,
        duration: '45 min',
        thumbnailUrl: `https://picsum.photos/seed/yoga${i}/400/225`,
        type: 'long',
      })),
    },
    {
      title: 'HIIT para Queimar Calorias',
      videos: Array.from({ length: 6 }, (_, i) => ({
        id: `hiit_${i + 1}`,
        title: `HIIT Intenso ${i+1}`,
        duration: '15 min',
        thumbnailUrl: `https://picsum.photos/seed/hiit${i}/400/225`,
        type: 'short',
      })),
    },
  ];
  
  const MOCK_PROGRESS_DATA = [
    { month: 'Jan', weightLifted: 1200 },
    { month: 'Fev', weightLifted: 1500 },
    { month: 'Mar', weightLifted: 1400 },
    { month: 'Abr', weightLifted: 1800 },
    { month: 'Mai', weightLifted: 2200 },
    { month: 'Jun', weightLifted: 2500 },
  ];
  
  // --- START OF ICONS ---
  const DumbbellIcon = () => `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
      <path stroke-linecap="round" stroke-linejoin="round" d="M10.022 21.622L4.378 16a2.25 2.25 0 010-3.182l5.644-5.644a2.25 2.25 0 013.182 0l5.644 5.644a2.25 2.25 0 010 3.182l-5.644 5.644a2.25 2.25 0 01-3.182 0z" />
      <path stroke-linecap="round" stroke-linejoin="round" d="M12.75 9.75l-1.5 1.5-1.5-1.5-1.5 1.5-1.5-1.5M17.25 14.25l-1.5 1.5-1.5-1.5-1.5 1.5-1.5-1.5" />
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 2.25v-.75a3.375 3.375 0 013.375-3.375h.001c1.86 0 3.375 1.516 3.375 3.375v.75m-6.75 19.5v.75a3.375 3.375 0 003.375 3.375h.001c1.86 0 3.375-1.515 3.375-3.375v-.75" />
    </svg>
  `;
  
  const HomeIcon = () => `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
      <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  `;
  
  const UserIcon = () => `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  `;
  
  const PlayIcon = () => `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
    </svg>
  `;
  
  const DashboardIcon = () => `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
      <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 8.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 018.25 20.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6A2.25 2.25 0 0115.75 3.75h2.25A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75A2.25 2.25 0 0115.75 13.5h2.25a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  `;
  
  const CheckCircleIcon = () => `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  `;
  
  const XIcon = () => `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  `;
  
  const VideoCameraIcon = () => `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" />
    </svg>
  `;
  
  const LogoIcon = () => `
    <svg style="width: 3rem; height: 3rem;" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill="currentColor" style="color: var(--brand-primary)"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="40" font-weight="bold" dy=".1em">
        EMF
      </text>
    </svg>
  `;
  
  // --- START OF COMPONENTS ---
  
  // Layout.js
  const Header = (user) => {
    return `
      <header class="header">
        <div class="header-info">
          ${LogoIcon()}
          <div>
            <p class="header-welcome-text">Bem-vinda de volta,</p>
            <p class="header-user-name">${user.name.split(' ')[0]}!</p>
          </div>
        </div>
        <img src="${user.avatarUrl}" alt="${user.name}" class="header-avatar" />
      </header>
    `;
  };
  
  const BottomNav = (activeView) => {
    const navItems = [
      { view: View.Dashboard, icon: DashboardIcon(), label: 'Início' },
      { view: View.Gym, icon: DumbbellIcon(), label: 'Academia' },
      { view: View.Home, icon: HomeIcon(), label: 'Em Casa' },
      { view: View.Profile, icon: UserIcon(), label: 'Perfil' },
    ];
  
    return `
      <nav class="bottom-nav">
        ${navItems.map(item => `
          <button 
            data-view="${item.view}" 
            class="nav-item ${activeView === item.view ? 'active' : ''}"
          >
            ${item.icon}
            <span class="nav-item-label">${item.label}</span>
          </button>
        `).join('')}
      </nav>
    `;
  };
  
  // Dashboard.js
  const StatCard = ({ label, value, unit }) => `
    <div class="stat-card">
      <p class="stat-card-label">${label}</p>
      <p class="stat-card-value">
        ${value}
        ${unit ? `<span class="stat-card-unit">${unit}</span>` : ''}
      </p>
    </div>
  `;
  
  const ActionCard = ({ title, description, icon, onClick }) => `
    <div class="action-card" data-action="${onClick}" role="button" tabindex="0">
      <div class="action-card-icon">${icon}</div>
      <div>
        <h3 class="action-card-title">${title}</h3>
        <p class="action-card-description">${description}</p>
      </div>
    </div>
  `;
  
  const Dashboard = (user, workoutPlan) => {
    const todayWorkout = workoutPlan.days[0];
  
    return `
      <div class="page-container">
        <div>
          <h2 class="page-title">Visão Geral</h2>
        </div>
        <div class="stats-grid">
          ${StatCard({ label: "Treinos Concluídos", value: user.stats.workoutsCompleted })}
          ${StatCard({ label: "Horas de Treino", value: user.stats.hoursTrained })}
          ${StatCard({ label: "Peso Total", value: (user.stats.weightLifted / 1000).toFixed(1), unit: "ton" })}
        </div>
  
        <div class="action-card-container">
          ${ActionCard({ 
            title: "Ir para a Academia", 
            description: `Seu próximo treino: ${todayWorkout.focus}`,
            icon: DumbbellIcon(),
            onClick: "gym"
          })}
          ${ActionCard({ 
            title: "Treinar em Casa", 
            description: "Explore nossa biblioteca de vídeos",
            icon: HomeIcon(),
            onClick: "home"
          })}
        </div>
      </div>
    `;
  };
  
  // Gym.js
  const ExerciseDetailModal = (exercise, logs, onClose, onLogSet) => {
    let weight = '';
    let reps = '';
  
    const handleAddSet = (e) => {
      e.preventDefault();
      const weightInput = document.getElementById('weight');
      const repsInput = document.getElementById('reps');
      
      if (weightInput && repsInput && weightInput.value && repsInput.value) {
        onLogSet({ weight: weightInput.value, reps: repsInput.value });
        weightInput.value = '';
        repsInput.value = '';
      }
    };
  
    return `
      <div class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <img src="${exercise.imageUrl}" alt="${exercise.name}" class="modal-image" />
            <button class="modal-close-button" id="modal-close">
              ${XIcon()}
            </button>
          </div>
          <div class="modal-body">
            <h3 class="modal-title">${exercise.name}</h3>
            <div class="modal-stats">
              <div><p class="modal-stat-label">Séries</p><p class="modal-stat-value">${exercise.sets}</p></div>
              <div><p class="modal-stat-label">Reps</p><p class="modal-stat-value">${exercise.reps}</p></div>
              <div><p class="modal-stat-label">Descanso</p><p class="modal-stat-value">${exercise.rest}s</p></div>
            </div>
            ${exercise.observation ? `<p class="modal-observation">Obs: ${exercise.observation}</p>` : ''}
            <a href="${exercise.videoUrl}" target="_blank" rel="noopener noreferrer" class="modal-video-link">
              ${VideoCameraIcon()}
              Ver Vídeo de Execução
            </a>
            
            <div class="logged-sets">
              <h4 class="modal-section-title">Séries Registradas</h4>
              ${logs.length === 0 ? '<p class="modal-observation">Nenhuma série registrada ainda.</p>' : `
                <div class="logged-sets-list">
                  ${logs.map((log, index) => `
                    <div class="logged-set-item">
                      <span class="logged-set-label">Série ${index + 1}</span>
                      <span class="logged-set-value">${log.weight} kg x ${log.reps} reps</span>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>
  
            <form id="log-form" class="log-form">
              <h4 class="modal-section-title">Registrar Nova Série</h4>
              <div class="log-form-inputs">
                <div class="log-form-group">
                  <label for="weight" class="log-form-label">Carga (kg)</label>
                  <input type="number" id="weight" placeholder="20" class="log-form-input" />
                </div>
                <div class="log-form-group">
                  <label for="reps" class="log-form-label">Reps</label>
                  <input type="number" id="reps" placeholder="12" class="log-form-input" />
                </div>
              </div>
              <button type="submit" class="btn-primary">
                Adicionar Série
              </button>
            </form>
          </div>
        </div>
      </div>
    `;
  };
  
  const ExerciseCard = (exercise, logs, onClick) => {
    const totalSets = parseInt(exercise.sets, 10) || 0;
    const completedSets = logs.length;
    const isCompleted = completedSets >= totalSets;
  
    return `
      <div class="exercise-card" data-exercise="${exercise.name}" role="button" tabindex="0">
        <img src="${exercise.imageUrl}" alt="${exercise.name}" class="exercise-card-image" />
        <div class="exercise-card-info">
          <h4 class="exercise-card-title">${exercise.name}</h4>
          <p class="exercise-card-details">${exercise.sets} séries x ${exercise.reps} reps</p>
          <div class="exercise-card-progress">
            <span class="${isCompleted ? 'progress-complete' : 'progress-incomplete'}">
              ${completedSets}/${totalSets} séries concluídas
            </span>
          </div>
        </div>
        ${isCompleted ? CheckCircleIcon() : ''}
      </div>
    `;
  };
  
  const WorkoutDayView = (day, logs, onExerciseClick) => `
    <div class="exercise-list">
      ${day.exercises.map(ex => ExerciseCard(ex, logs[ex.name] || [], onExerciseClick)).join('')}
    </div>
  `;
  
  const Gym = (workoutPlan, logs, setLogs, setSelectedExercise) => {
    const activeDay = workoutPlan.days[0]?.day || '';
    const selectedDayData = workoutPlan.days.find(d => d.day === activeDay);
  
    return `
      <div class="page-container">
        <div>
          <h2 class="page-title">Meu Treino na Academia</h2>
          <p class="page-subtitle">${workoutPlan.name}</p>
        </div>
  
        <div class="gym-section">
          <div class="day-tabs">
            ${workoutPlan.days.map(day => `
              <button 
                class="day-tab ${activeDay === day.day ? 'active' : ''}" 
                data-day="${day.day}"
              >
                Treino ${day.day}: ${day.focus}
              </button>
            `).join('')}
          </div>
          ${selectedDayData ? WorkoutDayView(selectedDayData, logs, setSelectedExercise) : ''}
        </div>
  
        <div>
          <h3 class="section-title">Progresso Mensal</h3>
          <div class="progress-chart-container">
            <canvas id="progress-chart"></canvas>
          </div>
        </div>
      </div>
    `;
  };
  
  // Home.js
  const VideoCard = (video) => `
    <div class="video-card">
      <div class="video-card-thumbnail-container">
        <img src="${video.thumbnailUrl}" alt="${video.title}" class="video-card-thumbnail" />
        <div class="video-card-overlay">
          ${PlayIcon()}
        </div>
        <span class="video-card-duration">${video.duration}</span>
      </div>
      <h4 class="video-card-title">${video.title}</h4>
    </div>
  `;
  
  const VideoCarousel = (category) => `
    <div>
      <h3 class="section-title">${category.title}</h3>
      <div class="video-carousel">
        ${category.videos.map(video => VideoCard(video)).join('')}
      </div>
    </div>
  `;
  
  const Home = () => {
    const featuredVideo = MOCK_HOME_VIDEOS[0].videos[0];
  
    return `
      <div class="home-page-container">
        <div class="featured-video">
          <img src="${featuredVideo.thumbnailUrl.replace('/400/225', '/1200/400')}" alt="${featuredVideo.title}" class="featured-video-img" />
          <div class="featured-video-gradient"></div>
          <div class="featured-video-info">
            <h2 class="featured-video-title">${featuredVideo.title}</h2>
            <p class="featured-video-desc">Comece o desafio de 30 dias para fortalecer seu core e definir o abdômen.</p>
            <button class="featured-video-button">
              ${PlayIcon()}
              Começar Agora
            </button>
          </div>
        </div>
        
        <div class="carousels-container">
          ${MOCK_HOME_VIDEOS.map(category => VideoCarousel(category)).join('')}
        </div>
      </div>
    `;
  };
  
  // Profile.js
  const StatItem = ({ label, value }) => `
    <div class="profile-stat-item">
      <span class="profile-stat-label">${label}</span>
      <span class="profile-stat-value">${value}</span>
    </div>
  `;
  
  const Profile = (user) => {
    return `
      <div class="page-container">
        <div class="profile-header">
          <img src="${user.avatarUrl}" alt="${user.name}" class="profile-avatar" />
          <div>
            <h2 class="profile-name">${user.name}</h2>
            <p class="profile-membership">${user.membership} Member</p>
          </div>
        </div>
        
        <div class="profile-stats-container">
          <h3 class="section-title">Estatísticas Gerais</h3>
          ${StatItem({ label: "Treinos Concluídos", value: user.stats.workoutsCompleted })}
          ${StatItem({ label: "Total de Horas de Treino", value: `${user.stats.hoursTrained}h` })}
          ${StatItem({ label: "Peso Total Levantado", value: `${(user.stats.weightLifted / 1000).toFixed(2)} ton` })}
          ${StatItem({ label: "Membro Desde", value: new Date(user.joinDate).toLocaleDateString('pt-BR') })}
        </div>
  
        <div class="profile-actions">
          <button class="btn btn-secondary">
            Editar Perfil
          </button>
          <button class="btn btn-danger">
            Sair
          </button>
        </div>
      </div>
    `;
  };
  
  // App State Management
  class AppState {
    constructor() {
      this.activeView = View.Dashboard;
      this.user = MOCK_USER;
      this.workoutPlan = MOCK_WORKOUT_PLAN;
      this.logs = {};
      this.selectedExercise = null;
      this.activeDay = this.workoutPlan.days[0]?.day || '';
      
      this.init();
    }
  
    init() {
      this.render();
      this.setupEventListeners();
      // this.renderChart(); // <-- ERRO (E2) CORRIGIDO: Removido
    }
  
    setView(view) {
      this.activeView = view;
      this.render();
    }
  
    setActiveDay(day) {
      this.activeDay = day;
      this.render();
    }
  
    setSelectedExercise(exercise) {
      this.selectedExercise = exercise;
      this.render();
    }
  
    addLog(exerciseName, log) {
      if (!this.logs[exerciseName]) {
        this.logs[exerciseName] = [];
      }
      this.logs[exerciseName].push(log);
      this.render();
    }
  
    closeModal() {
      this.selectedExercise = null;
      this.render();
    }
  
    render() {
      const root = document.getElementById('root');
      if (!root) return;
  
      // --- ERRO (E1) CORRIGIDO ---
      // Limpa qualquer modal aberto antes de re-renderizar
      document.querySelector('.modal-overlay')?.remove();
      // --- FIM DA CORREÇÃO ---
  
      let mainContent = '';
      switch (this.activeView) {
        case View.Dashboard:
          mainContent = Dashboard(this.user, this.workoutPlan);
          break;
        case View.Gym:
          mainContent = Gym(this.workoutPlan, this.logs, this.addLog.bind(this), this.setSelectedExercise.bind(this));
          break;
        case View.Home:
          mainContent = Home();
          break;
        case View.Profile:
          mainContent = Profile(this.user);
          break;
        default:
          mainContent = Dashboard(this.user, this.workoutPlan);
      }
  
      root.innerHTML = `
        <div class="app-container">
          ${Header(this.user)}
          <main class="main-content">
            ${mainContent}
          </main>
          ${BottomNav(this.activeView)}
        </div>
      `;
  
      // Render modal if exercise is selected
      if (this.selectedExercise) {
        const modalHtml = ExerciseDetailModal(
          this.selectedExercise,
          this.logs[this.selectedExercise.name] || [],
          this.closeModal.bind(this),
          (log) => this.addLog(this.selectedExercise.name, log)
        );
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        this.setupModalEvents();
      }
  
      this.setupEventListeners();
      
      // Re-render chart if on Gym view
      if (this.activeView === View.Gym) {
        this.renderChart();
      }
    }
  
    setupEventListeners() {
      // Bottom navigation
      document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
          const view = item.getAttribute('data-view');
          this.setView(view);
        });
      });
  
      // Action cards
      document.querySelectorAll('.action-card').forEach(card => {
        card.addEventListener('click', () => {
          const action = card.getAttribute('data-action');
          if (action === 'gym') this.setView(View.Gym);
          if (action === 'home') this.setView(View.Home);
        });
      });
  
      // Day tabs
      document.querySelectorAll('.day-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          const day = tab.getAttribute('data-day');
          this.setActiveDay(day);
        });
      });
  
      // Exercise cards
      document.querySelectorAll('.exercise-card').forEach(card => {
        card.addEventListener('click', () => {
          const exerciseName = card.getAttribute('data-exercise');
          const exercise = this.workoutPlan.days
            .flatMap(day => day.exercises)
            .find(ex => ex.name === exerciseName);
          if (exercise) {
            this.setSelectedExercise(exercise);
          }
        });
      });
    }
  
    setupModalEvents() {
      const closeButton = document.getElementById('modal-close');
      const logForm = document.getElementById('log-form');
  
      if (closeButton) {
        closeButton.addEventListener('click', () => this.closeModal());
      }
  
      if (logForm) {
        logForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const weightInput = document.getElementById('weight');
          const repsInput = document.getElementById('reps');
          
          if (weightInput && repsInput && weightInput.value && repsInput.value) {
            this.addLog(this.selectedExercise.name, { 
              weight: weightInput.value, 
              reps: repsInput.value 
            });
            weightInput.value = '';
            repsInput.value = '';
            
            // --- MELHORIA DE UX (M1) ---
            // Foca no primeiro input para facilitar o registro da próxima série
            document.getElementById('weight')?.focus();
            // --- FIM DA MELHORIA ---
          }
        });
      }
  
      // Close modal when clicking outside
      document.querySelector('.modal-overlay').addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
          this.closeModal();
        }
      });
    }
  
    renderChart() {
      const canvas = document.getElementById('progress-chart');
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');

      // --- MELHORIA (M3): Substituído desenho manual por Chart.js ---
      
      // Destrói gráfico anterior se existir (Chart.js precisa disso)
      if (canvas.chartInstance) {
        canvas.chartInstance.destroy();
      }

      const labels = MOCK_PROGRESS_DATA.map(d => d.month);
      const data = MOCK_PROGRESS_DATA.map(d => d.weightLifted);

      canvas.chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Peso Total (kg)',
            data: data,
            backgroundColor: 'var(--brand-primary)',
            borderColor: 'var(--brand-secondary)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { 
                callbacks: { label: (context) => `${context.raw} kg` }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { color: 'var(--text-secondary)', stepSize: 500 },
              grid: { color: 'var(--surface)' }
            },
            x: {
              ticks: { color: 'var(--text-secondary)' },
              grid: { display: false }
            }
          }
        }
      });
    }
  }
  
  // Initialize the app when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    new AppState();
  });