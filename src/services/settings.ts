import { authService } from './auth';

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    studyReminders: boolean;
    achievementAlerts: boolean;
    emailDigest: boolean;
  };
  dashboard: {
    layout: 'grid' | 'list';
    showAnimations: boolean;
    compactView: boolean;
  };
  privacy: {
    shareProgress: boolean;
    publicProfile: boolean;
  };
  study: {
    defaultPomodoroLength: number;
    autoStartBreaks: boolean;
    soundEffects: boolean;
  };
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  language: 'en',
  notifications: {
    studyReminders: true,
    achievementAlerts: true,
    emailDigest: false,
  },
  dashboard: {
    layout: 'grid',
    showAnimations: true,
    compactView: false,
  },
  privacy: {
    shareProgress: false,
    publicProfile: false,
  },
  study: {
    defaultPomodoroLength: 25,
    autoStartBreaks: false,
    soundEffects: true,
  },
};

class SettingsService {
  private readonly STORAGE_KEY = 'adhd_rpg_settings';
  private settings: UserSettings | null = null;
  private listeners: Set<(settings: UserSettings) => void> = new Set();

  // Load settings from database or localStorage
  async loadSettings(): Promise<UserSettings> {
    try {
      // If authenticated, try to load from database
      if (authService.isAuthenticated()) {
        try {
          const dbSettings = await this.loadFromDatabase();
          if (dbSettings) {
            this.settings = { ...DEFAULT_SETTINGS, ...dbSettings };
            // Also cache in localStorage
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
            return this.settings;
          }
        } catch (dbError) {
          // Silently handle database errors and fall back to local storage
          console.warn('Database settings load failed, using local storage:', dbError);
        }
      }

      // Fallback to localStorage
      const localSettings = this.loadFromLocalStorage();
      this.settings = localSettings;
      return localSettings;
    } catch (error) {
      console.error('Failed to load settings:', error);
      this.settings = DEFAULT_SETTINGS;
      return DEFAULT_SETTINGS;
    }
  }

  // Save settings to both database and localStorage
  async saveSettings(newSettings: Partial<UserSettings>): Promise<void> {
    const currentSettings = this.settings || DEFAULT_SETTINGS;
    const updatedSettings: UserSettings = {
      ...currentSettings,
      ...newSettings,
      // Ensure nested objects are properly merged
      notifications: { ...currentSettings.notifications, ...newSettings.notifications },
      dashboard: { ...currentSettings.dashboard, ...newSettings.dashboard },
      privacy: { ...currentSettings.privacy, ...newSettings.privacy },
      study: { ...currentSettings.study, ...newSettings.study }
    };
    this.settings = updatedSettings;

    try {
      // Save to localStorage first (immediate)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedSettings));

      // Notify listeners immediately so UI updates
      this.notifyListeners(updatedSettings);

      // If authenticated, try to save to database (don't block on this)
      if (authService.isAuthenticated()) {
        try {
          await this.saveToDatabase(updatedSettings);
        } catch (dbError) {
          console.warn('Database save failed (settings saved locally):', dbError);
          // Don't throw - settings are still saved locally and UI is updated
        }
      }
    } catch (error) {
      console.error('Failed to save settings locally:', error);
      throw error;
    }
  }

  // Get current settings (synchronous)
  getSettings(): UserSettings {
    return this.settings || DEFAULT_SETTINGS;
  }

