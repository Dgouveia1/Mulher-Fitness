import React from 'react';
import { User, View, WorkoutPlan } from '../types';
import { DumbbellIcon, HomeIcon } from './Icons';

interface DashboardProps {
  user: User;
  workoutPlan: WorkoutPlan;
  setView: (view: View) => void;
}

const StatCard: React.FC<{ label: string; value: string | number; unit?: string }> = ({ label, value, unit }) => (
  <div className="bg-card p-4 rounded-lg text-center shadow-lg">
    <p className="text-text-secondary text-sm">{label}</p>
    <p className="text-2xl font-bold text-text-primary">
      {value}
      {unit && <span className="text-base font-normal text-text-secondary ml-1">{unit}</span>}
    </p>
  </div>
);

const ActionCard: React.FC<{ title: string; description: string; icon: React.ReactNode; onClick: () => void; }> = ({ title, description, icon, onClick }) => (
    <div onClick={onClick} className="bg-card p-6 rounded-lg shadow-lg flex items-center space-x-4 cursor-pointer hover:bg-surface transition-colors duration-200">
        <div className="text-brand-primary">{icon}</div>
        <div>
            <h3 className="font-bold text-text-primary text-lg">{title}</h3>
            <p className="text-text-secondary text-sm">{description}</p>
        </div>
    </div>
);


export const Dashboard: React.FC<DashboardProps> = ({ user, workoutPlan, setView }) => {
  const todayWorkout = workoutPlan.days[0];

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold text-text-primary">Visão Geral</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Treinos Concluídos" value={user.stats.workoutsCompleted} />
        <StatCard label="Horas de Treino" value={user.stats.hoursTrained} />
        <StatCard label="Peso Total" value={(user.stats.weightLifted / 1000).toFixed(1)} unit="ton" />
      </div>

      <div className="space-y-4">
        <ActionCard 
            title="Ir para a Academia" 
            description={`Seu próximo treino: ${todayWorkout.focus}`} 
            icon={<DumbbellIcon className="w-10 h-10" />}
            onClick={() => setView(View.Gym)}
        />
        <ActionCard 
            title="Treinar em Casa" 
            description="Explore nossa biblioteca de vídeos" 
            icon={<HomeIcon className="w-10 h-10" />}
            onClick={() => setView(View.Home)}
        />
      </div>
    </div>
  );
};