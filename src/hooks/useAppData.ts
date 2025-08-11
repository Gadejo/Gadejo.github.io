import { useState, useEffect, useCallback } from 'react';
import type { AppData, SubjectData, Session, Goal, SubjectConfig } from '../types';
import { loadAppData, saveAppData } from '../utils/storage';

export function useAppData() {
  const [data, setData] = useState<AppData>(() => loadAppData());

  const saveData = useCallback((newData: AppData) => {
    setData(newData);
    saveAppData(newData);
  }, []);

  const updateSubject = useCallback((subjectId: string, updates: Partial<SubjectData>) => {
    setData(prevData => {
      const newData = {
        ...prevData,
        subjects: {
          ...prevData.subjects,
          [subjectId]: {
            ...prevData.subjects[subjectId],
            ...updates
          }
        }
      };
      saveAppData(newData);
      return newData;
    });
  }, []);

  const addSubject = useCallback((config: SubjectConfig) => {
    const subjectData: SubjectData = {
      config,
      totalMinutes: 0,
      currentStreak: 0,
      longestStreak: 0,
      achievementLevel: 0,
      lastStudyDate: null,
      totalXP: 0
    };

    setData(prevData => {
      const newData = {
        ...prevData,
        subjects: {
          ...prevData.subjects,
          [config.id]: subjectData
        }
      };
      saveAppData(newData);
      return newData;
    });
  }, []);

  const removeSubject = useCallback((subjectId: string) => {
    setData(prevData => {
      const { [subjectId]: removed, ...remainingSubjects } = prevData.subjects;
      const newData = {
        ...prevData,
        subjects: remainingSubjects,
        sessions: prevData.sessions.filter(s => s.subjectId !== subjectId),
        goals: prevData.goals.filter(g => g.subjectId !== subjectId)
      };
      saveAppData(newData);
      return newData;
    });
  }, []);

  const addSession = useCallback((session: Omit<Session, 'id'>) => {
    const newSession: Session = {
      ...session,
      id: `session-${Date.now()}-${Math.random().toString(36).slice(2)}`
    };

    setData(prevData => {
      const subject = prevData.subjects[session.subjectId];
      if (!subject) return prevData;

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
        ...prevData,
        sessions: [...prevData.sessions, newSession],
        subjects: {
          ...prevData.subjects,
          [session.subjectId]: updatedSubject
        }
      };
      
      saveAppData(newData);
      return newData;
    });

    return newSession;
  }, []);

  const addGoal = useCallback((goal: Omit<Goal, 'id'>) => {
    const newGoal: Goal = {
      ...goal,
      id: `goal-${Date.now()}-${Math.random().toString(36).slice(2)}`
    };

    setData(prevData => {
      const newData = {
        ...prevData,
        goals: [...prevData.goals, newGoal]
      };
      saveAppData(newData);
      return newData;
    });
  }, []);

  const updateGoal = useCallback((goalId: string, updates: Partial<Goal>) => {
    setData(prevData => {
      const newData = {
        ...prevData,
        goals: prevData.goals.map(goal =>
          goal.id === goalId ? { ...goal, ...updates } : goal
        )
      };
      saveAppData(newData);
      return newData;
    });
  }, []);

  const removeGoal = useCallback((goalId: string) => {
    setData(prevData => {
      const newData = {
        ...prevData,
        goals: prevData.goals.filter(goal => goal.id !== goalId)
      };
      saveAppData(newData);
      return newData;
    });
  }, []);

  const setPipCount = useCallback((subjectId: string, date: string, count: number) => {
    setData(prevData => {
      const newData = {
        ...prevData,
        pips: {
          ...prevData.pips,
          [date]: {
            ...prevData.pips[date],
            [subjectId]: count
          }
        }
      };
      saveAppData(newData);
      return newData;
    });
  }, []);

  const toggleDarkMode = useCallback(() => {
    setData(prevData => {
      const newData = {
        ...prevData,
        preferences: {
          ...prevData.preferences,
          dark: !prevData.preferences.dark
        }
      };
      saveAppData(newData);
      return newData;
    });
  }, []);

  // Auto-save when data changes
  useEffect(() => {
    saveAppData(data);
  }, [data]);

  return {
    data,
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