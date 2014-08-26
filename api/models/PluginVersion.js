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
    }
  }
};

