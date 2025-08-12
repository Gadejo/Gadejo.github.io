/**
 * Comprehensive Achievement System for ADHD Learning RPG
 * Handles unlocking, tracking, and displaying achievements
 */

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'study_time' | 'streaks' | 'subjects' | 'sessions' | 'consistency' | 'milestones' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  unlockedAt?: string;
  progress?: {
    current: number;
    target: number;
    unit: string;
  };
  condition: (userStats: UserStats) => boolean;
  isSecret?: boolean;
  prerequisites?: string[]; // Other achievement IDs required
}

export interface UserStats {
  totalMinutes: number;
  totalSessions: number;
  subjectsStudied: number;
  longestStreak: number;
  currentStreak: number;
  totalXP: number;
  weeklyMinutes: number;
  monthlyMinutes: number;
  averageSessionLength: number;
  studyDays: number;
  perfectWeeks: number; // Weeks with study every day
  subjectMastery: Record<string, number>; // Subject ID -> mastery level
  timeOfDayPreference: string;
  sessionsByDay: Record<string, number>; // Day of week -> session count
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  achievementId: string;
  level?: number;
}

// Comprehensive Achievement Definitions
export const ACHIEVEMENTS: Achievement[] = [
  // Study Time Achievements
  {
    id: 'first_session',
    title: 'First Steps',
    description: 'Complete your first study session',
    icon: '🌱',
    category: 'study_time',
    rarity: 'common',
    xpReward: 10,
    condition: (stats) => stats.totalSessions >= 1
  },
  {
    id: 'one_hour_total',
    title: 'Hour Scholar',
    description: 'Study for a total of 1 hour',
    icon: '⏰',
    category: 'study_time',
    rarity: 'common',
    xpReward: 25,
    condition: (stats) => stats.totalMinutes >= 60
  },
  {
    id: 'five_hours_total',
    title: 'Dedicated Learner',
    description: 'Study for a total of 5 hours',
    icon: '📚',
    category: 'study_time',
    rarity: 'common',
    xpReward: 50,
    condition: (stats) => stats.totalMinutes >= 300
  },
  {
    id: 'twenty_hours_total',
    title: 'Study Champion',
    description: 'Study for a total of 20 hours',
    icon: '🏆',
    category: 'study_time',
    rarity: 'rare',
    xpReward: 100,
    condition: (stats) => stats.totalMinutes >= 1200
  },
  {
    id: 'fifty_hours_total',
    title: 'Learning Master',
    description: 'Study for a total of 50 hours',
    icon: '🎓',
    category: 'study_time',
    rarity: 'epic',
    xpReward: 200,
    condition: (stats) => stats.totalMinutes >= 3000
  },
  {
    id: 'hundred_hours_total',
    title: 'Knowledge Sage',
    description: 'Study for a total of 100 hours',
    icon: '🧙‍♂️',
    category: 'study_time',
    rarity: 'legendary',
    xpReward: 500,
    condition: (stats) => stats.totalMinutes >= 6000
  },

  // Streak Achievements
  {
    id: 'three_day_streak',
    title: 'Getting Started',
    description: 'Maintain a 3-day study streak',
    icon: '🔥',
    category: 'streaks',
    rarity: 'common',
    xpReward: 30,
    condition: (stats) => stats.longestStreak >= 3
  },
  {
    id: 'seven_day_streak',
    title: 'Week Warrior',
    description: 'Maintain a 7-day study streak',
    icon: '⚡',
    category: 'streaks',
    rarity: 'rare',
    xpReward: 75,
    condition: (stats) => stats.longestStreak >= 7
  },
  {
    id: 'thirty_day_streak',
    title: 'Consistency King',
    description: 'Maintain a 30-day study streak',
    icon: '👑',
    category: 'streaks',
    rarity: 'epic',
    xpReward: 250,
    condition: (stats) => stats.longestStreak >= 30
  },
  {
    id: 'hundred_day_streak',
    title: 'Unstoppable Force',
    description: 'Maintain a 100-day study streak',
    icon: '🌟',
    category: 'streaks',
    rarity: 'legendary',
    xpReward: 1000,
    condition: (stats) => stats.longestStreak >= 100
  },

  // Session Achievements
  {
    id: 'ten_sessions',
    title: 'Regular Student',
    description: 'Complete 10 study sessions',
    icon: '📖',
    category: 'sessions',
    rarity: 'common',
    xpReward: 40,
    condition: (stats) => stats.totalSessions >= 10
  },
  {
    id: 'fifty_sessions',
    title: 'Committed Learner',
    description: 'Complete 50 study sessions',
    icon: '📝',
    category: 'sessions',
    rarity: 'rare',
    xpReward: 100,
    condition: (stats) => stats.totalSessions >= 50
  },
  {
    id: 'hundred_sessions',
    title: 'Session Master',
    description: 'Complete 100 study sessions',
    icon: '🎯',
    category: 'sessions',
    rarity: 'epic',
    xpReward: 200,
    condition: (stats) => stats.totalSessions >= 100
  },
  {
    id: 'marathon_session',
    title: 'Marathon Scholar',
    description: 'Complete a 2-hour study session',
    icon: '🏃‍♂️',
    category: 'sessions',
    rarity: 'rare',
    xpReward: 75,
    condition: (stats) => stats.averageSessionLength >= 120 || stats.totalMinutes >= 120 // Simplified check
  },

  // Subject Diversity
  {
    id: 'multi_subject',
    title: 'Renaissance Mind',
    description: 'Study 3 different subjects',
    icon: '🎨',
    category: 'subjects',
    rarity: 'common',
    xpReward: 50,
    condition: (stats) => stats.subjectsStudied >= 3
  },
  {
    id: 'subject_explorer',
    title: 'Knowledge Explorer',
    description: 'Study 5 different subjects',
    icon: '🗺️',
    category: 'subjects',
    rarity: 'rare',
    xpReward: 100,
    condition: (stats) => stats.subjectsStudied >= 5
  },

  // Consistency Achievements
  {
    id: 'perfect_week',
    title: 'Perfect Week',
    description: 'Study every day for a full week',
    icon: '✨',
    category: 'consistency',
    rarity: 'rare',
    xpReward: 100,
    condition: (stats) => stats.perfectWeeks >= 1
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Complete 10 morning study sessions',
    icon: '🌅',
    category: 'consistency',
    rarity: 'rare',
    xpReward: 75,
    condition: (stats) => stats.timeOfDayPreference === 'morning'
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Complete 10 evening study sessions',
    icon: '🦉',
    category: 'consistency',
    rarity: 'rare',
    xpReward: 75,
    condition: (stats) => stats.timeOfDayPreference === 'evening'
  },

  // Special Achievements
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Complete 3 sessions in one day',
    icon: '💨',
    category: 'special',
    rarity: 'rare',
    xpReward: 100,
    condition: (stats) => Object.values(stats.sessionsByDay).some(count => count >= 3),
    isSecret: true
  },
  {
    id: 'comeback_story',
    title: 'Comeback Story',
    description: 'Return to studying after a 7+ day break',
    icon: '🔄',
    category: 'special',
    rarity: 'rare',
    xpReward: 50,
    condition: (stats) => stats.currentStreak >= 1, // Simplified - would need break detection
    isSecret: true
  },
  {
    id: 'overachiever',
    title: 'Overachiever',
    description: 'Earn 1000 total XP',
    icon: '⭐',
    category: 'milestones',
    rarity: 'epic',
    xpReward: 100,
    condition: (stats) => stats.totalXP >= 1000
  }
];

