import { User, WorkoutPlan, VideoCategory } from './types';

export const MOCK_USER: User = {
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

export const MOCK_WORKOUT_PLAN: WorkoutPlan = {
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

export const MOCK_HOME_VIDEOS: VideoCategory[] = [
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

export const MOCK_PROGRESS_DATA = [
  { month: 'Jan', weightLifted: 1200 },
  { month: 'Fev', weightLifted: 1500 },
  { month: 'Mar', weightLifted: 1400 },
  { month: 'Abr', weightLifted: 1800 },
  { month: 'Mai', weightLifted: 2200 },
  { month: 'Jun', weightLifted: 2500 },
];