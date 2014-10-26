/**
 * Connections
 * (sails.config.connections)
 *
 * `Connections` are like "saved settings" for your adapters.  What's the difference between
 * a connection and an adapter, you might ask?  An adapter (e.g. `sails-mysql`) is generic--
 * it needs some additional information to work (e.g. your database host, password, user, etc.)
 * A `connection` is that additional information.
 *
 * Each model must have a `connection` property (a string) which is references the name of one
 * of these connections.  If it doesn't, the default `connection` configured in `config/models.js`
 * will be applied.  Of course, a connection can (and usually is) shared by multiple models.
 * .
 * Note: If you're using version control, you should put your passwords/api keys
 * in `config/local.js`, environment variables, or use another strategy.
 * (this is to prevent you inadvertently sensitive credentials up to your repository.)
 *
 * For more information on configuration, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.connections.html
 */

module.exports.connections = {

  /***************************************************************************
  *                                                                          *
  * MongoDB storage for DEVELOPMENT                                          *
  *                                                                          *
  *                                                                          *
  * IMPORTANT: DO NOT CHANGE THE CONNECTION. This connection is used on      *
  *            dev environments. It should be enough to debug and develop    *
  *            stuff. If you REALLY need to change it, override it on your   *
  *            local.js file.                                                *
  *                                                                          *
  * ProTip: How to change the default database.                              *
  *                                                                          *
  *         $ DB_URL="mongodb://my-ip/database" sails lift                   *
  *                                                                          *
  ***************************************************************************/
  mongoDevelopment : {
    adapter : 'sails-mongo',
    url     : process.env.DB_URL || 'mongodb://127.0.0.1/hpmjs'
  },

  /***************************************************************************
  *                                                                          *
  * MongoDB storage for PRODUCTION                                           *
  *                                                                          *
  *                                                                          *
  * IMPORTANT: DO NOT CHANGE THE CONNECTION. This connection is used on the  *
  *            production environment.                                       *
  *                                                                          *
  ***************************************************************************/
  mongoProduction : {
    adapter : 'sails-mongo',
    url     : process.env.DB_URL
  }

};
