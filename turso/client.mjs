import { createClient } from '@libsql/client';
export function connect(env = process.env) {
  const url = env.TURSO_DATABASE_URL || env.TURSO_SQL;
  const authToken = env.TURSO_AUTH_TOKEN || env.TURSO_TOKEN;
  if (!url || !authToken) throw new Error('Turso credentials are missing');
  const parsed = new URL(url);
  if (!['libsql:', 'https:'].includes(parsed.protocol) || parsed.search || parsed.username || parsed.password)
    throw new Error('Expected a secure Turso libSQL database URL');
  return createClient({ url, authToken });
}
