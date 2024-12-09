import APP_VERSION from './version_dev';
import { dlog } from './helpers/debugLog';

dlog('APP_VERSION_INFO: ', APP_VERSION);

import App from './App.svelte';

const app = new App({ target: document.body });

// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/service-worker.js')
//       .then(registration => {
//         console.log('ServiceWorker registration successful: ', registration);
//       })
//       .catch(err => {
//         console.log('ServiceWorker registration failed: ', err);
//       });
//   });
// }

export default app;
