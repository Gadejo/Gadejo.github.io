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
        SELECT theme, language, notifications, dashboard, privacy, study_preferences, updated_at
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

    // Parse JSON fields
    const settings = {
      theme: userSettings.theme || 'light',
      language: userSettings.language || 'en',
      notifications: userSettings.notifications ? JSON.parse(userSettings.notifications) : {
        studyReminders: true,
        achievementAlerts: true,
        emailDigest: false
      },
      dashboard: userSettings.dashboard ? JSON.parse(userSettings.dashboard) : {
        layout: 'grid',
        showAnimations: true,
        compactView: false
      },
      privacy: userSettings.privacy ? JSON.parse(userSettings.privacy) : {
        shareProgress: false,
        publicProfile: false
      },
      study: userSettings.study_preferences ? JSON.parse(userSettings.study_preferences) : {
        defaultPomodoroLength: 25,
        autoStartBreaks: false,
        soundEffects: true
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

    const settingsData = {
      theme: settings.theme || 'light',
      language: settings.language || 'en',
      notifications: JSON.stringify(settings.notifications || {}),
      dashboard: JSON.stringify(settings.dashboard || {}),
      privacy: JSON.stringify(settings.privacy || {}),
      study_preferences: JSON.stringify(settings.study || {})
    };

    if (existing) {
      // Update existing settings
      await db
        .prepare(`
          UPDATE user_settings 
          SET theme = ?, language = ?, notifications = ?, dashboard = ?, 
              privacy = ?, study_preferences = ?, updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?
        `)
        .bind(
          settingsData.theme,
          settingsData.language,
          settingsData.notifications,
          settingsData.dashboard,
          settingsData.privacy,
          settingsData.study_preferences,
          userId
        )
        .run();
    } else {
      // Insert new settings
      await db
        .prepare(`
          INSERT INTO user_settings (user_id, theme, language, notifications, dashboard, privacy, study_preferences)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `)
        .bind(
          userId,
          settingsData.theme,
          settingsData.language,
          settingsData.notifications,
          settingsData.dashboard,
          settingsData.privacy,
          settingsData.study_preferences
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