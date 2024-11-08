/* script that sets up the environment for the development or production version
 * it also copies the appropriate svelte file to the src folder
 * and sets the timeout for the reload button in the development version
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nakamaPath = path.join(__dirname, 'src', 'nakama.svelte');
const envPath = path.join(__dirname, '.env');

// Clean up existing files
if (fs.existsSync(nakamaPath)) {
  fs.unlinkSync(nakamaPath);
}
if (fs.existsSync(envPath)) {
  fs.unlinkSync(envPath);
}

const mode = process.argv[2];

if (mode === 'dev') {
  // Development mode setup
  const devSvelteFile = path.join(__dirname, 'src', 'nakama_dev.svelte');
  fs.copyFileSync(devSvelteFile, nakamaPath);
  fs.copyFileSync(path.join(__dirname, '.env.dev'), envPath);
  process.env.ENV_FILE = '.env.dev';

} else if (mode === 'build') {
  // Production build setup
  const prodSvelteFile = path.join(__dirname, 'src', 'nakama_production.svelte');
  fs.copyFileSync(prodSvelteFile, nakamaPath);
  fs.copyFileSync(path.join(__dirname, '.env.build'), envPath);
  process.env.ENV_FILE = '.env.build';

} else {
  console.error('Invalid mode specified. Use "dev" or "build".');
  process.exit(1);
}