var _ = require('lodash');
var winston = require('winston');

var CLF_MONTH = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

var pad2 = (num) => {
  var str = String(num);

  return (str.length === 1 ? '0' : '') + str;
};

var clfdate = (dateTime) => {
  var date = dateTime.getUTCDate();
  var hour = dateTime.getUTCHours();
  var mins = dateTime.getUTCMinutes();
  var secs = dateTime.getUTCSeconds();
  var year = dateTime.getUTCFullYear();

  var month = CLF_MONTH[dateTime.getUTCMonth()];

  return `[${pad2(date)}/${month}/${year}:${pad2(hour)}:${pad2(mins)}:${pad2(secs)} +0000]`;
};

var formatMeta = (meta) => {
  if (meta) return ` ${JSON.stringify(meta)}`;
  return ' ---';
};

var formatter = (options) => {
  var string = '';
  string += clfdate(new Date(options.timestamp()));
  string += ' ';
  string += 'DRY RUN RESULT:';
  string += ' ';
  string += options.message ? options.message : '';
  if (options.meta) string += formatMeta(options.meta);
  return string;
};

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      timestamp: () => Date.now(),
      formatter,
    }),
  ],
  level: 'info',
});

module.exports = logger;
