function loadConfig(env = process.env) {
  const isProd = env.NODE_ENV === "production";
  const frontend = new URL(env.FE_URI || "http://localhost:3000");
  const callback = new URL(
    env.OAUTH_CALLBACK_URI || "http://localhost:5000/api/auth/login/callback",
  );
  if (
    isProd &&
    (!env.FE_URI ||
      !env.OAUTH_CALLBACK_URI ||
      frontend.protocol !== "https:" ||
      callback.protocol !== "https:")
  ) {
    throw new Error(
      "Production requires explicit HTTPS FE_URI and OAUTH_CALLBACK_URI",
    );
  }
  if (
    frontend.username ||
    frontend.password ||
    callback.username ||
    callback.password ||
    callback.pathname !== "/api/auth/login/callback" ||
    callback.search ||
    callback.hash
  ) {
    throw new Error(
      "Invalid application origin or OAuth callback configuration",
    );
  }
  if (isProd && callback.origin !== frontend.origin) {
    throw new Error("Production frontend and API must share an origin");
  }
  if (!env.SESSION_SECRET || Buffer.byteLength(env.SESSION_SECRET) < 32) {
    throw new Error(
      "SESSION_SECRET must contain at least 32 bytes of random secret material",
    );
  }
  if (!env.DB_URI || !env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new Error("DB_URI and Google OAuth credentials are required");
  }
  if (isProd) {
    const params = new URLSearchParams(env.DB_URI.split("?")[1] || "");
    const options = Object.fromEntries(
      [...params].map(([key, value]) => [
        key.toLowerCase(),
        value.toLowerCase(),
      ]),
    );
    const authenticated = /^mongodb(?:\+srv)?:\/\/[^/]+:[^/]+@/.test(
      env.DB_URI,
    );
    const tls =
      env.DB_URI.startsWith("mongodb+srv://") ||
      options.tls === "true" ||
      options.ssl === "true";
    if (
      !authenticated ||
      !tls ||
      options.tls === "false" ||
      options.ssl === "false" ||
      [
        "tlsinsecure",
        "tlsallowinvalidcertificates",
        "tlsallowinvalidhostnames",
      ].some((key) => options[key] === "true")
    ) {
      throw new Error(
        "Production MongoDB requires authentication and verified TLS",
      );
    }
  }
  if (isProd && (env.BYPASS_AUTH_ROLE || env.DEFAULT_ROLE)) {
    throw new Error(
      "Production cannot enable authentication bypass or default-role overrides",
    );
  }
  const mockRole = env.BYPASS_AUTH_ROLE?.toUpperCase();
  if (
    mockRole &&
    !["ADMIN", "VOLUNTEER", "PENDING", "REJECTED"].includes(mockRole)
  ) {
    throw new Error("Invalid BYPASS_AUTH_ROLE");
  }
  if (["true", "1", "*"].includes(env.TRUST_PROXY)) {
    throw new Error("TRUST_PROXY must list trusted proxy addresses or subnets");
  }
  return {
    isProd,
    mockRole,
    dbUri: env.DB_URI,
    secret: env.SESSION_SECRET,
    frontendOrigin: frontend.origin,
    callbackUrl: callback.href,
    googleClientId: env.GOOGLE_CLIENT_ID,
    googleClientSecret: env.GOOGLE_CLIENT_SECRET,
    cookieName: isProd ? "__Host-lah.sid" : "lah.sid",
    trustProxy: env.TRUST_PROXY
      ? env.TRUST_PROXY.split(",").map((s) => s.trim())
      : false,
  };
}
module.exports = { loadConfig };
