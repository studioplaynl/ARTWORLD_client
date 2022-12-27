    <script>
     import Painterro from 'painterro/build/painterro.umd';
     import { createEventDispatcher, onMount } from 'svelte';

       const dispatch = createEventDispatcher();

     export let file;
      export let data;
      export let thumb;
      export let changes;


      const options = {
        id: 'canvasContainer',
        defaultTool: 'brush',
        backgroundFillColorAlpha: 0,
        saveHandler,
      };


     onMount(() => {
       Painterro(options).show(file.url);
     });


      function saveHandler(image, done) {
        const img = image.asDataURL();
        dispatch('save', img);
        console.log('saved', img);
      }


    </script>

    <div id= 'canvasContainer' />
