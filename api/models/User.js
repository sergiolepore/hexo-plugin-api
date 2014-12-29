
var bcrypt = require('bcrypt');

/**
* User.js
*
* @module      :: Model
* @description :: Describes a user.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  schema: true,

  attributes: {
    /**
     * Username.
     *
     * @type String
     * @example CoolCoder123
     */
    username: {
      type: 'string',
      required: true,
      unique: true
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
     * Encrypted user password
     *
     * @type String
     */
    password: {
      type: 'string',
      required: true,
      minLength: 6
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
     * TOken used to validate a reset password operation
     *
     * @type {String}
     */
    resetToken: 'string',

    /**
     * Record/instance method used to serialize an User object to JSON.
     *
     * @see http://sailsjs.org/#/documentation/concepts/ORM/Models.html?q=attribute-methods-(ie-record%2Finstance-methods)
     */
    toJSON: function() {
      var obj = this.toObject();

      delete obj.email;
      delete obj.password;
      delete obj.resetToken;

      return obj;
    }
  },

  beforeCreate: function(values, next) {
    var password = values.password;

    bcrypt.hash(password, 10, function(err, encryptedPassword) {
      if (err)
        return next(err);

      values.password = encryptedPassword;

      next();
    });
  },

  beforeUpdate: function(values, next) {
    var password = values.password;

    if (!password)
      return next();

    bcrypt.hash(password, 10, function(err, encryptedPassword) {
      if (err)
        return next(err);

      values.password = encryptedPassword;

      next();
    });
  }

};
