/**
 * Advanced Leveling System for ADHD Learning RPG
 * Manages user levels, XP progression, and unlockable features
 */

export interface UserLevel {
  level: number;
  currentXP: number;
  xpForNextLevel: number;
  totalXP: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  unlockedFeatures: string[];
  prestigeLevel?: number;
}

export interface LevelReward {
  type: 'feature' | 'customization' | 'boost' | 'achievement';
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface StudyBoost {
  id: string;
  name: string;
  description: string;
  icon: string;
  multiplier: number;
  duration: number; // minutes
  cost: number; // XP cost
  cooldown: number; // minutes
  isActive: boolean;
  activatedAt?: string;
}

// XP calculation formulas
const BASE_XP = 100;
const XP_MULTIPLIER = 1.5;
const MAX_LEVEL = 100;
const PRESTIGE_THRESHOLD = 50;

export function calculateXPForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(BASE_XP * Math.pow(level - 1, XP_MULTIPLIER));
}

export function calculateLevelFromXP(totalXP: number): { level: number; currentXP: number; xpForNextLevel: number } {
  let level = 1;
  let xpUsed = 0;
  
  while (level < MAX_LEVEL) {
    const xpNeeded = calculateXPForLevel(level + 1);
    if (totalXP < xpUsed + xpNeeded) {
      break;
    }
    xpUsed += xpNeeded;
    level++;
  }
  
  const currentXP = totalXP - xpUsed;
  const xpForNextLevel = level < MAX_LEVEL ? calculateXPForLevel(level + 1) : 0;
  
  return { level, currentXP, xpForNextLevel };
}

// Level titles and descriptions
export const LEVEL_TITLES: Record<number, { title: string; description: string; icon: string; color: string }> = {
  1: { title: 'Curious Beginner', description: 'Just starting the learning journey', icon: '🌱', color: '#10b981' },
  5: { title: 'Eager Student', description: 'Building good study habits', icon: '📚', color: '#3b82f6' },
  10: { title: 'Dedicated Learner', description: 'Showing real commitment', icon: '🎯', color: '#8b5cf6' },
  15: { title: 'Knowledge Seeker', description: 'Actively pursuing wisdom', icon: '🔍', color: '#06b6d4' },
  20: { title: 'Study Warrior', description: 'Conquering academic challenges', icon: '⚔️', color: '#ef4444' },
  25: { title: 'Learning Champion', description: 'Excellence in education', icon: '🏆', color: '#f59e0b' },
  30: { title: 'Wisdom Gatherer', description: 'Accumulating vast knowledge', icon: '📜', color: '#84cc16' },
  35: { title: 'Academic Master', description: 'Mastery across subjects', icon: '🎓', color: '#a855f7' },
  40: { title: 'Scholar Supreme', description: 'Peak academic performance', icon: '👑', color: '#ec4899' },
  45: { title: 'Knowledge Sage', description: 'Wise beyond measure', icon: '🧙‍♂️', color: '#6366f1' },
  50: { title: 'Learning Legend', description: 'Legendary dedication to growth', icon: '⭐', color: '#f59e0b' },
  60: { title: 'Enlightened Master', description: 'Transcendent understanding', icon: '✨', color: '#8b5cf6' },
  70: { title: 'Cosmic Scholar', description: 'Universal knowledge seeker', icon: '🌌', color: '#6366f1' },
  80: { title: 'Infinity Learner', description: 'Boundless pursuit of wisdom', icon: '♾️', color: '#ec4899' },
  90: { title: 'Omniscient Being', description: 'Near-perfect knowledge', icon: '🌟', color: '#f59e0b' },
  100: { title: 'Transcendent Sage', description: 'The ultimate learner', icon: '🎆', color: '#ffffff' }
};

