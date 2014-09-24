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
    var params = req.params.all();
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
    var params = req.params.all();
    var user = req.session.user;

    if (user.id != params.id) // if logged in user != user to edit
      return res.forbidden('You have no permissions to perform this action.');

    User.update(params.id, params, function(updateErr, user) {
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
    var params = req.params.all();
    var user = req.session.user;

    if (user.id != params.id) // if logged in user != user to delete
      return res.forbidden('You have no permissions to perform this action.');

    User.destroy({id: user.id}).exec(function(destroyErr) {
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