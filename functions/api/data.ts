interface Env {
  DB: D1Database;
}

interface Subject {
  id: string;
  user_id: string;
  name: string;
  color: string;
  xp: number;
  total_sessions: number;
  streak: number;
  created_at: string;
}

interface Session {
  id: string;
  user_id: string;
  subject_id: string;
  duration: number;
  xp_earned: number;
  completed_at: string;
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
  const url = new URL(request.url);
  const resource = url.pathname.split('/').pop();
  
  const userId = await getUserFromToken(request, env);
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  try {
    switch (resource) {
      case 'subjects':
        return getSubjects(userId, env);
      case 'sessions':
        return getSessions(userId, env);
      default:
        return new Response('Not found', { status: 404 });
    }
  } catch (error) {
    console.error('Data GET error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const resource = url.pathname.split('/').pop();
  
  const userId = await getUserFromToken(request, env);
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  try {
    switch (resource) {
      case 'subjects':
        return createSubject(request, userId, env);
      case 'sessions':
        return createSession(request, userId, env);
      default:
        return new Response('Not found', { status: 404 });
    }
  } catch (error) {
    console.error('Data POST error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};

async function getSubjects(userId: string, env: Env): Promise<Response> {
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
}

async function getSessions(userId: string, env: Env): Promise<Response> {
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
}

async function createSubject(request: Request, userId: string, env: Env): Promise<Response> {
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
}

async function createSession(request: Request, userId: string, env: Env): Promise<Response> {
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
}