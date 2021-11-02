<script>
  import { fabric } from "./fabric";
  import { Switch } from "attractions";
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
  import MouseIcon from "svelte-icons/fa/FaMousePointer.svelte";
  import BucketIcon from "svelte-icons/md/MdFormatColorFill.svelte";
  import CameraIcon from "svelte-icons/fa/FaCamera.svelte";
  import CopyIcon from "svelte-icons/fa/FaCopy.svelte";
  import PasteIcon from "svelte-icons/fa/FaPaste.svelte";

  export let params = {};
  let history = [],
    historyCurrent;
  let canv, _clipboard;
  let saveCanvas, savecanvas, videoCanvas;
  let videoWidth, videoHeight;
  let canvas,
    video,
    lineWidth = 5;
  let json,
    drawingColor = "#000000";
  let shadowOffset = 0,
    shadowColor = "#ffffff",
    shadowWidth = 0;
  let title,
    showBackground = true;
  let fillColor = "#f00", fillTolerance = 2;
  let current = "draw";
  if (!!params.name) title = params.name.split(".")[0];
  let saved = false;
  let saveToggle = false,
    colorToggle = true;
  const statussen = ["zichtbaar", "verborgen"];
  let status = "zichtbaar";
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
    MouseIcon;
    savecanvas = new fabric.Canvas(saveCanvas, {
      isDrawingMode: false,
    });

    getImage();

    fabric.Object.prototype.transparentCorners = false;
    resizeCanvas();

    var drawingModeEl = fab("drawing-mode"),
      selectModeEl = fab("select-mode"),
      fillModeEl = fab("fill-mode"),
      drawingOptionsEl = fab("drawing-mode-options"),
      eraseModeEl = fab("erase-mode"),
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
      current = "draw";
      canvas.isDrawingMode = true;
      changebrush();
      console.log(drawingColor);
      floodFill(false);
    };

    selectModeEl.onclick = function () {
      canvas.isDrawingMode = false;
      current = "select";
      floodFill(false);
    };

    fillModeEl.onclick = function () {
      current = "fill";
      floodFill(true);
    };

    eraseModeEl.onclick = function () {
      // erase functie kapot? recompile: http://fabricjs.com/build/
      var eraseBrush = new fabric.EraserBrush(canvas);
      canvas.freeDrawingBrush = eraseBrush;
      canvas.freeDrawingBrush.width = 10;
      canvas.isDrawingMode = true;
      current = "erase";
      floodFill(false);
    };

    if (fabric.PatternBrush) {
      var vLinePatternBrush = new fabric.PatternBrush(canvas);
      vLinePatternBrush.getPatternSrc = function () {
        var patternCanvas = fabric.document.createElement("canvas");
        patternCanvas.width = patternCanvas.height = 10;
        var ctx = patternCanvas.getContext("2d");

        ctx.strokeStyle = this.color;
        ctx.lineWidth = lineWidth;
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
        ctx.lineWidth = lineWidth;
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

    fab("drawing-mode-selector").onchange = () => changebrush();

    function changebrush() {
      brush = fab("drawing-mode-selector");
      console.log(brush);
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
    }

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

    canvas.on("mouse:up", function (element) {
      console.log(element);
      setTimeout(() => {
        updateFrame();
        saveHistory();
      }, 200);
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
    frames = frames;

    backgroundFrames[currentFrame] = canvas.toDataURL("jpeg");
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
    if (appType != "avatar") {
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
    // if (appType == "avatar") {
    //   canvas.setHeight(128);
    //   canvas.setWidth(128);
    //   canvas.renderAll();
    // } else {
    //   canvas.setHeight(window.innerWidth);
    //   canvas.setWidth(window.innerWidth);
    //   canvas.renderAll();
    //   console.log(window.innerWidth)
    // }
    console.log(window.innerWidth);
    if (window.innerWidth <= 700) {
      videoWidth = window.innerWidth - 10;
      canvas.setHeight(window.innerWidth - 10);
      canvas.setWidth(window.innerWidth - 10);
    } else {
      canvas.setHeight(700);
      canvas.setWidth(700);
      videoWidth = 700
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
  if (showBackground) {
    img.onload = function () {
      var f_img = new fabric.Image(img);
      let options;
      if (!play) options = { opacity: 0.5 };
      else options = {};
      canvas.setBackgroundImage(f_img, canvas.renderAll.bind(canvas), options);

      canvas.renderAll();
    };
  }

  const changeFrame = (newFrame) => {
    if (!play) {
      console.log(newFrame);
      // save frame
      // put as background of button
      //canvas.clear()
      // load frame
      canvas.loadFromJSON(frames[newFrame], canvas.renderAll.bind(canvas));
      if (showBackground) img.src = backgroundFrames[newFrame - 1];

      // change current frame
      currentFrame = newFrame;
      console.log(frames);
    }
    if (play || !showBackground) {
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

  ///////////////////// select functions /////////////////////////////////
  function Copy() {
    // clone what are you copying since you
    // may want copy and paste on different moment.
    // and you do not want the changes happened
    // later to reflect on the copy.
    canvas.getActiveObject().clone(function (cloned) {
      _clipboard = cloned;
    });
  }

  function Paste() {
    // clone again, so you can do multiple copies.
    _clipboard.clone(function (clonedObj) {
      canvas.discardActiveObject();
      clonedObj.set({
        left: clonedObj.left + 10,
        top: clonedObj.top + 10,
        evented: true,
      });
      if (clonedObj.type === "activeSelection") {
        // active selection needs a reference to the canvas.
        clonedObj.canvas = canvas;
        clonedObj.forEachObject(function (obj) {
          canvas.add(obj);
        });
        // this should solve the unselectability
        clonedObj.setCoords();
      } else {
        canvas.add(clonedObj);
      }
      _clipboard.top += 10;
      _clipboard.left += 10;
      canvas.setActiveObject(clonedObj);
      canvas.requestRenderAll();
    });
  }

  function Delete() {
    // clone what are you copying since you
    // may want copy and paste on different moment.
    // and you do not want the changes happened
    // later to reflect on the copy.
    var curSelectedObjects = canvas.getActiveObjects();
    canvas.discardActiveObject();
    for (var i = 0; i < curSelectedObjects.length; i++) {
      canvas.remove(curSelectedObjects[i]);
    }
  }

  /////////////// select functions end //////////////////

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
    let scale = 128 / 700;
    console.log(data);
    for (let i = 0; i < frames.length; i++) {
      frames[i].backgroundImage = {};
      const newFrames = frames[i].objects.map((object, index) => {
        const newObject = { ...object };
        newObject.left = newObject.left * scale;
        newObject.top = newObject.top * scale;
        newObject.left += 128 * i;
        newObject.scaleX = scale;
        newObject.scaleY = scale;
        console.log(newObject);
        data.objects.push(newObject);
      });
    }
    savecanvas.loadFromJSON(data, savecanvas.renderAll.bind(savecanvas));
    savecanvas.calcOffset();
    setTimeout(() => {
      var Image = savecanvas.toDataURL("image/png", 0.2);
      console.log(Image);
      var blobData = dataURItoBlob(Image);
      uploadAvatar(blobData);
    }, 300);
  }

  /*
  function createAvatar() {
    console.log("upload avatar");
    savecanvas.setHeight(128);
    savecanvas.setWidth(128 * frames.length);
    savecanvas.renderAll();
    savecanvas.clear();
    for (let i = 0; i < frames.length; i++) {
    
    }


  }
  */
  //////////////////// avatar functies end /////////////////////////////////

  //////////////////// camera functies ///////////////////////////////
  function camera() {
    current = "camera";

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(function (stream) {
          video.srcObject = stream;
          video.play();
        })
        .catch((err) => {
          console.log(err);
          alert(err);
        });
    }
  }

  async function capturePicture() {
    let videocanv = new fabric.Canvas(videoCanvas, {
      isDrawingMode: false,
    });
    videocanv.setHeight(videoWidth/1.33);
    videocanv.setWidth(videoWidth);
    let vidContext = videocanv.getContext("2d");
    console.log(video.srcObject)
    vidContext.drawImage(video, 0, 0, videoWidth, videoWidth/1.33);
    var uri = videoCanvas.toDataURL("image/png");
    fabric.Image.fromURL(uri, function (oImg) {
      oImg.scale(1);
      oImg.set({ left: 0, top: 0 });
      canvas.add(oImg);
    });
    video.srcObject.getTracks()[0].stop()
    current = "select";
  }

  //////////////////// camera functies end ///////////////////////////

  //////////////////// redo/undo function ///////////////////////////

  const saveHistory = () => {};

  const undo = () => {
    let lastObject =
      canvas.toJSON().objects[canvas.toJSON().objects.length - 1];
    console.log(lastObject);
    history.push(lastObject);
    console.log(history);
    let newFile = canvas.toJSON();
    newFile.objects.pop();
    canvas.loadFromJSON(newFile, canvas.renderAll.bind(canvas));
  };

  const redo = () => {
    console.log("redo");
    let newFile = canvas.toJSON();
    newFile.objects.push(history[history.length - 1]);
    history.pop();
    canvas.loadFromJSON(newFile, canvas.renderAll.bind(canvas));
  };

  //////////////////// redo/undo function end ///////////////////////////

  /////////////////// fill functie //////////////////////////////////////
  var FloodFill = {
    // Compare subsection of array1's values to array2's values, with an optional tolerance
    withinTolerance: function (array1, offset, array2, tolerance) {
      var length = array2.length,
        start = offset + length;
      tolerance = tolerance || 0;

      // Iterate (in reverse) the items being compared in each array, checking their values are
      // within tolerance of each other
      while (start-- && length--) {
        if (Math.abs(array1[start] - array2[length]) > tolerance) {
          return false;
        }
      }

      return true;
    },

    // The actual flood fill implementation
    fill: function (
      imageData,
      getPointOffsetFn,
      point,
      color,
      target,
      tolerance,
      width,
      height
    ) {
      var directions = [
          [1, 0],
          [0, 1],
          [0, -1],
          [-1, 0],
        ],
        coords = [],
        points = [point],
        seen = {},
        key,
        x,
        y,
        offset,
        i,
        x2,
        y2,
        minX = -1,
        maxX = -1,
        minY = -1,
        maxY = -1;

      // Keep going while we have points to walk
      while (!!(point = points.pop())) {
        x = point.x;
        y = point.y;
        offset = getPointOffsetFn(x, y);

        // Move to next point if this pixel isn't within tolerance of the color being filled
        if (!FloodFill.withinTolerance(imageData, offset, target, tolerance)) {
          continue;
        }

        if (x > maxX) {
          maxX = x;
        }
        if (y > maxY) {
          maxY = y;
        }
        if (x < minX || minX == -1) {
          minX = x;
        }
        if (y < minY || minY == -1) {
          minY = y;
        }

        // Update the pixel to the fill color and add neighbours onto stack to traverse
        // the fill area
        i = directions.length;
        while (i--) {
          // Use the same loop for setting RGBA as for checking the neighbouring pixels
          if (i < 4) {
            imageData[offset + i] = color[i];
            coords[offset + i] = color[i];
          }

          // Get the new coordinate by adjusting x and y based on current step
          x2 = x + directions[i][0];
          y2 = y + directions[i][1];
          key = x2 + "," + y2;

          // If new coordinate is out of bounds, or we've already added it, then skip to
          // trying the next neighbour without adding this one
          if (x2 < 0 || y2 < 0 || x2 >= width || y2 >= height || seen[key]) {
            continue;
          }

          // Push neighbour onto points array to be processed, and tag as seen
          points.push({ x: x2, y: y2 });
          seen[key] = true;
        }
      }

      return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
        coords: coords,
      };
    },
  }; // End FloodFill



  function hexToRgb(hex, opacity) {
    opacity = Math.round(opacity * 255) || 255;
    hex = hex.replace("#", "");
    var rgb = [],
      re = new RegExp("(.{" + hex.length / 3 + "})", "g");
    hex.match(re).map(function (l) {
      rgb.push(parseInt(hex.length % 2 ? l + l : l, 16));
    });
    return rgb.concat(opacity);
  }

  function floodFill(enable) {
    if (!enable) {
      canvas.off("mouse:down");
      canvas.selection = true;
      canvas.forEachObject(function (object) {
        object.selectable = true;
      });
      return;
    }

    canvas.discardActiveObject();
    canvas.renderAll();
    canvas.selection = false;
    canvas.forEachObject(function (object) {
      object.selectable = false;
    });

    canvas.on({
      "mouse:down": function (e) {
          var mouseX = Math.round(e.e.layerX),
          mouseY = Math.round(e.e.layerY),
          //canvas = canvas.lowerCanvasEl,
          context = canvas.getContext("2d"),
          parsedColor = hexToRgb(fillColor),
          imageData = context.getImageData(0, 0, canvas.width, canvas.height),
          getPointOffset = function (x, y) {
            return 4 * (y * imageData.width + x);
          },
          targetOffset = getPointOffset(mouseX, mouseY),
          target = imageData.data.slice(targetOffset, targetOffset + 4);

        if (FloodFill.withinTolerance(target, 0, parsedColor, fillTolerance)) {
          // Trying to fill something which is (essentially) the fill color
          console.log("Ignore... same color");
          return;
        }

        // Perform flood fill
        var data = FloodFill.fill(
          imageData.data,
          getPointOffset,
          { x: mouseX, y: mouseY },
          parsedColor,
          target,
          fillTolerance,
          imageData.width,
          imageData.height
        );

        if (0 == data.width || 0 == data.height) {
          return;
        }

        var tmpCanvas = document.createElement("canvas"),
          tmpCtx = tmpCanvas.getContext("2d");
        tmpCanvas.width = canvas.width;
        tmpCanvas.height = canvas.height;

        var palette = tmpCtx.getImageData(
          0,
          0,
          tmpCanvas.width,
          tmpCanvas.height
        ); // x, y, w, h
        palette.data.set(new Uint8ClampedArray(data.coords)); // Assuming values 0..255, RGBA
        tmpCtx.putImageData(palette, 0, 0); // Repost the data.
        var imgData = tmpCtx.getImageData(
          data.x,
          data.y,
          data.width,
          data.height
        ); // Get cropped image

        tmpCanvas.width = data.width;
        tmpCanvas.height = data.height;
        tmpCtx.putImageData(imgData, 0, 0);

        // Convert canvas back to image:
        var img = new Image();
        img.onload = function () {
          canvas.add(
            new fabric.Image(img, {
              left: data.x,
              top: data.y,
              selectable: false,
            })
          );
        };
        img.src = tmpCanvas.toDataURL("image/png");

        canvas.add(
          new fabric.Image(tmpCanvas, {
            left: data.x,
            top: data.y,
            selectable: false,
          })
        );
      },
    });
  }

  ///////////////// fill functie end ///////////////////////

  function backgroundHide() {
    if (!showBackground) {
      console.log("hidden");
      for (let i = 0; i < frames.length; i++) {
        frames[i].backgroundImage = {};
      }
      canvas.loadFromJSON(frames[currentFrame], canvas.renderAll.bind(canvas));
      frames = frames;
    } else {
      console.log("show");
      img.src = backgroundFrames[currentFrame - 1];
    }
  }
</script>

<main>
  <div class="box1">
    {#if current == "camera"}
      <video bind:this={video} autoplay />
      <button on:click={capturePicture} class="videoButton" />
      <div class="videocanvas">
        <canvas bind:this={videoCanvas} />
      </div>
    {/if}
    <div class="topbar">
      <button class="icon" on:click={undo}><UndoIcon /></button>
      <button class="icon" on:click={redo}><RedoIcon /></button>
    </div>
    <div class="canvasBox" class:hidden={current === "camera"}>
      <canvas bind:this={canv} class="canvas"  />
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
        </div>
        <Switch on:change={backgroundHide} bind:value={showBackground} />
      {/if}
    </div>
  </div>
  <div class="box2">
    <div class="optionbox">
      <div class="iconbox">
        <button
          id="drawing-mode"
          class="icon"
          class:currentSelected={current === "draw"}><ColorIcon /></button
        >
        <button
          class="icon"
          id="erase-mode"
          class:currentSelected={current === "erase"}><EraseIcon /></button
        >
        <button
          class="icon"
          id="fill-mode"
          class:currentSelected={current === "fill"}><BucketIcon /></button
        >
        <button
          class="icon"
          id="select-mode"
          class:currentSelected={current === "select"}><MouseIcon /></button
        >
        {#if "mediaDevices" in navigator && "getUserMedia" in navigator.mediaDevices}
          <button
            class="icon"
            id="camera-mode"
            class:currentSelected={current == "camera"}
            on:click={camera}><CameraIcon /></button
          >
        {/if}
        <button id="clear-canvas" class="btn btn-info icon">
          <TrashIcon />
        </button>
        <button
          class="icon"
          class:currentSelected={current === "saveToggle"}
          on:click={() => {
            saveToggle = !saveToggle;
            current = "saveToggle";
          }}><SaveIcon /></button
        >
      </div>

      <div class="optionbar">
        <div id="drawing-mode-options" class:hidden={current != "draw"}>
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

        <div class="colorTab" class:hidden={current != "draw"}>
          <div
            class="lineWidth"
            style="width:{lineWidth}px; height: {lineWidth}px; background-color: {drawingColor}; box-shadow: {shadowOffset}px {shadowOffset}px {shadowWidth}px {shadowColor};margin:  0px auto {shadowOffset}px auto;"
          />
          <span class="info">{lineWidth}</span><input
            type="range"
            min="0"
            max="150"
            id="drawing-line-width"
            bind:value={lineWidth}
          />

          <label for="drawing-color">Line color:</label>
          <input type="color" bind:value={drawingColor} id="drawing-color" />

          <label for="drawing-shadow-color">Shadow color:</label>
          <input
            type="color"
            bind:value={shadowColor}
            id="drawing-shadow-color"
          />

          <label for="drawing-shadow-width">Shadow width:</label>
          <span class="info">0</span><input
            type="range"
            bind:value={shadowWidth}
            min="0"
            max="50"
            id="drawing-shadow-width"
          />

          <label for="drawing-shadow-offset">Shadow offset:</label>
          <span class="info">0</span><input
            type="range"
            bind:value={shadowOffset}
            min="0"
            max="50"
            id="drawing-shadow-offset"
          />
        </div>
        <div class="eraseTab" class:hidden={current != "erase"}>
          <div
            class="lineWidth"
            style="width:{lineWidth}px; height: {lineWidth}px; background-color: black;margin:  0px auto;"
          />
          <span class="info">{lineWidth}</span><input
            type="range"
            min="0"
            max="150"
            id="drawing-line-width"
            bind:value={lineWidth}
          />
        </div>
        <div class="fillTab" class:hidden={current != "fill"}>
          <input
            type="color"
            bind:value={fillColor}
            id="fill-color"
          />
        </div>
        <div class="selectTab" class:hidden={current != "select"}>
          <button on:click={Copy} class="btn btn-info icon"><CopyIcon /></button
          >
          <button on:click={Paste} class="btn btn-info icon"
            ><PasteIcon /></button
          >
          <button on:click={Delete} class="btn btn-info icon"
            ><TrashIcon /></button
          >
        </div>
        <div class="saveBox" class:hidden={current != "saveToggle"}>
          <div class="saveTab">
            {#if appType != "avatar"}
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
            {/if}
            <button on:click={upload}>Save</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</main>

<style>
  main {
    background-color: rgb(204, 201, 201);
    height: 100vh;
    margin: 0 auto;
    width: fit-content;
  }

  .topbar {
    width: 100vw;
    margin: 0px auto;
    padding: 5px 0;
  }

  .canvas {
    width: 100vw;
    height: 100vw;
    margin: 0px;
  }

  .canvasBox {
    background-color: white;
    margin: 0 auto;
    width: fit-content;
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
    min-width: 160px;
    bottom: 50px;
    z-index: 1;
  }

  .savecanvas {
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

  /* .savecanvas {
    display: none;
  } */

  .iconbox {
    display: inline-block;
    margin: 10px;
    width: 50px;
    align-self: flex-start;
    border-right: 3px solid grey;
    padding-right: 10px;
  }

  .optionbar {
    margin: 10px;
    /* align-self: flex-end; */
  }

  .icon {
    min-width: 50px;
    height: 50px;
    border-radius: 50%;
    padding: 14px;
  }

  #drawing-color,
  #drawing-shadow-color {
    margin: 0.4rem;
    height: 32px;
  }

  .optionbox {
    width: fit-content;
    display: flex;
  }

  .currentSelected {
    background-color: green;
  }

  .hidden {
    display: none;
  }

  /* video {
    width: 100vw;
    height: 100vw;
  } */

  @media only screen and (min-width: 700px) {
    video {
      /* width: 700px;
      height: 700px; */
      margin: 0 auto;
      display: block;
    }

    .box1 {
      float: left;
      /* width: 100vw; */
    }

    .box2 {
      float: left;
    }

    .topbar {
      width: unset;
    }

    .optionbox {
      margin-top: 60px;
    }
  }

  .videoButton {
    border-radius: 50%;
    padding: 25px;
    margin: 0 auto;
    background: red;
    display: block;
  }

  .lineWidth {
    border-radius: 50%;
  }
</style>
