import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import replace from '@rollup/plugin-replace';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
	  svelte(),
		replace({
			'preventAssignment': true,
          	'typeof CANVAS_RENDERER': "'true'",
          	'typeof WEBGL_RENDERER': "'true'",
       	 	'typeof EXPERIMENTAL': "'true'",
         	'typeof PLUGIN_CAMERA3D': "'false'",
         	'typeof PLUGIN_FBINSTANT': "'false'",
         	'typeof FEATURE_SOUND': "'true'"
           }),
  ],
});