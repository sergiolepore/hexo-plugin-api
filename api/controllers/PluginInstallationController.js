
var emberUtils = require('../blueprints/_util/actionUtil.js');

/**
 * PluginInstallationController
 *
 * @description :: Server-side logic for managing Plugininstallations
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var controller = module.exports = {};

/**
 * Overridden from default blueprint.
 *
 * POST /plugininstallations -> PluginInstallationController.create
 */
controller.create = function(req, res) {
  var data = emberUtils.parseValues(req, PluginInstallation);

  sails.async.waterfall([

    function createPluginInst(onCreatePluginInstFinished) {
      PluginInstallation.create(data).exec(function (createErr, pluginInstRecord) {
        if (createErr)
          return onCreatePluginInstFinished(createErr);

        return onCreatePluginInstFinished(null, pluginInstRecord); //next function in waterfall
      });
    },

    function updatePluginInstallCount(pluginInstRecord, onUpdatePluginInstallCountFinished) {
      var pluginId = data.plugin;

      Plugin.findOne(pluginId).exec(function (findErr, pluginRecord) {
        if (findErr)
          return onUpdatePluginInstallCountFinished(findErr);

        var prevCount = pluginRecord.installationCount;

        if (prevCount === undefined)
          prevCount = 0;

        pluginRecord.installationCount = prevCount + 1;

        pluginRecord.save(function (saveErr, pluginRecord) {
          if (saveErr)
            return onUpdatePluginInstallCountFinished(findErr);

          return onUpdatePluginInstallCountFinished(null, pluginInstRecord); // next function in waterfall
        });
      });
    },

    function repopulateRecord(pluginInstRecord, onRepopulateRecordFinished) {
      var Q = PluginInstallation.findOne(pluginInstRecord.id);
      Q = emberUtils.populateEach(Q, req);

      Q.exec(function (findErr, populatedRecord) {
        if (findErr)
          return onRepopulateRecordFinished(findErr);

        return onRepopulateRecordFinished(null, populatedRecord); // finish
      });
    }

  ], function waterfallFinished(err, populatedRecord) {
    if (err)
      return ErrorManager.handleError(err, res);

    return res.emberOk(PluginInstallation, populatedRecord, { status: 201 });
  });
};
