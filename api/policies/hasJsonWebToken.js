/**
 * hasJsonWebToken
 *
 * @module      :: Policy
 * @description :: Simple policy to check if the request has a JWT and if it's
 *              	 valid.
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {
  var token;

  if (req.headers && req.headers.authorization) {
    var parts = req.headers.authorization.split(' ');

    if (parts.length == 2) {
      var scheme      = parts[0];
      var credentials = parts[1];

      if (/^Bearer$/i.test(scheme))
        token = credentials;

    } else {
      return res.unauthorized('Format is Authorization: Bearer [token]');
    }
  } else if (req.param('token')) {
    token = req.param('token');
    // We delete the token from param to not mess with blueprints
    delete req.query.token;
  } else {
    return res.unauthorized('No Authorization header was found');
  }

  SailsTokenAuth.verifyToken(token, function(err, token) {
    if (err)
      return res.unauthorized('The token is not valid');

    var userId     = token.iss;
    var expiration = token.exp;

    if (expiration <= Date.now())
      return res.unauthorized('Access token has expired');

    req.token = token;

    User.findOne(userId).exec(function(findErr, user) {
      if (findErr)
        return ErrorManager.handleError(findErr, res);

      if(!user)
        return res.unauthorized('No user found');

      req.session.authenticated = true;
      req.session.user          = user;

      next();
    });
  });
};
