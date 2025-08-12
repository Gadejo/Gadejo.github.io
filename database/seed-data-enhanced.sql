-- Enhanced Seed Data for ADHD Learning RPG v2.0
-- Production-ready sample data with new features

-- Global achievements (enhanced with progression)
INSERT OR IGNORE INTO global_achievements (id, name, description, emoji, category, requirement_type, requirement_value, badge_color, xp_reward, unlock_order) VALUES
-- Beginner achievements
('first_session', 'First Step', 'Complete your first study session', '🌱', 'sessions', 'sessions_count', 1, '#10B981', 50, 1),
('early_bird', 'Early Bird', 'Study for 3 consecutive days', '🐦', 'streak', 'streak_days', 3, '#F59E0B', 100, 2),
('focused_learner', 'Focused Learner', 'Complete 10 study sessions', '🎯', 'sessions', 'sessions_count', 10, '#3B82F6', 150, 3),

-- Intermediate achievements
('week_warrior', 'Week Warrior', 'Maintain a 7-day study streak', '⚔️', 'streak', 'streak_days', 7, '#8B5CF6', 300, 4),
('time_master', 'Time Master', 'Study for 10 total hours', '⏰', 'time', 'total_time', 600, '#EF4444', 500, 5),
('habit_builder', 'Habit Builder', 'Complete 25 study sessions', '🔨', 'sessions', 'sessions_count', 25, '#F97316', 400, 6),

-- Advanced achievements
('dedication', 'Dedication', 'Maintain a 30-day study streak', '🔥', 'streak', 'streak_days', 30, '#DC2626', 1000, 7),
('scholar', 'Scholar', 'Study for 50 total hours', '📚', 'time', 'total_time', 3000, '#7C3AED', 1500, 8),
('consistency_king', 'Consistency King', 'Complete 100 study sessions', '👑', 'sessions', 'sessions_count', 100, '#059669', 2000, 9),

-- Expert achievements
('master_learner', 'Master Learner', 'Study for 100 total hours', '🎓', 'time', 'total_time', 6000, '#DC2626', 3000, 10),
('streak_legend', 'Streak Legend', 'Maintain a 90-day study streak', '🌟', 'streak', 'streak_days', 90, '#7C2D12', 5000, 11),
('ultimate_scholar', 'Ultimate Scholar', 'Complete 500 study sessions', '🏆', 'sessions', 'sessions_count', 500, '#A855F7', 10000, 12);

-- Sample user settings for enhanced features
INSERT OR IGNORE INTO user_settings (
  user_id, 
  study_reminders, 
  reminder_times, 
  daily_goal_minutes, 
  weekly_goal_minutes,
  theme_preference,
  dashboard_layout
) 
SELECT 
  id,
  1,
  '["09:00", "14:00", "19:00"]',
  60,
  420,
  'auto',
  'grid'
FROM users LIMIT 1;

-- Sample enhanced goals with new types
INSERT OR IGNORE INTO goals (
  id, user_id, title, description, subject_id, type, target, 
  start_date, due_date, priority, status
) 
SELECT 
  'goal_weekly_minutes_' || hex(randomblob(4)),
  u.id,
  'Weekly Study Goal',
  'Study for at least 7 hours this week across all subjects',
  sc.id,
  'minutes',
  420,
  date('now'),
  date('now', '+7 days'),
  'H',
  'active'
FROM users u, subject_configs sc WHERE u.id = sc.user_id LIMIT 1;

INSERT OR IGNORE INTO goals (
  id, user_id, title, description, subject_id, type, target, 
  start_date, due_date, priority, status
) 
SELECT 
  'goal_daily_streak_' || hex(randomblob(4)),
  u.id,
  'Build Study Habit',
  'Maintain a 14-day study streak',
  sc.id,
  'streak',
  14,
  date('now'),
  date('now', '+14 days'),
  'M',
  'active'
FROM users u, subject_configs sc WHERE u.id = sc.user_id LIMIT 1;

INSERT OR IGNORE INTO goals (
  id, user_id, title, description, subject_id, type, target, 
  start_date, due_date, priority, status
) 
SELECT 
  'goal_xp_milestone_' || hex(randomblob(4)),
  u.id,
  'XP Milestone',
  'Earn 1000 XP in studies',
  sc.id,
  'xp',
  1000,
  date('now'),
  date('now', '+30 days'),
  'L',
  'active'
FROM users u, subject_configs sc WHERE u.id = sc.user_id LIMIT 1;

-- Sample study plan
INSERT OR IGNORE INTO study_plans (
  id, user_id, name, description, subject_id, start_date, end_date,
  daily_target_minutes, weekly_target_minutes, plan_data
) 
SELECT 
  'plan_' || hex(randomblob(4)),
  u.id,
  '30-Day Learning Challenge',
  'Intensive study plan for skill development',
  sc.id,
  date('now'),
  date('now', '+30 days'),
  45,
  315,
  '{"weeks": [
    {"week": 1, "focus": "Foundation building", "sessions": 7},
    {"week": 2, "focus": "Skill practice", "sessions": 7},
    {"week": 3, "focus": "Advanced concepts", "sessions": 7},
    {"week": 4, "focus": "Mastery and review", "sessions": 7}
  ]}'
