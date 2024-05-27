import { writeFileSync } from 'fs';

const months = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MEI',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OKT',
  'NOV',
  'DEC',
];

const date = new Date()
  .toISOString()
  .substr(0, 10)
  .replace(/-\d{2}-/, (match) => `-${months[Number(match.slice(1, 3)) - 1]}-`);
const time = new Date().toLocaleTimeString('en-US', {
  hour12: false,
  hour: '2-digit',
  minute: '2-digit',
});

const version = `#${date} ${time} MAIN#`;

const content = `/** version_dev.js is generated by version.js on 'npm run dev' */
const APP_VERSION = '${version}';\nexport default APP_VERSION;\n`;

writeFileSync('src/version_dev.js', content);
