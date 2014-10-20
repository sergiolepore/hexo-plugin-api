
var emberUtils = require('../blueprints/_util/actionUtil.js');

/**
 * canManageUser
 *
 * @module      :: Policy
 * @description :: Simple policy to check if the user being edited /
 *              	 deleted is the same as the authenticated one.
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {
  var errorMsg = 'You are not permitted to perform this action.';
  var pk       = emberUtils.requirePk(req);
  var user     = req.session.user;

  // If there's an user in session and his id is the same as the id of the
  // user being manipulated, continue without errors.
  if (req.session.authenticated && user.id == pk)
    return next();

  return res.forbidden(errorMsg);
};
