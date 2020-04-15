const Boom = require("@hapi/boom");
const errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(500).send(Boom.badImplementation("terrible implementation"));
};

module.exports = errorHandler;
