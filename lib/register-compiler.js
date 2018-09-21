const path = require('path');

module.exports = (c) => {
  const compiler = c.split(':');
  const ext = compiler[0];
  const mod = compiler[1];

  if (mod[0] === '.') mod = path.join(process.cwd(), mod);
  require(mod)({ extensions: ['.' + ext] });
};