FROM users u, subject_configs sc WHERE u.id = sc.user_id LIMIT 1;

-- Sample activity logs
INSERT OR IGNORE INTO activity_logs (
  id, user_id, action_type, action_data, ip_address
) 
SELECT 
  'log_session_' || hex(randomblob(4)),
  u.id,
  'session_completed',
  '{"subject_id": "' || sc.id || '", "duration": 30, "xp_earned": 25, "quest_type": "practice"}',
  '127.0.0.1'
FROM users u, subject_configs sc WHERE u.id = sc.user_id LIMIT 1;

INSERT OR IGNORE INTO activity_logs (
  id, user_id, action_type, action_data, ip_address
) 
SELECT 
  'log_achievement_' || hex(randomblob(4)),
  u.id,
  'achievement_unlocked',
  '{"achievement_id": "first_session", "xp_reward": 50}',
  '127.0.0.1'
FROM users u LIMIT 1;

INSERT OR IGNORE INTO activity_logs (
  id, user_id, action_type, action_data, ip_address
) 
SELECT 
  'log_goal_' || hex(randomblob(4)),
  u.id,
  'goal_created',
  '{"goal_type": "minutes", "target": 420}',
  '127.0.0.1'
FROM users u LIMIT 1;

-- Enhanced user profile data
UPDATE user_profiles SET
  learning_style = 'mixed',
  motivation_factors = '["achievement_unlocks", "progress_tracking", "streak_building", "xp_earning"]',
  preferred_session_length = 30,
  best_study_times = '["09:00-10:00", "14:00-15:00", "19:00-20:00"]',
  study_environment_prefs = '{"noise_level": "quiet", "lighting": "bright", "temperature": "cool", "music": false}'
WHERE user_id IN (SELECT id FROM users);

-- Sample template with enhanced features
INSERT OR IGNORE INTO user_templates (
  id, user_id, name, description, category, author, version,
  subjects, default_goals, tags, is_public
) 
SELECT 
  'template_comprehensive_' || hex(randomblob(4)),
  u.id,
  'Comprehensive Learning System',
  'Advanced learning template with progressive difficulty and analytics',
  'General Learning',
  'ADHD Learning RPG Team',
  '2.0.0',
  '[{
    "id": "core_subject",
    "name": "Core Subject",
    "emoji": "🎯",
    "color": "#4F46E5",
    "pipAmount": 10,
    "targetHours": 100,
    "achievements": [
      {"name": "Getting Started", "streakRequired": 1, "emoji": "🌱"},
      {"name": "Building Momentum", "streakRequired": 7, "emoji": "🔥"},
      {"name": "Steady Progress", "streakRequired": 30, "emoji": "⚡"},
      {"name": "Committed Learner", "streakRequired": 90, "emoji": "🎖️"},
      {"name": "Subject Master", "streakRequired": 180, "emoji": "🏆"},
      {"name": "Expert Level", "streakRequired": 365, "emoji": "👑"}
    ],
    "questTypes": [
      {"id": "review", "name": "Review", "duration": 15, "xp": 10, "emoji": "📝"},
      {"id": "practice", "name": "Practice", "duration": 25, "xp": 20, "emoji": "💪"},
      {"id": "deep_study", "name": "Deep Study", "duration": 45, "xp": 35, "emoji": "🧠"},
      {"id": "project", "name": "Project Work", "duration": 60, "xp": 50, "emoji": "🔨"}
    ],
    "resources": [
      {"title": "Study Materials", "url": "https://example.com/materials", "type": "resource"},
      {"title": "Practice Platform", "url": "https://example.com/practice", "type": "tool"},
      {"title": "Community Forum", "url": "https://example.com/forum", "type": "community"}
    ]
  }]',
  '[{
    "title": "Daily Practice",
    "type": "sessions",
    "target": 1,
    "priority": "H"
  }, {
    "title": "Weekly Deep Study",
    "type": "minutes",
    "target": 180,
    "priority": "M"
  }]',
  '["comprehensive", "progressive", "analytics", "structured"]',
  1
FROM users u LIMIT 1;

-- Add some sample sessions with enhanced tracking
INSERT OR IGNORE INTO sessions (
  id, user_id, subject_id, duration, date, notes, quest_type, xp_earned,
  mood_before, mood_after, difficulty_rating, focus_rating, was_planned,
  environment, device_used
) 
SELECT 
  'session_' || hex(randomblob(4)),
  u.id,
  sc.id,
  30,
  datetime('now', '-1 day'),
  'Productive session focusing on core concepts',
  'practice',
  25,
  3, -- mood before (1-5 scale)
  4, -- mood after (1-5 scale)
  3, -- difficulty rating
  4, -- focus rating
  1, -- was planned
  'home',
  'desktop'
FROM users u, subject_configs sc WHERE u.id = sc.user_id LIMIT 1;

