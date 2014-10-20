/**
 * JWT (JSON Web Tokens) configuration.
 */

module.exports.jwt = {

  /****************************************************************************
  *                                                                           *
  * Secret phrase used by the hashing library to encode the JWT data.         *
  * 																																					*
  * !!! IMPORTANT !!!                                                         *
  * 																																					*
  * DO NOT forget to generate a new secret and store it on an environment     *
  * variable in the production server!                                        *
  *                                                                           *
  ****************************************************************************/

  secret: process.env.JWT_SECRET || 'b2c2703b5e80b28d38a6ef1e23577c4bbf177b85',


  expiration: {
    number: 30,
    period: 'days'
  },

};
