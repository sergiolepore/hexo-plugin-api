
var Mandrill = require('mandrill-api/mandrill').Mandrill;
var mandrill = new Mandrill(sails.config.mandrill.apiKey);

module.exports.send = function(message, callback) {
  message = message || {};

  message.from_email = sails.config.mandrill.from.email;
  message.from_name  = sails.config.mandrill.from.name;

  mandrill.messages.send({
    message : message,
    async   : true
  }, function(result) {
    return callback(null, result);
  }, function(error) {
    return callback(error);
  });
};
