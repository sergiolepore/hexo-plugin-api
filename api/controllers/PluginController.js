/**
 * PluginController
 *
 * @module      :: Controller
 * @description :: Server-side logic for managing plugins
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

  /**
   * Overridden from default blueprint.
   *
   * POST /plugin -> PluginController.create
   */
  create: function (req, res) {
    var params = req.params.all();
    var user = req.session.user;

    // Check if the plugins exists. If so, just update versions. Otherwise, create and then
    // update versions.
    Plugin.findOne().where({
      packageName: params.packageName,
      user: user.id
    }).exec(function(findErr, plugin) {
      if (findErr) {
        return ErrorManager.handleError(findErr, res);
      }

      if (!plugin) {
        var pluginObj = {
          name: params.name,
          packageName: params.packageName,
          user: user
        };

        Plugin.create(pluginObj).exec(function(createErr, plugin) {
          if (createErr) {
            return ErrorManager.handleError(createErr, res);
          }

          // Update info and versions for the newly created plugin
          PluginService.updateVersionMetadata(plugin, function(updateMetadataErr, updatedPlugin) {
            if (updateMetadataErr) {
              if (updateMetadataErr.type == 'NPMREGNOTFOUND') { // not found on npm repo? destroy it.
                plugin.destroy(function(destroyErr) {
                  if (destroyErr) {
                    sails.log.error(destroyErr);
                  }
                  return ErrorManager.handleError(updateMetadataErr, res);
                });
              } else { // other errors
                return ErrorManager.handleError(updateMetadataErr, res);
              }
            } else {
              return res.ok(updatedPlugin);
            }
          });
        });
      } else {
        // Plugin exists, update info and versions
        PluginService.updateVersionMetadata(plugin, function(updateMetadataErr, updatedPlugin) {
          if (updateMetadataErr) {
            if (updateMetadataErr.type == 'NPMREGNOTFOUND') { // not found on npm repo? destroy it.
              plugin.destroy(function(destroyErr) {
                if (destroyErr) {
                  sails.log.error(destroyErr);
                }
                return ErrorManager.handleError(updateMetadataErr, res);
              });
            } else { // other errors
              return ErrorManager.handleError(updateMetadataErr, res);
            }
          } else {
            return res.ok(updatedPlugin);
          }
        });
      }
    });
  },

  /**
   * Overridden from default blueprint.
   *
   * PUT /plugin/:id -> PluginController.update
   */
  update: function(req, res) {

  }
};