  // Subscribe to settings changes
  subscribe(callback: (settings: UserSettings) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Specific setting methods for convenience
  async setTheme(theme: 'light' | 'dark' | 'system'): Promise<void> {
    await this.saveSettings({ theme });
    this.applyTheme(theme);
  }

  async toggleDarkMode(): Promise<void> {
    const currentTheme = this.getSettings().theme;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    await this.setTheme(newTheme);
  }

  async setDashboardLayout(layout: 'grid' | 'list'): Promise<void> {
    await this.saveSettings({
      dashboard: { ...this.getSettings().dashboard, layout }
    });
  }

  async setNotifications(notifications: Partial<UserSettings['notifications']>): Promise<void> {
    await this.saveSettings({
      notifications: { ...this.getSettings().notifications, ...notifications }
    });
  }

  // Apply theme to document
  private applyTheme(theme: 'light' | 'dark' | 'system'): void {
    let effectiveTheme = theme;
    
    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    document.documentElement.setAttribute('data-theme', effectiveTheme);
    
    // Update meta theme-color for mobile browsers
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    const themeColor = effectiveTheme === 'dark' ? '#1a1a1a' : '#ffffff';
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', themeColor);
    }
  }

  // Initialize settings and apply theme
  async initialize(): Promise<UserSettings> {
    const settings = await this.loadSettings();
    this.applyTheme(settings.theme);
    
    // Listen for system theme changes
    if (settings.theme === 'system') {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.getSettings().theme === 'system') {
          this.applyTheme('system');
        }
      });
    }

    return settings;
  }

  // Export settings for backup
  exportSettings(): Blob {
    const exportData = {
      settings: this.getSettings(),
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      type: 'adhd-learning-rpg-settings'
    };

    return new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
  }

  // Import settings from backup
  async importSettings(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async () => {
        try {
          const imported = JSON.parse(reader.result as string);
          
          if (imported.type !== 'adhd-learning-rpg-settings' || !imported.settings) {
            throw new Error('Invalid settings file format');
          }

          // Validate and merge with defaults
          const validatedSettings = { ...DEFAULT_SETTINGS, ...imported.settings };
          await this.saveSettings(validatedSettings);
          
          resolve();
        } catch (error) {
          reject(new Error('Invalid settings file'));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  // Reset to default settings
  async resetSettings(): Promise<void> {
    await this.saveSettings(DEFAULT_SETTINGS);
  }

  // Private methods
  private loadFromLocalStorage(): UserSettings {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error);
    }
    return DEFAULT_SETTINGS;
  }

  private async loadFromDatabase(): Promise<UserSettings | null> {
    const token = authService.getStoredToken();
    if (!token || !authService.isAuthenticated()) {
      return null;
    }

    try {
      // Check if we're in development mode (localhost or specific dev domains)
      const isDevMode = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' || 
                       window.location.port === '5173' ||
                       window.location.port === '8788';
      
      if (isDevMode) {
        console.log('Development mode detected: using default settings');
        return null;
      }

      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'load',
          token
        })
      });

      // Handle different response scenarios gracefully
      if (!response.ok) {
        if (response.status === 401) {
          console.log('Not authenticated - using default settings');
        } else {
          console.warn(`Settings API returned ${response.status}: ${response.statusText}`);
        }
        return null;
      }

      const result = await response.json();
      
      if (result.success) {
        return result.settings; // This could be null, which is fine
      }
      
      console.warn('Settings API returned unsuccessful result:', result);
      return null;
    } catch (error) {
      console.warn('Failed to load settings from database (using defaults):', error);
      return null;
    }
  }

  private async saveToDatabase(settings: UserSettings): Promise<void> {
    const token = authService.getStoredToken();
    if (!token) throw new Error('Authentication required');

    // Skip API call in development mode
    const isDevMode = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' || 
                     window.location.port === '5173' ||
                     window.location.port === '8788';
    
    if (isDevMode) {
      console.log('Development mode detected: skipping settings save to database');
      return;
    }

    const response = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'save',
        token,
        settings
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.log('Not authenticated - settings saved locally only');
        return; // Don't throw error, just skip database save
      }
      throw new Error(`Settings API error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      console.warn('Settings save failed:', result.error);
      // Don't throw error, just log warning - settings are still saved locally
    }
  }

  private notifyListeners(settings: UserSettings): void {
    this.listeners.forEach(callback => {
      try {
        callback(settings);
      } catch (error) {
        console.error('Settings listener error:', error);
      }
    });
  }
}

export const settingsService = new SettingsService();