INSERT OR IGNORE INTO sessions (
  id, user_id, subject_id, duration, date, notes, quest_type, xp_earned,
  mood_before, mood_after, difficulty_rating, focus_rating, was_planned,
  environment, device_used
) 
SELECT 
  'session_' || hex(randomblob(4)),
  u.id,
  sc.id,
  45,
  datetime('now', '-2 days'),
  'Deep dive session with excellent focus',
  'deep_study',
  35,
  4,
  5,
  4,
  5,
  1,
  'library',
  'tablet'
FROM users u, subject_configs sc WHERE u.id = sc.user_id LIMIT 1;

-- Initialize user achievement progress for sample users
INSERT OR IGNORE INTO user_achievement_progress (
  user_id, achievement_id, current_progress, is_completed, completed_at, first_progress_at
)
SELECT 
  u.id,
  ga.id,
  CASE 
    WHEN ga.requirement_value <= 1 THEN ga.requirement_value
    ELSE CAST(ga.requirement_value * 0.3 AS INTEGER)
  END,
  CASE WHEN ga.requirement_value <= 1 THEN 1 ELSE 0 END,
  CASE WHEN ga.requirement_value <= 1 THEN datetime('now', '-1 day') ELSE NULL END,
  datetime('now', '-7 days')
FROM users u, global_achievements ga
WHERE ga.unlock_order <= 3;

-- Enhanced pip data with analytics
UPDATE pips SET
  total_minutes = count * (
    SELECT CAST(json_extract(sc.custom_fields, '$.pipAmount') AS INTEGER)
    FROM subject_configs sc 
    WHERE sc.id = pips.subject_id AND sc.user_id = pips.user_id 
    LIMIT 1
  ),
  last_pip_time = datetime('now', '-' || (3 - count) || ' hours')
WHERE EXISTS (
  SELECT 1 FROM users u WHERE u.id = pips.user_id
);

-- Add sample template rating
INSERT OR IGNORE INTO template_ratings (
  user_id, template_id, rating, review
) 
SELECT 
  u.id,
  ut.id,
  5,
  'Excellent template! Really helped me structure my learning journey with great analytics.'
FROM users u, user_templates ut 
WHERE u.id = ut.user_id LIMIT 1;

-- Update template with rating data
UPDATE user_templates SET
  rating_average = 4.8,
  rating_count = 12,
  download_count = 156
WHERE id IN (SELECT id FROM user_templates LIMIT 1);

-- Update user stats based on sample data
UPDATE users SET
  total_study_time = (
    SELECT COALESCE(SUM(duration), 0) 
    FROM sessions 
    WHERE sessions.user_id = users.id
  ),
  total_sessions = (
    SELECT COUNT(*) 
    FROM sessions 
    WHERE sessions.user_id = users.id
  ),
  current_streak = 2,
  longest_streak = 5,
  total_xp = (
    SELECT COALESCE(SUM(xp_earned), 0) 
    FROM sessions 
    WHERE sessions.user_id = users.id
  ),
  level = CASE 
    WHEN (SELECT COALESCE(SUM(xp_earned), 0) FROM sessions WHERE sessions.user_id = users.id) >= 1000 THEN 3
    WHEN (SELECT COALESCE(SUM(xp_earned), 0) FROM sessions WHERE sessions.user_id = users.id) >= 500 THEN 2
    ELSE 1
  END;

-- Update subject progress based on sessions
UPDATE subjects SET
  total_minutes = (
    SELECT COALESCE(SUM(duration), 0) 
    FROM sessions 
    WHERE sessions.subject_id = subjects.id AND sessions.user_id = subjects.user_id
  ),
  total_sessions = (
    SELECT COUNT(*) 
    FROM sessions 
    WHERE sessions.subject_id = subjects.id AND sessions.user_id = subjects.user_id
  ),
  total_xp = (
    SELECT COALESCE(SUM(xp_earned), 0) 
    FROM sessions 
    WHERE sessions.subject_id = subjects.id AND sessions.user_id = subjects.user_id
  ),
  average_session_duration = (
    SELECT COALESCE(AVG(duration), 0) 
    FROM sessions 
    WHERE sessions.subject_id = subjects.id AND sessions.user_id = subjects.user_id
  ),
  current_streak = 2,
  longest_streak = 5,
  last_study_date = (
    SELECT DATE(MAX(date)) 
    FROM sessions 
    WHERE sessions.subject_id = subjects.id AND sessions.user_id = subjects.user_id
  );

-- Add some recent pip activity
INSERT OR IGNORE INTO pips (user_id, date, subject_id, count, total_minutes, last_pip_time)
SELECT 
  u.id,
  date('now'),
  sc.id,
  2,
  (2 * sc.pip_amount),
  datetime('now', '-2 hours')
FROM users u, subject_configs sc
WHERE u.id = sc.user_id LIMIT 1;

INSERT OR IGNORE INTO pips (user_id, date, subject_id, count, total_minutes, last_pip_time)
SELECT 
  u.id,
  date('now', '-1 day'),
  sc.id,
  3,
  (3 * sc.pip_amount),
  datetime('now', '-1 day', '+2 hours')
FROM users u, subject_configs sc
WHERE u.id = sc.user_id LIMIT 1;
