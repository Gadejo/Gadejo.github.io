import type { User, LoginCredentials, RegisterData } from '../types/auth';

// Mock auth service - replace with real implementation
class AuthService {
  private readonly STORAGE_KEY = 'adhd_rpg_auth';

  async login(credentials: LoginCredentials): Promise<User> {
    // Mock implementation - replace with real API call
    const mockUser: User = {
      id: 'user_' + Date.now(),
      email: credentials.email,
      displayName: credentials.email.split('@')[0],
      createdAt: new Date().toISOString(),
      lastSyncAt: new Date().toISOString(),
      preferences: {
        theme: 'light',
        syncEnabled: true,
        offlineMode: false,
      },
    };

    // Simulate API delay
    await this.delay(1000);
    
    // Store user in localStorage for persistence
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mockUser));
    
    return mockUser;
  }

  async register(data: RegisterData): Promise<User> {
    // Mock implementation
    const mockUser: User = {
      id: 'user_' + Date.now(),
      email: data.email,
      displayName: data.displayName,
      createdAt: new Date().toISOString(),
      lastSyncAt: new Date().toISOString(),
      preferences: {
        theme: 'light',
        syncEnabled: true,
        offlineMode: false,
      },
    };

    await this.delay(1000);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mockUser));
    
    return mockUser;
  }

  async logout(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY);
    // Clear any other user-specific data
    await this.delay(500);
  }

  getCurrentUser(): User | null {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error('No authenticated user');
    }

    const updatedUser = { ...currentUser, ...updates };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedUser));
    
    await this.delay(500);
    return updatedUser;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const authService = new AuthService();