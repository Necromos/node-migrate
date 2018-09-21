const MongoClient = require('mongodb').MongoClient;
const bluebird = require('bluebird');

module.exports = (cb) =>
  MongoClient.connect(
    process.env.MONGODB_CONNECTION_STRING || 'mongodb://localhost:27017',
    {
      useNewUrlParser: true,
      promiseLibrary: bluebird,
    },
    cb
  );
