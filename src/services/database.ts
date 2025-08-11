import type { AppData, SubjectData, Session, Goal, Template } from '../types';
import { authService } from './auth';

// Database service for D1 operations
class DatabaseService {
  
  async loadAppData(): Promise<AppData> {
    const token = authService.getStoredToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    try {
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

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load data');
      }

      return result.data;
      
    } catch (error) {
      console.error('Load app data error:', error);
      throw error;
    }
  }

  async saveAppData(data: AppData): Promise<void> {
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
          action: 'saveAppData',
          token,
          data
        }),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save data');
      }
      
    } catch (error) {
      console.error('Save app data error:', error);
      throw error;
    }
  }

  async addSession(session: Omit<Session, 'id'>): Promise<Session> {
    const token = authService.getStoredToken();
    if (!token) {
      throw new Error('Authentication token required');
    }

    const newSession: Session = {
      ...session,
      id: `session-${Date.now()}-${Math.random().toString(36).slice(2)}`
    };

    try {
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

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to add session');
      }

      return newSession;
      
    } catch (error) {
      console.error('Add session error:', error);
      throw error;
    }
  }

  async updateSubject(subjectId: string, updates: Partial<SubjectData>): Promise<void> {
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
          action: 'updateSubject',
          token,
          id: subjectId,
          data: updates
        }),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update subject');
      }
      
    } catch (error) {
      console.error('Update subject error:', error);
      throw error;
    }
  }

  async addGoal(goal: Omit<Goal, 'id'>): Promise<Goal> {
    const token = authService.getStoredToken();
    if (!token) {
      throw new Error('Authentication token required');
    }

    const newGoal: Goal = {
      ...goal,
      id: `goal-${Date.now()}-${Math.random().toString(36).slice(2)}`
    };

    try {
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

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to add goal');
      }

      return newGoal;
      
    } catch (error) {
      console.error('Add goal error:', error);
      throw error;
    }
  }

  async updateGoal(goalId: string, updates: Partial<Goal>): Promise<void> {
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
          action: 'updateGoal',
          token,
          id: goalId,
          data: updates
        }),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update goal');
      }
      
    } catch (error) {
      console.error('Update goal error:', error);
      throw error;
    }
  }

  async deleteGoal(goalId: string): Promise<void> {
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
          action: 'deleteGoal',
          token,
          id: goalId
        }),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete goal');
      }
      
    } catch (error) {
      console.error('Delete goal error:', error);
      throw error;
    }
  }

  async setPipCount(subjectId: string, date: string, count: number): Promise<void> {
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
          action: 'setPipCount',
          token,
          data: { subjectId, date, count }
        }),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to set pip count');
      }
      
    } catch (error) {
      console.error('Set pip count error:', error);
      throw error;
    }
  }

  async loadUserTemplates(): Promise<Template[]> {
    const token = authService.getStoredToken();
    if (!token) {
      throw new Error('Authentication token required');
    }

    try {
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

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load templates');
      }

      return result.templates;
      
    } catch (error) {
      console.error('Load user templates error:', error);
      throw error;
    }
  }

  async saveUserTemplate(template: Template): Promise<void> {
    const token = authService.getStoredToken();
    if (!token) {
      throw new Error('Authentication token required');
    }

    try {
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

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save template');
      }
      
    } catch (error) {
      console.error('Save user template error:', error);
      throw error;
    }
  }

  async deleteUserTemplate(templateId: string): Promise<void> {
    const token = authService.getStoredToken();
    if (!token) {
      throw new Error('Authentication token required');
    }

    try {
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

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete template');
      }
      
    } catch (error) {
      console.error('Delete user template error:', error);
      throw error;
    }
  }

  async migrateFromLocalStorage(localStorageData: { appData: AppData, userTemplates: Template[] }): Promise<void> {
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
          action: 'migrateFromLocalStorage',
          token,
          data: localStorageData
        }),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Migration failed');
      }
      
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  }

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
}

export const databaseService = new DatabaseService();