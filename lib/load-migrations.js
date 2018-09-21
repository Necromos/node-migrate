const path = require('path');
const fs = require('fs');
const Migration = require('./models/Migration');

module.exports = (options, fn) => {
  // Process options, set and store are required, rest optional
  const opts = options || {};
  if (!opts.set || !opts.store) {
    throw new TypeError((opts.set ? 'store' : 'set') + ' is required for loading migrations');
  }
  const set = opts.set;
  const store = opts.store;
  const ignoreMissing = !!opts.ignoreMissing;
  const migrationsDirectory = path.resolve(opts.migrationsDirectory || 'migrations');
  const filterFn = opts.filterFunction || (() => true);
  const sortFn = opts.sortFunction
    || ((m1, m2) => m1.title > m2.title ? 1 : (m1.title < m2.title ? -1 : 0));

  // Load from migrations store first up
  store.load((err, state) => {
    if (err) return fn(err);

    // Set last run date on the set
    set.lastRun = state.lastRun || null;

    // Read migrations directory
    fs.readdir(migrationsDirectory, (err, files) => {
      if (err) return fn(err);

      // Filter out non-matching files
      files = files.filter(filterFn);

      // Create migrations, keep a lookup map for the next step
      const migMap = {};
      let migrations = files.map((file) => {
        // Try to load the migrations file
        let mod;
        try {
          mod = require(path.join(migrationsDirectory, file));
        } catch (e) {
          return fn(e);
        }

        const migration = new Migration(file, mod.up, mod.down, mod.description);
        migMap[file] = migration;
        return migration;
      })

      // Fill in timestamp from state, or error if missing
      state.migrations && state.migrations.forEach((m) => {
        if (m.timestamp !== null && !migMap[m.title]) {
          return ignoreMissing ? null : fn(new Error('Missing migration file: ' + m.title));
        } else if (!migMap[m.title]) {
          // Migration existed in state file, but was not run and not loadable
          return undefined;
        }
        migMap[m.title].timestamp = m.timestamp;
      });

      // Sort the migrations by their title
      migrations = migrations.sort(sortFn);

      // Add the migrations to the set
      migrations.forEach(set.addMigration.bind(set));

      // Successfully loaded
      fn();
    })
  })
}