// Feature unlocks by level
export const FEATURE_UNLOCKS: Record<number, LevelReward[]> = {
  3: [{ type: 'feature', id: 'custom_subjects', name: 'Custom Subjects', description: 'Create unlimited subjects', icon: '🎨' }],
  5: [{ type: 'customization', id: 'themes', name: 'Theme Customization', description: 'Unlock new color themes', icon: '🎨' }],
  8: [{ type: 'feature', id: 'advanced_stats', name: 'Advanced Statistics', description: 'Detailed analytics dashboard', icon: '📊' }],
  10: [{ type: 'boost', id: 'focus_boost', name: 'Focus Boost', description: '2x XP for 30 minutes', icon: '⚡' }],
  12: [{ type: 'customization', id: 'badges', name: 'Badge Collection', description: 'Earn and display badges', icon: '🏅' }],
  15: [{ type: 'feature', id: 'study_groups', name: 'Study Groups', description: 'Join collaborative sessions', icon: '👥' }],
  18: [{ type: 'boost', id: 'streak_protector', name: 'Streak Protector', description: 'Protect streak for 1 day', icon: '🛡️' }],
  20: [{ type: 'feature', id: 'time_travel', name: 'Time Travel', description: 'Edit past study sessions', icon: '⏰' }],
  25: [{ type: 'customization', id: 'avatars', name: 'Avatar System', description: 'Customize your avatar', icon: '👤' }],
  30: [{ type: 'boost', id: 'double_xp', name: 'Double XP Weekend', description: '2x XP for entire weekend', icon: '💫' }],
  35: [{ type: 'feature', id: 'ai_tutor', name: 'AI Study Tutor', description: 'Personalized study guidance', icon: '🤖' }],
  40: [{ type: 'customization', id: 'legendary_themes', name: 'Legendary Themes', description: 'Exclusive premium themes', icon: '🌟' }],
  45: [{ type: 'feature', id: 'prestige_mode', name: 'Prestige Mode', description: 'Reset level for special rewards', icon: '♦️' }],
  50: [{ type: 'achievement', id: 'hall_of_fame', name: 'Hall of Fame', description: 'Eternal recognition', icon: '🏛️' }]
};

// Study boosts available for purchase
export const STUDY_BOOSTS: StudyBoost[] = [
  {
    id: 'focus_boost',
    name: 'Focus Boost',
    description: 'Double XP gain for 30 minutes',
    icon: '⚡',
    multiplier: 2,
    duration: 30,
    cost: 50,
    cooldown: 120,
    isActive: false
  },
  {
    id: 'mega_focus',
    name: 'Mega Focus',
    description: 'Triple XP gain for 15 minutes',
    icon: '💥',
    multiplier: 3,
    duration: 15,
    cost: 100,
    cooldown: 180,
    isActive: false
  },
  {
    id: 'knowledge_surge',
    name: 'Knowledge Surge',
    description: '50% XP bonus for 60 minutes',
    icon: '🧠',
    multiplier: 1.5,
    duration: 60,
    cost: 75,
    cooldown: 240,
    isActive: false
  },
  {
    id: 'streak_shield',
    name: 'Streak Shield',
    description: 'Protect your streak for 24 hours',
    icon: '🛡️',
    multiplier: 1,
    duration: 1440, // 24 hours
    cost: 200,
    cooldown: 2880, // 48 hours
    isActive: false
  }
];

export class LevelingSystem {
  private static instance: LevelingSystem;
  private activeBoosts: Map<string, StudyBoost> = new Map();
  private listeners: ((userLevel: UserLevel) => void)[] = [];

  static getInstance(): LevelingSystem {
    if (!LevelingSystem.instance) {
      LevelingSystem.instance = new LevelingSystem();
    }
    return LevelingSystem.instance;
  }

