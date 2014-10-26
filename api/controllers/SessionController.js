
var bcrypt = require('bcrypt');
var moment = require('moment');
var crypto = require('crypto');

/**
 * SessionController
 *
 * @description :: Server-side logic for managing Sessions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var SessionController = module.exports = {};

SessionController.authenticate = function(req, res) {
  var errorMsg = 'Wrong username or password';
  var params   = req.params.all();
  var email    = params.email;
  var password = params.password;
  var jwtConf  = sails.config.jwt;

  User.findOne().where({
    email: email
  }).exec(function(findErr, user) {
    if (findErr)
      return ErrorManager.handleError(findErr, res);

    if (!user)
      return res.unauthorized(errorMsg);

    bcrypt.compare(password, user.password, function(bcrypErr, isValid) {
      if (bcrypErr)
        return ErrorManager.handleError(bcrypErr, res);

      if (!isValid)
        return res.unauthorized(errorMsg);

      req.session.authenticated = true;
      req.session.user          = user;

      var expires = moment().add(jwtConf.expiration.number, jwtConf.expiration.period).valueOf();
      var token = SailsTokenAuth.issueToken({
        iss: user.id,
        exp: expires
      });

      return res.ok({
        user:  user.id,
        token: token
      });
    });
  });
};

SessionController.resetPasswordEmail = function(req, res) {
  var params = req.params.all();
  var email  = params.email;

  sails.async.waterfall([

    function findUser(onFindUserFinished) {
      User.findOne({
        email: email
      }).exec(function(findErr, user) {
        if (findErr)
          return onFindUserFinished(findErr);

        if (!user) {
          return onFindUserFinished({
            error: 'E_NOTFOUND',
            status: 404,
            summary: 'Invalid email'
          });
        }

        return onFindUserFinished(null, user);
      });
    },

    function generateResetToken(user, onGenerateResetTokenFinished) {
      if (user.resetToken) {
        return onGenerateResetTokenFinished(null, user);
      } else {
        crypto.randomBytes(48, function(cryptoErr, buffer) {
          if (cryptoErr)
            return onGenerateResetTokenFinished(cryptoErr);

          user.resetToken = buffer.toString('hex');

          user.save(onGenerateResetTokenFinished);
        });
      }
    },

    function renderTemplate(user, onRenderTemplateFinished) {
      var frontendUrl = sails.config.siteapp.baseUrl;
      var resetPath   = sails.config.siteapp.resetPasswordPath;
      resetPath       = resetPath.replace(':token', user.resetToken);

      res.render('email/reset', {
        url : frontendUrl + resetPath
      }, function(renderErr, html) {
        if (renderErr)
          return onRenderTemplateFinished(renderErr);

        return onRenderTemplateFinished(null, user, html);
      });
    },

    function sendEmail(user, template, onSendEmailFinished) {
      Email.send({
        to : [{
          name  : user.username,
          email : user.email,
        }],
        subject       : 'hpmjs.org | Password Reset',
        html          : template,
        track_opens   : false,
        track_clicks  : false
      }, onSendEmailFinished);
    }

  ], function onWaterfallFinished(err, result) {
    if (err)
      return ErrorManager.handleError(err, res);

    res.ok();
  });
};
