/**
 * User
 *
 * @module      :: Model
 * @description :: This is the base user model
 * @docs        :: http://waterlock.ninja/documentation
 */

module.exports = {
  schema: true,

  attributes: require('waterlock').models.user.attributes({
    /**
     * User name.
     * 
     * @type String
     * @example CoolCoder123
     */
    name: {
      type: 'string',
      required: true
    },

    /**
     * User email.
     * 
     * @type String
     */
    email: {
      type: 'string',
      email: true,
      required: true,
      unique: true
    },

    /**
     * Github profile URL.
     *
     * @type String
     * @example https://github.com/coolcoder123
     */
    githubProfile: 'string',

    /**
     * npm profile URL.
     * 
     * @type String
     * @example https://www.npmjs.org/~coolcoder123
     */
    npmProfile: 'string',

    /**
     * User website URL.
     *
     * @type String
     * @example http://www.coolcoder123.com/
     */
    website: 'string',

    /**
     * User donations URL.
     * 
     * @type String
     * @example "https://www.gittip.com/coolcoder123/"
     */
    donationsUrl: 'string',

    /**
     * User plugins.
     * 
     * @see Plugin
     */
    plugins: {
      collection: 'Plugin',
      via: 'user'
    },

    /**
     * Record/instance method used to serialize an User object to JSON.
     * 
     * @see http://sailsjs.org/#/documentation/concepts/ORM/Models.html?q=attribute-methods-(ie-record%2Finstance-methods)
     */
    toJSON: function() {
      var obj = this.toObject();

      // inherited from waterlock
      delete obj.password;
      delete obj.attempts;
      delete obj.jsonWebTokens;
      delete obj.auth;

      return obj;
    }
  }),
  
  beforeCreate: require('waterlock').models.user.beforeCreate,
  beforeUpdate: require('waterlock').models.user.beforeUpdate
};
