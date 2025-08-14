export interface User {
  id: string;
  username: string;
  email: string;
  level: number;
  totalXp: number;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  xp: number;
  totalSessions: number;
  streak: number;
  createdAt: string;
}

export interface Session {
  id: string;
  subjectId: string;
  duration: number;
  xpEarned: number;
  completedAt: string;
}

export interface AppState {
  user: User | null;
  subjects: Subject[];
  sessions: Session[];
  isLoading: boolean;
}