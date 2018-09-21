const MongoClient = require('mongodb').MongoClient;
const bluebird = require('bluebird');

module.exports = (cb) =>
  MongoClient.connect(
    'mongodb://localhost:27017/test',
    {
      useNewUrlParser: true,
      promiseLibrary: bluebird,
    },
    cb
  );
