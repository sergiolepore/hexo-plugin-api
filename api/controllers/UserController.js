
var emberUtils = require('../blueprints/_util/actionUtil.js');

/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var UserController = module.exports = {};

/**
 * Returns the logged in user.
 *
 * GET /user/current
 */
UserController.current = function(req, res) {
  var user = req.session.user;

  return res.emberOk(User, user);
};
