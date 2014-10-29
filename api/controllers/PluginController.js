
var _ = require('underscore');
var emberUtils = require('../blueprints/_util/actionUtil.js');

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
 * POST /plugins -> PluginController.create
 */
controller.create = function (req, res) {
  var params = emberUtils.parseValues(req, Plugin);
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
      return updatePluginMetadata(res, plugin, {status: 201});
    }
  });
};

/**
 * Overridden from default blueprint.
 *
 * PUT /plugins/:id -> PluginController.update
 */
controller.update = function(req, res) {
  var pk = emberUtils.requirePk(req);
  var params = emberUtils.parseValues(req, Plugin);
  var user = req.session.user;

  Plugin.findOne(pk).exec(function(findErr, plugin) {
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
 * DELETE /plugins/:id -> PluginController.destroy
 */
controller.destroy = function(req, res) {
  var pk = emberUtils.requirePk(req);
  var user = req.session.user;

  Plugin.findOne(pk).exec(function(findErr, plugin) {
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

controller.trending = function(req,res) {
  var where = emberUtils.parseCriteria(req);
  var limit = emberUtils.parseLimit(req);
  var skip = emberUtils.parseSkip(req);

  sails.async.waterfall([

    function findInstallations(onFindInstallationsFinished) {
      PluginInstallation
        .find()
        .where(where)
        .populate('plugin')
        .exec(onFindInstallationsFinished)
      ;
    },

    function groupByPlugin(installations, onGroupByPluginFinished) {
      var groupedInstalls = _.groupBy(installations, function(installation) {
        var plugin = installation.plugin;

        if (plugin === undefined)
          return "undef";

        return plugin.id;
      });

      if (groupedInstalls.undef !== undefined)
        delete groupedInstalls.undef;

      return onGroupByPluginFinished(null, groupedInstalls);
    },

    function countInstallations(groupedInstalls, onCountInstallationsFinished) {
      var pluginInstalls = [];

      for (var pluginId in groupedInstalls) {
        var count = groupedInstalls[pluginId].length;

        pluginInstalls.push({plugin: pluginId, count: count });
      }

      pluginInstalls = _.sortBy(pluginInstalls, 'count').reverse().slice(skip, (skip+limit));

      return onCountInstallationsFinished(null, pluginInstalls);
    },

    function findPlugins(pluginInstalls, onFindPluginsFinished) {
      sails.async.mapSeries(pluginInstalls, function(pluginData, next) {
        Plugin.findOne(pluginData.plugin).exec(next);
      }, onFindPluginsFinished);
    }

  ], function waterfallFinished(err, result) {
    if (err)
      return ErrorManager.handleError(err);

    return res.emberOk(Plugin, result);
  });

};

/**
 * Updates the plugin metadata, by calling the PluginService (which gets all
 * metadata from npm registry) and handles errors and success operations.
 *
 * @param  Object res          The Sails Response object
 * @param  Object pluginObject A Plugin object, populated from the database
 */
function updatePluginMetadata(res, pluginObject, options) {
  options = options || {};

  PluginService.updateVersionMetadata(pluginObject, function(updateMetadataErr, updatedPlugin) {
    if (updateMetadataErr) {
      var errorType = updateMetadataErr.type;

      // destroy the plugin if:
      //  - not found on npm repository
      //  - the validation token does not match (forbidden registration)
      if (errorType === 'NPMREGNOTFOUND' || errorType === 'TOKENMISMATCH') {
        pluginObject.destroy(function(destroyErr) {
          if (destroyErr)
            sails.log.error(destroyErr);

          return ErrorManager.handleError(updateMetadataErr, res);
        });
      } else { // other errors
        return ErrorManager.handleError(updateMetadataErr, res);
      }
    } else {
      return res.emberOk(Plugin, updatedPlugin, options);
    }
  });
}

/**
 * I will keep this action here just for references. Everything it does can be
 * achieved with a simple "GET /plugins" with a query parameter named "where" and
 * with a content like this:
 *
 * {
 *   "or": [
 *     { "name": { "contains": "404" } },
 *     { "name": { "contains": "error" } },
 *     { "description": { "contains": "404" } },
 *     { "description": { "contains": "error" } },
 *     { "packageName": { "contains": "404" } },
 *     { "packageName": { "contains": "error" } },
 *     { "keywordCache": { "contains": "404" } },
 *     { "keywordCache": { "contains": "error" } },
 *     { "readme": { "contains": "404 error" } }
 *   ]
 * }
 *
 * This JSON will be processed by Waterline.
 *
 * GET /plugins/search
 */
// controller.search = function(req, res) {
//   var params = req.params.all();
//   var searchQuery = params.q || '';
//   var limit = params.size || sails.config.search.limit;
//   var page = params.page || 1;
//   // var queryWords = '%' + searchQuery.trim().split(/\s+/).join('%') + '%';
//   var queryWords = searchQuery.trim().split(/\s+/);
//   var orClause = [];

//   if (!searchQuery)
//     return res.emberOk(Plugin, []);

//   queryWords.forEach(function(word) {
//     orClause.push({ name: { 'contains': word } });
//     orClause.push({ packageName: { 'contains': word } });
//     orClause.push({ description: { 'contains': word } });
//     orClause.push({ keywordCache: { 'contains': word } });
//   });

//   orClause.push({ readme: { 'contains': searchQuery } });

//   Plugin.find().where({
//     or: orClause
//   })
//   .paginate({ page: page, limit: limit })
//   .exec(function(err, pluginMatches) {
//     if (err)
//       return ErrorManager.handleError(err, res);

//     return res.emberOk(Plugin, pluginMatches);
//   });
// };
