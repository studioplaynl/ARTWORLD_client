import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import replace from '@rollup/plugin-replace';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: path.resolve(__dirname, 'public'), // output to public folder
    emptyOutDir: false, // don't delete existing files
  },
  resolve: {
    alias: {
      'svelte-icons': path.resolve(__dirname, 'node_modules/svelte-icons')
    }
  },
  plugins: [
    svelte(),
    replace({
      preventAssignment: true,
      'typeof CANVAS_RENDERER': "'true'",
      'typeof WEBGL_RENDERER': "'true'",
      'typeof EXPERIMENTAL': "'true'",
      'typeof PLUGIN_CAMERA3D': "'false'",
      'typeof PLUGIN_FBINSTANT': "'false'",
      'typeof FEATURE_SOUND': "'true'",
    }),
  ],
  define: {
    __LOADER_TIMEOUT__: 1000  // set the timeout for the reload button in dev mode
  },
});
