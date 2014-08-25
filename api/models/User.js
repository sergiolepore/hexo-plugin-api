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
    name: {
      type: 'string',
      required: true
    },
    email: {
      type: 'string',
      email: true,
      required: true,
      unique: true
    },
    githubProfile: 'string',
    npmProfile: 'string',
    website: 'string',
    plugins: {
      collection: 'Plugin',
      via: 'user'
    },

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
