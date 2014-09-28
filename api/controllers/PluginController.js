/**
 * PluginController
 *
 * @module      :: Controller
 * @description :: Server-side logic for managing plugins
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var controller = module.exports = {};

/**
 * Overridden from default blueprint.
 *
 * POST /plugin -> PluginController.create
 */
controller.create = function (req, res) {
  var params = req.params.all();
  var user = req.session.user;

  // Check if the plugins exists. If so, just update versions. Otherwise, create and then
  // update versions.
  Plugin.findOne().where({
    packageName: params.packageName,
    user: user.id
  }).exec(function(findErr, plugin) {
    if (findErr)
      return ErrorManager.handleError(findErr, res);

    if (!plugin) {
      var pluginObj = {
        name: params.name,
        packageName: params.packageName,
        user: user
      };

      Plugin.create(pluginObj).exec(function(createErr, plugin) {
        if (createErr)
          return ErrorManager.handleError(createErr, res);

        // Update info and versions for the newly created plugin
        return updatePluginMetadata(res, plugin);
      });
    } else {
      // Plugin exists, update info and versions
      return updatePluginMetadata(res, plugin);
    }
  });
};

/**
 * Overridden from default blueprint.
 *
 * PUT /plugin/:id -> PluginController.update
 */
controller.update = function(req, res) {
  var params = req.params.all();
  var user = req.session.user;

  Plugin.findOne().where({
    id: params.id
  }).exec(function(findErr, plugin) {
    if (findErr)
      return ErrorManager.handleError(findErr, res);

    if (plugin.user != user.id)
      return res.forbidden('You have no permissions to perform this action.');

    //only the name can be manually changed, all other data comes from npm
    plugin.name = params.name;

    return updatePluginMetadata(res, plugin);
  });
};

/**
 * Overridden from default blueprint.
 *
 * DELETE /plugin/:id -> PluginController.destroy
 */
controller.destroy = function(req, res) {
  var params = req.params.all();
  var user = req.session.user;

  Plugin.findOne().where({
    id: params.id
  }).exec(function(findErr, plugin) {
    if (findErr)
      return ErrorManager.handleError(err, res);

    if (plugin.user != user.id)
      return res.forbidden('You have no permissions to perform this action.');

    plugin.destroy(function(destroyErr) {
      if (destroyErr)
        return ErrorManager.handleError(err, res);

      return res.ok(null);
    });
  });
};

/**
 * Updates the plugin metadata, by calling the PluginService (which gets all
 * metadata from npm registry) and handles errors and success operations.
 *
 * @param  Object res          The Sails Response object
 * @param  Object pluginObject A Plugin object, populated from the database
 */
function updatePluginMetadata(res, pluginObject) {
  PluginService.updateVersionMetadata(pluginObject, function(updateMetadataErr, updatedPlugin) {
    if (updateMetadataErr) {
      if (updateMetadataErr.type == 'NPMREGNOTFOUND') { // not found on npm repo? destroy it.
        pluginObject.destroy(function(destroyErr) {
          if (destroyErr)
            sails.log.error(destroyErr);

          return ErrorManager.handleError(updateMetadataErr, res);
        });
      } else { // other errors
        return ErrorManager.handleError(updateMetadataErr, res);
      }
    } else {
      return res.emberOk(Plugin, updatedPlugin);
    }
  });
}