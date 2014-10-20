
var jwt = require('jsonwebtoken');

/**
 * Generates a new JWT with a given payload data.
 *
 * @param {Object} payload Data to store in the JWT.
 */
module.exports.issueToken = function(payload) {
  return jwt.sign(payload, sails.config.jwt.secret);
};

/**
 * Returns the payload decoded if the signature is valid.
 * If not, it will return the error.
 *
 * @param {String}   token    JWT String
 * @param {function} callback Callback function. callback(err, decodedToken)
 */
module.exports.verifyToken = function(token, callback) {
  return jwt.verify(token, sails.config.jwt.secret, {}, callback);
};
