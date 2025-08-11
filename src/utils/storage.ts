import type { AppData, SubjectData, SubjectConfig, Template } from '../types';
import { defaultSubjects } from './defaults';

const STORAGE_KEY = 'modular-learning-rpg';
const TEMPLATES_KEY = 'user-templates';

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

export function loadAppData(): AppData {
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

export function saveAppData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save app data:', error);
  }
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

export function loadUserTemplates(): Template[] {
  try {
    const stored = localStorage.getItem(TEMPLATES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load user templates:', error);
    return [];
  }
}

export function saveUserTemplate(template: Template): void {
  try {
    const templates = loadUserTemplates();
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

export function deleteUserTemplate(templateId: string): void {
  try {
    const templates = loadUserTemplates().filter(t => t.id !== templateId);
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