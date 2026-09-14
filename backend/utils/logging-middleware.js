const { randomUUID } = require("node:crypto");
// Exclude URLs, queries, bodies, headers and identity from operational logs.
const requestLogger = (req, res, next) => {
  req.requestId = randomUUID();
  res.setHeader("X-Request-ID", req.requestId);
  res.on("finish", () =>
    console.info(
      JSON.stringify({
        requestId: req.requestId,
        method: req.method,
        status: res.statusCode,
      }),
    ),
  );
  next();
};
module.exports = { requestLogger };
