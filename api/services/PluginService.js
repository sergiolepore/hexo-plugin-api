var os = require('os');
var RegistryClient = require('silent-npm-registry-client');
var npmClient = new RegistryClient({
  registry: 'http://registry.npmjs.org/',
  cache: os.tmpDir() + '/' + Math.random().toString(16).slice(2)
});

/**
 * Updates a plugin info and versions with information stored on the npm registry.
 *
 * @param  Plugin   plugin                   A Plugin object
 * @param  function onUpdateVersionCompleted Callback function.
 *
 * The callback Will be called as:
 *   onUpdateVersionCompleted(error, successfullyUpdatedPluginObject)
 * If {error} parameter is null = no errors occured during the operation.
 */
module.exports.updateVersionMetadata = function(plugin, onUpdateVersionCompleted) {
  var packageUri = '/'+plugin.packageName;

  npmClient.get(packageUri, function(npmErr, npmData) {
    if (npmErr) { // error while checking npmjs.org
      if (npmErr.code == 'E404') {
        npmErr = {
          error: 'E_INVALID',
          status: 400,
          summary: 'Package not found on npm registry',
          invalidAttributes: {
            packageName: [
              {
                value: plugin.packageName,
                message: 'A package with name `'+plugin.packageName+'` was not found on the npm registry.'
              }
            ]
          },
          type: 'NPMREGNOTFOUND'
        };
      }

      return onUpdateVersionCompleted(npmErr);
    }

    plugin.readme = npmData.readme;
    plugin.repositoryUrl = (npmData.repository && npmData.repository.url) ? (
      npmData.repository.url
    ) : (
      ''
    );
    plugin.website = npmData.homepage;
    plugin.lastModified = npmData.time.modified;
    plugin.lastVersion = npmData['dist-tags'].latest;

    if (npmData.keywords) {
      plugin.keywords = npmData.keywords;
    }

    // This is a tricky part... If npmjs.org returns a version, we need to
    // iterate the data asynchronously to prevent a blocking operation.
    // Otherwise, we just save the Plugin object and we are done.
    if (npmData.versions) {
      var npmVersions = Object.keys(npmData.versions);
      var versionsToSave = [];

      // for each version to save (async)
      sails.async.eachSeries(npmVersions, function(versionNumber, next) {
        // we need to check if we are just updating a Plugin (adding new versions)
        // or creating a new one. If the former, we have to identify which versions
        // previously exists and which are new. The new versions will be persisted
        // into the database.
        PluginVersion.count().where({
          plugin: plugin.id,
          number: versionNumber,
        }).exec(function(countErr, count) {
          if (countErr) { // Oops!
            return next(countErr);
          }

          if (count === 0) {
            versionsToSave.push(versionNumber);
          }

          next();
        });
      }, function(asyncErr) {
        // Ok, all iterations have finished. If there was an error on any of them,
        // we have it on {asyncErr} parameter
        if (asyncErr) {
          return onUpdateVersionCompleted(asyncErr);
        }

        // remember that {versionsToSave} is cleaned up. Every version on this array
        // does not exists on the database.
        versionsToSave.forEach(function (versionNumber) {
          var npmVersionData = npmData.versions[versionNumber];
          var pluginVersionObj = {
            number: versionNumber,
            time: npmData.time[versionNumber],
            hexoVersion: npmVersionData.hexo || ''
          };

          plugin.versions.add(pluginVersionObj);
        });

        plugin.save(function(saveErr, plugin) {
          if (saveErr) { // :(
            return onUpdateVersionCompleted(saveErr);
          }

          return onUpdateVersionCompleted(null, plugin); // error = null = no errors
        });
      });
    } else { // no versions? Weird, but we save the Plugin object anyways
      plugin.save(function (saveErr, plugin) {
        if (saveErr) { // f#ck
          return onUpdateVersionCompleted(saveErr);
        }

        return onUpdateVersionCompleted(null, plugin); // error = null = no errors
      });
    }
  });
};