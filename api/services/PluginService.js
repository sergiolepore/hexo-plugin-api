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
  sails.async.waterfall([

    // Plugin Waterfall 1.
    // It will fetch the npm registry for the plugin metadata.
    // On success, pass an object with the package data to the next function.
    function fetchNpmRepository(onNpmFetchFinished) {
      var packageUri = '/'+plugin.packageName;

      npmClient.get(packageUri, function(npmErr, npmData) {
        if (npmErr) { // error while checking npmjs.org
          if (npmErr.code == 'E404') { // not found
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

          return onNpmFetchFinished(npmErr); // on 404 error or another unknown error, stop everything
        } else {
          return onNpmFetchFinished(null, npmData); // no error, move to the next function
        }
      });
    },

    // Plugin Waterfall 2.
    // It will populate the Plugin object with its basic metadata, such as the readme, timestamps, websites.
    // On success, returns the npmData object so it can be reused by the next function.
    function extractBasicMetadata(npmData, onMetadataExtractionFinished) {
      plugin.description = npmData.description;
      plugin.readme = npmData.readme;
      plugin.repositoryUrl = (npmData.repository && npmData.repository.url) ? (
        npmData.repository.url
      ) : (
        ''
      );
      plugin.website = npmData.homepage;
      plugin.lastModified = npmData.time.modified;
      plugin.lastVersion = npmData['dist-tags'].latest;

      return onMetadataExtractionFinished(null, npmData);
    },

    // Plugin Waterfall 3.
    // From here, things start to get messy. This function will
    // iterate over all keywords in npmData (if any) and search them on the database. If exists,
    // it will be associated to the plugin. If not, it will be persisted and then associated to our
    // plugin.
    // On success, returns the npmData object to the next function.
    function processKeywords(npmData, onProcessKeywordsFinished) {
      if (!npmData.keywords) {
        return onProcessKeywordsFinished(null, npmData);
      } else {
        // iterate over each keyword and perform database operations, all async
        sails.async.each(npmData.keywords, function(keywordName, nextKeyword) {
          sails.async.waterfall([

            // Keyword Waterfall 1.
            // First, we need to check if the kw is already on the database. If so,
            // grab it and give it to the next function. Otherwise, save it and return it
            // to the next function.
            function findKeyword(onFindKeywordFinished) {
              keywordName = keywordName.toLowerCase().trim();

              Keyword.findOne().where({
                name: keywordName
              })
              // keywordObject.plugins array will be populated with a plugin if a keyword is found
              // an is already related to the plugin
              .populate('plugins', { id: plugin.id })
              .exec(function(err, keywordObject) {
                if (err)
                  return onFindKeywordFinished(err);

                if (!keywordObject) {
                  keywordObject = {};
                  keywordObject.name = keywordName;

                  Keyword.create(keywordObject).exec(function(err, keywordObject) {
                    if (err)
                      return onFindKeywordFinished(err);

                    return onFindKeywordFinished(null, keywordObject);
                  });
                } else { // keyword already exists on database
                  return onFindKeywordFinished(null, keywordObject);
                }
              });
            },

            // Keyword Waterfall 2
            // Now we are sure that we have a keyword from the database (new or existing),
            // associate it to our plugin object and finish this task.
            function associateKeywordToPlugin(keywordObject, onAssociateKeywordToPluginFinished) {
              if (!keywordObject.plugins.length) // only create new relations
                plugin.keywords.add(keywordObject.id);

              return onAssociateKeywordToPluginFinished(); // done
            }

          ], function keywordWaterfallFinished(err) {
            if (err)
              return nextKeyword(err); // next on kw async

            return nextKeyword(); // next on kw async
          });
        }, function eachKeywordFinished(err) {
          // all keywords processed...
          if (err)
            return onProcessKeywordsFinished(err); // next on plugin waterfall

          // this is needed because Waterline queries have limits.
          // See Plugin.attributes.keywordCache docblock
          if (npmData.keywords)
            plugin.keywordCache = npmData.keywords.join(' ');

          return onProcessKeywordsFinished(null, npmData); // next on plugin waterfall
        });
      }
    },

    // Plugin Waterfall 4.
    // This function will iterate over npmData.versions and extract version metadata
    // for the current plugin.
    // On success, it will return nothing and pluginWatefallFinished will be invoked.
    function processVersions(npmData, onProcessVersionsFinished) {
      if (!npmData.versions) { // weird, no versions?
        return onProcessVersionsFinished(null);
      } else {
        var npmVersions = Object.keys(npmData.versions); // version numbers
        var versionsToSave = []; // temporal storage

        sails.async.eachSeries(npmVersions, function(versionNumber, nextVersion) {
          // we need to check if we are just updating a Plugin (adding new versions)
          // or creating a new one. If the former, we have to identify which versions
          // previously exists and which are new. The new versions will be persisted
          // into the database.
          PluginVersion.count().where({
            plugin: plugin.id,
            number: versionNumber,
          }).exec(function(countErr, count) {
            if (countErr) // Oops!
              return nextVersion(countErr);

            if (count === 0)
              versionsToSave.push(versionNumber);

            return nextVersion();
          });
        }, function eachVersionFinished(err) {
          // Ok, all iterations have finished.
          if (err)
            return onProcessVersionsFinished(err);

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

          return onProcessVersionsFinished(); // done
        });
      }
    }

  ], function pluginWaterfallFinished(err) {
    if (err)
      return onUpdateVersionCompleted(err);

    // every function in waterfall has finished... We have our plugin object with
    // everything we need. Save it.
    plugin.save(function(err, plugin) {
      if (err) // f#ck
        return onUpdateVersionCompleted(err);

      return onUpdateVersionCompleted(null, plugin);
    });
  });
};
