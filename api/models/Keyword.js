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
    }
  }
};
