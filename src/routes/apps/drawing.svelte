    <script>
      import Painterro from 'painterro/build/painterro.umd';
      import { createEventDispatcher, onMount } from 'svelte';
      import { IMAGE_BASE_SIZE, STOPMOTION_BASE_SIZE } from '../../constants';

      const dispatch = createEventDispatcher();

      export let file; // file is currentFile in the appLoader (synced)
      export let data;
      export let thumb;
      export let changes;
      // change artwork name
      export let displayName;
      // In order to allow for multi-frames (stopmotion), we need to expose these values
      export let frames = 1;
      export let frameBuffer = [];
      export let currentFrame = 1;
      export let stopMotion = false;
      let saveCanvas;

      const options = {
        id: 'canvasContainer',
        defaultTool: 'brush',
        backgroundFillColorAlpha: 0,
        defaultSize: `${IMAGE_BASE_SIZE}x${IMAGE_BASE_SIZE}`,
        language: 'nl',
        hiddenTools: ['resize', 'crop', 'close'],
        how_to_paste_actions: 'replace_all',
        saveHandler,
        onImageLoaded,
        onChange,
      };
      let p;


     onMount(async () => {
       p = Painterro(options);
       await p.show(file.url).doScale({ width: IMAGE_BASE_SIZE });
     });

      function onImageLoaded() {
        p.doScale({ width: IMAGE_BASE_SIZE });
      }

      function onChange(image) {
        changes = changes++;
        if (stopMotion) {
          frameBuffer[currentFrame - 1] = image.image.asDataURL();
        } else {
          data = image.image.asDataURL();
        }
      }


      function downloadImage(data, filename = 'untitled.jpeg') {
        const a = document.createElement('a');
        a.href = data;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
      }

      function saveHandler(image, done) {
        console.log('saveCanvas', saveCanvas);
        saveCanvas.width = IMAGE_BASE_SIZE * frames;
        saveCanvas.height = IMAGE_BASE_SIZE;
        console.log('called');








        new Promise((resolve, reject) => {
          let loaded = 0;
          frameBuffer.forEach((frame, i) => {
            const position = i * IMAGE_BASE_SIZE;
            const img = new window.Image();
            img.addEventListener('load', async () => {
              await saveCanvas.getContext('2d').drawImage(img, position, 0);
              loaded++;
              if (loaded === frameBuffer.length) resolve();
            });
            img.setAttribute('src', frame);
          });
        }).then(() => {
          data = saveCanvas.toDataURL('image/png');

          downloadImage(data);

          console.log('saved', data);
        });
      }

       $: { // when the currenFrame changes, clear the canvas
         if (typeof p === 'object') {
           //  p.clear();
           swapFrame(currentFrame - 1);
         }
       }

      export function swapFrame(frame) {
        if (typeof frameBuffer[frame] === 'undefined') p.clear();
        else p.loadImage(frameBuffer[frame]);
      }

      export function deleteFrame(deleteableFrame) {
        currentFrame = deleteableFrame - 1;
        frameBuffer.splice(deleteableFrame - 1, 1);

        dispatch('frameContentDeleted');
        // // Finally update data
        // updateExportedImages();
      }



    </script>
	  <slot name="stopmotion"></slot>
    <canvas bind:this="{saveCanvas}" id="saveCanvas" ></canvas>

    <div id='canvasContainer' />


    // putimageoncanvas is voor het opslaan van de afbeelding in de savecanvas

