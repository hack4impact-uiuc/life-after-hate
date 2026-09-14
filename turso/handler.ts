import worker from '../cloudflare/src/index';
import { validOrigin } from '../cloudflare/src/security';
import { connect } from './client.mjs';
import { database } from './database.mjs';
import { applicationURL } from './request.mjs';
let db: any;
let lastCleanup = 0;
export async function handle(request: Request) {
  try {
    const origin = process.env.APP_ORIGIN || '';
    validOrigin(origin);
    const incoming = applicationURL(request.url);
    // Vercel terminates TLS ahead of the Node adapter. Validate host before
    // reconstructing the canonical HTTPS URL; never trust a forwarded host.
    if (incoming.host !== new URL(origin).host)
      return new Response('Invalid host', {status:400});
    const headers = new Headers(request.headers);
    headers.delete('CF-Connecting-IP');
    if (process.env.VERCEL === '1')
      headers.set('CF-Connecting-IP', headers.get('x-forwarded-for') || 'unknown');
    const canonical = new Request(origin + incoming.pathname + incoming.search, {
      method:request.method, headers, body:request.body, duplex:'half',
    } as RequestInit);
    db ||= database(connect());
    if (Date.now() - lastCleanup > 600000) {
      await worker.scheduled(undefined as any, { DB:db, APP_ORIGIN:origin });
      lastCleanup = Date.now();
    }
    return await worker.fetch(canonical, {
      DB: db, APP_ORIGIN: origin,
      GOOGLE_CLIENT_ID:process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET:process.env.GOOGLE_CLIENT_SECRET,
      MAPQUEST_KEY:process.env.MAPQUEST_KEY,
    });
  } catch {
    return new Response('Service unavailable', {status:503,headers:{'Cache-Control':'no-store'}});
  }
}
