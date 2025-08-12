import type { AppData, SubjectData, SubjectConfig, Template } from '../types';
import { defaultSubjects } from './defaults';
import { databaseService } from '../services/database';
import { authService } from '../services/auth';

const STORAGE_KEY = 'modular-learning-rpg';
const TEMPLATES_KEY = 'user-templates';
const MIGRATION_COMPLETED_KEY = 'migration-completed-v4';

function createDefaultSubjectData(config: SubjectConfig): SubjectData {
  return {
    config,
    totalMinutes: 0,
    currentStreak: 0,
    longestStreak: 0,
    achievementLevel: 0,
    lastStudyDate: null,
    totalXP: 0
  };
}

function createDefaultAppData(): AppData {
  const subjects: Record<string, SubjectData> = {};
  
  defaultSubjects.forEach(config => {
    subjects[config.id] = createDefaultSubjectData(config);
  });

  return {
    subjects,
    sessions: [],
    goals: [],
    pips: {},
    preferences: { dark: false },
    version: '4.0.0'
  };
}

export async function loadAppData(): Promise<AppData> {
  // If user is authenticated, try to load from D1 database
  if (authService.getCurrentUser()) {
    try {
      return await databaseService.loadAppData();
    } catch (error) {
      console.error('Failed to load from database, falling back to localStorage:', error);
      // Fall back to localStorage
      return loadAppDataFromLocalStorage();
    }
  }
  
  // Fallback to localStorage for offline use
  return loadAppDataFromLocalStorage();
}

function loadAppDataFromLocalStorage(): AppData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return createDefaultAppData();
    
    const data = JSON.parse(stored) as AppData;
    
    // Ensure all subjects have proper config structure
    Object.values(data.subjects).forEach(subject => {
      if (!subject.config) {
        // Migration from old format
        const oldSubject = subject as any;
        const defaultConfig = defaultSubjects.find(s => s.id === oldSubject.subject);
        if (defaultConfig) {
          subject.config = { ...defaultConfig };
        }
      }
    });

    return data;
  } catch (error) {
    console.error('Failed to load app data:', error);
    return createDefaultAppData();
  }
}

export async function saveAppData(data: AppData): Promise<void> {
  // If user is authenticated, save to D1 database
  if (authService.getCurrentUser()) {
    try {
      await databaseService.saveAppData(data);
      // Also save to localStorage as backup
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return;
    } catch (error) {
      console.error('Failed to save to database, saving to localStorage:', error);
      // Fall back to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return;
    }
  }
  
  // Fallback to localStorage for offline use
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save app data:', error);
  }
}

// Migration function to move localStorage data to D1
export async function migrateLocalStorageToD1(): Promise<void> {
  if (!authService.getCurrentUser()) {
    throw new Error('User must be authenticated to migrate data');
  }

  const localAppData = loadAppDataFromLocalStorage();
  const localTemplates = loadUserTemplatesFromLocalStorage();
  
  try {
    await databaseService.migrateFromLocalStorage({
      appData: localAppData,
      userTemplates: localTemplates
    });
    
    // Mark migration as completed
    localStorage.setItem(MIGRATION_COMPLETED_KEY, 'true');
    console.log('Successfully migrated data to D1 database');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Check if there's localStorage data that needs migration
export function hasLocalStorageData(): boolean {
  // If migration was already completed, don't show migration again
  if (localStorage.getItem(MIGRATION_COMPLETED_KEY) === 'true') {
    return false;
  }

  const appData = localStorage.getItem(STORAGE_KEY);
  const templates = localStorage.getItem(TEMPLATES_KEY);
  
  // Only show migration if there's actual meaningful data
  if (appData) {
    try {
      const parsed = JSON.parse(appData);
      // Check if there's actual user data (sessions, custom subjects, etc.)
      const hasRealData = (
        (parsed.sessions && parsed.sessions.length > 0) ||
        (parsed.goals && parsed.goals.length > 0) ||
        Object.keys(parsed.pips || {}).length > 0 ||
        Object.keys(parsed.subjects || {}).length > defaultSubjects.length
      );
      return hasRealData;
    } catch (error) {
      return false;
    }
  }
  
  return !!(templates && templates !== '[]');
}

// Mark migration as completed (call this after successful migration)
export function markMigrationCompleted(): void {
  localStorage.setItem(MIGRATION_COMPLETED_KEY, 'true');
}

// Reset migration status (useful for testing)
export function resetMigrationStatus(): void {
  localStorage.removeItem(MIGRATION_COMPLETED_KEY);
}

// Skip migration (if user chooses to start fresh)
export function skipMigration(): void {
  localStorage.setItem(MIGRATION_COMPLETED_KEY, 'true');
}

export function exportAppData(data: AppData): Blob {
  const exportData = {
    ...data,
    exportedAt: new Date().toISOString(),
    type: 'modular-adhd-learning-export'
  };
  
  return new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json'
  });
}

