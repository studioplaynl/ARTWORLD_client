<script>
  import  { fabric }  from "./fabric"
  import { Switch } from "attractions"
  import { location, replace } from "svelte-spa-router";
  import { onMount, beforeUpdate } from "svelte";
  import { uploadImage, user, uploadAvatar } from "../../api.js";
  import { client } from "../../nakama.svelte";
  import { Session } from "../../session.js";
  import NameGenerator from "../components/nameGenerator.svelte";
  import SaveIcon from "svelte-icons/fa/FaSave.svelte";
  import ColorIcon from "svelte-icons/md/MdBorderColor.svelte";
  import TrashIcon from "svelte-icons/fa/FaTrash.svelte";
  import PlayIcon from "svelte-icons/io/IoIosPlay.svelte";
  import PauseIcon from "svelte-icons/io/IoIosPause.svelte";
  import UndoIcon from "svelte-icons/fa/FaUndoAlt.svelte";
  import RedoIcon from "svelte-icons/fa/FaRedoAlt.svelte";
  import EraseIcon from "svelte-icons/fa/FaEraser.svelte";
  import MouseIcon from "svelte-icons/fa/FaMousePointer.svelte"
  export let params = {};
  let history = [],historyCurrent
  let canv;
  let saveCanvas, savecanvas;
  let canvas;
  let json;
  let title, showBackground;
  let current = "draw";
  if (!!params.name) title = params.name.split(".")[0];
  let saved = false;
  let saveToggle = false,
    colorToggle = true;
  const statussen = ["zichtbaar", "verborgen"];
  let status;
  let appType = $location.split("/")[1];

  onMount(() => {
    const autosave = setInterval(() => {
      if (!saved) {
        let data = {};
        data.type = appType;
        data.name = title;
        if (appType == "drawing") {
          data.drawing = canvas.toJSON();
        }
        if (appType == "stopmotion" || appType == "avatar") {
          data.frames = frames;
        }
        console.log(JSON.stringify(data));
        localStorage.setItem("Drawing", JSON.stringify(data));
        console.log("stored in localstorage");
      }
    }, 20000);

    var fab = function (id) {
      return document.getElementById(id);
    };

    canvas = new fabric.Canvas(canv, {
      isDrawingMode: true,
    });
    MouseIcon
    savecanvas = new fabric.Canvas(saveCanvas, {
      isDrawingMode: false,
    });

    getImage();

    fabric.Object.prototype.transparentCorners = false;
    resizeCanvas();

    var drawingModeEl = fab("drawing-mode"),
      selectModeEl = fab("select-mode"),
      drawingOptionsEl = fab("drawing-mode-options"),
      eraseModeEl  = fab("erase-mode"),
      drawingColorEl = fab("drawing-color"),
      drawingShadowColorEl = fab("drawing-shadow-color"),
      drawingLineWidthEl = fab("drawing-line-width"),
      drawingShadowWidth = fab("drawing-shadow-width"),
      drawingShadowOffset = fab("drawing-shadow-offset"),
      clearEl = fab("clear-canvas");

    clearEl.onclick = function () {
      if (window.confirm("are you sure?")) {
        canvas.clear();
        localStorage.setItem("Drawing", "");
      }
    };

    drawingModeEl.onclick = function () {
      canvas.isDrawingMode = true;
      changebrush()
      current = "draw"
    };

    selectModeEl.onclick = function () {
      canvas.isDrawingMode = false
      current = 'select'
    }

    eraseModeEl.onclick = function () {
      // erase functie kapot? recompile: http://fabricjs.com/build/
      var eraseBrush = new fabric.EraserBrush(canvas);
      canvas.freeDrawingBrush = eraseBrush
      canvas.freeDrawingBrush.width = 10;
      canvas.isDrawingMode = true;
      current = 'erase'
    }

    if (fabric.PatternBrush) {
      var vLinePatternBrush = new fabric.PatternBrush(canvas);
      vLinePatternBrush.getPatternSrc = function () {
        var patternCanvas = fabric.document.createElement("canvas");
        patternCanvas.width = patternCanvas.height = 10;
        var ctx = patternCanvas.getContext("2d");

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(0, 5);
        ctx.lineTo(10, 5);
        ctx.closePath();
        ctx.stroke();

        return patternCanvas;
      };

      var hLinePatternBrush = new fabric.PatternBrush(canvas);
      hLinePatternBrush.getPatternSrc = function () {
        var patternCanvas = fabric.document.createElement("canvas");
        patternCanvas.width = patternCanvas.height = 10;
        var ctx = patternCanvas.getContext("2d");

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(5, 0);
        ctx.lineTo(5, 10);
        ctx.closePath();
        ctx.stroke();

        return patternCanvas;
      };

      var squarePatternBrush = new fabric.PatternBrush(canvas);
      squarePatternBrush.getPatternSrc = function () {
        var squareWidth = 10,
          squareDistance = 2;

        var patternCanvas = fabric.document.createElement("canvas");
        patternCanvas.width = patternCanvas.height =
          squareWidth + squareDistance;
        var ctx = patternCanvas.getContext("2d");

        ctx.fillStyle = this.color;
        ctx.fillRect(0, 0, squareWidth, squareWidth);

        return patternCanvas;
      };

      var diamondPatternBrush = new fabric.PatternBrush(canvas);
      diamondPatternBrush.getPatternSrc = function () {
        var squareWidth = 10,
          squareDistance = 5;
        var patternCanvas = fabric.document.createElement("canvas");
        var rect = new fabric.Rect({
          width: squareWidth,
          height: squareWidth,
          angle: 45,
          fill: this.color,
        });

        var canvasWidth = rect.getBoundingRect().width;

        patternCanvas.width = patternCanvas.height =
          canvasWidth + squareDistance;
        rect.set({ left: canvasWidth / 2, top: canvasWidth / 2 });

        var ctx = patternCanvas.getContext("2d");
        rect.render(ctx);

        return patternCanvas;
      };
    }

    fab("drawing-mode-selector").onchange = () => changebrush()
    
    
    function changebrush() {
      brush =  fab("drawing-mode-selector")
      console.log(brush)
      if (brush.value === "hline") {
        canvas.freeDrawingBrush = vLinePatternBrush;
      } else if (brush.value === "vline") {
        canvas.freeDrawingBrush = hLinePatternBrush;
      } else if (brush.value === "square") {
        canvas.freeDrawingBrush = squarePatternBrush;
      } else if (brush.value === "diamond") {
        canvas.freeDrawingBrush = diamondPatternBrush;
      } else if (brush.value === "texture") {
        canvas.freeDrawingBrush = texturePatternBrush;
      } else {
        canvas.freeDrawingBrush = new fabric[brush.value + "Brush"](canvas);
      }

      if (canvas.freeDrawingBrush) {
        var brush = canvas.freeDrawingBrush;
        brush.color = drawingColorEl.value;
        if (brush.getPatternSrc) {
          brush.source = brush.getPatternSrc.call(brush);
        }
        brush.width = parseInt(drawingLineWidthEl.value, 10) || 1;
        brush.shadow = new fabric.Shadow({
          blur: parseInt(drawingShadowWidth.value, 10) || 0,
          offsetX: 0,
          offsetY: 0,
          affectStroke: true,
          color: drawingShadowColorEl.value,
        });
      }
    };

    drawingColorEl.onchange = function () {
      var brush = canvas.freeDrawingBrush;
      brush.color = this.value;
      if (brush.getPatternSrc) {
        brush.source = brush.getPatternSrc.call(brush);
      }
    };
    drawingShadowColorEl.onchange = function () {
      canvas.freeDrawingBrush.shadow.color = this.value;
    };
    drawingLineWidthEl.onchange = function () {
      canvas.freeDrawingBrush.width = parseInt(this.value, 10) || 1;
      this.previousSibling.innerHTML = this.value;
    };
    drawingShadowWidth.onchange = function () {
      canvas.freeDrawingBrush.shadow.blur = parseInt(this.value, 10) || 0;
      this.previousSibling.innerHTML = this.value;
    };
    drawingShadowOffset.onchange = function () {
      canvas.freeDrawingBrush.shadow.offsetX = parseInt(this.value, 10) || 0;
      canvas.freeDrawingBrush.shadow.offsetY = parseInt(this.value, 10) || 0;
      this.previousSibling.innerHTML = this.value;
    };

    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = drawingColorEl.value;
      // canvas.freeDrawingBrush.source = canvas.freeDrawingBrush.getPatternSrc.call(this);
      canvas.freeDrawingBrush.width =
        parseInt(drawingLineWidthEl.value, 10) || 1;
      canvas.freeDrawingBrush.shadow = new fabric.Shadow({
        blur: parseInt(drawingShadowWidth.value, 10) || 0,
        offsetX: 0,
        offsetY: 0,
        affectStroke: true,
        color: drawingShadowColorEl.value,
      });
    }
    console.log(params);
 
    canvas.on('mouse:up', function(element) {
      console.log(element)
      setTimeout(()=> {
        updateFrame()
        saveHistory()
      },200)

     });
  });




  const upload = () => {
    if (appType == "drawing") {
      json = JSON.stringify(canvas.toJSON());
      var Image = canvas.toDataURL("jpeg");
      var blobData = dataURItoBlob(Image);
      uploadImage(title, appType, json, blobData, status);
      saved = true;
    }
    if (appType == "stopmotion") {
      console.log("saved");
      json = JSON.stringify(frames);
      uploadImage(title, appType, json, "", status);
    }
    if (appType == "avatar") {
      createAvatar();
    }
  };

  const updateFrame = () => {
    frames[currentFrame] = canvas.toJSON();
    backgroundFrames[currentFrame] = canvas.toDataURL("jpeg");
    frames = frames;
    backgroundFrames = backgroundFrames;
  };

  const getImage = async () => {
    let localStore = JSON.parse(localStorage.getItem("Drawing"));
    if (!!localStore) {
      console.log(localStore);
      console.log("store " + localStore.name);
      console.log("param " + params.name);
      if (localStore.name == params.name) {
        console.log(localStore.type);
        if (localStore.type == "drawing") {
          console.log("test");
          canvas.loadFromJSON(
            localStore.drawing,
            canvas.renderAll.bind(canvas)
          );
        }
        if (localStore.type == "stopmotion") {
          frames = localStore.frames;
          canvas.loadFromJSON(
            localStore.frames[0],
            canvas.renderAll.bind(canvas)
          );
        }
      }
    }
    if (!!params.name && !!params.user) {
      title = params.name.split(".")[0];
      status = params.status;
      var jsonURL = await getDrawing(
        `/${appType}/${params.user}/${params.name}.json`
      );
      console.log(jsonURL);
      fetch(jsonURL)
        .then((res) => res.json())
        .then((json) => {
          console.log("Checkout this JSON! ", json);
          if (appType == "drawing")
            canvas.loadFromJSON(json, canvas.renderAll.bind(canvas));
          if (appType == "stopmotion" || appType == "avatar") {
            frames = json;
            canvas.loadFromJSON(frames[0], canvas.renderAll.bind(canvas));
          }
        })
        .catch((err) => console.log(err));
    } else {
      replace($location + "/" + $Session.user_id);
    }
  };

  function dataURItoBlob(dataURI) {
    var binary = atob(dataURI.split(",")[1]);
    var array = [];
    for (var i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], { type: "image/jpeg" });
  }

  async function getDrawing(DrawingUrl) {
    const payload = { url: DrawingUrl };
    const rpcid = "download_file";
    const fileurl = await client.rpc($Session, rpcid, payload);
    let url = fileurl.payload.url;
    console.log(url);
    return url;
  }

  window.addEventListener("resize", resizeCanvas, false);

  function resizeCanvas() {
    if (appType == "avatar") {
      canvas.setHeight(128);
      canvas.setWidth(128);
      canvas.renderAll();
    } else {
      canvas.setHeight(700);
      canvas.setWidth(700);
      canvas.renderAll();
    }
  }

  ////////////////////////// stop motion functie ////////////////////////////////////////

  let frames = [{}];
  let backgroundFrames = [{}];
  let maxFrames = 100;
  let currentFrame = 0;
  let play = false;

  // Create a new instance of the Image class
  var img = new Image();

  // When the image loads, set it as background image
  img.onload = function () {
    var f_img = new fabric.Image(img);
    let options;
    if (!play) options = { opacity: 0.5 };
    else options = {};
    canvas.setBackgroundImage(f_img, canvas.renderAll.bind(canvas), options);

    canvas.renderAll();
  };

  const changeFrame = (newFrame) => {
    if (!play) {
      console.log(newFrame);
      // save frame
      // put as background of button
      //canvas.clear()
      // load frame
      canvas.loadFromJSON(frames[newFrame], canvas.renderAll.bind(canvas));
      img.src = backgroundFrames[newFrame - 1];
      // change current frame
      currentFrame = newFrame;
      console.log(frames);
    } else {
      canvas.clear();
      frames[newFrame].backgroundImage = {};
      canvas.loadFromJSON(frames[newFrame], canvas.renderAll.bind(canvas));
    }
  };

  function addFrame() {
    updateFrame();
    if (frames.length >= maxFrames) return;
    console.log("click");
    frames.push({});
    frames = frames;
    changeFrame(frames.length - 1);
  }

  function playFrames() {
    if (currentFrame < frames.length - 1) currentFrame++;
    else currentFrame = 0;

    changeFrame(currentFrame);
  }
  let playint;

  function setPlay(bool) {
    if (bool) {
      playint = window.setInterval(playFrames, 500);
    } else {
      window.clearInterval(playint);
    }
  }

  ///////////////////// stop motion functies end //////////////////////////////

  //////////////////// avatar functies /////////////////////////////////

  if (appType == "avatar") {
    console.log("avatar");
    maxFrames = 5;
  }

  function createAvatar() {
    console.log("upload avatar");
    savecanvas.setHeight(128);
    savecanvas.setWidth(128 * frames.length);
    savecanvas.renderAll();
    savecanvas.clear();
    let data = { objects: [] };
    console.log(data);
    for (let i = 0; i < frames.length; i++) {
      frames[i].backgroundImage = {};
      const newFrames = frames[i].objects.map((object, index) => {
        const newObject = { ...object };
        newObject.left += 128 * i;
        console.log(newObject);
        data.objects.push(newObject);
      });
    }
    savecanvas.loadFromJSON(data, savecanvas.renderAll.bind(savecanvas));
    var Image = savecanvas.toDataURL("png");
    var blobData = dataURItoBlob(Image);
    uploadAvatar(blobData);
  }
  //////////////////// avatar functies end /////////////////////////////////

  //////////////////// camera functies ///////////////////////////////

  //////////////////// camera functies end ///////////////////////////


  //////////////////// redo/undo function ///////////////////////////

  const saveHistory = () => {
    
  }


  const undo = () => {
    let lastObject = canvas.toJSON().objects[canvas.toJSON().objects.length-1]
    console.log(lastObject)
    history.push(lastObject)
    console.log(history)
    let newFile = canvas.toJSON()
    newFile.objects.pop()
    canvas.loadFromJSON(newFile, canvas.renderAll.bind(canvas));
  }

  const redo = () => {
    console.log("redo")
    let newFile = canvas.toJSON()
    newFile.objects.push(history[history.length-1])
    history.pop()
    canvas.loadFromJSON(newFile, canvas.renderAll.bind(canvas));
  }


  //////////////////// redo/undo function end ///////////////////////////
  

