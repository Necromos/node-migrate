'use strict'
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var Collection = mongodb.Collection;
var Db = mongodb.Db;
var logger = require('./dry-run-logger');

var originalFind = Collection.prototype.find;
var originalFindOne = Collection.prototype.findOne;
var originalCountDocuments = Collection.prototype.countDocuments;

var dryRunLogHelper = function dryRunLogHelper(methodTrail) {
  return methodTrail + ' ran with';
};
var optionsLogHelper = function optionsLogHelper(options) {
  return 'options ' + JSON.stringify(options) + ' will result with';
};
var updatesLogHelper = function updateLogHelper(update, objectsCount) {
  return 'update query ' + JSON.stringify(update) + ' will result with ' + objectsCount + ' records modified';
};

Object.assign(Db.prototype, {
  createCollection: function (name, options, callback) {
    logger.info(dryRunLogHelper(this.s.databaseName + '.createCollection()'), optionsLogHelper(options), 'creation of', name, 'collection');
  }
});

Object.assign(Collection.prototype, {
  find: function (query, options, callback) {
    logger.info(dryRunLogHelper(this.s.namespace + '.find()'), optionsLogHelper(options), 'search for', query);
    return originalFind.call(this, query, options, callback);
  },
  findOne: function (query, options, callback) {
    logger.info(dryRunLogHelper(this.s.namespace + '.findOne()'), optionsLogHelper(options), 'search for', query);
    return originalFindOne.call(this, query, options, callback);
  },
  createIndex: function (fieldOrSpec, options, callback) {
    logger.info(dryRunLogHelper(this.s.namespace + '.createIndex()'), optionsLogHelper(options), 'index creation defined by', fieldOrSpec);
    return typeof callback === 'function' ? callback() : undefined;
  },
  updateOne: function (filter, update, options, callback) {
    logger.info(dryRunLogHelper(this.s.namespace + '.updateOne()'), 'update query', JSON.stringify(update), 'will result with record matching', filter, 'modification');
    return typeof callback === 'function' ? callback() : undefined;
  },
  updateMany: function (filter, update, options, callback) {
    if (typeof callback === 'function') {
      return originalCountDocuments.call(this, filter, undefined, (err, objectsCount) => {
        if (err) return callback(err);
        logger.info(dryRunLogHelper(this.s.namespace + '.updateMany()'), updatesLogHelper(update, objectsCount));
        return callback();
      });
    }
    const that = this;
    return originalCountDocuments.call(this, filter)
      .then(function (objectsCount) {
        logger.info(dryRunLogHelper(that.s.namespace + '.updateMany()'), updatesLogHelper(update, objectsCount));
      });
  },
  drop: function (options, callback) {
    logger.info(dryRunLogHelper(this.s.namespace + '.drop()'), optionsLogHelper(options), this.s.namespace, 'collection to be dropped');
    return typeof callback === 'function' ? callback() : undefined;
  },
  insertOne: function (doc, options, callback) {
    logger.info(dryRunLogHelper(this.s.namespace + '.insertOne()'), optionsLogHelper(options), JSON.stringify(doc), 'being added to collection');
    return typeof callback === 'function' ? callback() : undefined;
  },
  deleteOne: function (filter, options, callback) {
    logger.info(dryRunLogHelper(this.s.namespace + '.deleteOne()'), optionsLogHelper(options), JSON.stringify(filter), 'being removed from collection');
    return typeof callback === 'function' ? callback() : undefined;
  }
});
