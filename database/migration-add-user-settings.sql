-- Migration: Add user_settings table to existing database
-- This migration adds the user_settings table if it doesn't exist

-- Add the user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  user_id TEXT PRIMARY KEY,
  theme_preference TEXT DEFAULT 'light',
  language TEXT DEFAULT 'en',
  study_reminders INTEGER DEFAULT 1,
  reminder_times TEXT DEFAULT '["09:00", "14:00", "19:00"]', -- JSON array
  break_reminders INTEGER DEFAULT 1,
  achievement_notifications INTEGER DEFAULT 1,
  weekly_reports INTEGER DEFAULT 0,
  auto_save_interval INTEGER DEFAULT 300, -- seconds
  pip_notification_sound INTEGER DEFAULT 1,
  quest_complete_sound INTEGER DEFAULT 1,
  daily_goal_minutes INTEGER DEFAULT 60,
  weekly_goal_minutes INTEGER DEFAULT 420, -- 7 hours
  dashboard_layout TEXT DEFAULT 'grid', -- grid, list
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Add update trigger for timestamp
CREATE TRIGGER IF NOT EXISTS update_user_settings_timestamp 
  AFTER UPDATE ON user_settings
  FOR EACH ROW
  BEGIN
    UPDATE user_settings SET updated_at = CURRENT_TIMESTAMP WHERE user_id = NEW.user_id;
  END;
