// Cloudflare Pages Functions for Multi-User Authentication
import { Env } from '../types';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  try {
    const body = await request.json() as { 
      action: 'register' | 'login' | 'verify' | 'logout' | 'refresh' | 'getUsers' | 'switchUser',
      email?: string,
      password?: string,
      displayName?: string,
      token?: string
    };
    
    const { action, email, password, displayName, token } = body;
    const db = env.DB;
    
    switch (action) {
      case 'register':
        return await registerUser(db, email!, password!, displayName!);
      
      case 'login':
        return await loginUser(db, email!, password!, request);
      
      case 'verify':
        return await verifyToken(db, token!);
      
      case 'logout':
        return await logoutUser(db, token!);
      
      case 'refresh':
        return await refreshToken(db, token!);
      
      case 'getUsers':
        return await getRegisteredUsers(db);
      
      case 'switchUser':
        return await switchUser(db, email!, password!, request);
      
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }
    
  } catch (error) {
    console.error('Auth error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

async function registerUser(db: D1Database, email: string, password: string, displayName: string) {
  if (!email || !password || !displayName) {
    return new Response(JSON.stringify({ error: 'Email, password, and display name required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Check if email is valid
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return new Response(JSON.stringify({ error: 'Invalid email format' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Check if user already exists
    const existingUser = await db
      .prepare('SELECT id FROM users WHERE email = ?')
      .bind(email.toLowerCase())
      .first();
      
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'User already exists' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userId = generateId();
    const passwordHash = await hashPassword(password);
    
    // Create user
    await db
      .prepare(`
        INSERT INTO users (id, email, display_name, password_hash, last_active)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `)
      .bind(userId, email.toLowerCase(), displayName, passwordHash)
      .run();

    // Create user profile
    await db
      .prepare(`
        INSERT INTO user_profiles (user_id, learning_goals, favorite_subjects, study_schedule)
        VALUES (?, ?, ?, ?)
      `)
      .bind(userId, JSON.stringify([]), JSON.stringify([]), JSON.stringify({}))
      .run();

    return new Response(JSON.stringify({ 
      success: true, 
      userId,
      message: 'User registered successfully'
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    return new Response(JSON.stringify({ error: 'Registration failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function loginUser(db: D1Database, email: string, password: string, request: Request) {
  if (!email || !password) {
    return new Response(JSON.stringify({ error: 'Email and password required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Get user by email
    const user = await db
      .prepare(`
        SELECT id, email, display_name, password_hash, is_active, avatar_url,
               total_study_time, total_sessions, current_streak, longest_streak
        FROM users 
        WHERE email = ? AND is_active = 1
      `)
      .bind(email.toLowerCase())
      .first() as any;
      
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const isValid = await verifyPassword(password, user.password_hash);
    
    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Invalid password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create session token
    const token = generateToken();
    const tokenHash = await hashPassword(token);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const userAgent = request.headers.get('User-Agent') || '';
    const ipAddress = request.headers.get('CF-Connecting-IP') || 
                     request.headers.get('X-Forwarded-For') || 
                     'unknown';

    // Create session
    await db
      .prepare(`
        INSERT INTO user_sessions (id, user_id, token_hash, expires_at, user_agent, ip_address)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(generateId(), user.id, tokenHash, expiresAt.toISOString(), userAgent, ipAddress)
      .run();

    // Update last login
    await db
      .prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP, last_active = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(user.id)
      .run();

    // Get user profile
    const profile = await db
      .prepare('SELECT * FROM user_profiles WHERE user_id = ?')
      .bind(user.id)
      .first() as any;

    return new Response(JSON.stringify({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        totalStudyTime: user.total_study_time,
        totalSessions: user.total_sessions,
        currentStreak: user.current_streak,
        longestStreak: user.longest_streak,
        level: profile?.level || 1,
        totalXp: profile?.total_xp || 0
      },
      token,
      expiresAt: expiresAt.toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Login failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function verifyToken(db: D1Database, token: string) {
  if (!token) {
    return new Response(JSON.stringify({ error: 'Token required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const tokenHash = await hashPassword(token);
    
    const session = await db
      .prepare(`
        SELECT s.user_id, s.expires_at, u.email, u.display_name, u.is_active, u.avatar_url,
               u.total_study_time, u.total_sessions, u.current_streak, u.longest_streak,
               p.level, p.total_xp
        FROM user_sessions s
        JOIN users u ON s.user_id = u.id
        LEFT JOIN user_profiles p ON u.id = p.user_id
        WHERE s.token_hash = ? AND s.is_active = 1 AND u.is_active = 1
      `)
      .bind(tokenHash)
      .first() as any;
      
    if (!session) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check if token is expired
    if (new Date(session.expires_at) < new Date()) {
      await db
        .prepare('UPDATE user_sessions SET is_active = 0 WHERE token_hash = ?')
        .bind(tokenHash)
        .run();
        
      return new Response(JSON.stringify({ error: 'Token expired' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update last used
    await db
      .prepare('UPDATE user_sessions SET last_used = CURRENT_TIMESTAMP WHERE token_hash = ?')
      .bind(tokenHash)
      .run();

    return new Response(JSON.stringify({ 
      success: true, 
      user: {
        id: session.user_id,
        email: session.email,
        displayName: session.display_name,
        avatarUrl: session.avatar_url,
        totalStudyTime: session.total_study_time,
        totalSessions: session.total_sessions,
        currentStreak: session.current_streak,
        longestStreak: session.longest_streak,
        level: session.level || 1,
        totalXp: session.total_xp || 0
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Token verification error:', error);
    return new Response(JSON.stringify({ error: 'Verification failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function logoutUser(db: D1Database, token: string) {
  if (!token) {
    return new Response(JSON.stringify({ error: 'Token required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const tokenHash = await hashPassword(token);
    
    await db
      .prepare('UPDATE user_sessions SET is_active = 0 WHERE token_hash = ?')
      .bind(tokenHash)
      .run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    return new Response(JSON.stringify({ error: 'Logout failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function refreshToken(db: D1Database, token: string) {
  // For now, just verify the token - could implement actual refresh logic
  return await verifyToken(db, token);
}

async function getRegisteredUsers(db: D1Database) {
  try {
    const users = await db
      .prepare(`
        SELECT id, email, display_name, avatar_url, last_login, 
               total_study_time, total_sessions, current_streak
        FROM users 
        WHERE is_active = 1 
        ORDER BY display_name
      `)
      .all();

    const publicUsers = users.results?.map((user: any) => ({
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      lastLogin: user.last_login,
      totalStudyTime: user.total_study_time || 0,
      totalSessions: user.total_sessions || 0,
      currentStreak: user.current_streak || 0
    })) || [];

    return new Response(JSON.stringify({ 
      success: true, 
      users: publicUsers
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Get users error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get users' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function switchUser(db: D1Database, email: string, password: string, request: Request) {
  // This is essentially the same as login, but for user switching context
  return await loginUser(db, email, password, request);
}

// Utility functions
function generateId(): string {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2);
}

function generateToken(): string {
  return 'token_' + Date.now() + '_' + Math.random().toString(36).slice(2) + 
         '_' + Math.random().toString(36).slice(2);
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computedHash = await hashPassword(password);
  return computedHash === hash;
}