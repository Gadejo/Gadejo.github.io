-- ADHD Learning RPG - D1 Database Schema
-- Multi-user application with email-based authentication

-- Users table for authentication and profiles
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- UUID
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT, -- Optional profile picture URL
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  last_active DATETIME,
  is_active INTEGER DEFAULT 1, -- Boolean: can the user log in?
  preferences TEXT DEFAULT '{"dark": false, "notifications": true, "privacy": "private"}', -- JSON blob
  total_study_time INTEGER DEFAULT 0, -- Overall stats across all subjects
  total_sessions INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0, -- Overall streak across all subjects
  longest_streak INTEGER DEFAULT 0
);

-- User sessions for managing multiple concurrent sessions
CREATE TABLE IF NOT EXISTS user_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  last_used DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_agent TEXT,
  ip_address TEXT,
  is_active INTEGER DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Subject configurations
CREATE TABLE IF NOT EXISTS subject_configs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  color TEXT NOT NULL,
  pip_amount INTEGER NOT NULL DEFAULT 5,
  target_hours INTEGER NOT NULL DEFAULT 8,
  achievements TEXT NOT NULL, -- JSON array of achievement tiers
  quest_types TEXT NOT NULL, -- JSON array of quest types
  resources TEXT NOT NULL, -- JSON array of resources
  custom_fields TEXT DEFAULT '{}', -- JSON blob for additional config
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Subject data/progress
CREATE TABLE IF NOT EXISTS subjects (
  id TEXT NOT NULL, -- matches subject_config.id
  user_id TEXT NOT NULL,
  total_minutes INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  achievement_level INTEGER DEFAULT 0,
  last_study_date TEXT, -- ISO date string (YYYY-MM-DD)
  total_xp INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id, user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (id, user_id) REFERENCES subject_configs(id, user_id) ON DELETE CASCADE
);

-- Study sessions
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  date TEXT NOT NULL, -- ISO datetime string
  notes TEXT DEFAULT '',
  quest_type TEXT NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User goals
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('minutes', 'sessions')),
  target INTEGER NOT NULL,
  start_date TEXT NOT NULL, -- ISO date string
  due_date TEXT, -- ISO date string, nullable
  priority TEXT NOT NULL CHECK (priority IN ('H', 'M', 'L')),
  done INTEGER NOT NULL DEFAULT 0, -- SQLite boolean (0/1)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Daily progress pips
CREATE TABLE IF NOT EXISTS pips (
  user_id TEXT NOT NULL,
  date TEXT NOT NULL, -- ISO date string (YYYY-MM-DD)
  subject_id TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, date, subject_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User templates
CREATE TABLE IF NOT EXISTS user_templates (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL,
  author TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0.0',
  subjects TEXT NOT NULL, -- JSON array of subject configs
  default_goals TEXT DEFAULT '[]', -- JSON array of default goals
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User profiles for extended information
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id TEXT PRIMARY KEY,
  bio TEXT,
  learning_goals TEXT, -- JSON array of learning objectives
  favorite_subjects TEXT, -- JSON array of subject IDs
  study_schedule TEXT, -- JSON object with preferred study times
  achievements_earned TEXT DEFAULT '[]', -- JSON array of global achievements
  badges TEXT DEFAULT '[]', -- JSON array of earned badges
  level INTEGER DEFAULT 1, -- Overall user level
  total_xp INTEGER DEFAULT 0, -- Cross-subject XP total
  study_streak_record TEXT, -- JSON object tracking streak history
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Global achievements system (shared across all users)
CREATE TABLE IF NOT EXISTS global_achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  emoji TEXT NOT NULL,
  category TEXT NOT NULL, -- 'streak', 'time', 'sessions', 'subjects', etc.
  requirement_type TEXT NOT NULL, -- 'total_time', 'streak_days', 'sessions_count', etc.
  requirement_value INTEGER NOT NULL,
  badge_color TEXT DEFAULT '#4F46E5',
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User achievement progress tracking
CREATE TABLE IF NOT EXISTS user_achievement_progress (
  user_id TEXT NOT NULL,
  achievement_id TEXT NOT NULL,
  current_progress INTEGER DEFAULT 0,
  is_completed INTEGER DEFAULT 0,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, achievement_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES global_achievements(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_subject_id ON sessions(subject_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_subject_id ON goals(subject_id);
CREATE INDEX IF NOT EXISTS idx_pips_user_date ON pips(user_id, date);
CREATE INDEX IF NOT EXISTS idx_subject_configs_user_id ON subject_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_templates_user_id ON user_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievement_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_completed ON user_achievement_progress(is_completed);

-- Update triggers to maintain updated_at timestamps
CREATE TRIGGER IF NOT EXISTS update_subjects_timestamp 
  AFTER UPDATE ON subjects
  FOR EACH ROW
  BEGIN
    UPDATE subjects SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id AND user_id = NEW.user_id;
  END;

CREATE TRIGGER IF NOT EXISTS update_goals_timestamp 
  AFTER UPDATE ON goals
  FOR EACH ROW
  BEGIN
    UPDATE goals SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_pips_timestamp 
  AFTER UPDATE ON pips
  FOR EACH ROW
  BEGIN
    UPDATE pips SET updated_at = CURRENT_TIMESTAMP WHERE user_id = NEW.user_id AND date = NEW.date AND subject_id = NEW.subject_id;
  END;

CREATE TRIGGER IF NOT EXISTS update_user_templates_timestamp 
  AFTER UPDATE ON user_templates
  FOR EACH ROW
  BEGIN
    UPDATE user_templates SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_subject_configs_timestamp 
  AFTER UPDATE ON subject_configs
  FOR EACH ROW
  BEGIN
    UPDATE subject_configs SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id AND user_id = NEW.user_id;
  END;

CREATE TRIGGER IF NOT EXISTS update_user_profiles_timestamp 
  AFTER UPDATE ON user_profiles
  FOR EACH ROW
  BEGIN
    UPDATE user_profiles SET updated_at = CURRENT_TIMESTAMP WHERE user_id = NEW.user_id;
  END;

CREATE TRIGGER IF NOT EXISTS update_user_achievement_progress_timestamp 
  AFTER UPDATE ON user_achievement_progress
  FOR EACH ROW
  BEGIN
    UPDATE user_achievement_progress SET updated_at = CURRENT_TIMESTAMP WHERE user_id = NEW.user_id AND achievement_id = NEW.achievement_id;
  END;

CREATE TRIGGER IF NOT EXISTS update_user_sessions_last_used 
  AFTER UPDATE ON user_sessions
  FOR EACH ROW
  BEGIN
    UPDATE user_sessions SET last_used = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;