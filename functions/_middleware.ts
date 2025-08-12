// Enhanced Cloudflare Pages Functions Middleware
import { Env } from './types';

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const clientIP = request.headers.get('CF-Connecting-IP') || 
                   request.headers.get('X-Forwarded-For') || 
                   'unknown';
  
  // Security headers for all requests
  const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };
  
  // API route handling
  if (url.pathname.startsWith('/api/')) {
    // Rate limiting for API routes
    const rateLimitKey = `rate_limit:${clientIP}`;
    const rateLimitWindow = parseInt(env.RATE_LIMIT_WINDOW);
    const rateLimitRequests = parseInt(env.RATE_LIMIT_REQUESTS);
    
    try {
      const currentCount = await env.RATE_LIMIT.get(rateLimitKey);
      const count = currentCount ? parseInt(currentCount) : 0;
      
      if (count >= rateLimitRequests) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded',
          resetTime: Date.now() + (rateLimitWindow * 1000)
        }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': rateLimitWindow.toString(),
            ...securityHeaders
          }
        });
      }
      
      // Increment rate limit counter
      await env.RATE_LIMIT.put(rateLimitKey, (count + 1).toString(), {
        expirationTtl: rateLimitWindow
      });
      
    } catch (error) {
      console.error('Rate limiting error:', error);
      // Continue on rate limiting errors to avoid blocking legitimate requests
    }
    
    // Process the API request
    const response = await context.next();
    
    // Clone response to modify headers
    const newResponse = new Response(response.body, response);
    
    // CORS headers
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    newResponse.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
    
    // Add security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
      newResponse.headers.set(key, value);
    });
    
    // Add rate limit headers
    const currentCount = await env.RATE_LIMIT.get(rateLimitKey);
    const count = currentCount ? parseInt(currentCount) : 0;
    newResponse.headers.set('X-RateLimit-Limit', rateLimitRequests.toString());
    newResponse.headers.set('X-RateLimit-Remaining', Math.max(0, rateLimitRequests - count).toString());
    newResponse.headers.set('X-RateLimit-Reset', (Date.now() + (rateLimitWindow * 1000)).toString());
    
    return newResponse;
  }
  
  // Static file caching for production
  if (env.NODE_ENV === 'production' && (
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico')
  )) {
    const response = await context.next();
    const newResponse = new Response(response.body, response);
    
    // Cache static assets for 1 year
    newResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    Object.entries(securityHeaders).forEach(([key, value]) => {
      newResponse.headers.set(key, value);
    });
    
    return newResponse;
  }
  
  // Default response with security headers
  const response = await context.next();
  const newResponse = new Response(response.body, response);
  
  Object.entries(securityHeaders).forEach(([key, value]) => {
    newResponse.headers.set(key, value);
  });
  
  return newResponse;
};

// Enhanced preflight OPTIONS handler
export const onRequestOptions: PagesFunction<Env> = async ({ env }) => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    },
  });
};
