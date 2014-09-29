/**
* Plugin.js
*
* @module      :: Model
* @description :: Describes a Hexo plugin.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    /**
     * Descriptive name for the plugin.
     *
     * @type String
     * @example "My Awesome Plugin"
     */
    name: {
      type: 'string',
      required: true
    },

    /**
     * npm package name.
     *
     * @type String
     * @example "hexo-awesome-plugin"
     */
    packageName: {
      type: 'string',
      required: true,
      unique: true
    },

    /**
     * Long description
     *
     * @type String
     * @example "Lorem ipsum dolor sit amet..."
     */
    readme: {
      type: 'text'
    },

    /**
     * Public repo URL.
     *
     * @type String
     * @example "git://github.com/user/repo.git"
     */
    repositoryUrl: {
      type: 'string'
    },

    /**
     * Plugin website.
     *
     * @type String
     * @example "http://user.github.io/repo"
     */
    website: {
      type: 'string'
    },

    /**
     * Plugin's last modification time.
     *
     * @type String
     * @example "2014-08-26T03:25:42Z"
     */
    lastModified: {
      type: 'datetime'
    },

    /**
     * Latest version.
     *
     * @type String
     * @example "1.0.3"
     */
    lastVersion: {
        type: 'string'
    },

    /**
     * Plugin Owner.
     *
     * @see User
     */
    user: {
      model: 'User'
    },

    /**
     * Plugin Keywords.
     *
     * @see Keyword
     */
    keywords: {
      collection: 'Keyword',
      via: 'plugins',
      dominant: true
    },

    /**
     * Plugin versions.
     *
     * @see PluginVersion
     */
    versions: {
      collection: 'PluginVersion',
      via: 'plugin'
    }
  }
};

