import { APP_VERSION_INFO } from './constants';
import { dlog } from './helpers/debugLog';

dlog('APP_VERSION_INFO: ', APP_VERSION_INFO);

import App from './App.svelte';

const app = new App({ target: document.body });

export default app;
