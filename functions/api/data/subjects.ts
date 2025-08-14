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
    const subjects = await env.DB.prepare(`
      SELECT id, name, color, xp, total_sessions, streak, created_at
      FROM subjects WHERE user_id = ?
      ORDER BY created_at DESC
    `).bind(userId).all();
    
    const formattedSubjects = subjects.results.map(subject => ({
      id: subject.id,
      name: subject.name,
      color: subject.color,
      xp: subject.xp,
      totalSessions: subject.total_sessions,
      streak: subject.streak,
      createdAt: subject.created_at
    }));
    
    return new Response(JSON.stringify(formattedSubjects), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get subjects error:', error);
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
    const { name, color } = await request.json();
    
    if (!name || !color) {
      return new Response('Missing required fields', { status: 400 });
    }
    
    const subjectId = generateId();
    
    await env.DB.prepare(`
      INSERT INTO subjects (id, user_id, name, color, xp, total_sessions, streak, created_at)
      VALUES (?, ?, ?, ?, 0, 0, 0, datetime('now'))
    `).bind(subjectId, userId, name, color).run();
    
    const subject = {
      id: subjectId,
      name,
      color,
      xp: 0,
      totalSessions: 0,
      streak: 0,
      createdAt: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(subject), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Create subject error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};