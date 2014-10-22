/**
 * Manages server responses in case of a Waterline error.
 * If {err} is {ValidationError} -> res.badRequest
 * Else -> res.serverError
 *
 * @param  Object   err      Waterline error
 * @param  Object   response The response object
 */
module.exports.handleError = function(err, response) {
  sails.log.error(err);

  // if (err.ValidationError || err.type == 'NPMREGNOTFOUND') {
  //   return response.badRequest(err);
  // } else {
  //   return response.serverError(err);
  // }

  return response.negotiate(err);
};
