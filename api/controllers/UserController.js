
var emberUtils = require('../blueprints/_util/actionUtil.js');

/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var UserController = module.exports = {};

/**
 * Overridden from default blueprint.
 *
 * PUT /users/:id -> UserController.update
 */
UserController.update = function(req, res) {
  var pk      = emberUtils.requirePk(req);
  var params  = emberUtils.parseValues(req, User);

  delete params.email; // can't change email
  delete params.username; // can't change username
  delete params.password; // this is not the method to change the password

  User.update({id:pk}, params).exec(function(updateErr, user) {
    if (updateErr)
      return ErrorManager.handleError(updateErr, res);

    return res.emberOk(User, user);
  });
};

/**
 * Returns the logged in user.
 *
 * GET /user/current
 */
UserController.current = function(req, res) {
  var user = req.session.user;

  return res.emberOk(User, user);
};

/**
 * Changes the password of the current logged in user.
 *
 * PUT /users/password
 */
UserController.password = function(req, res) {
  var newPassword = req.params.all().password;
  var user        = req.session.user;

  user.password = newPassword;

  user.save(function(saveErr, user) {
    if (saveErr)
      return ErrorManager.handleError(saveErr, res);

    return res.emberOk(User, user);
  });
};
