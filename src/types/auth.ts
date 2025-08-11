export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt?: string;
  lastLogin?: string;
  totalStudyTime: number;
  totalSessions: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  totalXp: number;
  preferences?: {
    dark: boolean;
    notifications: boolean;
    privacy: 'private' | 'public' | 'friends';
  };
}

export interface PublicUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  lastLogin?: string;
  totalStudyTime: number;
  totalSessions: number;
  currentStreak: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  availableUsers: PublicUser[];
  token: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  displayName: string;
}

export interface AuthContextType extends AuthState {
  register: (data: RegisterData) => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  switchUser: (credentials: LoginCredentials) => Promise<void>;
  refreshUsers: () => Promise<void>;
  verifyAuth: () => Promise<boolean>;
}