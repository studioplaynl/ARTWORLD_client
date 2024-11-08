/* script that runs after the build
 * it sets the timeout for the reload button in the production version
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicIndexPath = path.join(__dirname, 'public', 'index.html');
if (fs.existsSync(publicIndexPath)) {
  let indexContent = fs.readFileSync(publicIndexPath, 'utf8');
  indexContent = indexContent.replace(/"?__LOADER_TIMEOUT__"?/g, 25000);
  fs.writeFileSync(publicIndexPath, indexContent);
} 