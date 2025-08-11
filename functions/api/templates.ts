// Cloudflare Pages Functions for Template Operations
import { Env } from '../types';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  try {
    const body = await request.json() as {
      action: string;
      token: string;
      template?: any;
      templateId?: string;
    };
    
    const { action, token, template, templateId } = body;
    
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
      case 'loadUserTemplates':
        return await loadUserTemplates(db, userId);
        
      case 'saveUserTemplate':
        return await saveUserTemplate(db, userId, template);
        
      case 'deleteUserTemplate':
        return await deleteUserTemplate(db, userId, templateId!);
        
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }
    
  } catch (error) {
    console.error('Template operation error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

async function loadUserTemplates(db: D1Database, userId: string) {
  try {
    const result = await db
      .prepare('SELECT * FROM user_templates WHERE user_id = ? ORDER BY created_at DESC')
      .bind(userId)
      .all();

    const templates = result.results?.map((template: any) => ({
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      author: template.author,
      version: template.version,
      subjects: JSON.parse(template.subjects),
      defaultGoals: JSON.parse(template.default_goals)
    })) || [];

    return new Response(JSON.stringify({ success: true, templates }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Load user templates error:', error);
    return new Response(JSON.stringify({ error: 'Failed to load templates' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function saveUserTemplate(db: D1Database, userId: string, template: any) {
  try {
    await db.prepare(`
      INSERT OR REPLACE INTO user_templates 
      (id, user_id, name, description, category, author, version, subjects, default_goals, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      template.id, userId, template.name, template.description,
      template.category, template.author, template.version,
      JSON.stringify(template.subjects),
      JSON.stringify(template.defaultGoals || [])
    ).run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Save user template error:', error);
    return new Response(JSON.stringify({ error: 'Failed to save template' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function deleteUserTemplate(db: D1Database, userId: string, templateId: string) {
  try {
    await db.prepare('DELETE FROM user_templates WHERE id = ? AND user_id = ?')
      .bind(templateId, userId)
      .run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Delete user template error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete template' }), {
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