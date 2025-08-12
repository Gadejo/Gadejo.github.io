// TypeScript types for Cloudflare Functions
export interface Env {
  // Database
  DB: D1Database;
  
  // KV Namespaces
  SESSIONS: KVNamespace;
  CACHE: KVNamespace;
  RATE_LIMIT: KVNamespace;
  
  // Environment Variables
  NODE_ENV: string;
  API_BASE_URL: string;
  ENVIRONMENT: string;
  DEBUG_MODE: string;
  RATE_LIMIT_REQUESTS: string;
  RATE_LIMIT_WINDOW: string;
  SESSION_DURATION: string;
  MAX_UPLOAD_SIZE: string;
  APP_NAME: string;
  APP_VERSION: string;
  SUPPORT_EMAIL: string;
}

// D1 Database types (simplified)
declare global {
  interface D1Database {
    prepare(query: string): D1PreparedStatement;
    batch(statements: D1PreparedStatement[]): Promise<D1Result[]>;
  }

  interface D1PreparedStatement {
    bind(...values: any[]): D1PreparedStatement;
    first<T = any>(): Promise<T | null>;
    run(): Promise<D1Result>;
    all<T = any>(): Promise<D1Result<T>>;
  }

  interface D1Result<T = any> {
    results?: T[];
    success: boolean;
    error?: string;
    meta: any;
  }

  // Cloudflare Pages Functions
  interface PagesFunction<Env = any> {
    (context: {
      request: Request;
      env: Env;
      params: Record<string, string>;
      data: Record<string, any>;
      next: () => Promise<Response>;
      waitUntil: (promise: Promise<any>) => void;
    }): Response | Promise<Response>;
  }
}