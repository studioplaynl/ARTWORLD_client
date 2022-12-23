<script>
  import Konva from 'konva';
  import { IMAGE_BASE_SIZE, STOPMOTION_BASE_SIZE } from '../../constants';
  
  let baseSize = IMAGE_BASE_SIZE;
  let innerHeight;
  let innerWidth;
  let canvasWidth;
  let canvasHeight;
  let scaleRatio;

  let canvasEl;
  let canvas;
  let cursorCanvasEl;
  let cursorCanvas;
  const canvasClipperArray = []; // bugfixing
  let eraseBrush;
  let mouseCursor;
  let drawingClipboard;
  let lineWidth = 25;
  let drawingColor = '#000000';
  let currentTab = null;
  let showOptionbox = false;
  // declaring the variable to be available globally, onMount assinging a function to it
  let applyBrush;
  let selectedBrush = 'Pencil'; // by default the Pencil is chosen

  // $: {
  //   if (stopMotion) baseSize = STOPMOTION_BASE_SIZE;
  // }

      // first we need Konva core things: stage and layer
      var stage = new Konva.Stage({
        container: 'container',
        width: baseSize,
        height: baseSize,
      });

      var layer = new Konva.Layer();
      stage.add(layer);

      // then we are going to draw into special canvas element
      canvas.width = stage.width();
      canvas.height = stage.height();

      // created canvas we can add to layer as "Konva.Image" element
      var image = new Konva.Image({
        image: canvas,
        x: 0,
        y: 0,
      });
      layer.add(image);

      // Good. Now we need to get access to context element
      var context = canvas.getContext('2d');
      context.strokeStyle = '#df4b26';
      context.lineJoin = 'round';
      context.lineWidth = 5;

      var isPaint = false;
      var lastPointerPosition;
      var mode = 'brush';

      // now we need to bind some events
      // we need to start drawing on mousedown
      // and stop drawing on mouseup
      image.on('mousedown touchstart', function () {
        isPaint = true;
        lastPointerPosition = stage.getPointerPosition();
      });

      // will it be better to listen move/end events on the window?

      stage.on('mouseup touchend', function () {
        isPaint = false;
      });

      // and core function - drawing
      stage.on('mousemove touchmove', function () {
        if (!isPaint) {
          return;
        }

        if (mode === 'brush') {
          context.globalCompositeOperation = 'source-over';
        }
        if (mode === 'eraser') {
          context.globalCompositeOperation = 'destination-out';
        }
        context.beginPath();

        var localPos = {
          x: lastPointerPosition.x - image.x(),
          y: lastPointerPosition.y - image.y(),
        };
        context.moveTo(localPos.x, localPos.y);
        var pos = stage.getPointerPosition();
        localPos = {
          x: pos.x - image.x(),
          y: pos.y - image.y(),
        };
        context.lineTo(localPos.x, localPos.y);
        context.closePath();
        context.stroke();

        lastPointerPosition = pos;
        // redraw manually
        layer.batchDraw();
      });

      // var select = document.getElementById('tool');
      // select.addEventListener('change', function () {
      //   mode = select.value;
      // });


</script>

<svelte:window bind:innerHeight bind:innerWidth on:keydown="{handleKeydown}" />

