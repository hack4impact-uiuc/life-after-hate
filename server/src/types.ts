export interface Statement {
 bind(...values: any[]): Statement;
 first<T = Record<string, unknown>>(): Promise<T | null>;
 all<T = Record<string, unknown>>(): Promise<{results:T[]}>;
 run(): Promise<unknown>;
}
export interface Database {
 prepare(sql: string): Statement;
 batch(statements: Statement[]): Promise<unknown>;
}
export interface Env {
  DB: Database;
  CLIENT_IP?: string;
  APP_ORIGIN: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  MAPQUEST_KEY?: string;
}
export type Document = Record<string, any>;
export interface Session {
  token_hash: string;
  user_id: string;
  csrf: string;
  created_at: number;
  last_seen: number;
}
export type ContextEnv = {
  Bindings: Env;
  Variables: { user: Document; session: Session };
};
