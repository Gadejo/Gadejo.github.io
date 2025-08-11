import type { User, LoginCredentials, RegisterData, PublicUser } from '../types/auth';

// Multi-user email-based authentication service
class AuthService {
  private readonly STORAGE_KEY = 'adhd_rpg_session';
  private readonly USERS_CACHE_KEY = 'adhd_rpg_users_cache';

  async register(data: RegisterData): Promise<User> {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'register',
          email: data.email,
          password: data.password,
          displayName: data.displayName
        }),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Registration failed');
      }

      // After successful registration, log in the user
      return await this.login({
        email: data.email,
        password: data.password
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'login',
          email: credentials.email,
          password: credentials.password
        }),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Login failed');
      }

      const user = result.user;
      const token = result.token;

      // Store session info
      const sessionData = {
        user,
        token,
        expiresAt: result.expiresAt,
        loginTime: new Date().toISOString()
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionData));

      return user;
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async switchUser(credentials: LoginCredentials): Promise<User> {
    try {
      // Clear current session
      this.clearSession();
      
      // Login as new user
      return await this.login(credentials);
      
    } catch (error) {
      console.error('Switch user error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    const token = this.getStoredToken();
    
    if (token) {
      try {
        await fetch('/api/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'logout',
            token
          }),
        });
      } catch (error) {
        console.error('Logout API call failed:', error);
        // Continue with local cleanup even if API call fails
      }
    }

    this.clearSession();
  }

  async verifyAuth(): Promise<boolean> {
    const token = this.getStoredToken();
    if (!token) return false;

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verify',
          token
        }),
      });

      const result = await response.json();
      
      if (!result.success) {
        this.clearSession();
        return false;
      }

      // Update stored user info
      const sessionData = this.getStoredSession();
      if (sessionData) {
        sessionData.user = result.user;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionData));
      }

      return true;
      
    } catch (error) {
      console.error('Auth verification error:', error);
      this.clearSession();
      return false;
    }
  }

  async getAvailableUsers(): Promise<PublicUser[]> {
    try {
      // Try to get from cache first
      const cached = localStorage.getItem(this.USERS_CACHE_KEY);
      if (cached) {
        const cacheData = JSON.parse(cached);
        const now = new Date().getTime();
        // Cache for 5 minutes
        if (now - cacheData.timestamp < 5 * 60 * 1000) {
          return cacheData.users;
        }
      }

      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getUsers'
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Cache the results
        localStorage.setItem(this.USERS_CACHE_KEY, JSON.stringify({
          users: result.users,
          timestamp: new Date().getTime()
        }));
        
        return result.users;
      }

      return [];
      
    } catch (error) {
      console.error('Get users error:', error);
      return [];
    }
  }

  getCurrentUser(): User | null {
    const sessionData = this.getStoredSession();
    if (!sessionData) return null;

    // Check if session is expired
    if (sessionData.expiresAt && new Date(sessionData.expiresAt) < new Date()) {
      this.clearSession();
      return null;
    }

    return sessionData.user;
  }

  getStoredToken(): string | null {
    const sessionData = this.getStoredSession();
    return sessionData?.token || null;
  }

  getUserId(): string | null {
    const user = this.getCurrentUser();
    return user?.id || null;
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  private getStoredSession(): any | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error parsing session data:', error);
      this.clearSession();
      return null;
    }
  }

  private clearSession(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  clearUsersCache(): void {
    localStorage.removeItem(this.USERS_CACHE_KEY);
  }

  // Helper method to get user's display name for UI
  getDisplayName(): string {
    const user = this.getCurrentUser();
    return user?.displayName || 'Unknown User';
  }

  // Helper method to get user's avatar URL
  getAvatarUrl(): string | undefined {
    const user = this.getCurrentUser();
    return user?.avatarUrl;
  }

  // Helper method to check if user has admin privileges (can be extended later)
  isAdmin(): boolean {
    // For now, no admin system - could be extended
    return false;
  }
}

export const authService = new AuthService();