export function importAppData(file: File): Promise<AppData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result as string);
        
        if (!imported.subjects || !imported.sessions) {
          throw new Error('Invalid export file format');
        }
        
        // Validate and clean imported data
        const data: AppData = {
          subjects: imported.subjects || {},
          sessions: imported.sessions || [],
          goals: imported.goals || [],
          pips: imported.pips || {},
          preferences: imported.preferences || { dark: false },
          version: imported.version || '4.0.0'
        };
        
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid JSON or corrupted file'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export async function loadUserTemplates(): Promise<Template[]> {
  // If user is authenticated, try to load from D1 database
  if (authService.getCurrentUser()) {
    try {
      return await databaseService.loadUserTemplates();
    } catch (error) {
      console.error('Failed to load templates from database, falling back to localStorage:', error);
      // Fall back to localStorage
      return loadUserTemplatesFromLocalStorage();
    }
  }
  
  // Fallback to localStorage for offline use
  return loadUserTemplatesFromLocalStorage();
}

function loadUserTemplatesFromLocalStorage(): Template[] {
  try {
    const stored = localStorage.getItem(TEMPLATES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load user templates:', error);
    return [];
  }
}

export async function saveUserTemplate(template: Template): Promise<void> {
  // If user is authenticated, save to D1 database
  if (authService.getCurrentUser()) {
    try {
      await databaseService.saveUserTemplate(template);
      // Also save to localStorage as backup
      const templates = loadUserTemplatesFromLocalStorage();
      const existingIndex = templates.findIndex(t => t.id === template.id);
      
      if (existingIndex >= 0) {
        templates[existingIndex] = template;
      } else {
        templates.push(template);
      }
      
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
      return;
    } catch (error) {
      console.error('Failed to save template to database, saving to localStorage:', error);
      // Fall back to localStorage
    }
  }
  
  // Fallback to localStorage
  try {
    const templates = loadUserTemplatesFromLocalStorage();
    const existingIndex = templates.findIndex(t => t.id === template.id);
    
    if (existingIndex >= 0) {
      templates[existingIndex] = template;
    } else {
      templates.push(template);
    }
    
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  } catch (error) {
    console.error('Failed to save template:', error);
  }
}

export async function deleteUserTemplate(templateId: string): Promise<void> {
  // If user is authenticated, delete from D1 database
  if (authService.getCurrentUser()) {
    try {
      await databaseService.deleteUserTemplate(templateId);
      // Also remove from localStorage
      const templates = loadUserTemplatesFromLocalStorage().filter(t => t.id !== templateId);
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
      return;
    } catch (error) {
      console.error('Failed to delete template from database, removing from localStorage:', error);
      // Fall back to localStorage
    }
  }
  
  // Fallback to localStorage
  try {
    const templates = loadUserTemplatesFromLocalStorage().filter(t => t.id !== templateId);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  } catch (error) {
    console.error('Failed to delete template:', error);
  }
}

export function exportTemplate(template: Template): Blob {
  const exportData = {
    ...template,
    exportedAt: new Date().toISOString(),
    type: 'modular-adhd-learning-template'
  };
  
  return new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json'
  });
}

export function importTemplate(file: File): Promise<Template> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result as string);
        
        if (!imported.subjects || !imported.name) {
          throw new Error('Invalid template file format');
        }
        
        const template: Template = {
          id: imported.id || `imported-${Date.now()}`,
          name: imported.name,
          description: imported.description || '',
          category: imported.category || 'Custom',
          author: imported.author || 'Unknown',
          version: imported.version || '1.0.0',
          subjects: imported.subjects,
          defaultGoals: imported.defaultGoals || []
        };
        
        resolve(template);
      } catch (error) {
        reject(new Error('Invalid template file'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}