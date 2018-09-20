'use strict'

var MongoClient = require('mongodb').MongoClient;
var Promise = require('bluebird');

module.exports = function (cb) {
  return MongoClient.connect(
    'mongodb://localhost:27017/test',
    {
      useNewUrlParser: true,
      promiseLibrary: Promise,
    },
    cb
  );
};
