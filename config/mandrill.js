/**
 * Mandrill Service configurations.
 */

module.exports.mandrill = {
  apiKey  : process.env.MANDRILL_KEY, // the api key for your mandrill account

  from : {
    name  : 'hpmjs.org',
    email : 'info@hpmjs.org'
  },

};
