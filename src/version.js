const fs = require('fs');

const date = new Date().toISOString().substr(0, 10);
const time = new Date().toLocaleTimeString('en-US', { hour12: false });

const version = `#${date} ${time} DEV#`;

const content = `export const APP_VERSION = '${version}';\n`;

fs.writeFileSync('src/version_dev.js', content);
