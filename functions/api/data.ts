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
      // For certain read operations, return empty data instead of error
      if (action === 'loadAppData') {
        return new Response(JSON.stringify({ 
          success: true, 
          data: null // This will trigger localStorage loading
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({ error: 'Authentication token required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const db = env.DB;
    
    // Verify token and get user ID
    const userId = await verifyTokenAndGetUserId(db, token);
    if (!userId) {
      // For read operations, return empty data instead of error
      if (action === 'loadAppData') {
        return new Response(JSON.stringify({ 
          success: true, 
          data: null // This will trigger localStorage loading
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
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
        
      case 'testMigration':
        return await testMigration(db, userId, data);
        
      case 'ensureUser':
        return await ensureUserExists(db, userId);
        
      case 'diagnostics':
        return await runDiagnostics(db, token, userId);
        
      case 'stepByStepMigration':
        return await stepByStepMigration(db, userId, data);
        
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
    // Load all user data with safe queries that handle missing tables
    const [subjects, subjectConfigs, sessions, goals, pips, preferences] = await Promise.all([
      db.prepare('SELECT * FROM subjects WHERE user_id = ?').bind(userId).all().catch(() => ({ results: [] })),
      db.prepare('SELECT * FROM subject_configs WHERE user_id = ?').bind(userId).all().catch(() => ({ results: [] })),
      db.prepare('SELECT * FROM sessions WHERE user_id = ? ORDER BY date DESC LIMIT 1000').bind(userId).all().catch(() => ({ results: [] })),
      db.prepare('SELECT * FROM goals WHERE user_id = ?').bind(userId).all().catch(() => ({ results: [] })),
      db.prepare('SELECT * FROM pips WHERE user_id = ?').bind(userId).all().catch(() => ({ results: [] })),
      db.prepare('SELECT preferences FROM users WHERE id = ?').bind(userId).first().catch(() => ({ preferences: '{"dark": false}' }))
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

    // If no subjects exist for this user, initialize with defaults
    if (Object.keys(subjectsData).length === 0) {
      await initializeDefaultSubjects(db, userId);
      // Reload subjects after initialization
      const [newSubjects, newSubjectConfigs] = await Promise.all([
        db.prepare('SELECT * FROM subjects WHERE user_id = ?').bind(userId).all(),
        db.prepare('SELECT * FROM subject_configs WHERE user_id = ?').bind(userId).all()
      ]);
      
      newSubjectConfigs.results?.forEach((config: any) => {
        const subjectData = newSubjects.results?.find((s: any) => s.id === config.id);
        
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
    }

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
    console.log('saveAppData - appData structure:', {
      hasPreferences: !!appData.preferences,
      hasSubjects: !!appData.subjects,
      subjectsType: typeof appData.subjects,
      subjectsKeys: appData.subjects ? Object.keys(appData.subjects) : null
    });

    // Start a transaction by batching operations
    const operations = [];

    // Save preferences (with default if missing)
    const preferences = appData.preferences || { dark: false };
    operations.push(
      db.prepare('UPDATE users SET preferences = ? WHERE id = ?')
        .bind(JSON.stringify(preferences), userId)
    );

    // Save subjects (with null safety)
    if (appData.subjects && typeof appData.subjects === 'object') {
      for (const [subjectId, subject] of Object.entries(appData.subjects as Record<string, any>)) {
        console.log('Processing subject:', subjectId, 'structure:', Object.keys(subject || {}));
        
        // Handle different subject data structures
        let config, subjectData;
        if (subject && typeof subject === 'object') {
          if (subject.config) {
            // New structure with separate config
            config = subject.config;
            subjectData = { ...subject };
            delete subjectData.config;
          } else {
            // Older structure where subject IS the config
            config = subject;
            subjectData = {
              totalMinutes: subject.totalMinutes || 0,
              currentStreak: subject.currentStreak || 0,
              longestStreak: subject.longestStreak || 0,
              achievementLevel: subject.achievementLevel || 0,
              lastStudyDate: subject.lastStudyDate || null,
              totalXP: subject.totalXP || 0
            };
          }
        } else {
          console.warn('Invalid subject data for:', subjectId);
          continue;
        }
        
        // Ensure config has required fields with defaults
        const safeConfig = {
          id: config.id || subjectId,
          name: config.name || 'Unknown Subject',
          emoji: config.emoji || '📚',
          color: config.color || '#3B82F6',
          pipAmount: config.pipAmount || 5,
          targetHours: config.targetHours || 8,
          achievements: config.achievements || [],
          questTypes: config.questTypes || ['study'],
          resources: config.resources || [],
          customFields: config.customFields || {}
        };
      
        // Upsert subject config with safe values (without updated_at in case it doesn't exist)
        operations.push(
          db.prepare(`
            INSERT OR REPLACE INTO subject_configs 
            (id, user_id, name, emoji, color, pip_amount, target_hours, achievements, quest_types, resources, custom_fields)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            safeConfig.id, userId, safeConfig.name, safeConfig.emoji, safeConfig.color,
            safeConfig.pipAmount, safeConfig.targetHours,
            JSON.stringify(safeConfig.achievements),
            JSON.stringify(safeConfig.questTypes),
            JSON.stringify(safeConfig.resources),
            JSON.stringify(safeConfig.customFields)
          )
        );
        
        // Upsert subject data with safe values (without updated_at in case it doesn't exist)
        operations.push(
          db.prepare(`
            INSERT OR REPLACE INTO subjects 
            (id, user_id, total_minutes, current_streak, longest_streak, achievement_level, last_study_date, total_xp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            subjectId, userId, 
            subjectData.totalMinutes || 0, 
            subjectData.currentStreak || 0,
            subjectData.longestStreak || 0, 
            subjectData.achievementLevel || 0,
            subjectData.lastStudyDate, 
            subjectData.totalXP || 0
          )
        );
      }
    }

    // Execute all operations with error handling
    try {
      await db.batch(operations);
    } catch (batchError) {
      console.error('Batch operation failed:', batchError);
      // Try to execute operations individually to identify the problem
      for (let i = 0; i < operations.length; i++) {
        try {
          await operations[i].run();
        } catch (opError) {
          console.error(`Operation ${i} failed:`, opError);
          // Continue with other operations even if one fails
        }
      }
    }

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
    
    // Check if user exists in database
    let userExists = await db.prepare('SELECT id, email, display_name FROM users WHERE id = ?').bind(userId).first();
    if (!userExists) {
      console.log('User does not exist in database, attempting to create from token...');
      
      // Try to get user info from token to create the user
      try {
        const tokenInfo = await db
          .prepare(`
            SELECT s.user_id, u.email, u.display_name
            FROM user_sessions s
            LEFT JOIN users u ON s.user_id = u.id
            WHERE s.user_id = ? AND s.is_active = 1
          `)
          .bind(userId)
          .first() as any;
          
        if (!tokenInfo || !tokenInfo.email) {
          // Create a minimal user record for migration
          console.log('Creating minimal user record for migration...');
          await db
            .prepare(`
              INSERT INTO users (id, email, display_name, password_hash, last_active, preferences)
              VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
            `)
            .bind(
              userId, 
              `user-${userId}@temp.local`, // Temporary email
              'Migrated User', 
              'migrated-user-hash', // Temporary hash
              JSON.stringify({ dark: false })
            )
            .run();
          
          // Create user profile
          await db
            .prepare(`
              INSERT INTO user_profiles (user_id, learning_goals, favorite_subjects, study_schedule)
              VALUES (?, ?, ?, ?)
            `)
            .bind(userId, JSON.stringify([]), JSON.stringify([]), JSON.stringify({}))
            .run();
            
          console.log('Created minimal user record for migration');
          userExists = { id: userId, email: `user-${userId}@temp.local`, display_name: 'Migrated User' };
        }
      } catch (createError) {
        console.error('Failed to create user for migration:', createError);
        throw new Error(`User ${userId} does not exist in database and could not be created. Please try registering again.`);
      }
    }
    console.log('User confirmed in database:', userExists);
    
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

async function testMigration(db: D1Database, userId: string, localStorageData: any) {
  try {
    console.log('Test migration - userId:', userId);
    console.log('Test migration - localStorageData keys:', localStorageData ? Object.keys(localStorageData) : 'null');
    
    // Check if user exists
    const userExists = await db.prepare('SELECT id, email, display_name FROM users WHERE id = ?').bind(userId).first();
    console.log('User exists:', !!userExists);
    if (userExists) {
      console.log('User details:', userExists);
    }
    
    // Test just the saveAppData function first
    if (localStorageData?.appData) {
      console.log('Testing saveAppData...');
      await saveAppData(db, userId, localStorageData.appData);
      console.log('saveAppData completed successfully');
    } else {
      console.log('No appData found in localStorageData');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Test migration completed',
      data: {
        userId,
        userExists: !!userExists,
        userDetails: userExists || null,
        hasAppData: !!localStorageData?.appData,
        appDataKeys: localStorageData?.appData ? Object.keys(localStorageData.appData) : null
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Test migration error:', error);
    return new Response(JSON.stringify({ 
      error: 'Test migration failed',
      details: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function stepByStepMigration(db: D1Database, userId: string, localStorageData: any) {
  const steps = {
    step1_data_validation: false,
    step2_user_confirmed: false,
    step3_clear_existing_data: false,
    step4_save_app_data: false,
    step5_save_sessions: false,
    step6_save_goals: false,
    step7_save_pips: false,
    step8_save_templates: false,
    error_at_step: null as string | null,
    error_details: null as any
  };

  try {
    // Step 1: Validate data structure
    console.log('Step 1: Validating data structure...');
    const { appData, userTemplates = [] } = localStorageData || {};
    if (!appData) {
      throw new Error('No app data provided');
    }
    steps.step1_data_validation = true;
    console.log('✓ Data structure valid');

    // Step 2: Confirm user exists
    console.log('Step 2: Confirming user exists...');
    const userExists = await db.prepare('SELECT id FROM users WHERE id = ?').bind(userId).first();
    if (!userExists) {
      throw new Error('User does not exist');
    }
    steps.step2_user_confirmed = true;
    console.log('✓ User confirmed');

    // Step 3: Clear existing data (small batch test)
    console.log('Step 3: Testing clear operations...');
    await db.prepare('DELETE FROM sessions WHERE user_id = ?').bind(userId).run();
    steps.step3_clear_existing_data = true;
    console.log('✓ Clear operations work');

    // Step 4: Test saveAppData
    console.log('Step 4: Testing saveAppData...');
    await saveAppData(db, userId, appData);
    steps.step4_save_app_data = true;
    console.log('✓ saveAppData works');

    // Step 5: Save all sessions
    console.log('Step 5: Saving all sessions...');
    const batchOps = [];
    
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
    steps.step5_save_sessions = true;
    console.log(`✓ Prepared ${batchOps.length} session operations`);

    // Step 6: Save all goals
    console.log('Step 6: Saving all goals...');
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
    steps.step6_save_goals = true;
    console.log(`✓ Prepared ${appData.goals?.length || 0} goal operations`);

    // Step 7: Save pips
    console.log('Step 7: Saving pips...');
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
    steps.step7_save_pips = true;
    console.log('✓ Prepared pip operations');

    // Step 8: Save templates
    console.log('Step 8: Saving templates...');
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
    steps.step8_save_templates = true;
    console.log(`✓ Prepared ${userTemplates.length} template operations`);

    // Execute all operations in batches
    console.log(`Executing ${batchOps.length} total operations in batches...`);
    if (batchOps.length > 0) {
      const batchSize = 25;
      for (let i = 0; i < batchOps.length; i += batchSize) {
        const batch = batchOps.slice(i, i + batchSize);
        console.log(`Executing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(batchOps.length/batchSize)} (${batch.length} ops)`);
        await db.batch(batch);
      }
    }
    console.log('✓ All operations completed successfully');

    return new Response(JSON.stringify({
      success: true,
      steps,
      message: 'Step-by-step migration test completed'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Step-by-step migration error:', error);
    
    // Identify which step failed
    if (!steps.step1_data_validation) steps.error_at_step = 'data_validation';
    else if (!steps.step2_user_confirmed) steps.error_at_step = 'user_confirmation';
    else if (!steps.step3_clear_existing_data) steps.error_at_step = 'clear_existing_data';
    else if (!steps.step4_save_app_data) steps.error_at_step = 'save_app_data';
    else if (!steps.step5_save_sessions) steps.error_at_step = 'save_sessions';

    steps.error_details = {
      message: error.message,
      stack: error.stack
    };

    return new Response(JSON.stringify({
      success: false,
      steps,
      error: 'Step-by-step migration failed',
      failed_at: steps.error_at_step
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function runDiagnostics(db: D1Database, token: string, userId: string) {
  const results = {
    step1_token_received: !!token,
    step2_userId_extracted: !!userId,
    step3_db_connection: false,
    step4_user_exists: false,
    step5_token_verification: false,
    error_details: null as any,
    userId_value: userId,
    token_length: token ? token.length : 0
  };
  
  try {
    // Step 3: Test database connection
    console.log('Testing database connection...');
    const dbTest = await db.prepare('SELECT 1 as test').first();
    results.step3_db_connection = !!dbTest;
    console.log('DB connection test:', dbTest);
    
    // Step 4: Check if user exists
    console.log('Checking if user exists...');
    const userCheck = await db.prepare('SELECT id, email FROM users WHERE id = ?').bind(userId).first();
    results.step4_user_exists = !!userCheck;
    console.log('User check result:', userCheck);
    
    // Step 5: Test token verification process
    console.log('Testing token verification...');
    const tokenHash = await hashPassword(token);
    const sessionCheck = await db
      .prepare(`
        SELECT s.user_id, s.expires_at, u.email
        FROM user_sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.token_hash = ? AND s.is_active = 1 AND u.is_active = 1
      `)
      .bind(tokenHash)
      .first();
    results.step5_token_verification = !!sessionCheck;
    console.log('Token verification result:', sessionCheck);
    
    return new Response(JSON.stringify({
      success: true,
      diagnostics: results,
      message: 'Diagnostics completed'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Diagnostics error:', error);
    results.error_details = {
      message: error.message,
      stack: error.stack
    };
    
    return new Response(JSON.stringify({
      success: false,
      diagnostics: results,
      error: 'Diagnostics failed'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function ensureUserExists(db: D1Database, userId: string) {
  try {
    // Check if user exists
    const userExists = await db.prepare('SELECT id, email, display_name FROM users WHERE id = ?').bind(userId).first();
    
    if (userExists) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'User already exists',
        user: userExists
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Create minimal user record
    console.log('Creating user record for:', userId);
    await db
      .prepare(`
        INSERT INTO users (id, email, display_name, password_hash, last_active, preferences)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
      `)
      .bind(
        userId, 
        `user-${userId}@temp.local`,
        'User', 
        'temp-hash',
        JSON.stringify({ dark: false })
      )
      .run();
    
    // Create user profile
    await db
      .prepare(`
        INSERT INTO user_profiles (user_id, learning_goals, favorite_subjects, study_schedule)
        VALUES (?, ?, ?, ?)
      `)
      .bind(userId, JSON.stringify([]), JSON.stringify([]), JSON.stringify({}))
      .run();

    const newUser = { id: userId, email: `user-${userId}@temp.local`, display_name: 'User' };
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'User created successfully',
      user: newUser
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Ensure user exists error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to ensure user exists',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Initialize default subjects for new users
async function initializeDefaultSubjects(db: D1Database, userId: string) {
  const defaultSubjects = [
    {
      id: 'japanese',
      name: 'Japanese',
      emoji: '🇯🇵',
      color: '#E53E3E',
      pipAmount: 15,
      targetHours: 1,
      questTypes: [
        { id: 'easy', name: 'Easy', duration: 15, xp: 10, emoji: '🌟' },
        { id: 'medium', name: 'Medium', duration: 30, xp: 25, emoji: '⚡' },
        { id: 'hard', name: 'Hard', duration: 60, xp: 50, emoji: '🏆' }
      ],
      achievements: [
        { id: 'first_step', name: 'First Step', emoji: '🌟', streakRequired: 0 },
        { id: 'on_fire', name: 'On Fire', emoji: '🔥', streakRequired: 3 },
        { id: 'power_user', name: 'Power User', emoji: '⚡', streakRequired: 7 },
        { id: 'champion', name: 'Champion', emoji: '🏆', streakRequired: 14 },
        { id: 'master', name: 'Master', emoji: '💎', streakRequired: 30 },
        { id: 'legend', name: 'Legend', emoji: '👑', streakRequired: 60 }
      ],
      resources: [
        { id: '1', title: 'Tae Kim — Complete Grammar Guide', url: 'https://www.guidetojapanese.org/learn/grammar', priority: 'H' },
        { id: '2', title: 'NHK Easy News — Real Japanese', url: 'https://www3.nhk.or.jp/news/easy/', priority: 'H' },
        { id: '3', title: 'Jisho — Ultimate Dictionary', url: 'https://jisho.org/', priority: 'H' },
        { id: '4', title: 'Anki — SRS Flashcards', url: 'https://apps.ankiweb.net/', priority: 'H' }
      ]
    },
    {
      id: 'programming',
      name: 'Programming',
      emoji: '💻',
      color: '#38A169',
      pipAmount: 20,
      targetHours: 1.5,
      questTypes: [
        { id: 'easy', name: 'Easy', duration: 15, xp: 10, emoji: '🌟' },
        { id: 'medium', name: 'Medium', duration: 30, xp: 25, emoji: '⚡' },
        { id: 'hard', name: 'Hard', duration: 60, xp: 50, emoji: '🏆' }
      ],
      achievements: [
        { id: 'first_step', name: 'First Step', emoji: '🌟', streakRequired: 0 },
        { id: 'on_fire', name: 'On Fire', emoji: '🔥', streakRequired: 3 },
        { id: 'power_user', name: 'Power User', emoji: '⚡', streakRequired: 7 },
        { id: 'champion', name: 'Champion', emoji: '🏆', streakRequired: 14 },
        { id: 'master', name: 'Master', emoji: '💎', streakRequired: 30 },
        { id: 'legend', name: 'Legend', emoji: '👑', streakRequired: 60 }
      ],
      resources: [
        { id: '1', title: 'MDN Web Docs', url: 'https://developer.mozilla.org/', priority: 'H' },
        { id: '2', title: 'JavaScript.info', url: 'https://javascript.info/', priority: 'H' },
        { id: '3', title: 'FreeCodeCamp', url: 'https://www.freecodecamp.org/', priority: 'H' },
        { id: '4', title: 'Stack Overflow', url: 'https://stackoverflow.com/', priority: 'M' }
      ]
    },
    {
      id: 'math',
      name: 'Mathematics',
      emoji: '🧮',
      color: '#3182CE',
      pipAmount: 25,
      targetHours: 1,
      questTypes: [
        { id: 'easy', name: 'Easy', duration: 15, xp: 10, emoji: '🌟' },
        { id: 'medium', name: 'Medium', duration: 30, xp: 25, emoji: '⚡' },
        { id: 'hard', name: 'Hard', duration: 60, xp: 50, emoji: '🏆' }
      ],
      achievements: [
        { id: 'first_step', name: 'First Step', emoji: '🌟', streakRequired: 0 },
        { id: 'on_fire', name: 'On Fire', emoji: '🔥', streakRequired: 3 },
        { id: 'power_user', name: 'Power User', emoji: '⚡', streakRequired: 7 },
        { id: 'champion', name: 'Champion', emoji: '🏆', streakRequired: 14 },
        { id: 'master', name: 'Master', emoji: '💎', streakRequired: 30 },
        { id: 'legend', name: 'Legend', emoji: '👑', streakRequired: 60 }
      ],
      resources: [
        { id: '1', title: 'Khan Academy', url: 'https://www.khanacademy.org/', priority: 'H' },
        { id: '2', title: 'Wolfram Alpha', url: 'https://www.wolframalpha.com/', priority: 'H' },
        { id: '3', title: 'Desmos Calculator', url: 'https://www.desmos.com/', priority: 'M' },
        { id: '4', title: 'PatrickJMT', url: 'https://patrickjmt.com/', priority: 'M' }
      ]
    }
  ];

  // Insert default subjects and configs
  for (const subject of defaultSubjects) {
    // Insert subject config
    await db.prepare(`
      INSERT OR IGNORE INTO subject_configs 
      (id, user_id, name, emoji, color, achievements, quest_types, pip_amount, target_hours, resources, custom_fields, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).bind(
      subject.id,
      userId,
      subject.name,
      subject.emoji,
      subject.color,
      JSON.stringify(subject.achievements),
      JSON.stringify(subject.questTypes),
      subject.pipAmount,
      subject.targetHours,
      JSON.stringify(subject.resources),
      JSON.stringify({})
    ).run();

    // Insert subject data
    await db.prepare(`
      INSERT OR IGNORE INTO subjects 
      (id, user_id, total_minutes, current_streak, longest_streak, achievement_level, last_study_date, total_xp, created_at, updated_at)
      VALUES (?, ?, 0, 0, 0, 0, NULL, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).bind(subject.id, userId).run();
  }

  console.log(`Initialized ${defaultSubjects.length} default subjects for user ${userId}`);
}