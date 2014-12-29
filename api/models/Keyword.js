/**
* Keyword.js
*
* @module      :: Model
* @description :: Describes a plugin keyword
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {

    /**
     * Keyword name.
     *
     * @type String
     * @example "emoji"
     */
    name: {
      type: 'string',
      required: true
    },

    /**
     * Plugins asocciated to this Keyword.
     *
     * @see Plugin
     */
    plugins: {
      collection: 'Plugin',
      via: 'keywords'
    },

    /**
     * Record/instance method used to serialize a Keyword object to JSON.
     *
     * @see http://sailsjs.org/#/documentation/concepts/ORM/Models.html?q=attribute-methods-(ie-record%2Finstance-methods)
     */
    toJSON: function() {
      var obj = this.toObject();

      delete obj.createdAt;
      delete obj.updatedAt;

      return obj;
    }
  }
};
