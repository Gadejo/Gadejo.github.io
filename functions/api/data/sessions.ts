interface Env {
  DB: D1Database;
}

function generateId(): string {
  return crypto.randomUUID();
}

async function getUserFromToken(request: Request, env: Env): Promise<string | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  
  const session = await env.DB.prepare(`
    SELECT user_id FROM user_sessions
    WHERE token = ? AND expires_at > datetime('now')
  `).bind(token).first<{ user_id: string }>();
  
  return session?.user_id || null;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  const userId = await getUserFromToken(request, env);
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  try {
    const sessions = await env.DB.prepare(`
      SELECT id, subject_id, duration, xp_earned, completed_at
      FROM sessions WHERE user_id = ?
      ORDER BY completed_at DESC
      LIMIT 100
    `).bind(userId).all();
    
    const formattedSessions = sessions.results.map(session => ({
      id: session.id,
      subjectId: session.subject_id,
      duration: session.duration,
      xpEarned: session.xp_earned,
      completedAt: session.completed_at
    }));
    
    return new Response(JSON.stringify(formattedSessions), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  const userId = await getUserFromToken(request, env);
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  try {
    const { subjectId, duration, xpEarned } = await request.json();
    
    if (!subjectId || !duration || !xpEarned) {
      return new Response('Missing required fields', { status: 400 });
    }
    
    const sessionId = generateId();
    
    await env.DB.batch([
      env.DB.prepare(`
        INSERT INTO sessions (id, user_id, subject_id, duration, xp_earned, completed_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `).bind(sessionId, userId, subjectId, duration, xpEarned),
      
      env.DB.prepare(`
        UPDATE subjects 
        SET xp = xp + ?, total_sessions = total_sessions + 1
        WHERE id = ? AND user_id = ?
      `).bind(xpEarned, subjectId, userId),
      
      env.DB.prepare(`
        UPDATE users 
        SET total_xp = total_xp + ?, level = (total_xp + ?) / 100 + 1
        WHERE id = ?
      `).bind(xpEarned, xpEarned, userId)
    ]);
    
    const session = {
      id: sessionId,
      subjectId,
      duration,
      xpEarned,
      completedAt: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(session), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Create session error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};