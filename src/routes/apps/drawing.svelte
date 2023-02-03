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

      const backgroundURL = '';

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
       await p.show(file.url);
       saveCanvas.width(IMAGE_BASE_SIZE * frames);
       saveCanvas.height(IMAGE_BASE_SIZE);
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

        console.log('frameBuffer', frameBuffer[currentFrame - 1]);
      }

      function saveHandler(image, done) {
        swapFrame();
        // console.log('changes done', image.operationsDone);
        // changes = image.operationsDone;
        // data = image.asDataURL();
        // console.log('changes', changes);
        // const background = document.getElementsByClassName('ptro-substrate').style.backgroundImage = 'url("https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fcomic-news.com%2Fwp-content%2Fuploads%2F2017%2F04%2F20-2.jpg&f=1&nofb=1&ipt=2c119e0f51ac114f36faa6dce28b5e44a4ab29368199f1fa7f962013fdf7dea1&ipo=images")!important';
        // console.log(background);
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
        console.log(p);
      }



    </script>
	  <slot name="stopmotion"></slot>
    <canvas bind:this="{saveCanvas}" class="saveCanvas" ></canvas>

    <div id= 'canvasContainer' />


    // putimageoncanvas is voor het opslaan van de afbeelding in de savecanvas

