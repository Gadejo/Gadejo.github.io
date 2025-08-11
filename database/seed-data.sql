-- Seed data for ADHD Learning RPG
-- Global achievements that all users can work towards

-- Clear existing achievements (for development)
DELETE FROM global_achievements;

-- Study Time Achievements
INSERT INTO global_achievements (id, name, description, emoji, category, requirement_type, requirement_value, badge_color) VALUES
('first_session', 'First Steps', 'Complete your first study session', '👶', 'milestone', 'sessions_count', 1, '#10B981'),
('study_1h', 'Hour Hero', 'Study for 1 hour total', '⏰', 'time', 'total_time', 60, '#3B82F6'),
('study_10h', 'Study Warrior', 'Study for 10 hours total', '⚡', 'time', 'total_time', 600, '#6366F1'),
('study_50h', 'Knowledge Seeker', 'Study for 50 hours total', '🔍', 'time', 'total_time', 3000, '#8B5CF6'),
('study_100h', 'Learning Master', 'Study for 100 hours total', '🎓', 'time', 'total_time', 6000, '#A855F7'),
('study_500h', 'Scholar Supreme', 'Study for 500 hours total', '👑', 'time', 'total_time', 30000, '#D946EF');

-- Streak Achievements
INSERT INTO global_achievements (id, name, description, emoji, category, requirement_type, requirement_value, badge_color) VALUES
('streak_3', 'Getting Started', 'Maintain a 3-day study streak', '🔥', 'streak', 'streak_days', 3, '#EF4444'),
('streak_7', 'Weekly Warrior', 'Maintain a 7-day study streak', '🗓️', 'streak', 'streak_days', 7, '#F97316'),
('streak_14', 'Two Week Champion', 'Maintain a 14-day study streak', '💪', 'streak', 'streak_days', 14, '#F59E0B'),
('streak_30', 'Monthly Master', 'Maintain a 30-day study streak', '🏆', 'streak', 'streak_days', 30, '#EAB308'),
('streak_60', 'Streak Legend', 'Maintain a 60-day study streak', '👑', 'streak', 'streak_days', 60, '#84CC16'),
('streak_100', 'Consistency King', 'Maintain a 100-day study streak', '💎', 'streak', 'streak_days', 100, '#22C55E');

-- Session Count Achievements
INSERT INTO global_achievements (id, name, description, emoji, category, requirement_type, requirement_value, badge_color) VALUES
('sessions_10', 'Session Starter', 'Complete 10 study sessions', '📚', 'sessions', 'sessions_count', 10, '#06B6D4'),
('sessions_50', 'Study Regular', 'Complete 50 study sessions', '📖', 'sessions', 'sessions_count', 50, '#0891B2'),
('sessions_100', 'Century Club', 'Complete 100 study sessions', '💯', 'sessions', 'sessions_count', 100, '#0E7490'),
('sessions_500', 'Session Master', 'Complete 500 study sessions', '🎯', 'sessions', 'sessions_count', 500, '#155E75'),
('sessions_1000', 'Study Titan', 'Complete 1000 study sessions', '⚡', 'sessions', 'sessions_count', 1000, '#164E63');

-- Subject Diversity Achievements
INSERT INTO global_achievements (id, name, description, emoji, category, requirement_type, requirement_value, badge_color) VALUES
('subjects_2', 'Multi-Tasker', 'Create 2 different subjects', '🎨', 'subjects', 'subjects_count', 2, '#EC4899'),
('subjects_5', 'Renaissance Learner', 'Create 5 different subjects', '🌟', 'subjects', 'subjects_count', 5, '#DB2777'),
('subjects_10', 'Polymath', 'Create 10 different subjects', '🧠', 'subjects', 'subjects_count', 10, '#BE185D');

-- Daily Achievements
INSERT INTO global_achievements (id, name, description, emoji, category, requirement_type, requirement_value, badge_color) VALUES
('daily_30min', 'Daily Dose', 'Study 30 minutes in a single day', '☀️', 'daily', 'daily_minutes', 30, '#FDE047'),
('daily_60min', 'Daily Double', 'Study 60 minutes in a single day', '🌅', 'daily', 'daily_minutes', 60, '#FACC15'),
('daily_120min', 'Daily Dedication', 'Study 120 minutes in a single day', '🌞', 'daily', 'daily_minutes', 120, '#EAB308'),
('daily_180min', 'Daily Champion', 'Study 180 minutes in a single day', '⭐', 'daily', 'daily_minutes', 180, '#CA8A04');

-- XP Achievements
INSERT INTO global_achievements (id, name, description, emoji, category, requirement_type, requirement_value, badge_color) VALUES
('xp_100', 'XP Novice', 'Earn 100 total XP', '⭐', 'xp', 'total_xp', 100, '#64748B'),
('xp_500', 'XP Adept', 'Earn 500 total XP', '✨', 'xp', 'total_xp', 500, '#475569'),
('xp_1000', 'XP Expert', 'Earn 1000 total XP', '🌟', 'xp', 'total_xp', 1000, '#334155'),
('xp_5000', 'XP Master', 'Earn 5000 total XP', '💫', 'xp', 'total_xp', 5000, '#1E293B'),
('xp_10000', 'XP Legend', 'Earn 10000 total XP', '⚡', 'xp', 'total_xp', 10000, '#0F172A');

-- Special Achievements
INSERT INTO global_achievements (id, name, description, emoji, category, requirement_type, requirement_value, badge_color) VALUES
('night_owl', 'Night Owl', 'Complete a study session after 10 PM', '🦉', 'special', 'night_session', 1, '#6366F1'),
('early_bird', 'Early Bird', 'Complete a study session before 6 AM', '🐦', 'special', 'morning_session', 1, '#10B981'),
('weekend_warrior', 'Weekend Warrior', 'Study on both Saturday and Sunday in the same week', '🏃', 'special', 'weekend_study', 1, '#F59E0B'),
('goal_crusher', 'Goal Crusher', 'Complete 10 learning goals', '🎯', 'goals', 'goals_completed', 10, '#EF4444'),
('template_creator', 'Template Creator', 'Create your first custom template', '🎨', 'creative', 'templates_created', 1, '#8B5CF6'),
('pip_master', 'Pip Master', 'Use all daily pips for 7 consecutive days', '💊', 'pips', 'pip_streaks', 7, '#06B6D4');