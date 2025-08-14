import type { AppData, SubjectData, Session, Goal, Template } from '../types';
import { authService } from './auth';

// Enhanced database service with better error handling and fallbacks
class DatabaseService {
  private retryDelay = 1000; // Start with 1 second
  private maxRetries = 3;
  
  // Rate limiting handling with exponential backoff
  private async retryWithBackoff<T>(
    operation: () => Promise<T>, 
    retries = this.maxRetries,
    delay = this.retryDelay
  ): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      if (error.status === 429 && retries > 0) {
        console.log(`Rate limited, retrying in ${delay}ms... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retryWithBackoff(operation, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  async loadAppData(): Promise<AppData | null> {
    const token = authService.getStoredToken();
    
    // If no token, return null to trigger localStorage fallback
    if (!token) {
      console.log('No auth token, falling back to localStorage');
      return null;
    }

    try {
      return await this.retryWithBackoff(async () => {
        const response = await fetch('/api/data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'loadAppData',
            token
          }),
        });

        // Handle rate limiting
        if (response.status === 429) {
          throw { status: 429, message: 'Rate limit exceeded' };
        }

        const result = await response.json();
        
        if (!result.success) {
          // If backend returns no data, return null to trigger localStorage
          if (result.data === null) {
            return null;
          }
          throw new Error(result.error || 'Failed to load data');
        }

        return result.data;
      });
      
    } catch (error: any) {
      console.error('Load app data error:', error);
      
      // On rate limit or server error, return null to use localStorage
      if (error.status === 429 || error.status >= 500) {
        console.log('Server error, falling back to localStorage');
        return null;
      }
      
      throw error;
    }
  }

  async saveAppData(data: AppData): Promise<boolean> {
    const token = authService.getStoredToken();
    
    // If no token, return false to indicate save failed (will save to localStorage)
    if (!token) {
      console.log('No auth token, data will be saved to localStorage only');
      return false;
    }

    try {
      await this.retryWithBackoff(async () => {
        const response = await fetch('/api/data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'saveAppData',
            token,
            data
          }),
        });

        // Handle rate limiting
        if (response.status === 429) {
          throw { status: 429, message: 'Rate limit exceeded' };
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to save data');
        }
        
        return result;
      });
      
      return true; // Successfully saved to database
      
    } catch (error: any) {
      console.error('Save app data error:', error);
      
      // On rate limit or server error, return false to save to localStorage
      if (error.status === 429 || error.status >= 500) {
        console.log('Server error, data will be saved to localStorage as backup');
        return false;
      }
      
      throw error;
    }
  }

  async addSession(session: Omit<Session, 'id'>): Promise<Session> {
    const token = authService.getStoredToken();
    
    const newSession: Session = {
      ...session,
      id: `session-${Date.now()}-${Math.random().toString(36).slice(2)}`
    };

    if (!token) {
      console.log('No auth token, session will be stored locally only');
      return newSession;
    }

    try {
      await this.retryWithBackoff(async () => {
        const response = await fetch('/api/data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'addSession',
            token,
            data: newSession
          }),
        });

        if (response.status === 429) {
          throw { status: 429, message: 'Rate limit exceeded' };
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to add session');
        }
        
        return result;
      });

      return newSession;
      
    } catch (error: any) {
      console.error('Add session error:', error);
      
      // On error, still return the session so it can be stored locally
      if (error.status === 429 || error.status >= 500) {
        console.log('Server error, session will be synced later');
        return newSession;
      }
      
      throw error;
    }
  }

  async updateSubject(subjectId: string, updates: Partial<SubjectData>): Promise<boolean> {
    const token = authService.getStoredToken();
    
    if (!token) {
      return false;
    }

    try {
      await this.retryWithBackoff(async () => {
        const response = await fetch('/api/data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'updateSubject',
            token,
            id: subjectId,
            data: updates
          }),
        });

        if (response.status === 429) {
          throw { status: 429, message: 'Rate limit exceeded' };
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to update subject');
        }
        
        return result;
      });
      
      return true;
      
    } catch (error: any) {
      console.error('Update subject error:', error);
      return false;
    }
  }

  async addGoal(goal: Omit<Goal, 'id'>): Promise<Goal> {
    const token = authService.getStoredToken();
    
    const newGoal: Goal = {
      ...goal,
      id: `goal-${Date.now()}-${Math.random().toString(36).slice(2)}`
    };

    if (!token) {
      return newGoal;
    }

    try {
      await this.retryWithBackoff(async () => {
        const response = await fetch('/api/data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'addGoal',
            token,
            data: newGoal
          }),
        });

        if (response.status === 429) {
          throw { status: 429, message: 'Rate limit exceeded' };
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to add goal');
        }
        
        return result;
      });

      return newGoal;
      
    } catch (error: any) {
      console.error('Add goal error:', error);
      return newGoal; // Return goal anyway for local storage
    }
  }

  async updateGoal(goalId: string, updates: Partial<Goal>): Promise<boolean> {
    const token = authService.getStoredToken();
    
    if (!token) {
      return false;
    }

    try {
      await this.retryWithBackoff(async () => {
        const response = await fetch('/api/data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'updateGoal',
            token,
            id: goalId,
            data: updates
          }),
        });

        if (response.status === 429) {
          throw { status: 429, message: 'Rate limit exceeded' };
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to update goal');
        }
        
        return result;
      });
      
      return true;
      
    } catch (error: any) {
      console.error('Update goal error:', error);
      return false;
    }
  }

  async deleteGoal(goalId: string): Promise<boolean> {
    const token = authService.getStoredToken();
    
    if (!token) {
      return false;
    }

    try {
      await this.retryWithBackoff(async () => {
        const response = await fetch('/api/data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'deleteGoal',
            token,
            id: goalId
          }),
        });

        if (response.status === 429) {
          throw { status: 429, message: 'Rate limit exceeded' };
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to delete goal');
        }
        
        return result;
      });
      
      return true;
      
    } catch (error: any) {
      console.error('Delete goal error:', error);
      return false;
    }
  }

  async setPipCount(subjectId: string, date: string, count: number): Promise<boolean> {
    const token = authService.getStoredToken();
    
    if (!token) {
      return false;
    }

    try {
      await this.retryWithBackoff(async () => {
        const response = await fetch('/api/data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'setPipCount',
            token,
            data: { subjectId, date, count }
          }),
        });

        if (response.status === 429) {
          throw { status: 429, message: 'Rate limit exceeded' };
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to set pip count');
        }
        
        return result;
      });
      
      return true;
      
    } catch (error: any) {
      console.error('Set pip count error:', error);
      return false;
    }
  }

  // Template methods with similar error handling
  async loadUserTemplates(): Promise<Template[]> {
    const token = authService.getStoredToken();
    if (!token) {
      return [];
    }

    try {
      return await this.retryWithBackoff(async () => {
        const response = await fetch('/api/templates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'loadUserTemplates',
            token
          }),
        });

        if (response.status === 429) {
          throw { status: 429, message: 'Rate limit exceeded' };
        }

        const result = await response.json();
        
        if (!result.success) {
          return [];
        }

        return result.templates || [];
      });
      
    } catch (error: any) {
      console.error('Load user templates error:', error);
      return [];
    }
  }

  async saveUserTemplate(template: Template): Promise<boolean> {
    const token = authService.getStoredToken();
    if (!token) {
      return false;
    }

    try {
      await this.retryWithBackoff(async () => {
        const response = await fetch('/api/templates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'saveUserTemplate',
            token,
            template
          }),
        });

        if (response.status === 429) {
          throw { status: 429, message: 'Rate limit exceeded' };
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to save template');
        }
        
        return result;
      });
      
      return true;
      
    } catch (error: any) {
      console.error('Save user template error:', error);
      return false;
    }
  }

  async deleteUserTemplate(templateId: string): Promise<boolean> {
    const token = authService.getStoredToken();
    if (!token) {
      return false;
    }

    try {
      await this.retryWithBackoff(async () => {
        const response = await fetch('/api/templates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'deleteUserTemplate',
            token,
            templateId
          }),
        });

        if (response.status === 429) {
          throw { status: 429, message: 'Rate limit exceeded' };
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to delete template');
        }
        
        return result;
      });
      
      return true;
      
    } catch (error: any) {
      console.error('Delete user template error:', error);
      return false;
    }
  }

  // Migration methods
  async migrateFromLocalStorage(localStorageData: { appData: AppData, userTemplates: Template[] }): Promise<void> {
    const token = authService.getStoredToken();
    if (!token) {
      throw new Error('Authentication token required');
    }

    try {
      await this.retryWithBackoff(async () => {
        const response = await fetch('/api/data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'migrateFromLocalStorage',
            token,
            data: localStorageData
          }),
        });

        if (response.status === 429) {
          throw { status: 429, message: 'Rate limit exceeded' };
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Migration failed');
        }
        
        return result;
      });
      
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  }

  // Diagnostic methods remain the same
  async testMigration(localStorageData: { appData: AppData, userTemplates: Template[] }): Promise<any> {
    const token = authService.getStoredToken();
    if (!token) {
      throw new Error('Authentication token required');
    }

    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'testMigration',
          token,
          data: localStorageData
        }),
      });

      const result = await response.json();
      return result;
      
    } catch (error) {
      console.error('Test migration error:', error);
      throw error;
    }
  }

  async ensureUserExists(): Promise<any> {
    const token = authService.getStoredToken();
    if (!token) {
      throw new Error('Authentication token required');
    }

    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'ensureUser',
          token
        }),
      });

      const result = await response.json();
      return result;
      
    } catch (error) {
      console.error('Ensure user exists error:', error);
      throw error;
    }
  }

  async runDiagnostics(): Promise<any> {
    const token = authService.getStoredToken();
    if (!token) {
      throw new Error('Authentication token required');
    }

    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'diagnostics',
          token
        }),
      });

      const result = await response.json();
      console.log('Diagnostics result:', result);
      return result;
      
    } catch (error) {
      console.error('Diagnostics error:', error);
      throw error;
    }
  }

  async stepByStepMigration(localStorageData: { appData: AppData, userTemplates: Template[] }): Promise<any> {
    const token = authService.getStoredToken();
    if (!token) {
      throw new Error('Authentication token required');
    }

    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'stepByStepMigration',
          token,
          data: localStorageData
        }),
      });

      const result = await response.json();
      console.log('Step-by-step migration result:', result);
      return result;
      
    } catch (error) {
      console.error('Step-by-step migration error:', error);
      throw error;
    }
  }
}

export const databaseService = new DatabaseService();
export { DatabaseService };