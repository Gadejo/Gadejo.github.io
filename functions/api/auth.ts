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
  const url = new URL(request.url);
  const action = url.pathname.split('/').pop();
  
  try {
    switch (action) {
      case 'register':
        return handleRegister(request, env);
      case 'login':
        return handleLogin(request, env);
      case 'verify':
        return handleVerify(request, env);
      default:
        return new Response('Not found', { status: 404 });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};

async function handleRegister(request: Request, env: Env): Promise<Response> {
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
}

async function handleLogin(request: Request, env: Env): Promise<Response> {
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
}

async function handleVerify(request: Request, env: Env): Promise<Response> {
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
}