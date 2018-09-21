const _ = require('lodash');
const winston = require('winston');

const CLF_MONTH = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const pad2 = (num) => {
  const str = String(num);

  return (str.length === 1 ? '0' : '') + str;
};

const clfdate = (dateTime) => {
  const date = dateTime.getUTCDate();
  const hour = dateTime.getUTCHours();
  const mins = dateTime.getUTCMinutes();
  const secs = dateTime.getUTCSeconds();
  const year = dateTime.getUTCFullYear();

  const month = CLF_MONTH[dateTime.getUTCMonth()];

  return `[${pad2(date)}/${month}/${year}:${pad2(hour)}:${pad2(mins)}:${pad2(secs)} +0000]`;
};

const formatMeta = (meta) => {
  if (meta) return ` ${JSON.stringify(meta)}`;
  return ' ---';
};

const formatter = (options) => {
  let string = '';
  string += clfdate(new Date(options.timestamp()));
  string += ' ';
  string += 'DRY RUN RESULT:';
  string += ' ';
  string += options.message ? options.message : '';
  if (options.meta) string += formatMeta(options.meta);
  return string;
};

module.exports = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      timestamp: () => Date.now(),
      formatter,
    }),
  ],
  level: 'info',
});
