import React from 'react';
import { View } from '../types';
import { User } from '../types';
import { HomeIcon, DumbbellIcon, UserIcon, DashboardIcon } from './Icons';

interface HeaderProps {
  user: User;
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  return (
    <header className="p-4 flex justify-between items-center bg-card sticky top-0 z-20 shadow-lg">
      <div className="flex items-center space-x-4">
        <img src="https://instagram.faqa2-1.fna.fbcdn.net/v/t51.2885-19/329458880_205930925266000_189153674032486837_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDAwLmMyIn0&_nc_ht=instagram.faqa2-1.fna.fbcdn.net&_nc_cat=104&_nc_oc=Q6cZ2QERThs2sM1NCn-mOomzwQjbUh7YeGN87S52Xfj4J1DL7jkUctd4HFHuuXjadqBcnZ5oKZTurD8lLEn5yomecTFc&_nc_ohc=4fnNIlKeYH0Q7kNvwFUYp_u&_nc_gid=KMhpXDMBL95uN-C9zfMIvA&edm=APoiHPcBAAAA&ccb=7-5&oh=00_Afh0AgNmSupgGJ8QV6uMmXtC6uoV4JXq0zhYygwW8KWnEA&oe=6914BDEA&_nc_sid=22de04" alt="Espaço Mulher Fitness Logo" className="w-12 h-12 rounded-full" />
        <div>
           <p className="text-sm text-text-secondary">Bem-vinda de volta,</p>
           <p className="font-bold text-text-primary text-lg -mt-1">{user.name.split(' ')[0]}!</p>
        </div>
      </div>
      <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full border-2 border-brand-primary" />
    </header>
  );
};


interface BottomNavProps {
  activeView: View;
  setView: (view: View) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeView, setView }) => {
  const navItems = [
    { view: View.Dashboard, icon: <DashboardIcon />, label: 'Início' },
    { view: View.Gym, icon: <DumbbellIcon />, label: 'Academia' },
    { view: View.Home, icon: <HomeIcon />, label: 'Em Casa' },
    { view: View.Profile, icon: <UserIcon />, label: 'Perfil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card p-2 flex justify-around border-t border-surface z-20"
         style={{boxShadow: '0 -2px 10px rgba(0,0,0,0.2)'}}>
      {navItems.map(item => (
        <button
          key={item.view}
          onClick={() => setView(item.view)}
          className={`flex flex-col items-center justify-center w-1/4 p-1 rounded-lg transition-colors duration-200 ${
            activeView === item.view ? 'text-brand-primary' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {React.cloneElement(item.icon, { className: 'w-6 h-6 mb-1' })}
          <span className="text-xs font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};