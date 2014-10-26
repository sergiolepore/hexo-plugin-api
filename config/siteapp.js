/**
 * Configuration for the Site SinglePagaApplication.
 * hexo-plugin-site project powered by Ember-CLI.
 */

module.exports.siteapp = {

  // configure on production!!!
  // defaults to Ember-CLI port (hexo-plugin-site project)
  baseUrl : process.env.FRONT_URL || 'http://localhost:4200',

  // Ember's SessionRoute Resource -> ResetPasswordRoute
  resetPasswordPath : '/devs/resetpassword/:token',
};
