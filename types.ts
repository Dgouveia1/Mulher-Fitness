export enum View {
  Dashboard = 'DASHBOARD',
  Gym = 'GYM',
  Home = 'HOME',
  Profile = 'PROFILE',
}

export interface User {
  name: string;
  avatarUrl: string;
  membership: 'Premium' | 'Basic';
  joinDate: string;
  stats: {
    workoutsCompleted: number;
    hoursTrained: number;
    weightLifted: number; // in kg
  };
}

export interface Exercise {
  name:string;
  sets: string;
  reps: string;
  rest: string; // in seconds
  observation?: string;
  imageUrl: string;
  videoUrl: string;
}

export interface WorkoutDay {
  day: string;
  focus: string;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  name: string;
  description: string;
  days: WorkoutDay[];
}

export interface Video {
  id: string;
  title: string;
  duration: string;
  thumbnailUrl: string;
  type: 'long' | 'short' | 'collection-item';
}

export interface VideoCategory {
  title: string;
  videos: Video[];
}