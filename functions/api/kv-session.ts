// Cloudflare Pages Function for KV Session Management
import { Env } from '../types';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  try {
    const body = await request.json() as { 
      action: 'store' | 'get' | 'delete' | 'list',
      key?: string,
      data?: any,
      expirationTtl?: number
    };
    
    const { action, key, data, expirationTtl } = body;
    const sessions = env.SESSIONS;
    
    if (!sessions) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'KV Sessions namespace not available' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    switch (action) {
      case 'store':
        if (!key || !data) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Key and data required for store operation' 
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        try {
          const options: any = {};
          if (expirationTtl && expirationTtl > 0) {
            options.expirationTtl = expirationTtl;
          }

          await sessions.put(key, JSON.stringify(data), options);
          
          return new Response(JSON.stringify({ 
            success: true, 
            message: 'Session stored successfully' 
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          console.error('KV store error:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Failed to store session' 
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }

      case 'get':
        if (!key) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Key required for get operation' 
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        try {
          const sessionData = await sessions.get(key);
          
          if (!sessionData) {
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'Session not found' 
            }), {
              status: 404,
              headers: { 'Content-Type': 'application/json' }
            });
          }

          return new Response(JSON.stringify({ 
            success: true, 
            data: JSON.parse(sessionData) 
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          console.error('KV get error:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Failed to retrieve session' 
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }

      case 'delete':
        if (!key) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Key required for delete operation' 
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        try {
          await sessions.delete(key);
          
          return new Response(JSON.stringify({ 
            success: true, 
            message: 'Session deleted successfully' 
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          console.error('KV delete error:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Failed to delete session' 
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }

      case 'list':
        try {
          const keys = await sessions.list({ limit: 100 });
          
          return new Response(JSON.stringify({ 
            success: true, 
            keys: keys.keys.map(k => k.name) 
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          console.error('KV list error:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Failed to list sessions' 
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }

      default:
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Invalid action' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }
    
  } catch (error) {
    console.error('KV Session API error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};