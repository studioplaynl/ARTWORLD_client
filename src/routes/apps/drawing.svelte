<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { writable } from 'svelte/store';

  // Important: keep the eslint comment below intact!
  // eslint-disable-next-line import/no-relative-packages
  import { fabric } from './fabric/dist/fabric';
  import {
    setLoader,
  } from '../../api';
  import { Error } from '../../session';
  import { IMAGE_BASE_SIZE, STOPMOTION_BASE_SIZE } from '../../constants';
  // import NameGenerator from '../components/nameGenerator.svelte';
  import { CurrentFileInfo } from '../../storage';
  import { hasSpecialCharacter, removeSpecialCharacters } from '../../validations';

  export let file;
  export let data;
  export let thumb;
  export let changes;

  // change artwork name
  let displayName;
  let currentFile;

  //! currentFile bug
  // subscribe to CurrentFileInfo via the appLoader, where artworks are loaded
CurrentFileInfo.subscribe((value) => {
  console.log('CurrentFileInfo.subscribe( value', value);
  if (typeof value !== 'undefined') {
    currentFile = value;
    // if the artwork was loaded: value.value.displayname
    // if the artwork is new: value.displayName
    if (value.value == null) {
      displayName = value.displayName;
    } else {
      displayName = value.value.displayname;
    }

    //
  }
});
  //!

  // In order to allow for multi-frames (stopmotion), we need to expose these values
  export let frames = 1;
  export let currentFrame = 1;
  export let stopMotion = false;

  let baseSize = IMAGE_BASE_SIZE;
  $: { // when the currenFrame changes, clear the canvas
    if (canvas) {
      canvas.clear();
      getCroppedImageFromSaveCanvas(canvas, currentFrame);
    }
  }

  $: {
    if (stopMotion) baseSize = STOPMOTION_BASE_SIZE;
  }

  // //! currentFile bug
  $: {
    if (displayName) {
      console.log('displayName, ', displayName);
      console.log('currentFile', currentFile);
      const tempInfo = currentFile;

      // if the artwork was loaded: value.value.displayname
      // if the artwork is new: value.displayName
      if (tempInfo.value == null) {
        tempInfo.displayName = displayName;
      } else {
        tempInfo.value.displayname = displayName;
      }
      // tempInfo.value.displayname = displayName;
      console.log('tempInfo', tempInfo);
      CurrentFileInfo.set(tempInfo);
    }
  }
  //! currentFile bug

  // remove forbidden characters from displayname
  $: if (hasSpecialCharacter(displayName)) displayName = removeSpecialCharacters(displayName);

  // In order to hide editor functions when previewing stopmotion
  export let enableEditor = true;
  export let enableOnionSkinning = false;

  const cursorOpacity = 0.5;
  const dispatch = createEventDispatcher();

  const state = writable({});
  const pastStates = writable([]);
  const futureStates = writable([]);

  // Let appLoader keep track of nr of changes
  $: {
    changes = $pastStates.length;
  }

  // Window size, canvas size
  let innerHeight;
  let innerWidth;
  let canvasHeight;
  let scaleRatio;

  $: windowRatio = innerWidth / innerHeight;
  $: canvasSize = innerWidth > innerHeight ? innerHeight : innerWidth;

  $: controlsHeight = innerWidth > 600 ? `${canvasHeight}px` : 'auto';
  $: controlsWidth = innerWidth <= 600 ? `${canvasHeight}px` : 'auto';

  /** Delete all content from a single frame
   * @maybe this belongs inside Stopmotion app instead..
   */
  export function deleteFrame(deleteableFrame) {
    const objects = canvas.getObjects();

    // Find and remove all objects with the required frameNumber attribute
    objects
      .filter((obj) => obj.frameNumber === deleteableFrame)
      .forEach((obj) => {
        canvas.remove(obj);
      });

    // Select all content to the right of the frame, and move over by –canvasWidth px
    objects
      .filter((obj) => obj.frameNumber > deleteableFrame)
      .forEach((obj) => {
        // eslint-disable-next-line no-param-reassign
        obj.left -= canvasHeight / scaleRatio;
      });

    // Emit event that deletion is done
    dispatch('frameContentDeleted');

    // Finally update data
    updateExportedImages();
  }

  $: {
    // Respond to changes in window size
    if (innerWidth && innerHeight) {
      let canvasEdge = 240;

      // Mobile landscape
      if (innerWidth <= 600 && windowRatio <= 0.8) {
        canvasEdge = 32;
      }
      // Mobile portrait
      if (innerHeight <= 600 && windowRatio >= 1.5) {
        canvasEdge = 32;
      }

      // here canvas size on screen is set
      // canvasWidth = (canvasSize * frames - canvasEdge);
      canvasHeight = (canvasSize - canvasEdge);
      canvas.setWidth(canvasHeight);
      canvas.setHeight(canvasHeight); // keep the drawing Canvas square

      saveCanvas.setWidth(baseSize * frames);
      saveCanvas.setHeight(baseSize);
      cursorCanvas.setWidth(canvasHeight);
      cursorCanvas.setHeight(canvasHeight); // keep the cursorCanvas square

      // for correct and adapted scaling of the preexisting artworks
      scaleRatio = Math.min(
        (canvas.width * frames) / baseSize,
        canvas.height / baseSize,
      );
      cursorCanvas.setZoom(scaleRatio);
      // saveCanvas.setZoom(scaleRatio * 0.3);
      canvas.setZoom(scaleRatio);

      // Finally update 'data' object immediately
      updateExportedImages();
    }
  }

  // DOM ELements etc
  let canvasEl;
  let canvas;
  let saveCanvas;
  let saveCanvasEl;
  let cursorCanvasEl;
  let cursorCanvas;
  let eraseBrush;
  let mouseCursor;
  // let drawingClipboard;
  let lineWidth = 25;
  let drawingColor = '#000000';
  let currentTab = null;
  let showOptionbox = false;

  // declaring the variable to be available globally, onMount assinging a function to it
  let applyBrush;
  let selectedBrush = 'Pencil'; // by default the Pencil is chosen

  // Reactive function: update Fabric brush according to UI state
  $: {
    if (canvas) {
      const brush = canvas.freeDrawingBrush;
      brush.color = drawingColor;
      brush.width = parseInt(lineWidth, 10) || 1;
      if (brush.getPatternSrc) {
        brush.source = brush.getPatternSrc.call(brush);
      }

      const bigint = parseInt(drawingColor.replace('#', ''), 16);

      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;

      mouseCursor
        .set({
          radius: brush.width / 2,
          fill: `rgba(${[r, g, b, cursorOpacity].join(',')})`,
        })
        .setCoords()
        .canvas.renderAll();
    }
  }

  // eslint-disable-next-line consistent-return
  onMount(() => {
    setLoader(true);

    // canvas should be setup on default size, later resized to fit screen
    // Set up Canvases
    cursorCanvas = new fabric.StaticCanvas(cursorCanvasEl);
    cursorCanvas.set('width', baseSize);
    cursorCanvas.set('height', baseSize);

    canvas = new fabric.Canvas(canvasEl, {
      isDrawingMode: true,
    });
    canvas.set('width', baseSize);
    canvas.set('height', baseSize);

    saveCanvas = new fabric.StaticCanvas(saveCanvasEl, {
    });
    saveCanvas.set('width', baseSize);
    saveCanvas.set('height', baseSize);

    eraseBrush = new fabric.EraserBrush(canvas);

    // Set frameNumber on object, to refer to when deleting frames
    canvas.on('path:created', () => {
      const idx = canvas.getObjects().length - 1;
      canvas.item(idx).frameNumber = currentFrame;
      canvas.renderAll();
      pushDrawingCanvasToSaveCanvas(canvas, currentFrame);
    });

    fabric.Object.prototype.transparentCorners = false;

    // mouse cursor layer
    // create cursor and place it off screen
    mouseCursor = new fabric.Circle({
      left: -100,
      top: -100,
      radius: canvas.freeDrawingBrush.width / 2,
      fill: `rgba(0,0,0,${cursorOpacity})`,
      stroke: 'black',
      originX: 'center',
      originY: 'center',
    });

    cursorCanvas.add(mouseCursor);

    // redraw cursor on new mouse position when moved
    // eslint-disable-next-line func-names
    canvas.on('mouse:move', function (evt) {
      if (currentTab === 'select') {
        return mouseCursor
          .set({ top: -100, left: -100 })
          .setCoords()
          .canvas.renderAll();
      }
      const mouse = this.getPointer(evt.e);

      return mouseCursor
        .set({
          top: mouse.y,
          left: mouse.x,
        })
        .setCoords()
        .canvas.renderAll();
    });

    // TODO @chip Figure out the best event to listen to (maybe multiple events?) in order to trigger a saveState()?
    // Set up Fabric Canvas interaction listeners
    // canvas.on('object:modified', () => {
    canvas.on('mouse:up', () => {
      saveState();
    });

    applyBrush = (brushType) => {
      if (typeof brushType === 'string') selectedBrush = brushType;
      canvas.freeDrawingBrush = new fabric[`${selectedBrush}Brush`](canvas);
      if (canvas.freeDrawingBrush) {
        const brush = canvas.freeDrawingBrush;
        brush.color = drawingColor;
        if (brush.getPatternSrc) {
          brush.source = brush.getPatternSrc.call(brush);
        }
        brush.width = parseInt(lineWidth, 10) || 1;
      }
    };

    // Was there an image to load? Do so
    if (file?.url) {
      putImageOnCanvas(file.url)
        .then(() => {
          updateExportedImages();
        })
        .catch(() => {
          Error.set(`Failed loading drawing from server: ${file.url}`);
        })
        .finally(() => {
          setLoader(false);
        });
    } else {
      setLoader(false);
    }
  });

  // Save state locally
  async function saveState() {
    // Clear futureStates (should be empty after each new edit..)
    futureStates.set([]);

    // If $state is existing, add it to pastStates
    if (
      ($state && $pastStates.length === 0) ||
      ($pastStates.length > 0 && $state !== $pastStates[$pastStates.length - 1])
    ) {
      // pastStates.update((states) => [...states, $state]); //working code
      pastStates.update(() => [$state]); // to make changes work, but there is only the last line as state
    }

    const json = canvas.toJSON();
    if (json) {
      state.set(json);
      // TODO MAYBE: If required, we could add a save to localStorage here.
      // Make sure to clear the localStorage in the save() function and apply it in onMount (if valid)

      // Set the data object (so the AppLoader can save it to server if required)
      // FIXME? Somehow this requires a timeout, as calling it directly clears the canvas?!
      // updateExportedImages();
    }
  }

  function updateExportedImages() {
    setTimeout(() => {
      // saveCanvas.setZoom(1);

      data = saveCanvas.toDataURL({
        format: 'png',
        height: baseSize,
        width: baseSize * frames,
      });
      // Small format thumbnail to add to frames
      // saveCanvas.setZoom(scaleRatio);
      thumb = saveCanvas.toDataURL({
        format: 'png',
        multiplier: 0.25,
      });
      // saveCanvas.setZoom(1);
    }, 30);
  }

  // Go back to previous state
  // function undoState() {
  //   // Add current state to futureStates
  //   futureStates.update((states) => [...states, $state]);

  //   // Then revert to last state from pastStates
  //   pastStates.update((past) => {
  //     // Set current state to last in redoStates
  //     state.set(past.pop());
  //     return past;
  //   });

  //   resetCanvasFromState();
  // }

  // Go back to previous reverted state
  // function redoState() {
  //   // Add current state to pastStates
  //   pastStates.update((states) => [...states, $state]);

  //   // Then revert to last state from futureStates
  //   futureStates.update((future) => {
  //     // Set current state to last in futureStates
  //     state.set(future.pop());
  //     return future;
  //   });

  //   resetCanvasFromState();
  // }

  // function resetCanvasFromState() {
  //   if ($state) {
  //     canvas.clear();
  //     canvas.loadFromJSON($state, () => {
  //       canvas.renderAll();
  //       updateExportedImages();
  //     });
  //   }
  // }

  function putImageOnCanvas(imgUrl) {
    return new Promise((resolve, reject) => {
      const imagePromises = [];
      for (let frame = 0; frame < frames; frame++) {
        imagePromises.push(
          new Promise((resolveImage, rejectImage) => {
            fabric.Image.fromURL(
              imgUrl,
              // eslint-disable-next-line no-loop-func
              (image, err) => {
                // image.opacity = 0.5;

                // Step 1: Crop using the loaded image's width'
                const nativeHeight = image.height;
                image.set({
                  cropX: nativeHeight * frame,
                  cropY: 0,
                  width: nativeHeight,
                  height: nativeHeight,
                });

                // Step 2: Scale to canvas dimensions
                image.scaleToHeight(baseSize);

                // Step 3: Put on right spot
                image.set({
                  left: baseSize * frame,
                  top: 0,
                  frameNumber: frame + 1, // Frames in the app are 1-based
                });

                if (err) {
                  rejectImage();
                } else {
                  resolveImage(image);
                }
              },
              { crossOrigin: 'anonymous' },
            );
          }),
        );
      }

      Promise.all(imagePromises)
        .then((images) => {
          images.forEach((image) => {
            // canvas.add(image);
            // eslint-disable-next-line no-param-reassign
            image.frame = 'importedImagePart';
            saveCanvas.add(image);
          });
          updateExportedImages();
          getCroppedImageFromSaveCanvas(canvas);
          resolve();
        })
        .catch(() => {
          reject();
        });
    });
  }

  /// / going from drawing canvas to SaveCanvas FUNCTIONS ////////////////////////////////////////////