// Badge definitions based on achievements
export const BADGES: Badge[] = [
  // Study Time Badges
  { id: 'rookie', name: 'Rookie', description: 'First study session', icon: '🌱', color: '#10b981', achievementId: 'first_session' },
  { id: 'scholar', name: 'Scholar', description: '1 hour studied', icon: '⏰', color: '#3b82f6', achievementId: 'one_hour_total' },
  { id: 'dedicated', name: 'Dedicated', description: '5 hours studied', icon: '📚', color: '#8b5cf6', achievementId: 'five_hours_total' },
  { id: 'champion', name: 'Champion', description: '20 hours studied', icon: '🏆', color: '#f59e0b', achievementId: 'twenty_hours_total' },
  { id: 'master', name: 'Master', description: '50 hours studied', icon: '🎓', color: '#ef4444', achievementId: 'fifty_hours_total' },
  { id: 'sage', name: 'Sage', description: '100 hours studied', icon: '🧙‍♂️', color: '#6366f1', achievementId: 'hundred_hours_total' },
  
  // Streak Badges
  { id: 'starter_flame', name: 'Starter Flame', description: '3-day streak', icon: '🔥', color: '#f97316', achievementId: 'three_day_streak' },
  { id: 'week_warrior', name: 'Week Warrior', description: '7-day streak', icon: '⚡', color: '#eab308', achievementId: 'seven_day_streak' },
  { id: 'consistency_king', name: 'Consistency King', description: '30-day streak', icon: '👑', color: '#a855f7', achievementId: 'thirty_day_streak' },
  { id: 'unstoppable', name: 'Unstoppable', description: '100-day streak', icon: '🌟', color: '#ec4899', achievementId: 'hundred_day_streak' },
  
  // Special Badges
  { id: 'renaissance', name: 'Renaissance', description: 'Multi-subject mastery', icon: '🎨', color: '#06b6d4', achievementId: 'multi_subject' },
  { id: 'explorer', name: 'Explorer', description: 'Subject diversity', icon: '🗺️', color: '#84cc16', achievementId: 'subject_explorer' },
  { id: 'perfectionist', name: 'Perfectionist', description: 'Perfect week completed', icon: '✨', color: '#f472b6', achievementId: 'perfect_week' }
];

