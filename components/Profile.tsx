import React from 'react';
import { User } from '../types';

interface StatItemProps {
  label: string;
  value: string | number;
}
const StatItem: React.FC<StatItemProps> = ({ label, value }) => (
  <div className="flex justify-between items-center py-3 border-b border-surface">
    <span className="text-text-secondary">{label}</span>
    <span className="font-bold text-text-primary">{value}</span>
  </div>
);

export const Profile: React.FC<{ user: User }> = ({ user }) => {
  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <img src={user.avatarUrl} alt={user.name} className="w-24 h-24 rounded-full border-4 border-brand-primary shadow-lg" />
        <div>
          <h2 className="text-2xl font-bold text-center text-text-primary">{user.name}</h2>
          <p className="text-center text-brand-primary font-semibold">{user.membership} Member</p>
        </div>
      </div>
      
      <div className="bg-card p-4 rounded-lg shadow-lg">
        <h3 className="text-lg font-bold mb-2 text-text-primary">Estatísticas Gerais</h3>
        <StatItem label="Treinos Concluídos" value={user.stats.workoutsCompleted} />
        <StatItem label="Total de Horas de Treino" value={`${user.stats.hoursTrained}h`} />
        <StatItem label="Peso Total Levantado" value={`${(user.stats.weightLifted / 1000).toFixed(2)} ton`} />
        <StatItem label="Membro Desde" value={new Date(user.joinDate).toLocaleDateString('pt-BR')} />
      </div>

      <div className="space-y-2">
        <button className="w-full bg-surface text-text-primary font-bold py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors">
          Editar Perfil
        </button>
        <button className="w-full bg-red-500/10 text-red-400 font-bold py-3 px-4 rounded-lg hover:bg-red-500/20 transition-colors">
          Sair
        </button>
      </div>
    </div>
  );
};