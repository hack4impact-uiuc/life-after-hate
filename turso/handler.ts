import app from '../server/src/index';
import { validOrigin } from '../server/src/security';
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
    const canonical = new Request(origin + incoming.pathname + incoming.search, {
      method:request.method, headers, body:request.body, duplex:'half',
    } as RequestInit);
    db ||= database(connect());
    if (Date.now() - lastCleanup > 600000) {
      await app.cleanup( { DB:db, APP_ORIGIN:origin });
      lastCleanup = Date.now();
    }
    return await app.fetch(canonical, {
      DB: db, APP_ORIGIN: origin,
      CLIENT_IP:process.env.VERCEL === '1' ? headers.get('x-forwarded-for') || 'unknown' : 'local',
      GOOGLE_CLIENT_ID:process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET:process.env.GOOGLE_CLIENT_SECRET,
      MAPQUEST_KEY:process.env.MAPQUEST_KEY,
    });
  } catch {
    return new Response('Service unavailable', {status:503,headers:{'Cache-Control':'no-store'}});
  }
}
