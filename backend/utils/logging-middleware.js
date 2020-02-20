const expressWinston = require("express-winston");
const winston = require("winston");
const { filterSensitiveInfo } = require("./user-utils");
require("winston-loggly-bulk");

module.exports.requestLogger = expressWinston.logger({
  transports: [
    new winston.transports.Loggly({
      subdomain: "h4i",
      inputToken: process.env.LOGGLY_TOKEN,
      json: true,
      colorize: true,
      tags: ["Winston-Request"]
    })
  ],
  exitOnError: false,
  format: winston.format.json(),
  dynamicMeta: req => ({
    user: req.user ? filterSensitiveInfo(req.user) : null
  })
});

module.exports.errorLogger = expressWinston.errorLogger({
  transports: [
    new winston.transports.Loggly({
      subdomain: "h4i",
      inputToken: process.env.LOGGLY_TOKEN,
      json: true,
      colorize: true,
      tags: ["Winston-Error"]
    })
  ],
  exitOnError: false,
  format: winston.format.json()
});
