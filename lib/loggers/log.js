const chalk = require('chalk')

module.exports = (key, msg) => console.log('  ' + chalk.grey(key) + ' : ' + chalk.cyan(msg));
module.exports.error = (key, msg) => {
  console.error('  ' + chalk.red(key) + ' : ' + chalk.white(msg));
  if (msg instanceof Error) console.error(msg);
};
