    <script>
      import Painter from 'spainter';
      import { onMount } from 'svelte';
      // import 'spainter/index.sass'; // you can import index.css if you don't have sass, ensure that you copy the fonts from the directory as well to production. Set `$FontelloPath: "../node_modules/spainter/font"`
      import { LoggerFactory } from 'lines-logger';
 // yarn install lines-logger
      let containerPainter;
      onMount(() => {
        const p = new Painter(containerPainter, { logger: new LoggerFactory().getLogger('spainter') });
      });
    </script>

    <div id="container" bind:this="{containerPainter}"></div>

<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/spainter@1.2.10/index.css"/>

