/**
 * 2xx Response
 *
 * Usage:
 * return res.emberOk(Model, recordObject);
 * return res.emberOk(Model, recordObject, options);
 *
 * @param {Object} Model
 * @param {Object} recordObject
 * @param {Object} options
 *          - status. Defaults to 200
 */

var emberUtils = require( '../blueprints/_util/actionUtil.js' );

module.exports = function emberOk(Model, recordObject, options) {

  // Get access to `req`, `res`, & `sails`
  var req = this.req;
  var res = this.res;
  var sails = req._sails;

  options = options || {};
  options.status = options.status || 200;
  options.sideloading = (sails.config.blueprints.ember && sails.config.blueprints.ember.sideload);

  sails.log.silly('res.emberOk() :: Sending ' + options.status);

  // Set status code
  res.status(options.status);

  var data = emberUtils.emberizeJSON(
    Model,
    recordObject,
    req.options.associations,
    options.sideloading
  );

  // If appropriate, serve data as JSON(P)
  if (req.wantsJSON) {
    return res.jsonx(data);
  }

  return res.jsonx(data);
};
