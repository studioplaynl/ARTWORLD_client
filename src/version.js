const fs = require('fs');

const months = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DEC'];

const date = new Date().toISOString().substr(0, 10)
  .replace(/-\d{2}-/, (match) => `-${months[Number(match.slice(1, 3)) - 1]}-`);
const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

const version = `#${date} ${time} DEV#`;

// const content = `export const APP_VERSION = '${version}';\n`;
const content = `const APP_VERSION = '${version}';\nexport default APP_VERSION;\n`;


fs.writeFileSync('src/version_dev.js', content);
