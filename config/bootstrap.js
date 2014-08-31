/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.bootstrap.html
 */

var async = require('async');

module.exports.bootstrap = function(continueSailsBoot) {

  // DO NOT LOAD DUMMY DATA ON PRODUCTION
  if (process.env.NODE_ENV === 'production') continueSailsBoot();

  var demoUsers = require(__dirname + '/dummy_data/basic_fixture.json');
  var demoPassword = 'demo1234';

  sails.log.info('Loading test data into the database. Please wait...\n');

  async.eachSeries(demoUsers, function(userObj, next) {
    User.create(userObj).exec(function(err, user) {
      if (err) {
        return next(err);
      }

      var auth = {
        email: user.email,
        password: demoPassword
      };

      sails.log.debug(auth);

      waterlock.engine.attachAuthToUser(auth, user, function(err) {
        if (err) {
          return next(err);
        }

        user.save(function(err, user) {
          if (err) {
            return next(err);
          }

          return next();
        });
      });
    });
  }, function(err) {
    if (err) {
      sails.log.error(err);
    }

    console.log('\n');

    // It's very important to trigger this callback method when you are finished
    // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
    continueSailsBoot();
  });
};
