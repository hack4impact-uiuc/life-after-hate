const { isCelebrateError } = require("celebrate");
module.exports = (error, req, res, _next) => {
  const invalid =
    isCelebrateError(error) ||
    ["ValidationError", "CastError"].includes(error.name);
  const status = invalid
    ? 400
    : error.code === 11000
      ? 409
      : [400, 413, 415].includes(error.status)
        ? error.status
        : error.isBoom
          ? error.output.statusCode
          : 500;
  // HTTP/database errors can contain credentials and personal data.
  console.error(
    JSON.stringify({
      event: "request_failed",
      requestId: req.requestId,
      status,
    }),
  );
  res.status(status).json({
    code: status,
    success: false,
    message:
      status === 500
        ? "Internal server error"
        : status === 409
          ? "Record already exists"
          : status === 404
            ? "Not found"
            : "Request could not be processed",
  });
};
