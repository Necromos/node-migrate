const initMongoClient = require('./mongodb-init');

let lastRunIndex;

const upMigrations = (set, lastRunIndex, toIndex) =>
  set.migrations.reduce(
    (arr, migration, index) => {
      if (index > toIndex) return arr;

      if (index < lastRunIndex && !migration.timestamp) {
        set.emit('warning', 'migrations running out of order');
      }

      if (!migration.timestamp) arr.push(migration);

      return arr
    },
    []
  )

const downMigrations = (set, lastRunIndex, toIndex) =>
  set.migrations.reduce(
    (arr, migration, index) => {
      if (index < toIndex || index > lastRunIndex) {
        return arr
      }

      if (migration.timestamp) {
        arr.push(migration)
      }

      return arr
    },
    []
  ).reverse();

/**
 * Get index of given migration in list of migrations
 *
 * @api private
 */

const positionOfMigration = (migrations, title) => {
  let lastTimestamp;
  for (let i = 0; i < migrations.length; ++i) {
    lastTimestamp = migrations[i].timestamp ? i : lastTimestamp;
    if (migrations[i].title === title) return i;
  }

  // If titled migration was missing use last timestamped
  return lastTimestamp;
}

const completeMigration = (err, next, mongoClient, migration, migrations, direction, set, callback) => {
  if (err) return callback(err)

  // Set timestamp if running up, clear it if down
  migration.timestamp = direction === 'up' ? Date.now() : null;

  // Decrement last run index
  lastRunIndex--;

  set.lastRun = direction === 'up'
    ? migration.title
    : set.migrations[lastRunIndex] ? set.migrations[lastRunIndex].title : null;

  set.save((err) => {
    if (err) return callback(err)

    next(mongoClient, migrations.shift(), migrations, direction, set, callback);
  });
}

const next = (mongoClient, migration, migrations, direction, set, callback) => {
  // Done running migrations
  if (!migration) {
    mongoClient.close();
    return callback(null);
  }

  // Missing direction method
  if (typeof migration[direction] !== 'function') {
    return callback(new TypeError('Migration ' + migration.title + ' does not have method ' + direction))
  }

  // Status for supporting promises and callbacks
  let isPromise = false;

  // Run the migration function
  set.emit('migration', migration, direction);
  const arity = migration[direction].length;
  const returnValue = migration[direction](
    (err) => {
      if (isPromise) return set.emit('warning', 'if your migration returns a promise, do not call the done callback');
      completeMigration(err, next, mongoClient, migration, migrations, direction, set, callback);
    },
    mongoClient
  );

  // Is it a promise?
  isPromise = typeof Promise !== 'undefined' && returnValue instanceof Promise;

  // If not a promise and arity is not 1, warn
  if (!isPromise && arity < 1) set.emit('warning', 'it looks like your migration did not take or callback or return a Promise, this might be an error');

  // Handle the promises
  if (isPromise) {
    returnValue
      .then(() => completeMigration(null, next, mongoClient, migration, migrations, direction, set, callback))
      .catch(callback);
  }
}

const migrate = (mongoClient, set, direction, migrationName, callback) => {
  let migrations = [];
  let toIndex;

  if (!migrationName) {
    toIndex = direction === 'up' ? set.migrations.length : 0;
  } else if ((toIndex = positionOfMigration(set.migrations, migrationName)) === -1) {
    return callback(new Error('Could not find migration: ' + migrationName));
  }

  lastRunIndex = positionOfMigration(set.migrations, set.lastRun);

  migrations = (direction === 'up' ? upMigrations : downMigrations)(set, lastRunIndex, toIndex);

  return next(mongoClient, migrations.shift(), migrations, direction, set, callback);
}

module.exports = (set, direction, migrationName, callback) => {
  initMongoClient((err, mongoClient) => {
    if (err) return callback(err);
    return migrate(mongoClient, set, direction, migrationName, callback);
  });
};
