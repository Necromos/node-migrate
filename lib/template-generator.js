const path = require('path');
const fs = require('fs');
const slug = require('slug');
const formatDate = require('dateformat');
const mkdirp = require('mkdirp');

let _templateCache = {}
const loadTemplate = (tmpl, cb) => {
  if (_templateCache[tmpl]) return cb(null, _templateCache);
  fs.readFile(
    tmpl,
    { encoding: 'utf8' },
    (err, content) => {
      if (err) return cb(err);
      _templateCache[tmpl] = content;
      cb(null, content);
    }
  );
};


module.exports = (opts = {}, cb) => {
  const { name, extension, dateFormat } = opts;
  const templateFile = opts.templateFile || path.join(__dirname, 'template.js')
  const migrationsDirectory = opts.migrationsDirectory || 'migrations'

  loadTemplate(templateFile, (err, template) => {
    if (err) return cb(err);

    // Ensure migrations directory exists
    mkdirp(migrationsDirectory, (err) => {
      if (err) return cb(err);

      // Create date string
      const formattedDate = dateFormat ? formatDate(new Date(), dateFormat) : Date.now();

      // Fix up file path
      const fixedFilePath = path.join(
        process.cwd(),
        migrationsDirectory,
        `${slug(formattedDate + (name ? `-${name}` : ''))}${extension}`
      );

      // Write the template file
      fs.writeFile(fixedFilePath, template, (err) => {
        if (err) return cb(err);
        cb(null, fixedFilePath);
      });
    });
  });
};
