/**
* Plugin.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    name: {
      type: 'string',
      required: true
    },
    packageName: {
      type: 'string',
      required: true,
      unique: true
    },
    github: {
      type: 'string'
    },
    website: {
      type: 'string'
    },
    lastModified: {
      type: 'datetime'
    },
    user: {
      model: 'User'
    },
    tags: {
      collection: 'Tag',
      via: 'plugins',
      dominant: true
    }
  }
};

