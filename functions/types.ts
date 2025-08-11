// TypeScript types for Cloudflare Functions
export interface Env {
  DB: D1Database;
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