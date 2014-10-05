
var emberUtils = require('../blueprints/_util/actionUtil.js');

/**
 * UserController.js
 *
 * @module      :: Controller
 * @description :: Provides the base user
 *                 actions used to make waterlock work.
 *
 * @docs        :: http://waterlock.ninja/documentation
 */
module.exports = require('waterlock').actions.user({

  /**
   * Overridden from default blueprint.
   *
   * POST /user -> UserController.create
   */
  create: function(req, res) {
    var params = emberUtils.parseValues(req, User);
    var auth = {
      email: params.email,
      password: params.password
    };
    var userObj = {
      name: params.name,
      email: params.email
    };

    User.create(userObj).exec(function(createErr, user) {
      if (createErr)
        return ErrorManager.handleError(createErr, res);

      req.session.user = user;
      req.session.authenticated = true;

      waterlock.engine.attachAuthToUser(auth, user, function(waterlockErr) {
        if (waterlockErr)
          return ErrorManager.handleError(waterlockErr, res);

        user.save(function(saveErr, user) {
          if (saveErr)
            return ErrorManager.handleError(saveErr, res);

          sails.log.info('User login success');

          return res.emberOk(User, user, {status: 201});
        });
      });
    });
  },

  /**
   * Overridden from default blueprint.
   *
   * PUT /user/:id -> UserController.update
   */
  update: function(req, res) {
    var pk = emberUtils.requirePk(req);
    var params = emberUtils.parseValues(req, User);
    var user = req.session.user;

    if (user.id != pk) // if logged in user != user to edit
      return res.forbidden('You have no permissions to perform this action.');

    User.update(pk, params, function(updateErr, user) {
      if (updateErr)
        return ErrorManager.handleError(updateErr, res);

      return res.emberOk(User, user);
    });
  },

  /**
   * Overridden from default blueprint.
   *
   * DELETE /user/:id -> UserController.destroy
   */
  destroy: function(req, res) {
    var pk = emberUtils.requirePk(req);
    var user = req.session.user;

    if (user.id != pk) // if logged in user != user to delete
      return res.forbidden('You have no permissions to perform this action.');

    User.destroy(pk).exec(function(destroyErr) {
      if (destroyErr)
        return ErrorManager.handleError(destroyErr, res);

      delete(req.session.user);
      req.session.authenticated = false;

      return res.ok(null);
    });
  },

  /**
   * Returns the logged in user.
   *
   * GET /user/current
   */
  current: function(req, res) {
    var user = req.session.user;

    return res.emberOk(User, user);
  }
});