<div class="drawing-app">
  <div class="main-container">
    <div
      class="canvas-frame-container"
      style="width: {canvasHeight}px; height: {canvasHeight}px; "
    >
      {#if enableOnionSkinning}
        <div
          class="canvas-onion"
          style="
            background-image: url({data});
            left: -{canvasHeight *
            (currentFrame - 2)}px;"
        ></div>
      {/if}
      <div
        class="canvas-box"
        style="
          left: -{canvasHeight *
          (currentFrame - 1)}px;
          pointer-events: {enableEditor
            ? 'all'
            : 'none'};
          "
      >
        <canvas bind:this="{canvas}" class="canvas"> </canvas>

        <!-- <canvas
          bind:this="{cursorCanvasEl}"
          class="cursor-canvas"
          style:visibility="{enableEditor ? 'visible' : 'hidden'}"
        >
        </canvas> -->
      </div>
    </div>
    <!-- This is where the stopmotion controls get injected, but only if the slot gets used.. -->
    {#if $$slots.stopmotion}
      <div
        class="stopmotion-controls"
        style=" height: {controlsHeight};
              width: {controlsWidth};"
      >
        <slot name="stopmotion" />
      </div>
    {/if}
  </div>
  {#if enableEditor}
    <div class="optionbox-container" class:open="{showOptionbox}">
      <div class="optionbox">
        <div class="optionbar">
          {#if currentTab === 'draw'}
            <div class="tab tab--draw">
              <div class="drawing-options-container">
                <img
                  on:click="{() => applyBrush('Pencil')}"
                  class="icon"
                  class:selected="{selectedBrush === 'Pencil'}"
                  src="assets/svg/drawing_pencil2.svg"
                  alt="Draw with pencil"
                />
                <img
                  on:click="{() => applyBrush('Circle')}"
                  class="icon"
                  class:selected="{selectedBrush === 'Circle'}"
                  src="assets/svg/drawing_circle2.svg"
                  alt="Paint dots"
                />
                <img
                  on:click="{() => applyBrush('Spray')}"
                  class="icon"
                  class:selected="{selectedBrush === 'Spray'}"
                  src="assets/svg/drawing_spray.svg"
                  alt="Paint with spraycan"
                />
                <img
                  on:click="{() => applyBrush('Pattern')}"
                  class="icon"
                  class:selected="{selectedBrush === 'Pattern'}"
                  src="assets/svg/drawing_pattern.svg"
                  alt="Use pattern"
                />
              </div>

              <input
                type="color"
                bind:value="{drawingColor}"
                id="drawing-color"
                title="Pick drawing color"
              />

              <div class="range-container">
                <div class="circle-box-small"></div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  id="drawing-line-width"
                  title="Set drawing thickness"
                  bind:value="{lineWidth}"
                />
                <div class="circle-box-big"></div>
              </div>
            </div>
          {:else if currentTab === 'erase'}
            <div class="tab tab--erase">
              <div class="range-container">
                <div class="circle-box-small"></div>

                <input
                  type="range"
                  min="10"
                  max="500"
                  id="erase-line-width"
                  bind:value="{lineWidth}"
                />
                <div class="circle-box-big"></div>
              </div>
            </div>
          {:else if currentTab === 'select'}
            <div class="tab tab--select">
              <button on:click="{Copy}">
                <img
                  class="icon"
                  src="assets/SHB/svg/AW-icon-copy.svg"
                  alt="Copy selection"
                />
              </button>
              <button on:click="{Paste}">
                <img
                  class="icon"
                  src="assets/SHB/svg/AW-icon-paste.svg"
                  alt="Paste selection"
                />
              </button>
              <button on:click="{Delete}">
                <img
                  class="icon"
                  src="assets/SHB/svg/AW-icon-trash.svg"
                  alt="Delete selection"
                />
              </button>
            </div>
          {:else if currentTab === 'save'}
            <div class="tab  tab--save">
              <!-- <p on:click="{save}">Save this file</p> -->
              <img
                  on:click={downloadImage}
                  class="icon"
                  src="assets/SHB/svg/AW-icon-save.svg"
                  alt="Download Artwork"
                />
            </div>
          {/if}
        </div>

        <div class="iconbox">
          <button on:click="{undoState}" disabled="{$pastStates.length < 1}">
            <img
              class="icon"
              src="assets/SHB/svg/AW-icon-rotate-CCW.svg"
              alt="Undo"
            />
          </button>
          <button
            on:click="{redoState}"
            disabled="{$futureStates.length === 0}"
          >
            <img
              class="icon"
              src="assets/SHB/svg/AW-icon-rotate-CW.svg"
              alt="Redo"
            />
          </button>
          <button
            id="drawing-mode"
            on:click="{() => {
              switchMode('draw');
              applyBrush();
            }}"
            class:currentSelected="{currentTab === 'draw' ||
              currentTab === null}"
          >
            <img class="icon" src="assets/SHB/svg/AW-icon-pen.svg" alt="Draw" />
          </button>
          <!-- bind:this="{eraseModeEl}" -->
          <button
            on:click="{() => switchMode('erase')}"
            id="erase-mode"
            class:currentSelected="{currentTab === 'erase'}"
          >
            <img
              class="icon"
              src="assets/SHB/svg/AW-icon-erase.svg"
              alt="Erase"
            />
          </button>
          <!-- <button
            class="icon"
            id="fill-mode"
            class:currentSelected="{current === 'fill'}"
          >
            <BucketIcon />
          </button> -->

          <button
            id="select-mode"
            on:click="{() => switchMode('select')}"
            class:currentSelected="{currentTab === 'select'}"
          >
            <img
              class="icon"
              src="assets/SHB/svg/AW-icon-pointer.svg"
              alt="Select"
            />
          </button>

          <!-- <button id="clear-canvas" class="btn btn-info icon">
            <TrashIcon />
          </button> -->

          <button
            class:currentSelected="{currentTab === 'save'}"
            on:click="{() => {
              switchMode('save');
            }}"
          >
            <img
              class="icon"
              src="assets/SHB/svg/AW-icon-save.svg"
              alt="Save"
            />
          </button>
        </div>
      </div>
    </div>
  {/if}
  {#if enableEditor}
    <div id="clear-canvas" on:click="{clearCanvas}">
      <img src="assets/SHB/svg/AW-icon-reset.svg" alt="Clear canvas" />
    </div>
  {/if}
</div>

<style>
  * {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .drawing-app {
    position: relative;
  }
  .main-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    height: 100vh;
    width: 100vw;
    background-color: rgb(115, 0, 237, 0.15);
  }

  .cursor-canvas {
    pointer-events: none !important;
    width: 100vw;
    height: 100vw;
    margin: 0px;
    position: absolute;
    user-select: none;
    top: 0px;
    left: 0px;
    pointer-events: none;
  }

  .selected {
    box-shadow: 3px 3px #7300ed;
  }

  .optionbox-container {
    margin: 0 10px 0 0;
    position: fixed;
    left: 0;
    bottom: 0;
    height: 100%;
    transition: transform 200ms ease-in-out;
    display: flex;
  }

  .optionbox-container.open {
    transform: translateX(280px);
  }

  .optionbar {
    border-right: 2px solid #7300ed;
    height: 100vh;
    background-color: white;
    width: fit-content;
    padding: 15px;
    width: 280px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    flex-wrap: wrap;
    position: absolute;
    top: 0;
    right: 50px;
  }

  .tab.tab--draw {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .tab.tab--erase {
  }

  .tab.tab--save {
    min-width: 160px;
    bottom: 50px;
    z-index: 1;
  }

  .tab.tab--save > * {
    padding: 0px 0px;
    text-decoration: none;
    display: block;
  }
  .iconbox {
    width: 50px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    flex-wrap: wrap;
    /* transition: all 0.5s ease-in-out; */
  }

  .icon {
    min-width: 50px;
    height: 50px;
    border-radius: 50%;
    padding: 8px;
    cursor: pointer;
    object-fit: contain;
    /* margin: 0 4px 0 4px; */
    /* outline: 1px solid #7300ed2e; */
  }
  .iconbox button {
    opacity: 1;
  }

  #drawing-color {
    padding: 0px;
    display: block;
    margin: 16px auto;
  }

  .optionbox {
    width: fit-content;
    display: flex;
  }

  .currentSelected {
    box-shadow: 0px 4px #7300ed;
    border-radius: 0% 50% 50% 0;
    height: 60px;
    display: block;
    width: 49px;
    padding: 0px;
    background-color: white;
    margin-left: -5px;
  }

  .range-container {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
  }

  .circle-box-small {
    border: solid 2px black;
    border-radius: 50%;
    padding: 5px;
  }

  .circle-box-big {
    border: solid 2px black;
    border-radius: 50%;
    padding: 10px;
  }

  input[type='range'] {
    -webkit-appearance: none;
    -moz-apperance: none;
    border-radius: 6px;
    border: 4px solid #7300ed;
    height: 4px;
    margin: 0 10px;
  }

  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none !important;
    background-color: black;
    border: 1px solid black;
    border-radius: 50%;
    height: 15px;
    width: 15px;
  }

  /* .colorIcon {
    width: 32px;
    position: absolute;
    right: 5px;
    bottom: 5px;
  } */

  .canvas-frame-container {
    background-color: white;
    /* border: 2px solid #7300ed; */
    position: relative;
    overflow: hidden;
    box-shadow: 5px 5px 0px #7300ed;
  }

  .canvas-box {
    position: relative;
  }

  .canvas-onion {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.2;
    background-size: cover;
  }

  .stopmotion-controls {
    position: relative;
    background-color: #e0c1ff;
    overflow: hidden;
    padding: 4px;
    box-shadow: 5px 5px 0px #7300ed;
  }

  #clear-canvas {
    position: fixed;
    left: 72px;
    top: 16px;
    z-index: 13;
    box-shadow: 5px 5px 0px #7300ed;
    cursor: pointer;
    padding: 0;
    margin: 0;
    border-radius: 50%;
    width: 40px;
    height: 40px;
  }

  #clear-canvas > img {
    width: 40px;
  }

  @media only screen and (min-width: 600px) and (max-width: 1024px) and (min-aspect-ratio: 3/2) {
    .iconbox {
      justify-content: flex-end;
    }
  }

  /* @media only screen and (min-width: 300px) and (max-width: 500px) {
    .iconbox {
      justify-content: flex-start;
    }
  } */

  .drawing-options-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }

  /* small */
  @media only screen and (max-width: 600px) {
    .main-container {
      flex-direction: column;
    }
    .optionbox-container {
      left: 0;
      bottom: -220px;
      width: 100%;
      height: 280px;
      transform: translateY(0);
    }

    .optionbox-container.open {
      transform: translateY(-220px);
    }
    .optionbox {
      flex-direction: row;
      width: 100%;
    }

    .optionbar {
      height: 220px;
      width: 100%;
      top: unset;
      left: 0;
      right: 0;
      bottom: 0;
      box-shadow: 4px 4px #7300ed;
      z-index: 2;
    }

    .iconbox {
      flex-direction: row;
      width: 100%;
      height: 60px;
      z-index: 1;
    }

    .currentSelected {
      box-shadow: 4px 4px #7300ed;
      border-radius: 50% 50% 0 0;
      height: 60px;
      display: block;
      width: 49px;
      padding: 0px;
      background-color: white;
      margin-left: -5px;
    }
  }

  /* small */
  /* @media only screen and (max-width: 600px) {
    .optionbox {
      width: 100%;
      height: min-content;
      position: fixed;
      bottom: 0;
      display: block;
    }

    .optionbar {
      margin: 0;
      border-right: none;
      border-top: 2px solid #7300ed;
      box-shadow: 0px -5px 5px 0px #7300ed;
      height: min-content;
      width: 100%;
      padding: 0px;

      transform-origin: bottom center;
      position: sticky;
      z-index: 40;
      align-items: center;
    }

    .optionbar > * {
      margin: 16px 16px 16px 0;
    }




    .optionbox-container {
      position: fixed;
      -ms-transform: initial;
      transform: initial;
    }

    .currentSelected {
      display: inline;
      border-radius: 50%;
      height: 49px;
      width: 49px;
    }

    .iconbox {
      width: max-content;
      height: min-content;
      display: block;
      margin: 0 auto;
    }

    .currentSelected > img {
      border: 2px solid #7300ed;
    }
    .currentSelected {
      box-shadow: unset;
    }

  } */

  button {
    border: 0;
    background: transparent;
    cursor: pointer;
    border-radius: 0;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    display: inline-block;
    width: auto;
    transform-origin: center;
    transform: scale(1);
    padding: 0;
    margin: 0;
  }

  button[disabled],
  button:disabled {
    opacity: 0.3;
  }
</style>