function getCroppedImageFromSaveCanvas(ToCanvas) {
  const frameOffset = currentFrame - 1;
  const leftOffset = baseSize * frameOffset;
  // var cropped = new Image();
  const cropped = saveCanvas.toDataURL({
    left: leftOffset,
    top: 0,
    width: baseSize,
    height: baseSize,
  });
  fabric.Image.fromURL(cropped, (img) => {
    ToCanvas.add(img.set({
      left: 0,
      top: 0,
      height: baseSize,
      width: baseSize,
    }));
  }, { crossOrigin: 'anonymous' });
}


function pushDrawingCanvasToSaveCanvas(_fromCanvas) {
  const prevZoom = _fromCanvas.getZoom();
  _fromCanvas.setZoom(1);

  const frameOffset = currentFrame - 1;
  const saveCanvasObjects = saveCanvas.getObjects();
  // remnove all objects with frame: frameNumber
  // that way there is only 1 image layer; the last one
  saveCanvasObjects.forEach((element) => {
    if (element.frameNumber === currentFrame) {
      saveCanvas.remove(element);
    }
  });

  const leftOffset = baseSize * frameOffset;

  const preview = _fromCanvas.toDataURL({
    format: 'png',
    height: baseSize,
    width: baseSize,
  });

  fabric.Image.fromURL(preview, (img) => {
    saveCanvas.add(img.set({
      left: leftOffset,
      top: 0,
      height: baseSize,
      width: baseSize,
      frameNumber: currentFrame,
    }));
  }, { crossOrigin: 'anonymous' });
  // show how many objects there are in canvas3
  // const canvasObjects = saveCanvas.getObjects();
  // console.log('canvasObjects', canvasObjects);
  _fromCanvas.setZoom(prevZoom);
  updateExportedImages();
  // return preview;
}
/// / end going from drawing canvas to SaveCanvas FUNCTIONS /////////////////////////////////////////////////

  /// ////////////////// select functions /////////////////////////////////
  function handleKeydown(evt) {
    if (evt.key === 'Backspace' || evt.key === 'Delete') {
      Delete();
    }
    // testing out the download function
    // save() = save and close
    if (evt.key === '1') {
      downloadImage();
    }
  }

  function downloadImage() {
    // eerst in de currentFileInfo de waardes veranderen en dan hier verkrijgen
    const filename = `${currentFile.key}_${displayName}.png`;

    data = saveCanvas.toDataURL('image/png', 1);

    const a = document.createElement('a');
    a.href = data;
    a.download = filename;
    // document.body.appendChild(a);
    a.click();
  }

  // function Copy() {
  //   // clone what are you copying since you
  //   // may want copy and paste on different moment.
  //   // and you do not want the changes happened
  //   // later to reflect on the copy.
  //   canvas.getActiveObject().clone((cloned) => {
  //     drawingClipboard = cloned;
  //   });
  // }

  // function Paste() {
  //   // clone again, so you can do multiple copies.
  //   drawingClipboard.clone((clonedObj) => {
  //     canvas.discardActiveObject();
  //     clonedObj.set({
  //       left: clonedObj.left + 10,
  //       top: clonedObj.top + 10,
  //       evented: true,
  //     });
  //     if (clonedObj.type === 'activeSelection') {
  //       // active selection needs a reference to the canvas.
  //       // eslint-disable-next-line no-param-reassign
  //       clonedObj.canvas = canvas;
  //       clonedObj.forEachObject((obj) => {
  //         canvas.add(obj);
  //       });
  //       // this should solve the unselectability
  //       clonedObj.setCoords();
  //     } else {
  //       canvas.add(clonedObj);
  //     }
  //     drawingClipboard.top += 10;
  //     drawingClipboard.left += 10;
  //     canvas.setActiveObject(clonedObj);
  //     canvas.requestRenderAll();
  //   });
  // }

  function Delete() {
    const curSelectedObjects = canvas.getActiveObjects();
    canvas.discardActiveObject();
    for (let i = 0; i < curSelectedObjects.length; i++) {
      canvas.remove(curSelectedObjects[i]);
    }
    updateExportedImages();
  }

  function clearCanvas() {
    canvas.clear();
    saveCanvas.clear();
    dispatch('clearCanvas');
  }

  /// //////////// select functions end //////////////////

  function switchMode(mode) {
    if (currentTab === mode) {
      if (!showOptionbox) {
        showOptionbox = true;
      } else {
        showOptionbox = false;
        currentTab = null;
      }
    } else {
      currentTab = mode;
    }

    switch (mode) {
      case 'draw':
        canvas.isDrawingMode = true;
        break;

      case 'select':
        canvas.isDrawingMode = false;
        break;

      case 'erase':
        canvas.freeDrawingBrush = eraseBrush;
        canvas.freeDrawingBrush.width = parseInt(lineWidth, 10) || 1;
        canvas.isDrawingMode = true;
        break;

      default:
        break;
    }
  }
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
          left: 0px;
          pointer-events: {enableEditor
            ? 'all'
            : 'none'};
          "
      >
        <canvas bind:this="{canvasEl}" class="canvas"> </canvas>

        <canvas
          bind:this="{cursorCanvasEl}"
          class="cursor-canvas"
          style:visibility="{enableEditor ? 'visible' : 'hidden'}"
        ></canvas>
        <canvas hidden bind:this="{saveCanvasEl}" class="saveCanvas" ></canvas>
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
          <!-- {:else if currentTab === 'select'}
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
            </div> -->
          {:else if currentTab === 'save'}
            <div class="tab  tab--save">

      <!-- {#if appType != "avatar" && appType != "house"} -->
              <label for="title">displayName</label>
              <!-- <NameGenerator
                bind:value={displayName}
                bind:invalidTitle
                bind:isTitleChanged
              /> -->
              <input type="text" bind:value="{displayName}" />
              <!-- {#if invalidTitle}
                <p style="color: red">No special characters</p>
              {/if} -->

            <!-- {/if} -->

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
          <!-- <button on:click="{undoState}" disabled="{$pastStates.length < 1}">
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
          </button> -->
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
            id="select-mode"
            on:click="{() => switchMode('select')}"
            class:currentSelected="{currentTab === 'select'}"
          >
            <img
              class="icon"
              src="assets/SHB/svg/AW-icon-pointer.svg"
              alt="Select"
            />
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
  <!-- DISABLED because this is not the desired behaviour:
    we want to save the current drawing/ stopmotion then start a new drawing/ stopmotion -->
  <!-- something along the lines of: saveData(andNew) in the appLoader -->
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

  .saveCanvas{
    /* position: fixed;
    top: 10px;
    left: 500px;
    width: 1024px;
    border: 3px solid #73AD21; */
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

  button:disabled {
    opacity: 0.3;
  }
</style>
