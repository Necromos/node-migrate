/*!
 * migrate - Set
 * Copyright (c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

const EventEmitter = require('events');
const Migration = require('./models/Migration');
const migrate = require('./migrate');

class MigrationSet extends EventEmitter {
  /**
   * Initialize a new migration `Set` with the given `path`
   * which is used to store data between migrations.
   *
   * @param {String} path
   * @api private
   */
  constructor(store) {
    super();
    this.store = store;
    this.migrations = [];
    this.map = {};
    this.lastRun = null;
  }

  /**
   * Add a migration.
   *
   * @param {String} title
   * @param {Function} up
   * @param {Function} down
   * @api public
   */
  addMigration(title, up, down) {
    const migration = !(title instanceof Migration)
      ? new Migration(title, up, down)
      : title;

    // Only add the migration once, but update
    if (this.map[migration.title]) {
      this.map[migration.title].up = migration.up;
      this.map[migration.title].down = migration.down;
      this.map[migration.title].description = migration.description;
      return undefined;
    }

    this.migrations.push(migration);
    this.map[migration.title] = migration;
  }

  /**
   * Save the migration data.
   *
   * @api public
   */
  save(fn) {
    this.store.save(this, (err) => {
      if (err) return fn(err);
      this.emit('save');
      fn(null);
    });
  }

  /**
   * Run down migrations and call `fn(err)`.
   *
   * @param {Function} fn
   * @api public
   */
  down(migrationName, fn) {
    this.migrate('down', migrationName, fn);
  }

  /**
   * Run up migrations and call `fn(err)`.
   *
   * @param {Function} fn
   * @api public
   */
  up(migrationName, fn) {
    this.migrate('up', migrationName, fn);
  }

  /**
   * Migrate in the given `direction`, calling `fn(err)`.
   *
   * @param {String} direction
   * @param {Function} fn
   * @api public
   */
  migrate(direction, migrationName, fn) {
    if (typeof migrationName === 'function') {
      fn = migrationName;
      migrationName = null;
    }
    migrate(this, direction, migrationName, fn);
  }
}


/**
 * Expose `Set`.
 */
module.exports = MigrationSet;
