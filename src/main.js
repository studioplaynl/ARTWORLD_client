import { APP_VERSION } from './version_dev';
import { dlog } from './helpers/debugLog';

dlog('APP_VERSION_INFO: ', APP_VERSION);

import App from './App.svelte';

const app = new App({ target: document.body });

export default app;
