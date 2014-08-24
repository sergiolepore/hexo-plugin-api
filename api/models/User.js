/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

var bcrypt = require('bcrypt');

module.exports = {
  schema: true,

  attributes: {
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
    salt: {
      type: 'string',
    },
    password: {
      type: 'string',
      minLength: 6,
      required: true
    },

    toJSON: function() {
      var obj = this.toObject();

      delete obj.salt;
      delete obj.password;

      return obj;
    }
  },

  beforeCreate: function(values, next) {
    bcrypt.genSalt(10, function(err, salt) {
      if (err) return next(err);

      bcrypt.hash(values.password, salt, function(err, hash) {
        if (err) return next(err);

        values.salt = salt;
        values.password = hash;

        next();
      });
    });
  }
};

