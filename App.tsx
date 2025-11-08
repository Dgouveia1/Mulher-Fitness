import React, { useState } from 'react';
import { View, User, WorkoutPlan } from './types';
import { MOCK_USER, MOCK_WORKOUT_PLAN } from './constants';
import { Header, BottomNav } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Gym } from './components/Gym';
import { Home } from './components/Home';
import { Profile } from './components/Profile';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.Dashboard);
  const [user] = useState<User>(MOCK_USER);
  const [workoutPlan] = useState<WorkoutPlan>(MOCK_WORKOUT_PLAN);

  const renderView = () => {
    switch (activeView) {
      case View.Dashboard:
        return <Dashboard user={user} workoutPlan={workoutPlan} setView={setActiveView} />;
      case View.Gym:
        return <Gym workoutPlan={workoutPlan} />;
      case View.Home:
        return <Home />;
      case View.Profile:
        return <Profile user={user} />;
      default:
        return <Dashboard user={user} workoutPlan={workoutPlan} setView={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Header user={user} />
      <main className="pb-20">
        {renderView()}
      </main>
      <BottomNav activeView={activeView} setView={setActiveView} />
    </div>
  );
};

export default App;