</script>

<main>
  <div class="topbar">
    <button class="icon" on:click="{undo}"><UndoIcon /></button>
    <button class="icon" on:click="{redo}"><RedoIcon /></button>
  </div>
  <div class="canvasBox">
    <canvas bind:this={canv} class="canvas" />
  </div>
  <div class="savecanvas">
    <canvas bind:this={saveCanvas} />
  </div>
  <div class="frameBox">
    {#if appType == "stopmotion" || appType == "avatar"}
      {#if play}
        <button
          class="icon"
          on:click={() => {
            play = false;
            setPlay(false);
          }}><PauseIcon /></button
        >
      {:else}
        <button
          class="icon"
          on:click={() => {
            play = true;
            setPlay(true);
          }}><PlayIcon /></button
        >
      {/if}
      <div class="framebar">
        {#each frames as frame, index}
          <div
            id={index}
            class:selected={currentFrame === index}
            on:click={() => changeFrame(index)}
            style="background-image: url({backgroundFrames[index]})"
          >
            <div>{index + 1}</div>
          </div>
        {/each}
        {#if frames.length < maxFrames}
          <div id="frameNew" on:click={addFrame}><div>+</div></div>
        {/if}
        <Switch bind:value={showBackground} on:change={redo}></Switch>
      </div>
    {/if}
  </div>
  <div class="optionbox">
  <div class="iconbox">
    <button id="drawing-mode" class="icon" class:currentSelected="{current === 'draw'}"><ColorIcon /></button>
    <button class="icon" id="erase-mode" class:currentSelected="{current === 'erase'}"><EraseIcon /></button>
    <button class="icon" id="select-mode" class:currentSelected="{current === 'select'}"><MouseIcon /></button>
    <button id="clear-canvas" class="btn btn-info icon">
      <TrashIcon />
    </button>
    <button class="icon" class:currentSelected="{current === 'saveToggle'}"  on:click={() => {saveToggle = !saveToggle; current = 'saveToggle'}}
      ><SaveIcon /></button
    >
  </div>
  
  <div class="optionbar">
    <div id="drawing-mode-options">
      <select id="drawing-mode-selector">
        <option>Pencil</option>
        <option>Circle</option>
        <option>Spray</option>
        <option>Pattern</option>

        <option>hline</option>
        <option>vline</option>
        <option>square</option>
        <option>diamond</option>
        <option>texture</option>
      </select>
    </div>

    {#if colorToggle}
      <div class="colorTab">
        <label for="drawing-line-width">Line width:</label>
        <span class="info">5</span><input
          type="range"
          value="5"
          min="0"
          max="150"
          id="drawing-line-width"
        />

        <label for="drawing-color" class="icon">Line color:</label>
        <input type="color" value="#005E7A" id="drawing-color" />

        <label for="drawing-shadow-color">Shadow color:</label>
        <input type="color" value="#005E7A" id="drawing-shadow-color" />

        <label for="drawing-shadow-width">Shadow width:</label>
        <span class="info">0</span><input
          type="range"
          value="0"
          min="0"
          max="50"
          id="drawing-shadow-width"
        />

        <label for="drawing-shadow-offset">Shadow offset:</label>
        <span class="info">0</span><input
          type="range"
          value="0"
          min="0"
          max="50"
          id="drawing-shadow-offset"
        />
      </div>
    {/if}
    <div class="saveBox">
      <div class="saveTab">
        <label for="title">Title</label>
        <NameGenerator bind:value={title} />
        <label for="title">Status</label>
        <select bind:value={status} on:change={() => (answer = "")}>
          {#each statussen as status}
            <option value={status}>
              {status}
            </option>
          {/each}
        </select>
        <button on:click={upload}>Save</button>
      </div>
    </div>
  </div>
</div>
</main>

<style>
  main {
    background-color: rgb(204, 201, 201);
  }

  .topbar {
    width: 700px;
    margin: 0px auto;
    padding: 5px;
  }

  .canvas {
    width: 100vw;
    height: 100vw;
    margin: 0px;
  }

  .canvasBox {
    background-color: white;
    width: 700px;
    height: 700px;
    margin: 0 auto;
  }

  .framebar {
    display: inline;
  }

  .framebar > div {
    display: inline-block;
    width: 100px;
    height: 100px;
    margin: 5px;
  }

  .frameBox {
    margin: 0 auto;
    width: fit-content;
    max-width: 700px;
  }

  .framebar > div > div {
    background-color: rgba(255, 255, 255, 0.2);
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .framebar > div:hover {
    cursor: pointer;
  }

  .framebar > div {
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
  }

  .selected {
    border: 1px solid black;
  }

  .colorTab {
    margin: 15px;
  }

  .saveTab {
    display: none;
    min-width: 160px;
    bottom: 50px;
    z-index: 1;
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

  .savecanvas {
    display: none;
  }

  .iconbox {
    display: inline-block;
    margin: 10px;
    width: 50px;
    align-self: flex-start;
  }

  .optionbar {
    margin: 10px;
    align-self: flex-end;
}

  .icon {
    min-width: 50px;
    height: 50px;
    border-radius: 50%;
    padding: 14px;
  }

  #drawing-color {
    margin: 0.4rem;
    height: 32px;
  }

  .optionbox {
    width: 700px;
    margin: 0 auto;
    display: flex;
  }

  .currentSelected {
    background-color: green;
  }

</style>
