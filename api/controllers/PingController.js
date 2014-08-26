/**
 * PingController
 *
 * @module      :: Controller
 * @description :: Server-side logic for managing pings
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

  open: function(req, res) {
    res.ok('hi');
  },

  restricted: function(req, res) {
    res.ok('hi');
  }
};

