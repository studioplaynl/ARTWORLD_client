<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { get, writable } from 'svelte/store';

  // import '@melloware/coloris/dist/coloris.css';
  // import { coloris, init } from '@melloware/coloris';

  // import ColorPicker from 'svelte-awesome-color-picker';
  // import Picker from 'vanilla-picker';

  // Important: keep the eslint comment below intact!
  // eslint-disable-next-line import/no-relative-packages
  import { fabric } from './fabric/dist/fabric';
  import {
    setLoader,
  } from '../../api';
  import { Profile } from '../../session';
  import { IMAGE_BASE_SIZE, STOPMOTION_BASE_SIZE } from '../../constants';
  // import NameGenerator from '../components/nameGenerator.svelte';
  import { hasSpecialCharacter, removeSpecialCharacters } from '../../validations';

  let hex = '#000000';

  let eyeDropper = false;
  $: {
    drawingColor = hex; // the eyeDropper is hex, pass it on to the colorPicker
  }

  $: {
    updateEyeDropper(drawingColor); // update the border around the eyeDropper icon when the colorPicker changes
  }

  function updateEyeDropper(drawingColor) {
    if (drawingCanvas) {
      const svgIcon = document.getElementById('eyeDropper');
      svgIcon.style.borderColor = drawingColor;
    }
  }
  $: {
    console.log('eyeDropper', eyeDropper);
    if (drawingCanvas) {
      if (eyeDropper) { drawingCanvas.isDrawingMode = false; } else { drawingCanvas.isDrawingMode = true; }
    }
  }

  export let file; // file is currentFile in the appLoader (synced)
  export let data;
  export let changes;

  // change artwork name
  export let displayName;

  // In order to allow for multi-frames (stopmotion), we need to expose these values
  export let frames = 1;
  export let currentFrame = 1;
  export let stopMotion = false;
  export let framesArray = [];
  const drawingCanvasUndoArray = writable([]);

  // const drawingCanvasUndoArray = [];
  const drawingCanvasRedoArray = writable([]);
  const maxUndo = 10;
  let loadCanvas;

  let baseSize = IMAGE_BASE_SIZE;
  // let prevFrame = 1;

  $: { // when the currenFrame changes, clear the drawingCanvas
    if (drawingCanvas) {
      // reset the undo array
      // Assuming you have a Svelte store for an array called myArray


      // To empty the array:


      drawingCanvasUndoArray.set([]);
      drawingCanvasRedoArray.set([]);

      drawingCanvas.clear();
      getImageFromFramesArray(currentFrame);
    }
  }

  $: { console.log('changes', changes); }

  //   function resetUndoOnChangeFrame(_currentFrame) {
  //     console.log('prevFrame', prevFrame);
  //     console.log('currentFrame', _currentFrame);
  //     putDrawingCanvasIntoFramesArray(prevFrame);

  //     // clear the canvas because we switch to a new frame
  //     drawingCanvas.clear();
  //     drawingCanvas.renderAll();

  //     getImageFromFramesArray(currentFrame);
  //     drawingCanvas.renderAll();

  //     const allDrawingCanvasObjects = drawingCanvas.getObjects();
  //     console.log('allDrawingCanvasObjects: ', allDrawingCanvasObjects);



  //     // drawingCanvas.renderAll();
  //     // let getStateStore = get(state);
  //     console.log('state BEFORE', get(state));
  //     //! maybe take away one prev object instead of clearing the whole canvas
  //     const json = drawingCanvas.toJSON();
  //     if (json) {
  //       state.set(json);
  //     // console.log('ending saveState $state: ', $state);
  //     }
  //     console.log('state AFTER', get(state));

  //     // empty the pastStates and futureStates
  //     pastStates.set([]);
  //     futureStates.set([]);


  //     if (prevFrame !== currentFrame) {
  //       prevFrame = currentFrame;
  //     }
  //   }

  // $: { console.log('file, displayName', file, displayName); }

  $: {
    if (stopMotion) baseSize = STOPMOTION_BASE_SIZE;
  }

  // remove forbidden characters from displayname after a new file has loaded or has been made
  $: if (file.loaded || file.new) {
    // console.log('displayName', displayName);
    if (hasSpecialCharacter(displayName)) displayName = removeSpecialCharacters(displayName);
  }

  // In order to hide editor functions when previewing stopmotion
  export let enableEditor = true;
  export let enableOnionSkinning = false;

  const cursorOpacity = 0.5;
  const dispatch = createEventDispatcher();

  // const state = writable({});
  // const pastStates = writable([]);
  // const futureStates = writable([]);

  //   const stateObject = {}
  // const pastStatesArray = []
  // const futureStatesArray = []

  // Let appLoader keep track of nr of changes
  // track changes with after a path is created,
  // with undo decrease changes, with redo increase changes
  // $: {
  //   changes = $pastStates.length;
  // }

  // Window size, canvas size
  let innerHeight;
  let innerWidth;
  let canvasHeight;
  let scaleRatio;

  $: windowRatio = innerWidth / innerHeight;
  $: canvasSize = innerWidth > innerHeight ? innerHeight : innerWidth;

  $: controlsHeight = innerWidth > 600 ? `${canvasHeight}px` : 'auto';
  $: controlsWidth = innerWidth <= 600 ? `${canvasHeight}px` : 'auto';

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
      canvasHeight = (canvasSize - canvasEdge);
      // canvasHeight = baseSize;
      drawingCanvas.setWidth(canvasHeight);
      drawingCanvas.setHeight(canvasHeight); // keep the drawing Canvas square

      cursorCanvas.setWidth(canvasHeight);
      cursorCanvas.setHeight(canvasHeight); // keep the cursorCanvas square

      // for correct and adapted scaling of the preexisting artworks
      scaleRatio = Math.min(
        (drawingCanvas.width * frames) / baseSize,
        drawingCanvas.height / baseSize,
      );
      cursorCanvas.setZoom(scaleRatio);
      drawingCanvas.setZoom(scaleRatio);
    }
  }

  // DOM ELements etc
  let drawingCanvasEl;
  let drawingCanvas;
  let saveCanvas;
  let cursorCanvasEl;
  let cursorCanvas;
  let eraseBrush;
  let mouseCursor;
  // let drawingClipboard;
  let lineWidth = 100;
  let drawingColor = hex;
  let currentTab = 'draw';
  let showOptionbox = false;

  // declaring the variable to be available globally, onMount assinging a function to it
  let applyBrush;
  let selectedBrush = 'Pencil'; // by default the Pencil is chosen
  let brushWidthLogarithmic = lineWidth;
  // Set the maximum value of the slider
  const brushSliderMax = 1000;
  // Set the minimum value of the slider
  const brushSliderMin = 2;
  // Calculate the value range for the first 3/4 of the slider
  const brushSliderQuarter = (brushSliderMax - brushSliderMin) * 0.9;
  // Calculate the offset for the first 3/4 of the slider
  const brushSliderOffset = brushSliderMin + brushSliderQuarter;
  // const maxUndo = 4;

  function updateLineWidth(_value) {
    if (cursorCanvas) {
      const middle = drawingCanvas.getWidth() / 2;
      mouseCursor
        .set({ top: middle, left: middle })
        .setCoords()
        .canvas.renderAll();
    }

    // Get the value of the slider and convert it to an integer
    let value = parseInt(_value, 10);
    // If the value is less than or equal to the offset, set the value to a value in the first 3/4 of the slider
    if (value <= brushSliderOffset) {
      value = Math.round((value - brushSliderMin) / brushSliderQuarter * 190) + brushSliderMin;
    } else { // If the value is greater than the offset, set the value to a value in the remaining 1/4 of the slider
      value = Math.round((value - brushSliderOffset) / (brushSliderMax - brushSliderOffset) * 800) + 200;
    }
    return value; // Set the value of the slider to the new value
  }

  $: { console.log('file: ', file); }

  // Reactive function: update Fabric brush according to UI state
  $: {
    if (drawingCanvas) {
      const brush = drawingCanvas.freeDrawingBrush;
      brush.color = drawingColor;
      brush.width = parseInt(brushWidthLogarithmic, 10) || 1;
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

  // make brush size slider logarithmic
  $: {
    brushWidthLogarithmic = updateLineWidth(lineWidth);
  }



  // eslint-disable-next-line consistent-return
  onMount(() => {
    setLoader(true);




    // drawingCanvas should be setup on default size, later resized to fit screen
    // Set up Canvases
    cursorCanvas = new fabric.StaticCanvas(cursorCanvasEl);
    cursorCanvas.set('width', baseSize);
    cursorCanvas.set('height', baseSize);

    drawingCanvas = new fabric.Canvas(drawingCanvasEl, {
      isDrawingMode: true,
    });
    drawingCanvas.set('width', baseSize);
    drawingCanvas.set('height', baseSize);

    eraseBrush = new fabric.EraserBrush(drawingCanvas);

    // Set frameNumber on object, to refer to when deleting frames
    drawingCanvas.on('path:created', () => {
      // const idx = drawingCanvas.getObjects().length - 1;
      // drawingCanvas.item(idx).frameNumber = currentFrame;

      // // clear futureState (because we continue to draw) and save current state
      // saveState();

      // if ($pastStates.length >= maxUndo) {
      //   console.log('maxUndo reached');
      //   undoState();
      //   putDrawingCanvasIntoFramesArray(currentFrame);
      //   redoState();

      //   // remove the first element of the pastStates array
      //   pastStates.update((store) => {
      //     store.shift();
      //     state.set(store);
      //     return store;
      //   });
      //   console.log('pasteStateLength: ', $pastStates.length);

      //   // remove the first element of the 'objects' array inside the state store object
      // }

      // clear the redo array when contuing to draw after undo
      if ($drawingCanvasRedoArray.length > 0) {
        drawingCanvasRedoArray.set([]);
      }

      // increment changes
      changes++;
      putDrawingCanvasIntoFramesArray(currentFrame);
      drawingCanvas.clear();
      getImageFromFramesArray(currentFrame);
      console.log('framesArray.length: ', framesArray.length);
      console.log('$drawingCanvasUndoArray.length: ', $drawingCanvasUndoArray.length);
    });

    fabric.Object.prototype.transparentCorners = false;

    // mouse cursor layer
    // create cursor and place it off screen
    mouseCursor = new fabric.Circle({
      left: -100,
      top: -100,
      radius: drawingCanvas.freeDrawingBrush.width / 2,
      fill: `rgba(0,0,0,${cursorOpacity})`,
      stroke: 'black',
      originX: 'center',
      originY: 'center',
    });

    cursorCanvas.add(mouseCursor);
    drawingCanvas.on('mouse:down', (evt) => {
      if (eyeDropper) {
        const canvasScaleRatio = canvasHeight / baseSize;
        // get color of the canvas under the mouse
        drawingCanvas.set('preserveObjectStacking', false);
        const ctx = drawingCanvas.contextContainer;
        // const ctx = drawingCanvas.getContext('2d');
        // console.log('ctx: ', ctx);
        const pointer = drawingCanvas.getPointer(evt.e);
        // console.log('pointer: ', pointer);
        const pixelData = ctx.getImageData(
          Math.round(pointer.x * canvasScaleRatio),
          Math.round(pointer.y * canvasScaleRatio),
          1,
          1,
        ).data;
        // console.log(`${pointer.x}, ${pointer.y}`);
        console.log(`color: ${pixelData[0]} ${pixelData[1]} ${pixelData[2]} ${pixelData[3]}`);
        // alert(`${pointer.x}, ${pointer.y} color: ${pixelData[0]} ${pixelData[1]} ${pixelData[2]}`);
        const colorPicker = document.getElementById('drawing-color');
        hex = rgbToHex(pixelData[0], pixelData[1], pixelData[2]);
        colorPicker.value = hex;
        eyeDropper = false;
      }
    });

    // redraw cursor on new mouse position when moved
    // eslint-disable-next-line func-names
    drawingCanvas.on('mouse:move', function (evt) {
      if (eyeDropper) {
        const canvasScaleRatio = canvasHeight / baseSize;

        // get color of the canvas under the mouse
        drawingCanvas.set('preserveObjectStacking', false);
        const ctx = drawingCanvas.contextContainer;
        // const ctx = drawingCanvas.getContext('2d');
        // console.log('ctx: ', ctx);
        const pointer = drawingCanvas.getPointer(evt.e);
        // console.log('pointer: ', pointer);
        const pixelData = ctx.getImageData(
          Math.round(pointer.x * canvasScaleRatio),
          Math.round(pointer.y * canvasScaleRatio),
          1,
          1,
        ).data;
        // console.log(`${pointer.x}, ${pointer.y}`);
        console.log(`color: ${pixelData[0]} ${pixelData[1]} ${pixelData[2]} ${pixelData[3]}`);
        // alert(`${pointer.x}, ${pointer.y} color: ${pixelData[0]} ${pixelData[1]} ${pixelData[2]}`);
        const colorPicker = document.getElementById('drawing-color');
        hex = rgbToHex(pixelData[0], pixelData[1], pixelData[2]);
        colorPicker.value = hex;
        const svgIcon = document.getElementById('eyeDropper');
        svgIcon.style.borderColor = hex;

        return mouseCursor
          .set({ top: -100, left: -100 })
          .setCoords()
          .canvas.renderAll();
        // return mouseCursor
        //   .set({
        //     top: pointer.y,
        //     left: pointer.x,
        //   })
        //   .setCoords()
        //   .canvas.renderAll();
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
    // drawingCanvas.on('object:added', () => {
    //   console.log('drawingCanvas.getObjects(): ', drawingCanvas.getObjects());
    // });

    // drawingCanvas.on('mouse:up', () => {
    //   // console.log('mouse up');
    //   saveState();
    // });



    applyBrush = (brushType) => {
      if (typeof brushType === 'string') selectedBrush = brushType;
      drawingCanvas.freeDrawingBrush = new fabric[`${selectedBrush}Brush`](drawingCanvas);
      if (drawingCanvas.freeDrawingBrush) {
        const brush = drawingCanvas.freeDrawingBrush;
        brush.color = drawingColor;
        if (brush.getPatternSrc) {
          brush.source = brush.getPatternSrc.call(brush);
        }
        brush.width = parseInt(brushWidthLogarithmic, 10) || 1;
        console.log('brush.width', brush.width);
      }
    };

    // Was there an image to load? Do so
    if (file?.url) {
      console.log('load file url drawing');
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = (e) => {
        frames = Math.floor(e.target.width / e.target.height);
        createframeBuffer(img); // disabled looking for error
      };

      img.src = file.url;
      setLoader(false);
    } else { // new image
      frames = 1;
      setLoader(false);
    }
  });

  // go through all frames, and put each image in framesArray array
  function createframeBuffer(img) {
    console.log('baseSize: ', baseSize);
    loadCanvas.width = baseSize;
    loadCanvas.height = baseSize;
    const ctx = loadCanvas.getContext('2d');
    for (let index = 0; index < frames; index++) {
      ctx.drawImage(
        img, (
          index * img.height),
        0,
        img.height,
        img.height,
        0,
        0,
        baseSize,
        baseSize,
      );
      framesArray[index] = loadCanvas.toDataURL('image/png');
      // clear the loadingCanvas
      ctx.clearRect(0, 0, baseSize, baseSize);
    }
    console.log('framesArray length: ', framesArray.length);

    // make the loadingCanvas 0
    loadCanvas.width = 0;

    // put currentFrame in the drawingCanvas
    getImageFromFramesArray(currentFrame);
  } // ............................. createframeBuffer ......................

  /**
   *
   * put framesArray in savaCanvas, and assign it as data
   * get's used for downloading the image to desktop
   * and in apploader to prepare the data for storage on the server
   */
  export async function saveHandler() {
    // set dimensions of savecanvas
    saveCanvas.height = baseSize;
    saveCanvas.width = baseSize * frames;
    putDrawingCanvasIntoFramesArray(currentFrame);
    await new Promise((resolve) => {
      let loaded = 0;
      // framebuffer contains all frames in an array
      framesArray.forEach((frame, i) => {
        const position = i * baseSize;
        // create image holder
        const img = new window.Image();
        // after image is placed in holder
        img.addEventListener('load', async () => {
          await saveCanvas.getContext('2d').drawImage(img, position, 0);
          loaded++;
          // after all images are loaded, resolve
          if (loaded === framesArray.length) resolve();
        });
        // load image in holder
        img.setAttribute('src', frame);
      });
    }).then(() => {
      data = saveCanvas.toDataURL('image/png');
      console.log('saveHandler saved');

      // empty the saveCanvas
      saveCanvas.height = 0;
      saveCanvas.width = 0;

      return data;
    });
  }

  // // Save state locally
  // async function saveState() {
  //   // Clear futureStates (should be empty after each new edit..)
  //   futureStates.set([]);
  //   // console.log('beginning saveState $state: ', $state);

  //   // If $state is existing, add it to pastStates
  //   if (
  //     ($state && $pastStates.length === 0) ||
  //     ($pastStates.length > 0 && $state !== $pastStates[$pastStates.length - 1])
  //   ) {
  //     pastStates.update((states) => [...states, $state]); // working code
  //     // pastStates.update(() => [$state]); // to make changes work, but there is only the last line as state
  //   }

  //   const json = drawingCanvas.toJSON();
  //   if (json) {
  //     state.set(json);
  //     // console.log('ending saveState $state: ', $state);
  //     // TODO MAYBE: If required, we could add a save to localStorage here.
  //     // Make sure to clear the localStorage in the save() function and apply it in onMount (if valid)
  //   }
  // }

  // // Go back to previous state
  // function undoState() {
  //   // Add current state to futureStates
  //   futureStates.update((states) => [...states, $state]);

  //   // Then revert to last state from pastStates
  //   pastStates.update((past) => {
  //     // Set current state to last in redoStates
  //     state.set(past.pop());
  //     // console.log('past: ', past);
  //     return past;
  //   });

  //   resetCanvasFromState();
  // }

  // // Go back to previous reverted state
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
  //     drawingCanvas.clear();
  //     console.log('resetCanvasFromState $state: ', $state);
  //     drawingCanvas.loadFromJSON($state, () => {
  //       drawingCanvas.renderAll();
  //     });
  //     if ($pastStates.length === 0) {
  //       console.log('resetCanvasFromState $pastStates.length === 0');
  //       getImageFromFramesArray(currentFrame);
  //     }
  //   }
  // }

  // Go back to previous state
  function undoDrawingCanvas() {
    if ($drawingCanvasUndoArray.length === 0) return;

    drawingCanvas.clear();
    // Add current index of drawingCanvasUndoArray to drawingCanvasRedoArray
    const copyFrame = $drawingCanvasUndoArray[$drawingCanvasUndoArray.length - 1];
    drawingCanvasRedoArray.update((array) => {
      array.push(copyFrame);
      return array;
    });


    drawingCanvasUndoArray.update((array) => {
      array.pop();
      return array;
    });
    // put last index of drawingCanvasUndoArray in the drawingCanvas
    const frame = $drawingCanvasUndoArray[$drawingCanvasUndoArray.length - 1];

    fabric.Image.fromURL(
      frame,
      (img) => {
        drawingCanvas.add(img.set({
          left: 0,
          top: 0,
          height: baseSize,
          width: baseSize,

        }, { crossOrigin: 'anonymous' }));
      },
    );

    // update the framesArray
    // put the copyFrame in the framesArray
    framesArray[currentFrame - 1] = frame;

    changes--;
  }

  // Go back to previous reverted state
  function redoDrawingCanvas() {
    if (drawingCanvasRedoArray.length === 0) return;

    drawingCanvas.clear();
    // Add current index of drawingCanvasRedoArray to drawingCanvasUndoArray
    const copyFrame = $drawingCanvasRedoArray[$drawingCanvasRedoArray.length - 1];
    drawingCanvasUndoArray.update((array) => {
      array.push(copyFrame);
      return array;
    });

    drawingCanvasRedoArray.update((array) => {
      array.pop();
      return array;
    });
    // put last index of drawingCanvasUndoArray in the drawingCanvas
    const frame = $drawingCanvasUndoArray[$drawingCanvasUndoArray.length - 1];
    fabric.Image.fromURL(frame, (img) => {
      drawingCanvas.add(img.set({
        left: 0,
        top: 0,
        height: baseSize,
        width: baseSize,

      }, { crossOrigin: 'anonymous' }));
    });
    changes++;
  }
/// / going from framesArray to drawingCanvas FUNCTIONS ///////////////////////////////////////////
// put the current frame in the drawingCanvas
export function getImageFromFramesArray(_currentFrame) {
  let frame;
  if (_currentFrame) {
    frame = _currentFrame - 1;
  } else {
    frame = currentFrame - 1;
  }
  // console.log('getImageFromFramesArray frame: ', frame);
  const storedFrame = framesArray[frame];

  fabric.Image.fromURL(storedFrame, (img) => {
    drawingCanvas.add(img.set({
      left: 0,
      top: 0,
      height: baseSize,
      width: baseSize,

    }, { crossOrigin: 'anonymous' }));

    // drawingCanvas.add(img);
    // drawingCanvas.renderAll();
  });
}

function putDrawingCanvasIntoFramesArray(_frame) {
  const prevZoom = drawingCanvas.getZoom();
  drawingCanvas.setZoom(1);

  const frame = _frame - 1;

  // get data from drawingCanvas
  const currentFrameData = drawingCanvas.toDataURL({
    format: 'png',
    height: baseSize,
    width: baseSize,
    crossOrigin: 'anonymous',
  });

  // put data into array
  framesArray[frame] = currentFrameData;
  // put drawingCanvas in undo Array
  // check if the drawingCanvasUndoArray is full
  if (drawingCanvasUndoArray.length === maxUndo) {
    // if it is full, remove the first element
    drawingCanvasUndoArray.update((array) => {
      array.shift();
      return array;
    });
  }


  // add the currentFrameData to the drawingCanvasUndoArray
  drawingCanvasUndoArray.update((array) => {
    array.push(currentFrameData);
    return array;
  });


  drawingCanvas.setZoom(prevZoom);
}

/// / end going from framesArray to drawingCanvas FUNCTIONS /////////////////////////////////////////////////

  /// ////////////////// select functions /////////////////////////////////
  function handleKeydown(evt) {
    if (evt.key === 'Backspace' || evt.key === 'Delete') {
      Delete();
    }

    if (evt.key === 'c' && evt.ctrlKey) {
      getColor();
    }
  }

 async function downloadImage() {
   await saveHandler();

   // eerst in de currentFileInfo de waardes veranderen en dan hier verkrijgen
   const userProfile = get(Profile);
   // console.log('userProfile', userProfile.username);
   const filename = `${userProfile.username}_${file.key}_${displayName}.png`;
   const a = document.createElement('a');
   a.download = filename;
   a.href = data;
   document.body.appendChild(a);
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
    const curSelectedObjects = drawingCanvas.getActiveObjects();
    drawingCanvas.discardActiveObject();
    for (let i = 0; i < curSelectedObjects.length; i++) {
      drawingCanvas.remove(curSelectedObjects[i]);
    }
  }

  function clearCanvas() {
    drawingCanvas.clear();
    // saveCanvas.clear();
    dispatch('clearCanvas');
  }

  function getColor() {
    drawingCanvas.set('preserveObjectStacking', false);
    const ctx = drawingCanvas.contextContainer;
    // const ctx = drawingCanvas.getContext('2d');
    console.log('ctx: ', ctx);
    const pointer = drawingCanvas.getPointer(e);
    const pixelData = ctx.getImageData(Math.round(pointer.x), Math.round(pointer.y), 1, 1).data;
    alert(`${pointer.x}, ${pointer.y} color: ${pixelData[0]} ${pixelData[1]} ${pixelData[2]}`);
  }

  /// //////////// select functions end //////////////////

  function rgbaToHex(r, g, b, a) {
    const hexR = r.toString(16).padStart(2, '0');
    const hexG = g.toString(16).padStart(2, '0');
    const hexB = b.toString(16).padStart(2, '0');
    const hexA = Math.round(a * 255).toString(16).padStart(2, '0');
    return `#${hexR}${hexG}${hexB}${hexA}`;
  }

  function rgbToHex(r, g, b) {
    const hexR = r.toString(16).padStart(2, '0');
    const hexG = g.toString(16).padStart(2, '0');
    const hexB = b.toString(16).padStart(2, '0');
    return `#${hexR}${hexG}${hexB}`;
  }

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
        drawingCanvas.isDrawingMode = true;
        break;

      case 'select':
        drawingCanvas.isDrawingMode = false;
        break;

      case 'erase':
        drawingCanvas.freeDrawingBrush = eraseBrush;
        drawingCanvas.freeDrawingBrush.width = parseInt(brushWidthLogarithmic, 10) || 1;
        drawingCanvas.isDrawingMode = true;
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
            background-image: url({framesArray[currentFrame - 2]});
            "
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
        <canvas bind:this="{drawingCanvasEl}" class="drawingCanvasEl"> </canvas>
        <!-- <canvas bind:this="{drawingCanvasEl}" class="canvas"> </canvas> -->

        <canvas
          bind:this="{cursorCanvasEl}"
          class="cursor-canvas"
          style:visibility="{enableEditor ? 'visible' : 'hidden'}"
        ></canvas>
        <canvas hidden bind:this="{saveCanvas}" class="saveCanvas" ></canvas>
        <canvas hidden bind:this="{loadCanvas}"></canvas>
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

  <!-- <ColorPicker bind:hex /> -->
  <!-- <div class="color-picker-parent">
    <div id="colorPicker" bind:this={picker}></div>
  </div> -->

              <div class="range-container">
                <div class="circle-box-small"></div>
                <input
                  type="range"
                  min="{brushSliderMin}"
                  max="{brushSliderMax}"
                  id="drawing-line-width"
                  title="Set drawing thickness"
                  bind:value="{lineWidth}"
                />
                <div class="circle-box-big"></div>
              </div>

                            <div class="colorSection">
              <button on:click="{ () => eyeDropper = !eyeDropper }">
                <img id="eyeDropper" src="assets/svg/eyeDropper.svg" />;
              </button>

              <input
                type="color"
                bind:value="{drawingColor}"
                id="drawing-color"
                title="Pick drawing color"
              />
              </div>

            </div>
          {:else if currentTab === 'erase'}
            <div class="tab tab--erase">
              <div class="range-container">
                <div class="circle-box-small"></div>

                <input
                  type="range"
                  min="{brushSliderMin}"
                  max="{brushSliderMax}"
                  id="erase-line-width"
                  title="Set erase thickness"
                  bind:value="{lineWidth}"
                />
                <div class="circle-box-big"></div>
              </div>
            </div>
          {:else if currentTab === 'select'}
            <!-- <div class="tab tab--select">
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
                <button on:click="{getColor}">
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
          <button on:click="{undoDrawingCanvas}" disabled="{$drawingCanvasUndoArray.length < 1}">
            <img
              class="icon"
              src="assets/SHB/svg/AW-icon-rotate-CCW.svg"
              alt="Undo"
            />
          </button>
          <button
            on:click="{redoDrawingCanvas}" disabled="{$drawingCanvasRedoArray.length < 1}"
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
    box-sizing: border-box;
    padding: 4px;
    cursor: pointer;
    object-fit: contain;
    flex: 1 1 auto;
    margin: 0 24px 0 6px;
    /*outline: 1px solid #7300ed2e; */
  }

  .colorSection {
    display: flex;
    justify-content: flex-start;
    width: 100%;
  }
  #eyeDropper {
    min-width: 50px;
    height: 50px;
    border-radius: 50%;
    box-sizing: border-box;
    border: 5px solid black;
    cursor: pointer;
    object-fit: contain;
    padding: 4px;
    margin-left: 8px;
  }

  .iconbox button {
    opacity: 1;
  }

  #drawing-color {
    width: 50%;
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
    /* horizontal: height, vertical: width */
    height: 60px;
    width: 62px;
    box-sizing:  border-box;
    object-fit: scale-down;
    padding: 0px;
    background-color: white;
    margin-left: -24px; /* horizontal offset */
  }

  .range-container {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    margin-top: 40px;
    margin-bottom: 40px;
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
      width: 62px;
      display: block;
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
