const { MongoClient, Collection, Db } = require('mongodb');
const logger = require('./loggers/dry-run-logger');

const originalFind = Collection.prototype.find;
const originalFindOne = Collection.prototype.findOne;
const originalCountDocuments = Collection.prototype.countDocuments;

const trialLogHelper = methodTrail => `${methodTrail} ran with`;
const optionsLogHelper = options => `options ${JSON.stringify(options)} will result with`;
const updatesLogHelper = (update, objectsCount) =>
  `update query ${JSON.stringify(update)} will result with ${objectsCount} records modified`;

const prepareReturn = callback => typeof callback === 'function' ? callback() : undefined;

Object.assign(
  Db.prototype,
  {
    createCollection: function (name, options, callback) {
      logger.info(
        trialLogHelper(`${this.s.databaseName}.createCollection()`),
        optionsLogHelper(options),
        'creation of',
        name,
        'collection'
      );
    }
  }
);

Object.assign(
  Collection.prototype,
  {
    find: function (query, options, callback) {
      logger.info(
        trialLogHelper(`${this.s.namespace}.find()`),
        optionsLogHelper(options),
        'search for',
        query
      );
      return originalFind.call(this, query, options, callback);
    },
    findOne: function (query, options, callback) {
      logger.info(
        trialLogHelper(`${this.s.namespace}.findOne()`),
        optionsLogHelper(options),
        'search for',
        query
      );
      return originalFindOne.call(this, query, options, callback);
    },
    createIndex: function (fieldOrSpec, options, callback) {
      logger.info(
        trialLogHelper(`${this.s.namespace}.createIndex()`),
        optionsLogHelper(options), 'index creation defined by',
        fieldOrSpec
      );
      return prepareReturn(callback);
    },
    updateOne: function (filter, update, options, callback) {
      logger.info(
        trialLogHelper(`${this.s.namespace}.updateOne()`),
        'update query',
        JSON.stringify(update),
        'will result with record matching',
        filter,
        'modification'
      );
      return prepareReturn(callback);
    },
    updateMany: function (filter, update, options, callback) {
      if (typeof callback === 'function') {
        return originalCountDocuments.call(this, filter, undefined, (err, objectsCount) => {
          if (err) return callback(err);
          logger.info(
            trialLogHelper(`${this.s.namespace}.updateMany()`),
            updatesLogHelper(update, objectsCount)
          );
          return callback();
        });
      }
      return originalCountDocuments.call(this, filter)
        .then((objectsCount) => {
          logger.info(
            trialLogHelper(`${this.s.namespace}.updateMany()`),
            updatesLogHelper(update, objectsCount)
          );
        });
    },
    drop: function (options, callback) {
      logger.info(
        trialLogHelper(`${this.s.namespace}.drop()`),
        optionsLogHelper(options),
        this.s.namespace,
        'collection to be dropped'
      );
      return prepareReturn(callback);
    },
    insertOne: function (doc, options, callback) {
      logger.info(
        trialLogHelper(`${this.s.namespace}.insertOne()`),
        optionsLogHelper(options),
        JSON.stringify(doc),
        'being added to collection'
      );
      return prepareReturn(callback);
    },
    deleteOne: function (filter, options, callback) {
      logger.info(
        trialLogHelper(`${this.s.namespace}.deleteOne()`),
        optionsLogHelper(options),
        JSON.stringify(filter),
        'being removed from collection'
      );
      return prepareReturn(callback);
    }
  }
);
