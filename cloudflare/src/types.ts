export interface Env {
  DB: D1Database;
  ASSETS?: Fetcher;
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
