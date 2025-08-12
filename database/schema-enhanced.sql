-- ADHD Learning RPG - Enhanced D1 Database Schema v2.0
-- Production-ready multi-user application with advanced features

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Users table (enhanced with analytics tracking)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- UUID
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT, -- Profile picture URL
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  last_active DATETIME,
  login_count INTEGER DEFAULT 0, -- Track login frequency
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en',
  is_active INTEGER DEFAULT 1, -- Boolean: can the user log in?
  is_verified INTEGER DEFAULT 0, -- Email verification status
  preferences TEXT DEFAULT '{"dark": false, "notifications": true, "privacy": "private"}', -- JSON blob
  
  -- Aggregated statistics for performance
  total_study_time INTEGER DEFAULT 0, -- Overall stats across all subjects
  total_sessions INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0, -- Overall streak across all subjects
  longest_streak INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1
);

-- User sessions (enhanced with better security)
CREATE TABLE IF NOT EXISTS user_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE, -- Ensure unique tokens
  refresh_token_hash TEXT, -- For token refresh functionality
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  last_used DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_agent TEXT,
  ip_address TEXT,
  is_active INTEGER DEFAULT 1,
  session_data TEXT DEFAULT '{}', -- JSON for additional session info
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User settings (separate from preferences for better organization)
CREATE TABLE IF NOT EXISTS user_settings (
  user_id TEXT PRIMARY KEY,
  study_reminders INTEGER DEFAULT 1,
  reminder_times TEXT DEFAULT '["09:00", "14:00", "19:00"]', -- JSON array
  break_reminders INTEGER DEFAULT 1,
  achievement_notifications INTEGER DEFAULT 1,
  weekly_reports INTEGER DEFAULT 1,
  auto_save_interval INTEGER DEFAULT 300, -- seconds
  pip_notification_sound INTEGER DEFAULT 1,
  quest_complete_sound INTEGER DEFAULT 1,
  daily_goal_minutes INTEGER DEFAULT 60,
  weekly_goal_minutes INTEGER DEFAULT 420, -- 7 hours
  theme_preference TEXT DEFAULT 'auto', -- auto, light, dark
  dashboard_layout TEXT DEFAULT 'grid', -- grid, list
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Subject configurations (enhanced with versioning)
CREATE TABLE IF NOT EXISTS subject_configs (
  id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  color TEXT NOT NULL,
  pip_amount INTEGER NOT NULL DEFAULT 5,
  target_hours INTEGER NOT NULL DEFAULT 8,
  achievements TEXT NOT NULL, -- JSON array of achievement tiers
  quest_types TEXT NOT NULL, -- JSON array of quest types
  resources TEXT NOT NULL DEFAULT '[]', -- JSON array of resources
  custom_fields TEXT DEFAULT '{}', -- JSON blob for additional config
  version INTEGER DEFAULT 1, -- For template versioning
  is_template INTEGER DEFAULT 0, -- Can be shared as template
  template_category TEXT, -- For template organization
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id, user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Subject data/progress (enhanced with analytics)
CREATE TABLE IF NOT EXISTS subjects (
  id TEXT NOT NULL, -- matches subject_config.id
  user_id TEXT NOT NULL,
  total_minutes INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  achievement_level INTEGER DEFAULT 0,
  last_study_date TEXT, -- ISO date string (YYYY-MM-DD)
  total_xp INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  average_session_duration REAL DEFAULT 0,
  best_streak_start_date TEXT,
  best_streak_end_date TEXT,
  difficulty_preference TEXT DEFAULT 'mixed', -- easy, medium, hard, mixed
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id, user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (id, user_id) REFERENCES subject_configs(id, user_id) ON DELETE CASCADE
);

-- Study sessions (enhanced with mood tracking)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  date TEXT NOT NULL, -- ISO datetime string
  notes TEXT DEFAULT '',
  quest_type TEXT NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  mood_before INTEGER, -- 1-5 scale
  mood_after INTEGER, -- 1-5 scale
  difficulty_rating INTEGER, -- 1-5 scale
  focus_rating INTEGER, -- 1-5 scale
  was_planned INTEGER DEFAULT 0, -- Boolean: was this session planned?
  break_count INTEGER DEFAULT 0, -- Number of breaks taken
  interruption_count INTEGER DEFAULT 0, -- Number of interruptions
  environment TEXT, -- 'home', 'library', 'cafe', etc.
  device_used TEXT, -- 'desktop', 'mobile', 'tablet'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User goals (enhanced with better tracking)
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  subject_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('minutes', 'sessions', 'streak', 'xp')),
  target INTEGER NOT NULL,
  current_progress INTEGER DEFAULT 0,
  start_date TEXT NOT NULL, -- ISO date string
  due_date TEXT, -- ISO date string, nullable
  priority TEXT NOT NULL CHECK (priority IN ('H', 'M', 'L')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  completion_date TEXT, -- When goal was completed
  reward TEXT, -- Optional reward for completing goal
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Daily progress pips (enhanced with analytics)
CREATE TABLE IF NOT EXISTS pips (
  user_id TEXT NOT NULL,
  date TEXT NOT NULL, -- ISO date string (YYYY-MM-DD)
  subject_id TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  total_minutes INTEGER DEFAULT 0, -- Total minutes from pips
  last_pip_time TEXT, -- ISO timestamp of last pip
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, date, subject_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User templates (enhanced for sharing)
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
  tags TEXT DEFAULT '[]', -- JSON array of tags for searching
  is_public INTEGER DEFAULT 0, -- Can others see this template?
  download_count INTEGER DEFAULT 0,
  rating_average REAL DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User profiles (enhanced with learning analytics)
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
  learning_style TEXT, -- 'visual', 'auditory', 'kinesthetic', 'mixed'
  motivation_factors TEXT DEFAULT '[]', -- JSON array of what motivates the user
  preferred_session_length INTEGER DEFAULT 30, -- minutes
  best_study_times TEXT DEFAULT '[]', -- JSON array of time slots
  study_environment_prefs TEXT DEFAULT '{}', -- JSON object
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Global achievements system (enhanced)
CREATE TABLE IF NOT EXISTS global_achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  emoji TEXT NOT NULL,
  category TEXT NOT NULL, -- 'streak', 'time', 'sessions', 'subjects', etc.
  requirement_type TEXT NOT NULL, -- 'total_time', 'streak_days', 'sessions_count', etc.
  requirement_value INTEGER NOT NULL,
  badge_color TEXT DEFAULT '#4F46E5',
  badge_image_url TEXT, -- Optional custom badge image
  xp_reward INTEGER DEFAULT 0, -- XP awarded for achievement
  is_active INTEGER DEFAULT 1,
  is_hidden INTEGER DEFAULT 0, -- Hidden until unlocked
  unlock_order INTEGER DEFAULT 0, -- For progressive unlocking
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User achievement progress tracking (enhanced)
CREATE TABLE IF NOT EXISTS user_achievement_progress (
  user_id TEXT NOT NULL,
  achievement_id TEXT NOT NULL,
  current_progress INTEGER DEFAULT 0,
  is_completed INTEGER DEFAULT 0,
  completed_at DATETIME,
  first_progress_at DATETIME, -- When user first made progress
  notification_sent INTEGER DEFAULT 0, -- Has user been notified?
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, achievement_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES global_achievements(id) ON DELETE CASCADE
);

-- Study plans (new feature for structured learning)
CREATE TABLE IF NOT EXISTS study_plans (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  subject_id TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  daily_target_minutes INTEGER DEFAULT 30,
  weekly_target_minutes INTEGER DEFAULT 210, -- 3.5 hours
  is_active INTEGER DEFAULT 1,
  completion_percentage REAL DEFAULT 0,
  plan_data TEXT DEFAULT '{}', -- JSON for flexible plan structure
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Activity logs (for detailed user analytics)
CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  action_type TEXT NOT NULL, -- 'session_start', 'session_end', 'goal_created', etc.
  action_data TEXT DEFAULT '{}', -- JSON blob with action details
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Template ratings (for community features)
CREATE TABLE IF NOT EXISTS template_ratings (
  user_id TEXT NOT NULL,
  template_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, template_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (template_id) REFERENCES user_templates(id) ON DELETE CASCADE
);

-- Performance-optimized indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_subject_id ON sessions(subject_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_subject_id ON goals(subject_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_pips_user_date ON pips(user_id, date);
CREATE INDEX IF NOT EXISTS idx_subject_configs_user_id ON subject_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_templates_user_id ON user_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_user_templates_public ON user_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_user_templates_category ON user_templates(category);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievement_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_completed ON user_achievement_progress(is_completed);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_date ON activity_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_study_plans_user_active ON study_plans(user_id, is_active);

-- Automated update triggers for timestamps
CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
  AFTER UPDATE ON users
  FOR EACH ROW
  BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

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

CREATE TRIGGER IF NOT EXISTS update_user_settings_timestamp 
  AFTER UPDATE ON user_settings
  FOR EACH ROW
  BEGIN
    UPDATE user_settings SET updated_at = CURRENT_TIMESTAMP WHERE user_id = NEW.user_id;
  END;

-- Automated statistics updates (for performance)
CREATE TRIGGER IF NOT EXISTS update_user_stats_on_session_insert
  AFTER INSERT ON sessions
  FOR EACH ROW
  BEGIN
    -- Update user total stats
    UPDATE users SET 
      total_study_time = total_study_time + NEW.duration,
      total_sessions = total_sessions + 1,
      total_xp = total_xp + NEW.xp_earned
    WHERE id = NEW.user_id;
    
    -- Update subject total stats
    UPDATE subjects SET 
      total_minutes = total_minutes + NEW.duration,
      total_sessions = total_sessions + 1,
      total_xp = total_xp + NEW.xp_earned,
      average_session_duration = (total_minutes + NEW.duration) / (total_sessions + 1),
      last_study_date = DATE(NEW.date)
    WHERE id = NEW.subject_id AND user_id = NEW.user_id;
  END;

-- Session cleanup trigger (remove expired sessions)
CREATE TRIGGER IF NOT EXISTS cleanup_expired_sessions
  AFTER INSERT ON user_sessions
  FOR EACH ROW
  BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at < CURRENT_TIMESTAMP AND is_active = 0;
  END;
