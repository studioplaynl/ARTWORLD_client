<script>
  export let file;
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { fabric } from './fabric/dist/fabric';
  import {
    uploadImage,
    uploadAvatar,
    uploadHouse,
    getObject,
    setLoader,
    convertImage,
    updateObject,
    getFile,
    getRandomName,
  } from '../../api';

  const imageResolution = 2048;

  // let user;
  let scaleRatio;
  let lastImg;

  let lastWidth;
  const params = {};

  let invalidTitle = true;
  const history = [];
  // DOM ELements etc
  let canvasEl;
  let canvas;
  let cursorCanvasEl;
  let cursorCanvas;
  let saveCanvasEl;
  let saveCanvas;
  let eraseBrush;
  let mouseCursor;

  const cursorOpacity = 0.5;
  let drawingColorEl;
  let drawingLineWidthEl;

  let drawingClipboard;
  let lineWidth = 25;
  let drawingColor = '#000000';

  /** Title of artwork on the server */
  let title;

  let showBackground = true;

  let current = 'draw';

  let savedURL = '';

  let version = 0;
  let optionbox = true;

  let status = true;
  let displayName;
  let isDrawn = false;
  let isPreexistingArt = false;
  let isAlreadyUploaded = false;
  let isTitleChanged = false;

  let autosaveInterval;

  // declaring the variable to be available globally, onMount assinging a function to it
  let applyBrush;
  let selectedBrush = 'Pencil'; // by default the Pencil is chosen

  const dispatch = createEventDispatcher();

  function save() {
    dispatch('save', file.id);
  }

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

  onMount(() => {
    setLoader(true);
    // if ($location.split('/').length > 2) {
    //   // eslint-disable-next-line prefer-destructuring
    //   params.user = $location.split('/')[2];
    //   // eslint-disable-next-line prefer-destructuring
    //   params.name = $location.split('/')[3];
    //   if (params.name) title = params.name;
    // }

    // Create autosave interval
    // autosaveInterval = setInterval(() => {
    //   if (isDrawn || isTitleChanged) {
    //     const data = {};
    //     data.type = appType;
    //     data.name = title;
    //     if (appType === 'drawing' || appType === 'house') {
    //       data.drawing = canvas.toDataURL('image/png', 1);
    //     }
    //     localStorage.setItem('Drawing', JSON.stringify(data));
    //     // console.log('Added drawing to localstorage');
    //   }
    // }, 20000);

    // Set up Canvases
    cursorCanvas = new fabric.StaticCanvas(cursorCanvasEl);
    canvas = new fabric.Canvas(canvasEl, {
      isDrawingMode: true,
    });
    eraseBrush = new fabric.EraserBrush(canvas);

    // Always adapt canvas sizes on screen size change
    window.onresize = () => {
      adaptCanvasSize();
    };

    saveCanvas = new fabric.Canvas(saveCanvasEl, {
      isDrawingMode: true,
    });

    fabric.Object.prototype.transparentCorners = false;

    /// ///////////// mouse circle ////////////////////////////

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

    // Set up Fabric Canvas interaction listeners
    canvas.on('mouse:up', () => {
      // once there is anything is drawn on the canvas
      isDrawn = true;
      isPreexistingArt = false;
      isAlreadyUploaded = false;
      mouseEvent();
    });

    // redraw cursor on new mouse position when moved
    // eslint-disable-next-line func-names
    canvas.on('mouse:move', function (evt) {
      if (current === 'select') {
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

    /// ///////////// mouse circle ////////////////////////////

    // /// ///////////// drawing challenge ////////////////////////
    // if (appType === 'drawingchallenge') {
    //   // each mouse-up event sends the drawing
    //   canvas.on('mouse:up', () => {
    //     // get the drawing from the canvas in the format of SVG
    //     const canvasData = canvas.toSVG();

    //     // convert SVG into the HTML format in order to be able to manipulate inner data
    //     const parsedSVG = new DOMParser().parseFromString(
    //       canvasData,
    //       'text/html',
    //     );

    //     // all <g> tags contain drawing action
    //     const gTagElement = parsedSVG.getElementsByTagName('g');

    //     // loop through <g> tags, remove all previous drawings and leave only the last one
    //     for (let i = gTagElement.length - 2; i >= 0; --i) {
    //       gTagElement[i].remove();
    //     }

    //     // get the position of the drawing
    //     const positionObject = canvas.toJSON().objects;

    //     // needed SVG is stored inside of body which we want to send only
    //     const body = parsedSVG.getElementsByTagName('BODY')[0].innerHTML;

    //     // all data to send

    //     const JSONToSend = JSON.stringify({
    //       action: body,
    //       location: 'drawingchallenge',
    //       posX: positionObject[positionObject.length - 1].left,
    //       posY: positionObject[positionObject.length - 1].top,
    //     });

    //     // const location = 'drawingchallenge';
    //     // const JSONToSend = `{ "action": ${JSON.stringify(
    //     //   body,
    //     // )}, "location": "${location}", "posX": ${
    //     //   positionObject[positionObject.length - 1].left
    //     // }, "posY": ${positionObject[positionObject.length - 1].top}}`;

    //     // send data
    //     ManageSession.socket.rpc('move_position', JSONToSend);
    //   });

    //   // listening to the stream to get actions of other person's drawing
    //   ManageSession.socket.onstreamdata = (streamdata) => {
    //     const data = JSON.parse(streamdata.data);

    //     if ($Session.user_id !== data.user_id) {
    //       // apply drawings to the canvas if only it is received from other participant
    //       fabric.loadSVGFromString(data.action, (objects) => {
    //         objects.forEach((svg) => {
    //           // console.log('svg', svg);
    //           svg.set({
    //             scaleX: 1,
    //             scaleY: 1,
    //             left: data.posX,
    //             top: data.posY,
    //           });
    //           canvas.add(svg).renderAll();
    //         });
    //       });
    //     } else {
    //       // console.log('The same user!');
    //     }
    //   };
    /// ///////////// drawing challenge ////////////////////////

    // adaptCanvasSize();

    applyBrush = (brushType) => {
      if (typeof brushType === 'string') selectedBrush = brushType;
      canvas.freeDrawingBrush = new fabric[`${selectedBrush}Brush`](canvas);
      if (canvas.freeDrawingBrush) {
        const brush = canvas.freeDrawingBrush;
        brush.color = drawingColorEl.value;
        if (brush.getPatternSrc) {
          brush.source = brush.getPatternSrc.call(brush);
        }
        brush.width = parseInt(drawingLineWidthEl.value, 10) || 1;
      }
    };
    adaptCanvasSize();

    putImageOnCanvas(file.path, (success) => {
      if (!success) {
        Error.set('Failed loading drawing from server');
      }
      return setLoader(false);
    });
  });

  function adaptCanvasSize() {
    // the canvas size is set by the least of two (width / height)
    const canvasSize =
      window.innerWidth > window.innerHeight
        ? window.innerHeight
        : window.innerWidth;

    // setting default width and height
    canvas.setWidth(canvasSize);
    canvas.setHeight(canvasSize);
    cursorCanvas.setWidth(canvasSize);
    cursorCanvas.setHeight(canvasSize);

    const canvasReductionAmount = 200;

    // for medium screens
    if (canvasSize < 1008 && canvasSize > 640) {
      canvas.setWidth(canvasSize - canvasReductionAmount);
      canvas.setHeight(canvasSize - canvasReductionAmount);
      cursorCanvas.setWidth(canvasSize - canvasReductionAmount);
      cursorCanvas.setHeight(canvasSize - canvasReductionAmount);
    }

    // for mobile screens
    if (canvasSize <= 640) {
      canvas.setWidth(canvasSize - canvasReductionAmount * 0, 55);
      canvas.setHeight(canvasSize - canvasReductionAmount * 0, 55);
      cursorCanvas.setWidth(canvasSize - canvasReductionAmount * 0, 55);
      cursorCanvas.setHeight(canvasSize - canvasReductionAmount * 0, 55);
    }

    // for mobile screens
    if (canvasSize <= 540) {
      canvas.setWidth(canvasSize - canvasReductionAmount * 0, 4);
      canvas.setHeight(canvasSize - canvasReductionAmount * 0, 4);
      cursorCanvas.setWidth(canvasSize - canvasReductionAmount * 0, 4);
      cursorCanvas.setHeight(canvasSize - canvasReductionAmount * 0, 4);
    }

    // for correct and adapted scaling of the preexisting artworks
    scaleRatio = Math.min(
      canvas.width / imageResolution,
      canvas.width / imageResolution,
    );
    cursorCanvas.setZoom(scaleRatio);
    canvas.setZoom(scaleRatio);
  }

  // const updateFrame = () => {
  //   const framesToUpdate = frames;
  //   framesToUpdate[currentFrame] = canvas.toJSON();
  //   frames = framesToUpdate;

  //   const backgroundFramesToUpdate = backgroundFrames;
  //   backgroundFramesToUpdate[currentFrame] = canvas.toDataURL('image/png', 1);
  //   backgroundFrames = backgroundFramesToUpdate;
  // };

  function putImageOnCanvas(imgUrl, callback) {
    fabric.Image.fromURL(
      imgUrl,
      (image, hasError) => {
        image.set({ left: 0, top: 0 });
        image.scaleToHeight(imageResolution);
        image.scaleToWidth(imageResolution);
        canvas.add(image);

        if (typeof callback === 'function') callback(hasError === false);
      },
      { crossOrigin: 'anonymous' },
    );
  }

  function mouseEvent() {
    setTimeout(() => {
      // updateFrame();
      //saveHistory();
    }, 200);
  }

  /// ///////////////// redo/undo function ///////////////////////////

  const saveHistory = () => {};

  const undo = () => {
    const lastObject = canvas.toJSON().objects[
      canvas.toJSON().objects.length - 1
    ];
    history.push(lastObject);
    const newFile = canvas.toJSON();
    newFile.objects.pop();
    canvas.loadFromJSON(newFile, canvas.renderAll.bind(canvas));

    // once all previously drawn objects are deleted, isDrawn is set to false
    if (canvas.toJSON().objects.length === 0) {
      isDrawn = false;
    }
  };

  const redo = () => {
    const newFile = canvas.toJSON();
    newFile.objects.push(history[history.length - 1]);
    history.pop();
    canvas.loadFromJSON(newFile, canvas.renderAll.bind(canvas));

    // once the elements that has been removed are brought back, isDrawn is set back to true
    if (canvas.toJSON().objects.length > 0) {
      isDrawn = true;
    }
  };

  /// ///////////////// redo/undo function end ///////////////////////////

  /// ////////////////// select functions /////////////////////////////////
  function Copy() {
    // clone what are you copying since you
    // may want copy and paste on different moment.
    // and you do not want the changes happened
    // later to reflect on the copy.
    canvas.getActiveObject().clone((cloned) => {
      drawingClipboard = cloned;
    });
  }

  function Paste() {
    // clone again, so you can do multiple copies.
    drawingClipboard.clone((clonedObj) => {
      canvas.discardActiveObject();
      clonedObj.set({
        left: clonedObj.left + 10,
        top: clonedObj.top + 10,
        evented: true,
      });
      if (clonedObj.type === 'activeSelection') {
        // active selection needs a reference to the canvas.
        clonedObj.canvas = canvas;
        clonedObj.forEachObject((obj) => {
          canvas.add(obj);
        });
        // this should solve the unselectability
        clonedObj.setCoords();
      } else {
        canvas.add(clonedObj);
      }
      drawingClipboard.top += 10;
      drawingClipboard.left += 10;
      canvas.setActiveObject(clonedObj);
      canvas.requestRenderAll();
    });
  }

  function Delete() {
    // clone what are you copying since you
    // may want copy and paste on different moment.
    // and you do not want the changes happened
    // later to reflect on the copy.
    const curSelectedObjects = canvas.getActiveObjects();
    canvas.discardActiveObject();
    for (let i = 0; i < curSelectedObjects.length; i++) {
      canvas.remove(curSelectedObjects[i]);
    }
  }

  function clearCanvas() {
    // if anything is drawn on the canvas and it has not been uploaded,
    // save the artwork and clear the canvas
    if (isDrawn && !isAlreadyUploaded) {
      // upload();
      isDrawn = false;
    }
    canvas.clear();
    localStorage.setItem('Drawing', '');
  }

  /// //////////// select functions end //////////////////

  function switchOption(option) {
    if (current === option) {
      optionbox = !optionbox;
    } else {
      optionbox = false;
      current = option;
    }
  }

  function switchMode(mode) {
    switchOption(mode);

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


<main on:mouseup="{mouseEvent}">
  <div class="main-container">
    <div class="canvas-frame-container">
      <div class="canvas-box">
        <canvas bind:this="{canvasEl}" class="canvas"> </canvas>
        <canvas bind:this="{cursorCanvasEl}" id="cursor"> </canvas>
      </div>
      <div class="saveCanvas">
        <canvas bind:this="{saveCanvasEl}"></canvas>
      </div>

    </div>
  </div>
  <div class="optionbox-container">
    <div class="optionbox">
      <div class="optionbar" class:hidden="{optionbox}">
        <div class="colorTab" class:hidden="{current !== 'draw'}">
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
            bind:this="{drawingColorEl}"
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
              bind:this="{drawingLineWidthEl}"
              bind:value="{lineWidth}"
            />
            <div class="circle-box-big"></div>
          </div>
        </div>
        <div class="eraseTab" class:hidden="{current !== 'erase'}">
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

        <div class="selectTab" class:hidden="{current !== 'select'}">
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
        <div class="saveTab" class:hidden="{current !== 'saveToggle'}">
          <p on:click="{save}">Save this file</p>

        </div>


        <!--  -->
      </div>

      <div class="iconbox">
        <button on:click="{undo}">
          <img
            class="icon"
            src="assets/SHB/svg/AW-icon-rotate-CCW.svg"
            alt="Undo"
          />
        </button>
        <button on:click="{redo}">
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
          class:currentSelected="{current === 'draw'}"
        >
          <img class="icon" src="assets/SHB/svg/AW-icon-pen.svg" alt="Draw" />
        </button>
        <!-- bind:this="{eraseModeEl}" -->
        <button
          on:click="{() => switchMode('erase')}"
          id="erase-mode"
          class:currentSelected="{current === 'erase'}"
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
        class:currentSelected={current === "fill"}><BucketIcon /></button
      > -->
        <button
          id="select-mode"
          on:click="{() => switchMode('select')}"
          class:currentSelected="{current === 'select'}"
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

        <!-- svelte-ignore a11y-missing-attribute -->
        <button
          class:currentSelected="{current === 'saveToggle'}"
          on:click="{() => {
            switchOption('saveToggle');
          }}"
        >
          <img class="icon" src="assets/SHB/svg/AW-icon-save.svg" alt="Save" />
        </button>
      </div>
    </div>
  </div>
  <div id="clear-canvas" on:click="{clearCanvas}">
    <img src="assets/SHB/svg/AW-icon-reset.svg" alt="Clear canvas" />
  </div>
  <!-- {#if appType === 'avatar'}
    <div id="avatarBox">
      <Avatar />
    </div>
  {/if} -->
</main>

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

  .main-container {
    display: flex;
    align-items: center;
    margin-left: 60px;
    justify-content: flex-end;
    /* justify-content: space-around; */
    margin: 20px 20px 0 0;
  }

  #cursor {
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

  .topbar {
    width: 100vw;
    margin: 0px auto;
  }

  .selected {
    box-shadow: 3px 3px #7300ed;
  }

  .colorTab {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .saveTab {
    min-width: 160px;
    bottom: 50px;
    z-index: 1;
  }

  .saveCanvasEl {
    display: none;
  }

  .saveTab > * {
    padding: 12px 16px;
    text-decoration: none;
    display: block;
  }
  .saveBox {
    position: relative;
    display: inline-block;
  }

  .saveBox:hover .saveTab {
    display: block;
    color: green;
  }

  .iconbox {
    width: 50px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    flex-wrap: wrap;
    transition: all 0.5s ease-in-out;
  }

  .optionbar {
    margin-left: 10px;
    border-right: 2px solid #7300ed;
    /* box-shadow: 10px 0px 5px 0px rgba(115,0,237,0.5); */
    height: 100vh;
    background-color: white;
    transition: all 0.5s ease-in-out;
    width: fit-content;
    padding: 15px;
    transform: translateX(0%);
    width: 280px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    flex-wrap: wrap;
  }

  .optionbar.hidden {
    width: 0px;
    transform: translateX(-160%);
    display: inline;
    padding: 0px;
    margin: 0px;
  }

  .optionbar.hidden > * {
    display: none;
  }

  .optionbar > * {
    /* margin: 5px auto; */
  }

  .icon {
    min-width: 50px;
    height: 50px;
    border-radius: 50%;
    padding: 5px 0px 5px 0px;
    cursor: pointer;
  }

  #drawing-color,
  #drawing-shadow-color {
    padding: 0px;
    display: block;
    margin: 20px auto;
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

  .hidden {
    display: none;
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

  .canvas-box {
    position: relative;
    background-color: white;
    border: 2px solid #7300ed;
  }

  .frame-box {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    flex-direction: column;
  }

  #frame-bar {
    display: flex;
    flex-direction: column;
    max-height: 300px;
    width: 130px;
    overflow-y: auto;
    overscroll-behavior-y: contain;
    scroll-snap-type: y proximity;
  }
  #frame-bar > div {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
  }

  #frame-bar > div > div {
    display: inline-block;
    width: 60px;
    height: 60px;
    margin: 5px;
    border: 2px solid #7300eb;
    font-size: 30px;
    text-align: center;
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
  }

  #frame-bar > div > div:hover {
    cursor: pointer;
  }

  #frame-bar > div > div > div {
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .frame-buttons {
    display: flex;
    flex-direction: column;
  }

  .frame-buttons > a > img {
    display: block;
  }

  #clear-canvas {
    position: fixed;
    left: 8px;
    top: 80px;
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

  .canvas-frame-container {
    display: flex;
    flex-direction: row;
  }

  #frame-bar > div:last-child {
    overflow-anchor: auto;
  }

  .optionbox-container {
    margin: 0 10px 0 0;
    position: fixed;
    left: 0;
    top: 50vh;
    -ms-transform: translateY(-50%);
    transform: translateY(-50%);
  }

  .unselected {
    filter: grayscale(1) opacity(0.5);
  }

  #avatarBox {
    position: fixed;
    top: 130px;
    left: 20px;
  }

  .drawing-options-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .status-save-download-container {
    display: flex;
    flex-direction: column;
    /* justify-content: center; */
    /* align-items: center; */
    height: min-content;
  }

  /* medium size */
  @media only screen and (max-width: 1007px) {
    .canvas-frame-container {
      flex-direction: column;
    }

    .frame-box {
      flex-direction: row;
    }

    #frame-bar {
      flex-direction: row;
      width: 250px;
      overflow-x: auto;
      overflow-y: none;
      overscroll-behavior-x: contain;
      scroll-snap-type: x proximity;
    }

    #frame-bar > div {
      flex-direction: column;
    }

    .frame-buttons {
      flex-direction: row;
    }
  }

  /* small */
  @media only screen and (max-width: 640px) {
    .main-container {
      display: unset;
      align-items: unset;
      margin: 0;
    }

    .canvas-frame-container {
      justify-content: center;
      align-items: center;
    }

    .canvas-box {
      order: 2;
    }

    .frame-box {
      order: 1;
      flex-direction: row;
      /* width: 100%; */
      justify-content: space-between;
      /* align-self: flex-end; */
    }

    #frame-bar {
      max-width: 300px;
      height: 140px;
      margin-right: 10px;
    }

    #frame-bar > div {
      flex-direction: column-reverse;
    }

    .frame-buttons {
      flex-direction: column-reverse;
      margin: unset;
      align-self: center;
    }

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
      transition: none;
      animation: growup 0.3s ease-in-out forwards;
      transform-origin: bottom center;
      position: sticky;
      z-index: 40;
      align-items: flex-end;
    }

    .optionbar > * {
      margin: 20px 50px 20px 0;
    }

    .status-save-download-container {
      flex-direction: row;
      justify-content: space-between;
    }

    @keyframes growup {
      0% {
        transform: scaleY(0);
      }
      80% {
        transform: scaleY(1.1);
      }
      100% {
        transform: scaleY(1);
      }
    }

    .optionbar.hidden {
      margin: 0;
      border-right: none;
      height: min-content;
      width: auto;
      transform: none;
      display: inline;
      animation: growdown 2s ease-in-out forwards;
    }

    @keyframes growdown {
      0% {
        transform: scaleY(1);
      }
      50% {
        transform: scaleY(0.5);
      }
      100% {
        transform: scaleY(0);
      }
    }

    .optionbox-container {
      position: fixed;
      -ms-transform: initial;
      transform: initial;
    }

    .currentSelected {
      display: inline;
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

    #clear-canvas {
      top: unset;
      bottom: 60px;
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
</style>
