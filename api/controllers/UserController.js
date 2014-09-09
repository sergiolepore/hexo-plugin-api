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

    User.create(userObj).exec(function(err, user) {
      if (err) {
        sails.log.error(err);

        if (err.ValidationError) {
          return res.badRequest(err);
        } else {
          return res.serverError(err);
        }
      }

      req.session.user = user;
      req.session.authenticated = true;

      waterlock.engine.attachAuthToUser(auth, user, function(err) {
        if (err) {
          sails.log.error(err);

          return res.serverError(err);
        }

        user.save(function(err, user) {
          if (err) {
            sails.log.error(err);

            if (err.ValidationError) {
              return res.badRequest(err);
            } else {
              return res.serverError(err);
            }
          }

          sails.log.info('User login success');

          return res.ok(user);
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

    User.update(params.id, params, function(err, user) {
      if (err) {
        sails.log.error(err);

        if (err.ValidationError) {
          return res.badRequest(err);
        } else {
          return res.serverError(err);
        }
      }

      return res.ok(user);
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

    User.destroy({id: user.id}).exec(function(err) {
      if (err)
        return res.serverError(err);

      delete(req.session.user);
      req.session.authenticated = false;

      return res.ok('Successfully deleted');
    });
  },

  /**
   * Returns the logged in user.
   *
   * GET /user/current
   */
  current: function(req, res) {
    var user = req.session.user;

    return res.ok(user);
  }
});