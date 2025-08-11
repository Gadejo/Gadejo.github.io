export interface QuestType {
  id: string;
  name: string;
  duration: number;
  xp: number;
  emoji: string;
}

export interface AchievementTier {
  id: string;
  name: string;
  emoji: string;
  streakRequired: number;
}

export interface Resource {
  id: string;
  title: string;
  url: string;
  priority: 'H' | 'M' | 'L';
}

export interface SubjectConfig {
  id: string;
  name: string;
  emoji: string;
  color: string;
  achievements: AchievementTier[];
  questTypes: QuestType[];
  pipAmount: number;
  targetHours: number;
  resources: Resource[];
  customFields?: Record<string, any>;
}

export interface SubjectData {
  config: SubjectConfig;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  achievementLevel: number;
  lastStudyDate: string | null;
  totalXP: number;
}

export interface Session {
  id: string;
  subjectId: string;
  duration: number;
  date: string;
  notes: string;
  questType: string;
}

export interface Goal {
  id: string;
  title: string;
  subjectId: string;
  type: 'minutes' | 'sessions';
  target: number;
  startDate: string;
  dueDate: string | null;
  priority: 'H' | 'M' | 'L';
  done: boolean;
}

export interface PipData {
  [date: string]: {
    [subjectId: string]: number;
  };
}

export interface AppData {
  subjects: Record<string, SubjectData>;
  sessions: Session[];
  goals: Goal[];
  pips: PipData;
  preferences: {
    dark: boolean;
  };
  version: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  author: string;
  version: string;
  subjects: SubjectConfig[];
  defaultGoals?: Omit<Goal, 'id' | 'subjectId'>[];
}

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  category: string;
  author: string;
  subjectCount: number;
}