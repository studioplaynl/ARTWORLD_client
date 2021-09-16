<script>
  import { fabric } from "fabric";
  import { location, replace } from "svelte-spa-router";
  import { onMount, beforeUpdate } from "svelte";
  import { uploadImage, user, uploadAvatar } from "../../api.js";
  import { client } from "../../nakama.svelte";
  import { Session } from "../../session.js";
  import NameGenerator from "../components/nameGenerator.svelte";
  import SaveIcon from "svelte-icons/fa/FaSave.svelte";
  import ColorIcon from "svelte-icons/md/MdBorderColor.svelte";
  import TrashIcon from "svelte-icons/fa/FaTrash.svelte";

  export let params = {};
  let canv;
  let saveCanvas, savecanvas;
  let canvas;
  let json;
  let title;
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
        if(appType == "drawing"){
          data.drawing = canvas.toJSON();
        }
        if(appType == "stopmotion" || appType == "avatar"){
          data.frames = frames
        }
        console.log(JSON.stringify(data));
        localStorage.setItem('Drawing', JSON.stringify(data))
        console.log("stored in localstorage");
      }
    }, 20000);

    var fab = function (id) {
      return document.getElementById(id);
    };

    canvas = new fabric.Canvas(canv, {
      isDrawingMode: true,
    });

    savecanvas = new fabric.Canvas(saveCanvas, {
      isDrawingMode: false,
    });

    getImage();

    fabric.Object.prototype.transparentCorners = false;
    resizeCanvas();

    var drawingModeEl = fab("drawing-mode"),
      drawingOptionsEl = fab("drawing-mode-options"),
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
      canvas.isDrawingMode = !canvas.isDrawingMode;
      if (canvas.isDrawingMode) {
        drawingModeEl.innerHTML = "Cancel drawing mode";
        drawingOptionsEl.style.display = "";
      } else {
        drawingModeEl.innerHTML = "Enter drawing mode";
        drawingOptionsEl.style.display = "none";
      }
    };

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

    fab("drawing-mode-selector").onchange = function () {
      if (this.value === "hline") {
        canvas.freeDrawingBrush = vLinePatternBrush;
      } else if (this.value === "vline") {
        canvas.freeDrawingBrush = hLinePatternBrush;
      } else if (this.value === "square") {
        canvas.freeDrawingBrush = squarePatternBrush;
      } else if (this.value === "diamond") {
        canvas.freeDrawingBrush = diamondPatternBrush;
      } else if (this.value === "texture") {
        canvas.freeDrawingBrush = texturePatternBrush;
      } else {
        canvas.freeDrawingBrush = new fabric[this.value + "Brush"](canvas);
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
  });

  const upload = () => {
    updateFrame()
    if(appType == "drawing"){
      json = JSON.stringify(canvas.toJSON());
      var Image = canvas.toDataURL("jpeg");
      var blobData = dataURItoBlob(Image);
      uploadImage(title, appType, json, blobData, status);
      saved = true;
    }
    if(appType == "stopmotion"){
      console.log('saved')
      json = JSON.stringify(frames)
      uploadImage(title, appType, json, '', status);

    }
    if(appType == "avatar"){
      createAvatar();
    }
  };

  const updateFrame = () => {
    frames[currentFrame] = canvas.toJSON();
    backgroundFrames[currentFrame] = canvas.toDataURL("jpeg");
    frames = frames
    backgroundFrames = backgroundFrames
  }

  const getImage = async () => {
    let localStore = JSON.parse(localStorage.getItem("Drawing"))
    if (!!localStore) {
      console.log(localStore)
      console.log('store ' + localStore.name)
      console.log('param '+params.name)
      if (localStore.name == params.name) {
        console.log(localStore.type)
        if(localStore.type == "drawing"){
          console.log('test')
          canvas.loadFromJSON(localStore.drawing, canvas.renderAll.bind(canvas));
        }
        if(localStore.type == "stopmotion"){
          frames = localStore.frames
          canvas.loadFromJSON(localStore.frames[0], canvas.renderAll.bind(canvas));
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
          if(appType == "drawing") canvas.loadFromJSON(json, canvas.renderAll.bind(canvas));
          if(appType == "stopmotion" || appType == "avatar") {
            frames = json
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
    if(appType == "avatar"){
      canvas.setHeight(128);
      canvas.setWidth(128);
      canvas.renderAll();
    } else {
      canvas.setHeight(window.innerHeight);
      canvas.setWidth(window.innerWidth);
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
      updateFrame()
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
    updateFrame()
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

  if(appType == "avatar"){
    console.log('avatar')
    maxFrames = 5;
  }

  function createAvatar() {
    console.log('upload avatar')
    savecanvas.setHeight(128);
    savecanvas.setWidth(128 * frames.length);
    savecanvas.renderAll();
    savecanvas.clear();
    let data = {objects: []}
    console.log(data)
    for(let i = 0; i < frames.length; i++){
      frames[i].backgroundImage = {}
      const newFrames = frames[i].objects.map((object, index) => {
        const newObject = {...object};
        newObject.left += 128 * i
        console.log(newObject)
        data.objects.push(newObject)
      });
    }
   savecanvas.loadFromJSON(data, savecanvas.renderAll.bind(savecanvas));
   var Image = savecanvas.toDataURL("png");
   var blobData = dataURItoBlob(Image);
   uploadAvatar(blobData)
  }
  //////////////////// avatar functies end /////////////////////////////////

  //////////////////// camera functies ///////////////////////////////


  //////////////////// camera functies end ///////////////////////////
</script>

<main>
  <canvas bind:this={canv} class="canvas" />
  <canvas bind:this={saveCanvas} class="savecanvas" />
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

      <button id="clear-canvas" class="btn btn-info icon">
        <TrashIcon />
      </button>
    </div>
    <button on:click={() => (colorToggle = !colorToggle)} class="icon"
      ><ColorIcon /></button
    >
    <div class="saveBox">
      <button class="icon" on:click={() => (saveToggle = !saveToggle)}
        ><SaveIcon /></button
      >
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
    <button id="drawing-mode" class="btn btn-info">Cancel drawing mode</button>
    {#if appType == "stopmotion" || appType == "avatar"}
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
      </div>
      {#if play}
        <button
          on:click={() => {
            play = false;
            setPlay(false);
          }}>pause</button
        >
      {:else}
        <button
          on:click={() => {
            play = true;
            setPlay(true);
          }}>play</button
        >
      {/if}
    {/if}
  </div>
</main>

<style>
  .canvas {
    width: 100vw;
    height: 100%;
    border: 1px solid black;
    margin: 5px;
  }
  .optionbar {
    background-color: rgb(204, 201, 201);
    overflow: hidden;
    position: absolute;
    width: 100%;
    display: inline;
    padding: 10px;
  }

  .framebar {
    display: block;
  }

  .framebar > div {
    display: inline-block;
    width: 100px;
    height: 100px;
    margin: 5px;
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
    background-color: rgb(204, 201, 201);
    overflow: hidden;
    position: fixed;
    bottom: 50px;
    display: inline;
    padding: 10px;
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

  .icon {
    width: 32px;
    height: 32px;
  }

  #drawing-color {
    margin: 0.4rem;
    height: 32px;
  }
</style>
