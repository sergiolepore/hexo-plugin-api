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

module.exports.bootstrap = function(continueSailsBoot) {
  sails.async = require('async');

  // DO NOT LOAD DUMMY DATA ON PRODUCTION
  if (process.env.NODE_ENV === 'production') continueSailsBoot();

  User.count().exec(function(err, num) {
    if (err) {
      console.log(err);
      return continueSailsBoot(err);
    }

    if (num > 0)
      return continueSailsBoot();

    var demoUsers = require(__dirname + '/dummy_data/basic_fixture.json');
    var demoPassword = 'demo1234';

    sails.log.info('Loading test data into the database. Please wait...\n');

    sails.async.eachSeries(demoUsers, function(userObj, next) {
      userObj.password = demoPassword;

      User.create(userObj).exec(function(err, user) {
        if (err)
          return next(err);

        var info = {
          id: user.id,
          email: user.email,
          password: demoPassword
        };

        sails.log.debug(info);

        Plugin.update({
          user: user.id
        }, {
          hpmmetadata: {
            token: user.id,
            hexoVersion: "2.8.2"
          }
        }).exec(function(updErr, plugins) {
          if (updErr)
            return next(err);

          return next();
        });
      });
    }, function(err) {
      if (err)
        sails.log.error(err);

      console.log('\n');

      // It's very important to trigger this callback method when you are finished
      // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
      continueSailsBoot();
    });
  });
};
