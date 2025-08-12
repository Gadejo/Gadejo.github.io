// Cloudflare Pages Function for User Settings Management
import { Env } from '../types';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  try {
    const body = await request.json() as { 
      action: 'load' | 'save' | 'delete',
      token?: string,
      settings?: any
    };
    
    const { action, token, settings } = body;
    const db = env.DB;
    
    if (!token) {
      // For load operations, return default settings instead of error
      if (action === 'load') {
        return new Response(JSON.stringify({ 
          success: true, 
          settings: null // This will trigger default settings usage
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Authentication token required' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify token and get user ID
    const userId = await getUserIdFromToken(db, token);
    if (!userId) {
      // For load operations, return default settings instead of error
      if (action === 'load') {
        return new Response(JSON.stringify({ 
          success: true, 
          settings: null // This will trigger default settings usage
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid or expired token' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    switch (action) {
      case 'load':
        return await loadUserSettings(db, userId);
      
      case 'save':
        if (!settings) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Settings data required' 
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return await saveUserSettings(db, userId, settings);
      
      case 'delete':
        return await deleteUserSettings(db, userId);
      
      default:
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Invalid action' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }
    
  } catch (error) {
    console.error('Settings API error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

async function getUserIdFromToken(db: D1Database, token: string): Promise<string | null> {
  try {
    const tokenHash = await hashPassword(token);
    
    const session = await db
      .prepare(`
        SELECT s.user_id
        FROM user_sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.token_hash = ? AND s.is_active = 1 AND u.is_active = 1 AND s.expires_at > CURRENT_TIMESTAMP
      `)
      .bind(tokenHash)
      .first() as any;
      
    return session?.user_id || null;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

async function loadUserSettings(db: D1Database, userId: string) {
  try {
    const userSettings = await db
      .prepare(`
        SELECT theme_preference, language, daily_goal_minutes, weekly_goal_minutes, 
               study_reminders, reminder_times, break_reminders, achievement_notifications,
               weekly_reports, auto_save_interval, pip_notification_sound, quest_complete_sound,
               dashboard_layout, updated_at
        FROM user_settings 
        WHERE user_id = ?
      `)
      .bind(userId)
      .first() as any;
      
    if (!userSettings) {
      // Return null to indicate no settings found (will use defaults)
      return new Response(JSON.stringify({ 
        success: true, 
        settings: null 
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse JSON fields and create settings object matching frontend expectations
    const settings = {
      theme: userSettings.theme_preference || 'light',
      language: userSettings.language || 'en',
      notifications: {
        studyReminders: userSettings.study_reminders || true,
        achievementAlerts: userSettings.achievement_notifications || true,
        emailDigest: userSettings.weekly_reports || false,
        reminderTimes: userSettings.reminder_times ? JSON.parse(userSettings.reminder_times) : ["09:00", "14:00", "19:00"],
        breakReminders: userSettings.break_reminders || true,
        pipNotificationSound: userSettings.pip_notification_sound || true,
        questCompleteSound: userSettings.quest_complete_sound || true
      },
      dashboard: {
        layout: userSettings.dashboard_layout || 'grid',
        showAnimations: true,
        compactView: false
      },
      privacy: {
        shareProgress: false,
        publicProfile: false
      },
      study: {
        defaultPomodoroLength: 25,
        autoStartBreaks: false,
        soundEffects: true,
        dailyGoalMinutes: userSettings.daily_goal_minutes || 60,
        weeklyGoalMinutes: userSettings.weekly_goal_minutes || 420,
        autoSaveInterval: userSettings.auto_save_interval || 300
      }
    };

    return new Response(JSON.stringify({ 
      success: true, 
      settings,
      lastUpdated: userSettings.updated_at
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Load settings error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to load settings' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function saveUserSettings(db: D1Database, userId: string, settings: any) {
  try {
    // Check if user settings already exist
    const existing = await db
      .prepare('SELECT user_id FROM user_settings WHERE user_id = ?')
      .bind(userId)
      .first();

    // Map frontend settings to database schema
    const settingsData = {
      theme_preference: settings.theme || 'light',
      language: settings.language || 'en',
      study_reminders: settings.notifications?.studyReminders ? 1 : 0,
      reminder_times: JSON.stringify(settings.notifications?.reminderTimes || ["09:00", "14:00", "19:00"]),
      break_reminders: settings.notifications?.breakReminders ? 1 : 0,
      achievement_notifications: settings.notifications?.achievementAlerts ? 1 : 0,
      weekly_reports: settings.notifications?.emailDigest ? 1 : 0,
      auto_save_interval: settings.study?.autoSaveInterval || 300,
      pip_notification_sound: settings.notifications?.pipNotificationSound ? 1 : 0,
      quest_complete_sound: settings.notifications?.questCompleteSound ? 1 : 0,
      daily_goal_minutes: settings.study?.dailyGoalMinutes || 60,
      weekly_goal_minutes: settings.study?.weeklyGoalMinutes || 420,
      dashboard_layout: settings.dashboard?.layout || 'grid'
    };

    if (existing) {
      // Update existing settings
      await db
        .prepare(`
          UPDATE user_settings 
          SET theme_preference = ?, language = ?, study_reminders = ?, reminder_times = ?, 
              break_reminders = ?, achievement_notifications = ?, weekly_reports = ?,
              auto_save_interval = ?, pip_notification_sound = ?, quest_complete_sound = ?,
              daily_goal_minutes = ?, weekly_goal_minutes = ?, dashboard_layout = ?, 
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?
        `)
        .bind(
          settingsData.theme_preference,
          settingsData.language,
          settingsData.study_reminders,
          settingsData.reminder_times,
          settingsData.break_reminders,
          settingsData.achievement_notifications,
          settingsData.weekly_reports,
          settingsData.auto_save_interval,
          settingsData.pip_notification_sound,
          settingsData.quest_complete_sound,
          settingsData.daily_goal_minutes,
          settingsData.weekly_goal_minutes,
          settingsData.dashboard_layout,
          userId
        )
        .run();
    } else {
      // Insert new settings
      await db
        .prepare(`
          INSERT INTO user_settings (
            user_id, theme_preference, language, study_reminders, reminder_times, 
            break_reminders, achievement_notifications, weekly_reports, auto_save_interval, 
            pip_notification_sound, quest_complete_sound, daily_goal_minutes, 
            weekly_goal_minutes, dashboard_layout
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          userId,
          settingsData.theme_preference,
          settingsData.language,
          settingsData.study_reminders,
          settingsData.reminder_times,
          settingsData.break_reminders,
          settingsData.achievement_notifications,
          settingsData.weekly_reports,
          settingsData.auto_save_interval,
          settingsData.pip_notification_sound,
          settingsData.quest_complete_sound,
          settingsData.daily_goal_minutes,
          settingsData.weekly_goal_minutes,
          settingsData.dashboard_layout
        )
        .run();
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Settings saved successfully' 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Save settings error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to save settings' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function deleteUserSettings(db: D1Database, userId: string) {
  try {
    await db
      .prepare('DELETE FROM user_settings WHERE user_id = ?')
      .bind(userId)
      .run();

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Settings deleted successfully' 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Delete settings error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Failed to delete settings' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Utility function for password hashing (same as auth.ts)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}