/*!
 * migrate
 * Copyright(c) 2011 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

const MigrationSet = require('./lib/MigrationSet');
const FileStore = require('./lib/stores/FileStore');
const loadMigrationsIntoSet = require('./lib/load-migrations');

/**
 * Expose the migrate function.
 */

exports = module.exports = (title, up, down) => {
  // migration
  if (typeof title === 'string' && up && down) {
    migrate.set.addMigration(title, up, down);
  // specify migration file
  } else if (typeof title === 'string') {
    migrate.set = exports.load(title);
  // no migration path
  } else if (!migrate.set) {
    throw new Error('must invoke migrate(path) before running migrations');
  // run migrations
  } else {
    return migrate.set;
  }
};

/**
 * Expose MigrationSet
 */
exports.MigrationSet = MigrationSet;

exports.load = (options = {}, fn) => {
  // Create default store
  const store = (typeof options.stateStore === 'string')
    ? new FileStore(options.stateStore)
    : options.stateStore;

  // Create migration set
  const set = new MigrationSet(store);

  loadMigrationsIntoSet(
    {
      set,
      store,
      migrationsDirectory: options.migrationsDirectory,
      filterFunction: options.filterFunction,
      sortFunction: options.sortFunction,
      ignoreMissing: options.ignoreMissing
    },
    (err) => fn(err, set)
  );
}
