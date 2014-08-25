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
        waterlock.logger.debug(err);

        return res.serverError(err);
      }

      req.session.user = user;
      req.session.authenticated = true;

      waterlock.engine.attachAuthToUser(auth, user, function(err) {
        if (err) {
          waterlock.logger.debug(err);

          return res.serverError(err);
        }

        user.save(function(err, user) {
          if (err) {
            sailsLog('err', err);

            return req.serverError(err);
          }

          waterlock.logger.debug('user login success');

          return res.ok(user);
        })
      })
    })
  }
});