interface Env {
  DB: D1Database;
}

interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  level: number;
  total_xp: number;
  created_at: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response('Missing or invalid token', { status: 401 });
    }
    
    const token = authHeader.substring(7);
    
    const session = await env.DB.prepare(`
      SELECT s.*, u.* FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ? AND s.expires_at > datetime('now')
    `).bind(token).first<User & { token: string }>();
    
    if (!session) {
      return new Response('Invalid or expired token', { status: 401 });
    }
    
    const user = {
      id: session.id,
      username: session.username,
      email: session.email,
      level: session.level,
      totalXp: session.total_xp
    };
    
    return new Response(JSON.stringify(user), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Verify error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};