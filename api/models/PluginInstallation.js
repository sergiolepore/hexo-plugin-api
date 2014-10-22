/**
* PluginInstallation.js
*
* @module      :: Model
* @description :: Tracks the plugin installations over time.
*                 Will be used to generate statistics.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  /**
   * Linux platform identifier.
   *
   * @type String
   */
  PLATFORM_LIN: 'linux',

  /**
   * Mac platform identifier.
   *
   * @type String
   */
  PLATFORM_MAC: 'mac',

  /**
   * Windows platform identifier.
   *
   * @type String
   */
  PLATFORM_WIN: 'windows',

  attributes: {

    /**
     * Installation platform.
     *
     * @type String
     * @example "linux"
     */
    platform: {
      type: 'string',
      enum: [ 'linux', 'mac', 'windows']
    },

    /**
     * Plugin which this installation belongs to.
     *
     * @see Plugin
     */
    plugin: {
      model: 'Plugin'
    }
  }
};
