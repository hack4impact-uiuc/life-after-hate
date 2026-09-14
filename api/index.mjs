import { handle } from "../turso/dist/handler.mjs";

// Receive the Web Request directly so Vercel's Node request helpers cannot
// consume the JSON body before the API reads it.
export default { fetch: handle };
