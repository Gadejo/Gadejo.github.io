import { useState, useEffect, useCallback } from 'react';
import type { AppData, SubjectData, Session, Goal, SubjectConfig } from '../types';
import { loadAppData, saveAppData } from '../utils/storage';
import { databaseService } from '../services/database';
import { authService } from '../services/auth';

export function useAppData() {
  const [data, setData] = useState<AppData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initial data loading
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const appData = await loadAppData();
        setData(appData);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const saveData = useCallback(async (newData: AppData) => {
    setData(newData);
    try {
      await saveAppData(newData);
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }, []);

  const updateSubject = useCallback(async (subjectId: string, updates: Partial<SubjectData>) => {
    if (!data) return;
    
    const newData = {
      ...data,
      subjects: {
        ...data.subjects,
        [subjectId]: {
          ...data.subjects[subjectId],
          ...updates
        }
      }
    };
    
    setData(newData);
    
    // If authenticated, try to update directly in database
    if (authService.getCurrentUser()) {
      try {
        await databaseService.updateSubject(subjectId, updates);
      } catch (error) {
        console.error('Failed to update subject in database:', error);
      }
    }
    
    try {
      await saveAppData(newData);
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }, [data]);

  const addSubject = useCallback((config: SubjectConfig) => {
    if (!data) return;
    
    const subjectData: SubjectData = {
      config,
      totalMinutes: 0,
      currentStreak: 0,
      longestStreak: 0,
      achievementLevel: 0,
      lastStudyDate: null,
      totalXP: 0
    };

    const newData: AppData = {
      ...data,
      subjects: {
        ...data.subjects,
        [config.id]: subjectData
      }
    };
    
    setData(newData);
    saveAppData(newData);
  }, [data]);

  const removeSubject = useCallback((subjectId: string) => {
    if (!data) return;
    
    const { [subjectId]: removed, ...remainingSubjects } = data.subjects;
    const newData: AppData = {
      ...data,
      subjects: remainingSubjects,
      sessions: data.sessions.filter(s => s.subjectId !== subjectId),
      goals: data.goals.filter(g => g.subjectId !== subjectId)
    };
    
    setData(newData);
    saveAppData(newData);
  }, [data]);

  const addSession = useCallback(async (session: Omit<Session, 'id'>) => {
    if (!data) return null;
    
    const newSession: Session = {
      ...session,
      id: `session-${Date.now()}-${Math.random().toString(36).slice(2)}`
    };

    const subject = data.subjects[session.subjectId];
    if (!subject) return null;

    // Update subject data based on session
    const today = new Date().toISOString().slice(0, 10);
    const lastStudyDate = subject.lastStudyDate;
    
    let newStreak = subject.currentStreak;
    if (!lastStudyDate) {
      newStreak = 1;
    } else {
      const daysDiff = Math.floor((new Date(today).getTime() - new Date(lastStudyDate).getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff === 0) {
        // Same day, no change to streak
      } else if (daysDiff === 1) {
        newStreak += 1;
      } else {
        newStreak = 1; // Reset streak
      }
    }

    // Update achievement level
    const questType = subject.config.questTypes.find(q => q.id === session.questType);
    const xpGained = questType?.xp || 0;
    
    let achievementLevel = subject.achievementLevel;
    for (let i = subject.config.achievements.length - 1; i >= 0; i--) {
      if (newStreak >= subject.config.achievements[i].streakRequired) {
        achievementLevel = i;
        break;
      }
    }

    const updatedSubject: SubjectData = {
      ...subject,
      totalMinutes: subject.totalMinutes + session.duration,
      currentStreak: newStreak,
      longestStreak: Math.max(subject.longestStreak, newStreak),
      lastStudyDate: today,
      totalXP: subject.totalXP + xpGained,
      achievementLevel
    };

    const newData = {
      ...data,
      sessions: [...data.sessions, newSession],
      subjects: {
        ...data.subjects,
        [session.subjectId]: updatedSubject
      }
    };
    
    setData(newData);
    
    // If authenticated, try to add session to database
    if (authService.getCurrentUser()) {
      try {
        await databaseService.addSession(session);
        await databaseService.updateSubject(session.subjectId, {
          totalMinutes: updatedSubject.totalMinutes,
          currentStreak: updatedSubject.currentStreak,
          longestStreak: updatedSubject.longestStreak,
          lastStudyDate: updatedSubject.lastStudyDate,
          totalXP: updatedSubject.totalXP,
          achievementLevel: updatedSubject.achievementLevel
        });
      } catch (error) {
        console.error('Failed to save session to database:', error);
      }
    }
    
    try {
      await saveAppData(newData);
    } catch (error) {
      console.error('Failed to save data:', error);
    }
    
    return newSession;
  }, [data]);

  const addGoal = useCallback(async (goal: Omit<Goal, 'id'>) => {
    if (!data) return;
    
    const newGoal: Goal = {
      ...goal,
      id: `goal-${Date.now()}-${Math.random().toString(36).slice(2)}`
    };

    const newData: AppData = {
      ...data,
      goals: [...data.goals, newGoal]
    };
    
    setData(newData);
    
    // If authenticated, try to add goal to database
    if (authService.getCurrentUser()) {
      try {
        await databaseService.addGoal(goal);
      } catch (error) {
        console.error('Failed to save goal to database:', error);
      }
    }
    
    try {
      await saveAppData(newData);
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }, [data]);

  const updateGoal = useCallback(async (goalId: string, updates: Partial<Goal>) => {
    if (!data) return;
    
    const newData: AppData = {
      ...data,
      goals: data.goals.map(goal =>
        goal.id === goalId ? { ...goal, ...updates } : goal
      )
    };
    
    setData(newData);
    
    // If authenticated, try to update goal in database
    if (authService.getCurrentUser()) {
      try {
        await databaseService.updateGoal(goalId, updates);
      } catch (error) {
        console.error('Failed to update goal in database:', error);
      }
    }
    
    try {
      await saveAppData(newData);
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }, [data]);

  const removeGoal = useCallback(async (goalId: string) => {
    if (!data) return;
    
    const newData: AppData = {
      ...data,
      goals: data.goals.filter(goal => goal.id !== goalId)
    };
    
    setData(newData);
    
    // If authenticated, try to delete goal from database
    if (authService.getCurrentUser()) {
      try {
        await databaseService.deleteGoal(goalId);
      } catch (error) {
        console.error('Failed to delete goal from database:', error);
      }
    }
    
    try {
      await saveAppData(newData);
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }, [data]);

  const setPipCount = useCallback(async (subjectId: string, date: string, count: number) => {
    if (!data) return;
    
    const newData: AppData = {
      ...data,
      pips: {
        ...data.pips,
        [date]: {
          ...data.pips[date],
          [subjectId]: count
        }
      }
    };
    
    setData(newData);
    
    // If authenticated, try to update pip count in database
    if (authService.getCurrentUser()) {
      try {
        await databaseService.setPipCount(subjectId, date, count);
      } catch (error) {
        console.error('Failed to update pip count in database:', error);
      }
    }
    
    try {
      await saveAppData(newData);
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }, [data]);

  const toggleDarkMode = useCallback(async () => {
    if (!data) return;
    
    const newData: AppData = {
      ...data,
      preferences: {
        ...data.preferences,
        dark: !data.preferences.dark
      }
    };
    
    setData(newData);
    
    try {
      await saveAppData(newData);
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }, [data]);

  // Auto-save when data changes
  useEffect(() => {
    if (data) {
      saveAppData(data);
    }
  }, [data]);

  return {
    data,
    isLoading,
    setData: saveData,
    updateSubject,
    addSubject,
    removeSubject,
    addSession,
    addGoal,
    updateGoal,
    removeGoal,
    setPipCount,
    toggleDarkMode
  };
}