  // Subscribe to level changes
  onLevelChange(callback: (userLevel: UserLevel) => void) {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Calculate user level from total XP
  getUserLevel(totalXP: number, prestigeLevel: number = 0): UserLevel {
    const { level, currentXP, xpForNextLevel } = calculateLevelFromXP(totalXP);
    
    // Find appropriate title
    const titleLevel = Object.keys(LEVEL_TITLES)
      .map(Number)
      .filter(l => l <= level)
      .sort((a, b) => b - a)[0] || 1;
    
    const { title, description, icon, color } = LEVEL_TITLES[titleLevel];
    
    // Get unlocked features up to current level
    const unlockedFeatures: string[] = [];
    Object.entries(FEATURE_UNLOCKS).forEach(([lvl, rewards]) => {
      if (parseInt(lvl) <= level) {
        rewards.forEach(reward => {
          unlockedFeatures.push(reward.id);
        });
      }
    });

    return {
      level,
      currentXP,
      xpForNextLevel,
      totalXP,
      title,
      description,
      icon,
      color,
      unlockedFeatures,
      prestigeLevel
    };
  }

  // Get rewards for a specific level
  getLevelRewards(level: number): LevelReward[] {
    return FEATURE_UNLOCKS[level] || [];
  }

  // Check if user can prestige (reset level for bonus)
  canPrestige(level: number): boolean {
    return level >= PRESTIGE_THRESHOLD;
  }

  // Perform prestige (reset level but keep special bonuses)
  performPrestige(currentXP: number): { newXP: number; prestigeBonus: number; prestigeLevel: number } {
    const prestigeBonus = Math.floor(currentXP * 0.1); // 10% of XP as permanent bonus
    const newXP = prestigeBonus;
    const prestigeLevel = 1; // Would increment existing prestige level
    
    return { newXP, prestigeBonus, prestigeLevel };
  }

  // Activate a study boost
  activateBoost(boostId: string, userXP: number): { success: boolean; newXP?: number; boost?: StudyBoost } {
    const boost = STUDY_BOOSTS.find(b => b.id === boostId);
    if (!boost) return { success: false };
    
    // Check if user has enough XP
    if (userXP < boost.cost) return { success: false };
    
    // Check if boost is on cooldown
    if (this.activeBoosts.has(boostId)) return { success: false };
    
    // Activate boost
    const activatedBoost: StudyBoost = {
      ...boost,
      isActive: true,
      activatedAt: new Date().toISOString()
    };
    
    this.activeBoosts.set(boostId, activatedBoost);
    
    // Set expiration timer
    setTimeout(() => {
      this.activeBoosts.delete(boostId);
    }, boost.duration * 60 * 1000);
    
    // Set cooldown timer
    setTimeout(() => {
      // Cooldown complete - boost can be purchased again
    }, boost.cooldown * 60 * 1000);
    
    return {
      success: true,
      newXP: userXP - boost.cost,
      boost: activatedBoost
    };
  }

  // Get all active boosts
  getActiveBoosts(): StudyBoost[] {
    return Array.from(this.activeBoosts.values());
  }

  // Calculate XP with active boosts
  calculateXPWithBoosts(baseXP: number): number {
    let multiplier = 1;
    
    this.activeBoosts.forEach(boost => {
      multiplier *= boost.multiplier;
    });
    
    return Math.floor(baseXP * multiplier);
  }

  // Get available boosts for purchase
  getAvailableBoosts(userXP: number): (StudyBoost & { canAfford: boolean; onCooldown: boolean })[] {
    return STUDY_BOOSTS.map(boost => ({
      ...boost,
      canAfford: userXP >= boost.cost,
      onCooldown: this.activeBoosts.has(boost.id),
      isActive: this.activeBoosts.has(boost.id)
    }));
  }

  // Calculate progress to next milestone
  getProgressToNextMilestone(level: number): { nextMilestone: number; progress: number } {
    const milestones = Object.keys(FEATURE_UNLOCKS).map(Number).sort((a, b) => a - b);
    const nextMilestone = milestones.find(m => m > level) || MAX_LEVEL;
    const lastMilestone = milestones.filter(m => m <= level).pop() || 1;
    
    const progress = level <= lastMilestone ? 100 : 
      Math.round(((level - lastMilestone) / (nextMilestone - lastMilestone)) * 100);
    
    return { nextMilestone, progress };
  }

  // Get level statistics
  getLevelStats(userLevel: UserLevel): {
    progressPercentage: number;
    xpToGo: number;
    totalFeaturesUnlocked: number;
    nextRewards: LevelReward[];
  } {
    const progressPercentage = userLevel.xpForNextLevel > 0 
      ? Math.round((userLevel.currentXP / userLevel.xpForNextLevel) * 100)
      : 100;
      
    const xpToGo = userLevel.xpForNextLevel - userLevel.currentXP;
    const totalFeaturesUnlocked = userLevel.unlockedFeatures.length;
    const nextRewards = this.getLevelRewards(userLevel.level + 1);
    
    return {
      progressPercentage,
      xpToGo,
      totalFeaturesUnlocked,
      nextRewards
    };
  }
}