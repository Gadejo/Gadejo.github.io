import type { User, LoginCredentials, RegisterData, PublicUser } from '../types/auth';

// Enhanced multi-user authentication service with KV storage support
class AuthService {
  private readonly STORAGE_KEY = 'adhd_rpg_session';
  private readonly USERS_CACHE_KEY = 'adhd_rpg_users_cache';
  private readonly SESSION_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private refreshTimer: NodeJS.Timeout | null = null;

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

      // Enhanced session info with device tracking
      const sessionData = {
        user,
        token,
        expiresAt: result.expiresAt,
        loginTime: new Date().toISOString(),
        deviceId: this.getDeviceId(),
        lastRefresh: new Date().toISOString()
      };

      // Store in both localStorage and attempt KV storage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionData));
      await this.storeSessionInKV(sessionData);

      // Start session refresh timer
      this.startSessionRefresh();

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
    
    // Stop session refresh timer
    this.stopSessionRefresh();
    
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

    // Clear from both localStorage and KV storage
    await this.clearSessionFromKV();
    this.clearSession();
  }

  async verifyAuth(): Promise<boolean> {
    const token = this.getStoredToken();
    if (!token) return false;

    // Check session expiry first
    const sessionData = this.getStoredSession();
    if (sessionData && sessionData.expiresAt && new Date(sessionData.expiresAt) < new Date()) {
      await this.clearSessionFromKV();
      this.clearSession();
      return false;
    }

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
        await this.clearSessionFromKV();
        this.clearSession();
        return false;
      }

      // Update stored user info in both localStorage and KV
      if (sessionData) {
        sessionData.user = result.user;
        sessionData.lastRefresh = new Date().toISOString();
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionData));
        await this.storeSessionInKV(sessionData);
      }

      // Start session refresh if not already running
      this.startSessionRefresh();

      return true;
      
    } catch (error) {
      console.error('Auth verification error:', error);
      await this.clearSessionFromKV();
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
    const user = this.getCurrentUser();
    return user !== null;
  }

  // Add guest mode login
  async loginAsGuest(): Promise<User> {
    const guestUser: User = {
      id: 'guest-mode',
      email: 'guest@local',
      displayName: 'Guest User',
      createdAt: new Date().toISOString(),
      isActive: true
    };

    const sessionData = {
      user: guestUser,
      token: 'guest-token',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      loginTime: new Date().toISOString(),
      deviceId: this.getDeviceId(),
      lastRefresh: new Date().toISOString(),
      isGuest: true
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionData));
    return guestUser;
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

  // Enhanced session management methods
  private getDeviceId(): string {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).slice(2);
      localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  }

  private async storeSessionInKV(sessionData: any): Promise<void> {
    try {
      // Store session in KV with device-specific key
      const kvKey = `session_${sessionData.user.id}_${sessionData.deviceId}`;
      
      await fetch('/api/kv-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'store',
          key: kvKey,
          data: sessionData,
          expirationTtl: Math.floor((new Date(sessionData.expiresAt).getTime() - Date.now()) / 1000)
        })
      });
    } catch (error) {
      console.warn('Failed to store session in KV storage:', error);
      // Not critical - session is still stored in localStorage
    }
  }

  private async clearSessionFromKV(): Promise<void> {
    try {
      const sessionData = this.getStoredSession();
      if (sessionData) {
        const kvKey = `session_${sessionData.user.id}_${sessionData.deviceId}`;
        
        await fetch('/api/kv-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'delete',
            key: kvKey
          })
        });
      }
    } catch (error) {
      console.warn('Failed to clear session from KV storage:', error);
      // Not critical
    }
  }

  private startSessionRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    this.refreshTimer = setInterval(async () => {
      try {
        const isValid = await this.verifyAuth();
        if (!isValid) {
          this.stopSessionRefresh();
          // Could emit an event here for the app to handle logout
          console.warn('Session invalid during refresh check');
        }
      } catch (error) {
        console.error('Session refresh error:', error);
      }
    }, this.SESSION_REFRESH_INTERVAL);
  }

  private stopSessionRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  // Initialize session check (call this on app startup)
  async initializeSession(): Promise<boolean> {
    try {
      // First try localStorage session
      if (!this.getCurrentUser()) {
        return false;
      }

      // Verify the session is still valid
      const isValid = await this.verifyAuth();
      if (isValid) {
        this.startSessionRefresh();
      }
      
      return isValid;
    } catch (error) {
      console.error('Session initialization error:', error);
      return false;
    }
  }

  // Method to check if session needs refresh
  needsRefresh(): boolean {
    const sessionData = this.getStoredSession();
    if (!sessionData || !sessionData.lastRefresh) return true;

    const lastRefresh = new Date(sessionData.lastRefresh);
    const now = new Date();
    const minutesSinceRefresh = (now.getTime() - lastRefresh.getTime()) / (1000 * 60);

    return minutesSinceRefresh > 10; // Refresh if more than 10 minutes
  }

  // Force refresh the current session
  async forceRefresh(): Promise<boolean> {
    const token = this.getStoredToken();
    if (!token) return false;

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'refresh',
          token
        })
      });

      const result = await response.json();
      
      if (result.success) {
        const sessionData = this.getStoredSession();
        if (sessionData) {
          sessionData.user = result.user;
          sessionData.lastRefresh = new Date().toISOString();
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionData));
          await this.storeSessionInKV(sessionData);
        }
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Force refresh error:', error);
      return false;
    }
  }
}

export const authService = new AuthService();