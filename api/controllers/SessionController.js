
var bcrypt = require('bcrypt');
var moment = require('moment');

/**
 * SessionController
 *
 * @description :: Server-side logic for managing Sessions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var SessionController = module.exports = {};

SessionController.authenticate = function(req, res) {
  var errorMsg = 'Wrong username or password';
  var params   = req.params.all();
  var email    = params.email;
  var password = params.password;
  var jwtConf  = sails.config.jwt;

  User.findOne().where({
    email: email
  }).exec(function(findErr, user) {
    if (findErr)
      return ErrorManager.handleError(findErr, res);

    if (!user)
      return res.unauthorized(errorMsg);

    bcrypt.compare(password, user.password, function(bcrypErr, isValid) {
      if (bcrypErr)
        return ErrorManager.handleError(bcrypErr, res);

      if (!isValid)
        return res.unauthorized(errorMsg);

      req.session.authenticated = true;
      req.session.user          = user;

      var expires = moment().add(jwtConf.expiration.number, jwtConf.expiration.period).valueOf();
      var token = SailsTokenAuth.issueToken({
        iss: user.id,
        exp: expires
      });

      return res.ok({
        user:  user.id,
        token: token
      });
    });
  });
};
