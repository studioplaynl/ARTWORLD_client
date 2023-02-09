<script>
  import Painterro from 'painterro/build/painterro.umd';
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { IMAGE_BASE_SIZE, STOPMOTION_BASE_SIZE } from '../../constants';

  const dispatch = createEventDispatcher();

  export let file; // file is currentFile in the appLoader (synced)
  export let data;
  export let thumb;
  export let changes = 0;
  // change artwork name
  export let displayName;
  // In order to allow for multi-frames (stopmotion), we need to expose these values
  export let frames = 1;
  export let frameBuffer = [];
  export let currentFrame = 1;
  export let stopMotion = false;
  let saveCanvas;

  // $: { console.log('file: ', file); }
let painterroDefaultSize = IMAGE_BASE_SIZE;
if (stopMotion === true) {
  painterroDefaultSize = STOPMOTION_BASE_SIZE;
}
  const options = {
    id: 'canvasContainer',
    defaultTool: 'brush',
    backgroundFillColorAlpha: 1,
    defaultSize: `${painterroDefaultSize}x${painterroDefaultSize}`,
    language: 'nl',
    hiddenTools: ['resize',
      'crop', 'close', 'arrow', 'text', 'rotate', 'save', 'open', 'pixelize', 'select', 'settings'],
    how_to_paste_actions: 'replace_all',
    activeColor: '#ff0000',
    activeColorAlpha: 1.0,
    activeFillColor: '#ff0000',
    defaultPrimitiveShadowOn: false,
    fixMobilePageReloader: true,
    buttonSizePx: 44,
    onImageLoaded,
    onChange,
  };
  let p;


  onMount(async () => {
    p = Painterro(options);
    p.show();
  });

  function onImageLoaded() {
    p.doScale({ width: painterroDefaultSize });
    changes = 0;
  }

  function onChange(image) {
    changes++;
    console.log(frameBuffer);
    if (stopMotion) {
      frameBuffer[currentFrame - 1] = image.image.asDataURL();
    } else {
      data = image.image.asDataURL();
    }
  }




  // gets executed inside appLoader
  export async function stopmotionSaveHandler() {
    // set dimensions of savecanvas
    saveCanvas.height = painterroDefaultSize;
    saveCanvas.width = painterroDefaultSize * frames;

    await new Promise((resolve, reject) => {
      let loaded = 0;
      // framebuffer contains all frames in an array
      frameBuffer.forEach((frame, i) => {
        const position = i * painterroDefaultSize;
        // create image holder
        const img = new window.Image();
        // after image is placed in holder
        img.addEventListener('load', async () => {
          await saveCanvas.getContext('2d').drawImage(img, position, 0);
          loaded++;
          // after all images are loaded, resolve
          if (loaded === frameBuffer.length) resolve();
        });
        // load image in holder
        img.setAttribute('src', frame);
      });
    }).then(() => {
      data = saveCanvas.toDataURL('image/png');
      console.log('saved');
      return data;
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