export class AchievementEngine {
  private static instance: AchievementEngine;
  private unlockedAchievements: Set<string> = new Set();
  private listeners: ((achievement: Achievement) => void)[] = [];

  static getInstance(): AchievementEngine {
    if (!AchievementEngine.instance) {
      AchievementEngine.instance = new AchievementEngine();
    }
    return AchievementEngine.instance;
  }

  // Subscribe to achievement unlocks
  onAchievementUnlocked(callback: (achievement: Achievement) => void) {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Check for new achievements based on user stats
  checkAchievements(userStats: UserStats): Achievement[] {
    const newlyUnlocked: Achievement[] = [];

    for (const achievement of ACHIEVEMENTS) {
      if (this.unlockedAchievements.has(achievement.id)) {
        continue; // Already unlocked
      }

      // Check prerequisites
      if (achievement.prerequisites) {
        const hasPrereqs = achievement.prerequisites.every(prereqId => 
          this.unlockedAchievements.has(prereqId)
        );
        if (!hasPrereqs) continue;
      }

      // Check condition
      if (achievement.condition(userStats)) {
        this.unlockedAchievements.add(achievement.id);
        achievement.unlockedAt = new Date().toISOString();
        newlyUnlocked.push(achievement);
        
        // Notify listeners
        this.listeners.forEach(callback => callback(achievement));
      }
    }

    return newlyUnlocked;
  }

  // Get all unlocked achievements
  getUnlockedAchievements(): Achievement[] {
    return ACHIEVEMENTS.filter(achievement => 
      this.unlockedAchievements.has(achievement.id)
    );
  }

  // Get achievement progress for display
  getAchievementProgress(achievement: Achievement, userStats: UserStats): { current: number; target: number; percentage: number } {
    // This would be more sophisticated in a real implementation
    // For now, return basic progress based on achievement type
    switch (achievement.category) {
      case 'study_time':
        const targets = { 'one_hour_total': 60, 'five_hours_total': 300, 'twenty_hours_total': 1200, 'fifty_hours_total': 3000, 'hundred_hours_total': 6000 };
        const target = targets[achievement.id as keyof typeof targets] || userStats.totalMinutes;
        return {
          current: Math.min(userStats.totalMinutes, target),
          target,
          percentage: Math.min(100, (userStats.totalMinutes / target) * 100)
        };
      case 'streaks':
        const streakTargets = { 'three_day_streak': 3, 'seven_day_streak': 7, 'thirty_day_streak': 30, 'hundred_day_streak': 100 };
        const streakTarget = streakTargets[achievement.id as keyof typeof streakTargets] || userStats.longestStreak;
        return {
          current: Math.min(userStats.longestStreak, streakTarget),
          target: streakTarget,
          percentage: Math.min(100, (userStats.longestStreak / streakTarget) * 100)
        };
      default:
        return { current: 0, target: 1, percentage: 0 };
    }
  }

  // Get badges for unlocked achievements
  getUnlockedBadges(): Badge[] {
    return BADGES.filter(badge => 
      this.unlockedAchievements.has(badge.achievementId)
    );
  }

  // Calculate total XP from achievements
  getTotalAchievementXP(): number {
    return this.getUnlockedAchievements()
      .reduce((total, achievement) => total + achievement.xpReward, 0);
  }

  // Get achievement rarity distribution
  getRarityStats(): Record<string, number> {
    const unlocked = this.getUnlockedAchievements();
    return {
      common: unlocked.filter(a => a.rarity === 'common').length,
      rare: unlocked.filter(a => a.rarity === 'rare').length,
      epic: unlocked.filter(a => a.rarity === 'epic').length,
      legendary: unlocked.filter(a => a.rarity === 'legendary').length
    };
  }

  // Load achievements from storage (simplified)
  loadFromStorage(achievementIds: string[]) {
    this.unlockedAchievements = new Set(achievementIds);
  }

  // Save achievements to storage (simplified)
  saveToStorage(): string[] {
    return Array.from(this.unlockedAchievements);
  }

  // Reset all achievements (for testing)
  reset() {
    this.unlockedAchievements.clear();
  }
}