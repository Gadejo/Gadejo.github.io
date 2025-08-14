interface Env {
  DB: D1Database;
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
    const { username, email, password } = await request.json();
    
    if (!username || !email || !password) {
      return new Response('Missing required fields', { status: 400 });
    }
    
    if (password.length < 6) {
      return new Response('Password must be at least 6 characters', { status: 400 });
    }
    
    const existingUser = await env.DB.prepare(
      'SELECT id FROM users WHERE email = ? OR username = ?'
    ).bind(email, username).first();
    
    if (existingUser) {
      return new Response('User already exists', { status: 409 });
    }
    
    const userId = generateId();
    const passwordHash = await hashPassword(password);
    const token = generateToken();
    
    await env.DB.prepare(`
      INSERT INTO users (id, username, email, password_hash, level, total_xp, created_at)
      VALUES (?, ?, ?, ?, 1, 0, datetime('now'))
    `).bind(userId, username, email, passwordHash).run();
    
    await env.DB.prepare(`
      INSERT INTO user_sessions (id, user_id, token, created_at, expires_at)
      VALUES (?, ?, ?, datetime('now'), datetime('now', '+30 days'))
    `).bind(generateId(), userId, token).run();
    
    const user = {
      id: userId,
      username,
      email,
      level: 1,
      totalXp: 0
    };
    
    return new Response(JSON.stringify({ user, token }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};