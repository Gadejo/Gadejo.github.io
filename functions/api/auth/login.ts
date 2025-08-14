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

function generateId(): string {
  return crypto.randomUUID();
}

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash), byte => 
    byte.toString(16).padStart(2, '0')
  ).join('');
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return new Response('Missing email or password', { status: 400 });
    }
    
    const user = await env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).first<User>();
    
    if (!user) {
      return new Response('Invalid credentials', { status: 401 });
    }
    
    const passwordHash = await hashPassword(password);
    if (passwordHash !== user.password_hash) {
      return new Response('Invalid credentials', { status: 401 });
    }
    
    const token = generateToken();
    
    await env.DB.prepare(`
      INSERT INTO user_sessions (id, user_id, token, created_at, expires_at)
      VALUES (?, ?, ?, datetime('now'), datetime('now', '+30 days'))
    `).bind(generateId(), user.id, token).run();
    
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      level: user.level,
      totalXp: user.total_xp
    };
    
    return new Response(JSON.stringify({ user: userResponse, token }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Login error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};