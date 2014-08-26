/**
* Tag.js
*
* @module      :: Model
* @description :: Describes a plugin tag (keyword)
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    /**
     * Tag name.
     *
     * @type String
     * @example "emoji"
     */
    name: {
      type: 'string',
      required: true
    },

    /**
     * Plugins asocciated to this Tag.
     * 
     * @see Plugin
     */
    plugins: {
      collection: 'Plugin',
      via: 'tags'
    }
  }
};

