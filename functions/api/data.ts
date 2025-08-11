// Cloudflare Pages Functions for Data Operations
import { Env } from '../types';

// Main data endpoint for CRUD operations
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  try {
    const body = await request.json() as {
      action: string;
      token: string;
      data?: any;
      id?: string;
    };
    
    const { action, token, data, id } = body;
    
    if (!token) {
      return new Response(JSON.stringify({ error: 'Authentication token required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = env.DB;
    
    // Verify token and get user ID
    const userId = await verifyTokenAndGetUserId(db, token);
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    switch (action) {
      case 'loadAppData':
        return await loadAppData(db, userId);
        
      case 'saveAppData':
        return await saveAppData(db, userId, data);
        
      case 'addSession':
        return await addSession(db, userId, data);
        
      case 'updateSubject':
        return await updateSubject(db, userId, id!, data);
        
      case 'addGoal':
        return await addGoal(db, userId, data);
        
      case 'updateGoal':
        return await updateGoal(db, userId, id!, data);
        
      case 'deleteGoal':
        return await deleteGoal(db, userId, id!);
        
      case 'setPipCount':
        return await setPipCount(db, userId, data);
        
      case 'migrateFromLocalStorage':
        return await migrateFromLocalStorage(db, userId, data);
        
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }
    
  } catch (error) {
    console.error('Data operation error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

async function loadAppData(db: D1Database, userId: string) {
  try {
    // Load all user data
    const [subjects, subjectConfigs, sessions, goals, pips, preferences] = await Promise.all([
      db.prepare('SELECT * FROM subjects WHERE user_id = ?').bind(userId).all(),
      db.prepare('SELECT * FROM subject_configs WHERE user_id = ?').bind(userId).all(),
      db.prepare('SELECT * FROM sessions WHERE user_id = ? ORDER BY date DESC').bind(userId).all(),
      db.prepare('SELECT * FROM goals WHERE user_id = ?').bind(userId).all(),
      db.prepare('SELECT * FROM pips WHERE user_id = ?').bind(userId).all(),
      db.prepare('SELECT preferences FROM users WHERE id = ?').bind(userId).first()
    ]);

    // Transform data to match frontend structure
    const subjectsData: Record<string, any> = {};
    
    subjectConfigs.results?.forEach((config: any) => {
      const subjectData = subjects.results?.find((s: any) => s.id === config.id);
      
      subjectsData[config.id] = {
        config: {
          id: config.id,
          name: config.name,
          emoji: config.emoji,
          color: config.color,
          achievements: JSON.parse(config.achievements),
          questTypes: JSON.parse(config.quest_types),
          pipAmount: config.pip_amount,
          targetHours: config.target_hours,
          resources: JSON.parse(config.resources),
          customFields: JSON.parse(config.custom_fields || '{}')
        },
        totalMinutes: subjectData?.total_minutes || 0,
        currentStreak: subjectData?.current_streak || 0,
        longestStreak: subjectData?.longest_streak || 0,
        achievementLevel: subjectData?.achievement_level || 0,
        lastStudyDate: subjectData?.last_study_date || null,
        totalXP: subjectData?.total_xp || 0
      };
    });

    // Transform pips data
    const pipsData: Record<string, Record<string, number>> = {};
    pips.results?.forEach((pip: any) => {
      if (!pipsData[pip.date]) {
        pipsData[pip.date] = {};
      }
      pipsData[pip.date][pip.subject_id] = pip.count;
    });

    const appData = {
      subjects: subjectsData,
      sessions: sessions.results || [],
      goals: goals.results || [],
      pips: pipsData,
      preferences: JSON.parse(preferences?.preferences || '{"dark": false}'),
      version: '4.0.0'
    };

    return new Response(JSON.stringify({ success: true, data: appData }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Load app data error:', error);
    return new Response(JSON.stringify({ error: 'Failed to load data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function saveAppData(db: D1Database, userId: string, appData: any) {
  try {
    // Start a transaction by batching operations
    const operations = [];

    // Save preferences
    operations.push(
      db.prepare('UPDATE users SET preferences = ? WHERE id = ?')
        .bind(JSON.stringify(appData.preferences), userId)
    );

    // Save subjects
    for (const [subjectId, subject] of Object.entries(appData.subjects as Record<string, any>)) {
      const { config, ...subjectData } = subject;
      
      // Upsert subject config
      operations.push(
        db.prepare(`
          INSERT OR REPLACE INTO subject_configs 
          (id, user_id, name, emoji, color, pip_amount, target_hours, achievements, quest_types, resources, custom_fields, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).bind(
          config.id, userId, config.name, config.emoji, config.color,
          config.pipAmount, config.targetHours,
          JSON.stringify(config.achievements),
          JSON.stringify(config.questTypes),
          JSON.stringify(config.resources),
          JSON.stringify(config.customFields || {})
        )
      );
      
      // Upsert subject data
      operations.push(
        db.prepare(`
          INSERT OR REPLACE INTO subjects 
          (id, user_id, total_minutes, current_streak, longest_streak, achievement_level, last_study_date, total_xp, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).bind(
          subjectId, userId, subjectData.totalMinutes, subjectData.currentStreak,
          subjectData.longestStreak, subjectData.achievementLevel,
          subjectData.lastStudyDate, subjectData.totalXP
        )
      );
    }

    // Execute all operations
    await db.batch(operations);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Save app data error:', error);
    return new Response(JSON.stringify({ error: 'Failed to save data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function addSession(db: D1Database, userId: string, session: any) {
  try {
    await db.prepare(`
      INSERT INTO sessions (id, user_id, subject_id, duration, date, notes, quest_type, xp_earned)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      session.id, userId, session.subjectId, session.duration,
      session.date, session.notes, session.questType, session.xpEarned || 0
    ).run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Add session error:', error);
    return new Response(JSON.stringify({ error: 'Failed to add session' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function updateSubject(db: D1Database, userId: string, subjectId: string, updates: any) {
  try {
    const setParts = Object.keys(updates).map(key => {
      const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      return `${dbKey} = ?`;
    });
    
    const query = `UPDATE subjects SET ${setParts.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`;
    const values = [...Object.values(updates), subjectId, userId];
    
    await db.prepare(query).bind(...values).run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Update subject error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update subject' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function addGoal(db: D1Database, userId: string, goal: any) {
  try {
    await db.prepare(`
      INSERT INTO goals (id, user_id, title, subject_id, type, target, start_date, due_date, priority, done)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      goal.id, userId, goal.title, goal.subjectId, goal.type,
      goal.target, goal.startDate, goal.dueDate, goal.priority, goal.done ? 1 : 0
    ).run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Add goal error:', error);
    return new Response(JSON.stringify({ error: 'Failed to add goal' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function updateGoal(db: D1Database, userId: string, goalId: string, updates: any) {
  try {
    const setParts = Object.keys(updates).map(key => {
      const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      return `${dbKey} = ?`;
    });
    
    const values = Object.values(updates).map(value => 
      typeof value === 'boolean' ? (value ? 1 : 0) : value
    );
    
    const query = `UPDATE goals SET ${setParts.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`;
    
    await db.prepare(query).bind(...values, goalId, userId).run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Update goal error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update goal' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function deleteGoal(db: D1Database, userId: string, goalId: string) {
  try {
    await db.prepare('DELETE FROM goals WHERE id = ? AND user_id = ?')
      .bind(goalId, userId).run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Delete goal error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete goal' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function setPipCount(db: D1Database, userId: string, pipData: { subjectId: string, date: string, count: number }) {
  try {
    await db.prepare(`
      INSERT OR REPLACE INTO pips (user_id, date, subject_id, count, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(userId, pipData.date, pipData.subjectId, pipData.count).run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Set pip count error:', error);
    return new Response(JSON.stringify({ error: 'Failed to set pip count' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function migrateFromLocalStorage(db: D1Database, userId: string, localStorageData: any) {
  try {
    // This is a one-time migration function
    const { appData, userTemplates = [] } = localStorageData;
    
    if (!appData) {
      throw new Error('No app data provided for migration');
    }

    console.log('Starting migration for user:', userId);
    console.log('App data keys:', Object.keys(appData));
    console.log('Sessions count:', appData.sessions?.length || 0);
    console.log('Goals count:', appData.goals?.length || 0);
    console.log('Templates count:', userTemplates.length);
    
    // First clear existing data for this user
    await db.batch([
      db.prepare('DELETE FROM subjects WHERE user_id = ?').bind(userId),
      db.prepare('DELETE FROM subject_configs WHERE user_id = ?').bind(userId),
      db.prepare('DELETE FROM sessions WHERE user_id = ?').bind(userId),
      db.prepare('DELETE FROM goals WHERE user_id = ?').bind(userId),
      db.prepare('DELETE FROM pips WHERE user_id = ?').bind(userId),
      db.prepare('DELETE FROM user_templates WHERE user_id = ?').bind(userId)
    ]);
    
    // Migrate app data (subjects and preferences)
    await saveAppData(db, userId, appData);
    
    const batchOps = [];
    
    // Migrate sessions (with null safety)
    if (appData.sessions && Array.isArray(appData.sessions)) {
      const sessionOps = appData.sessions.map((session: any) => 
        db.prepare(`
          INSERT INTO sessions (id, user_id, subject_id, duration, date, notes, quest_type, xp_earned)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          session.id || `session-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          userId, 
          session.subjectId || '',
          session.duration || 0,
          session.date || new Date().toISOString(),
          session.notes || '',
          session.questType || 'study',
          session.xpEarned || 0
        )
      );
      batchOps.push(...sessionOps);
    }
    
    // Migrate goals (with null safety)
    if (appData.goals && Array.isArray(appData.goals)) {
      const goalOps = appData.goals.map((goal: any) =>
        db.prepare(`
          INSERT INTO goals (id, user_id, title, subject_id, type, target, start_date, due_date, priority, done)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          goal.id || `goal-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          userId,
          goal.title || 'Untitled Goal',
          goal.subjectId || '',
          goal.type || 'minutes',
          goal.target || 0,
          goal.startDate || new Date().toISOString(),
          goal.dueDate || null,
          goal.priority || 'medium',
          goal.done ? 1 : 0
        )
      );
      batchOps.push(...goalOps);
    }
    
    // Migrate pips (with null safety)
    if (appData.pips && typeof appData.pips === 'object') {
      for (const [date, subjectPips] of Object.entries(appData.pips as Record<string, any>)) {
        if (subjectPips && typeof subjectPips === 'object') {
          for (const [subjectId, count] of Object.entries(subjectPips)) {
            if (typeof count === 'number' && count > 0) {
              batchOps.push(
                db.prepare(`
                  INSERT INTO pips (user_id, date, subject_id, count)
                  VALUES (?, ?, ?, ?)
                `).bind(userId, date, subjectId, count)
              );
            }
          }
        }
      }
    }
    
    // Migrate user templates (with null safety)
    if (userTemplates && Array.isArray(userTemplates)) {
      const templateOps = userTemplates.map((template: any) =>
        db.prepare(`
          INSERT INTO user_templates (id, user_id, name, description, category, author, version, subjects, default_goals)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          template.id || `template-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          userId,
          template.name || 'Untitled Template',
          template.description || '',
          template.category || 'custom',
          template.author || 'User',
          template.version || '1.0.0',
          JSON.stringify(template.subjects || []),
          JSON.stringify(template.defaultGoals || [])
        )
      );
      batchOps.push(...templateOps);
    }
    
    // Execute all migration operations in batches to avoid limits
    if (batchOps.length > 0) {
      const batchSize = 25; // D1 batch limit
      for (let i = 0; i < batchOps.length; i += batchSize) {
        const batch = batchOps.slice(i, i + batchSize);
        await db.batch(batch);
      }
    }

    console.log('Migration completed successfully');
    return new Response(JSON.stringify({ success: true, message: 'Migration completed' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Migration error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      localStorageData: localStorageData ? Object.keys(localStorageData) : 'null'
    });
    return new Response(JSON.stringify({ 
      error: 'Migration failed',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Token verification utility function
async function verifyTokenAndGetUserId(db: D1Database, token: string): Promise<string | null> {
  try {
    const tokenHash = await hashPassword(token);
    
    const session = await db
      .prepare(`
        SELECT s.user_id, s.expires_at, u.is_active
        FROM user_sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.token_hash = ? AND s.is_active = 1 AND u.is_active = 1
      `)
      .bind(tokenHash)
      .first() as any;
      
    if (!session) {
      return null;
    }
    
    // Check if token is expired
    if (new Date(session.expires_at) < new Date()) {
      await db
        .prepare('UPDATE user_sessions SET is_active = 0 WHERE token_hash = ?')
        .bind(tokenHash)
        .run();
      return null;
    }

    // Update last used timestamp
    await db
      .prepare('UPDATE user_sessions SET last_used = CURRENT_TIMESTAMP WHERE token_hash = ?')
      .bind(tokenHash)
      .run();

    return session.user_id;
    
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}