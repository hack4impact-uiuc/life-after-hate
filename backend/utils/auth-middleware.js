// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const passport = require("passport");
const Boom = require("@hapi/boom");
const roleEnum = require("../models/User.js").roleEnum;

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.send(Boom.unauthorized("You have not logged in!"));
}

function isVolunteer(req, res, next) {
  if (!req.isAuthenticated()) {
    res.send(Boom.unauthorized("You are not logged in!"));
  } else if (req.user.role === roleEnum.VOLUNTEER) {
    return next();
  } else {
    res.send(Boom.unauthorized("You are not a volunteer."));
  }
}

function isAdmin(req, res, next) {
  if (!req.isAuthenticated()) {
    res.send(Boom.unauthorized("You are not logged in!"));
  } else if (req.user.role === roleEnum.ADMIN) {
    return next();
  } else {
    res.send(Boom.unauthorized("You are not an admin."));
  }
}

module.exports = { isAuthenticated, isVolunteer, isAdmin };
