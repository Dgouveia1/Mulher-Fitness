import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WorkoutPlan, Exercise, WorkoutDay } from '../types';
import { CheckCircleIcon, VideoCameraIcon, XIcon } from './Icons';
import { MOCK_PROGRESS_DATA } from '../constants';

type WorkoutLogs = Record<string, { weight: string; reps: string }[]>;

const ExerciseDetailModal: React.FC<{
  exercise: Exercise;
  onClose: () => void;
  logs: { weight: string; reps: string }[];
  onLogSet: (log: { weight: string; reps: string }) => void;
}> = ({ exercise, onClose, logs, onLogSet }) => {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');

  const handleAddSet = (e: React.FormEvent) => {
    e.preventDefault();
    if (weight && reps) {
      onLogSet({ weight, reps });
      setWeight('');
      setReps('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-40 flex items-center justify-center animate-fade-in">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-md m-4 max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <img src={exercise.imageUrl} alt={exercise.name} className="w-full h-48 object-cover rounded-t-lg" />
          <button onClick={onClose} className="absolute top-2 right-2 bg-black bg-opacity-40 rounded-full p-1 text-white hover:bg-opacity-60">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <h3 className="text-2xl font-bold text-text-primary">{exercise.name}</h3>
          <div className="flex justify-around text-center border-y border-surface py-2">
            <div><p className="text-sm text-text-secondary">Séries</p><p className="font-bold text-lg">{exercise.sets}</p></div>
            <div><p className="text-sm text-text-secondary">Reps</p><p className="font-bold text-lg">{exercise.reps}</p></div>
            <div><p className="text-sm text-text-secondary">Descanso</p><p className="font-bold text-lg">{exercise.rest}s</p></div>
          </div>
          {exercise.observation && <p className="text-sm text-text-secondary italic">Obs: {exercise.observation}</p>}
          <a href={exercise.videoUrl} target="_blank" rel="noopener noreferrer" className="w-full bg-brand-primary/10 text-brand-primary font-bold py-2 px-4 rounded-lg hover:bg-brand-primary/20 transition-colors flex items-center justify-center">
            <VideoCameraIcon className="w-5 h-5 mr-2" />
            Ver Vídeo de Execução
          </a>
          
          {/* Logged Sets */}
          <div className="space-y-2">
            <h4 className="font-semibold">Séries Registradas</h4>
            {logs.length === 0 && <p className="text-sm text-text-secondary">Nenhuma série registrada ainda.</p>}
            {logs.map((log, index) => (
               <div key={index} className="flex justify-between items-center bg-surface p-2 rounded-md text-sm">
                <span className="font-semibold text-text-primary">Série {index + 1}</span>
                <span className="text-text-secondary">{log.weight} kg x {log.reps} reps</span>
              </div>
            ))}
          </div>

          {/* Add Set Form */}
          <form onSubmit={handleAddSet} className="space-y-3 pt-4 border-t border-surface">
             <h4 className="font-semibold">Registrar Nova Série</h4>
            <div className="flex gap-4">
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-text-secondary mb-1">Carga (kg)</label>
                <input type="number" id="weight" value={weight} onChange={e => setWeight(e.target.value)} placeholder="20" className="w-full bg-surface border border-gray-600 rounded-md p-2 text-text-primary" />
              </div>
              <div>
                <label htmlFor="reps" className="block text-sm font-medium text-text-secondary mb-1">Reps</label>
                <input type="number" id="reps" value={reps} onChange={e => setReps(e.target.value)} placeholder="12" className="w-full bg-surface border border-gray-600 rounded-md p-2 text-text-primary" />
              </div>
            </div>
            <button type="submit" className="w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-secondary transition-colors">
              Adicionar Série
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const ExerciseCard: React.FC<{ exercise: Exercise; onClick: () => void; logs: any[] }> = ({ exercise, onClick, logs }) => {
  const totalSets = parseInt(exercise.sets);
  const completedSets = logs.length;
  const isCompleted = completedSets >= totalSets;

  return (
    <div onClick={onClick} className="bg-card p-3 rounded-lg shadow-lg flex items-center space-x-4 cursor-pointer">
      <img src={exercise.imageUrl} alt={exercise.name} className="w-20 h-20 object-cover rounded-md" />
      <div className="flex-1">
        <h4 className="font-bold text-text-primary">{exercise.name}</h4>
        <p className="text-sm text-text-secondary">{exercise.sets} séries x {exercise.reps} reps</p>
        <div className="text-xs font-medium mt-2" >
           <span className={`${isCompleted ? 'text-success' : 'text-brand-primary'}`}>
            {completedSets}/{totalSets} séries concluídas
           </span>
        </div>
      </div>
      {isCompleted && <CheckCircleIcon className="w-8 h-8 text-success flex-shrink-0" />}
    </div>
  );
};

const WorkoutDayView: React.FC<{ day: WorkoutDay, logs: WorkoutLogs, onExerciseClick: (ex: Exercise) => void; }> = ({ day, logs, onExerciseClick }) => (
  <div className="space-y-3">
    {day.exercises.map((ex, index) => (
      <ExerciseCard key={index} exercise={ex} onClick={() => onExerciseClick(ex)} logs={logs[ex.name] || []} />
    ))}
  </div>
);

export const Gym: React.FC<{ workoutPlan: WorkoutPlan }> = ({ workoutPlan }) => {
  const [activeDay, setActiveDay] = useState<string>(workoutPlan.days[0]?.day || '');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [logs, setLogs] = useState<WorkoutLogs>({});
  
  const handleLogSet = (log: { weight: string, reps: string }) => {
    if (!selectedExercise) return;
    const currentLogs = logs[selectedExercise.name] || [];
    setLogs({
      ...logs,
      [selectedExercise.name]: [...currentLogs, log]
    });
  };

  const selectedDayData = workoutPlan.days.find(d => d.day === activeDay);

  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Meu Treino na Academia</h2>
        <p className="text-text-secondary">{workoutPlan.name}</p>
      </div>

      <div className="bg-card p-4 rounded-lg shadow-lg">
        <div className="flex space-x-2 mb-4 border-b border-surface overflow-x-auto">
          {workoutPlan.days.map(day => (
            <button
              key={day.day}
              onClick={() => setActiveDay(day.day)}
              className={`px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors ${activeDay === day.day ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-text-secondary'}`}
            >
              Treino {day.day}: {day.focus}
            </button>
          ))}
        </div>
        {selectedDayData && <WorkoutDayView day={selectedDayData} logs={logs} onExerciseClick={setSelectedExercise}/>}
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4 text-text-primary">Progresso Mensal</h3>
        <div className="bg-card p-4 rounded-lg shadow-lg h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_PROGRESS_DATA} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} unit="kg" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#F9FAFB' }}
                labelStyle={{ color: '#F9FAFB' }}
                formatter={(value: number) => [`${value} kg`, 'Peso Total']}
              />
              <Bar dataKey="weightLifted" fill="#E5398D" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {selectedExercise && (
        <ExerciseDetailModal 
          exercise={selectedExercise} 
          onClose={() => setSelectedExercise(null)}
          logs={logs[selectedExercise.name] || []}
          onLogSet={handleLogSet}
        />
      )}
    </div>
  );
};