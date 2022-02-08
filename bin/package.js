const fs = require("fs");
const AdmZip = require("adm-zip");
const slugify = require("slugify");

const manifest = JSON.parse(fs.readFileSync(`${__dirname}/../manifest.json`));

const name = slugify(manifest.name, { strict: true, replacement: "" });
const version = manifest.version.replaceAll(".", "_");

const zip = new AdmZip();

zip.addLocalFolder(`${__dirname}/../dist`);
zip.writeZip(`${__dirname}/../build/${name}-${version}.zip`);
