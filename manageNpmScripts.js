import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function setupEnvironment(envFile, svelteFile) {
  const nakamaPath = path.join(__dirname, 'src', 'nakama.svelte');
  const targetSvelteFile = path.join(__dirname, 'src', svelteFile);

  // Delete existing nakama.svelte if it exists
  if (fs.existsSync(nakamaPath)) {
    fs.unlinkSync(nakamaPath);
  }

  // Copy the appropriate svelte file
  fs.copyFileSync(targetSvelteFile, nakamaPath);

  // Set the environment file
  process.env.ENV_FILE = envFile;

  // Only modify the timeout in public/index.html during build
  if (mode === 'build') {
    const publicIndexPath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(publicIndexPath)) {
      let indexContent = fs.readFileSync(publicIndexPath, 'utf8');
      indexContent = indexContent.replace(/__LOADER_TIMEOUT__/g, '25000');
      fs.writeFileSync(publicIndexPath, indexContent);
    }
  }
}

const mode = process.argv[2];

if (mode === 'dev') {
  setupEnvironment('.env', 'nakama_dev.svelte');
} else if (mode === 'build') {
  setupEnvironment('.env.build', 'nakama_production.svelte');
} else {
  console.error('Invalid mode specified. Use "dev" or "build".');
  process.exit(1);
}