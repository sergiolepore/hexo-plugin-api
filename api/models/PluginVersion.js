/**
* PluginVersion.js
*
* @module      :: Model
* @description :: Describes a plugin version.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    /**
     * The version itself.
     *
     * @type String
     * @example "1.0.5"
     */
    number: {
      type: 'string',
      required: true
    },

    /**
     * Creation time for this version.
     *
     * @type String
     * @example "2013-10-22T05:41:29.191Z"
     */
    time: {
      type: 'datetime'
    },

    /**
     * Hexo version support.
     *
     * @type String
     * @example "2.8.2"
     */
    hexoVersion: {
      type: 'string'
    },

    /**
     * Plugin which this version belongs to.
     *
     * @see Plugin
     */
    plugin: {
      model: 'Plugin'
    },

    /**
     * Record/instance method used to serialize a PluginVersion object to JSON.
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
