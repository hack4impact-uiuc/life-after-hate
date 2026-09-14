import { getRequestListener } from '@hono/node-server';
import { handle } from '../turso/dist/handler.mjs';
export default getRequestListener(handle, { overrideGlobalObjects:false });
