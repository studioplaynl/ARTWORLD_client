<script>
  import { fabric } from "./fabric";
  import { location, replace } from "svelte-spa-router";
  import { onMount, beforeUpdate } from "svelte";
  import {
    uploadImage,
    user,
    uploadAvatar,
    uploadHouse,
    getObject,
    setLoader,
    convertImage,
    updateObject,
  } from "../../api.js";
  import { client } from "../../nakama.svelte";
  import { Session, Profile, tutorial } from "../../session.js";
  import { Achievements } from "../../storage";
  import NameGenerator from "../components/nameGenerator.svelte";
  import MouseIcon from "svelte-icons/fa/FaMousePointer.svelte";
  import Avatar from "../components/avatar.svelte";
  import ManageSession from "../game/ManageSession";

  let scaleRatio, lastImg, lastValue, lastWidth;
  let params = { user: $location.split("/")[2], name: $location.split("/")[3] };
  let invalidTitle = true;
  let history = [],
    historyCurrent;
  let canv, _clipboard, Cursor, cursor, drawingColorEl;
  let saveCanvas,
    savecanvas,
    videoCanvas,
    saving = false;
  let videoWidth;
  let canvas,
    video,
    lineWidth = 25;
  let json,
    drawingColor = "#000000";
  let shadowOffset = 0,
    shadowColor = "#ffffff",
    shadowWidth = 0;
  let title,
    answer,
    showBackground = true;
  let fillColor = "#f00",
    fillTolerance = 2;
  let current = "draw";
  if (!!params.name) title = params.name;
  let saved = false,
    saveToggle = false,
    savedURL = "",
    colorToggle = true;
  const statussen = ["zichtbaar", "verborgen"];
  let status = "zichtbaar";
  let displayName;
  export let appType = $location.split("/")[1];
  let version = 0;
  let optionbox = true;
  let isDrawn = false;

  let FrameObject = {
    type: "image",
    version: "4.6.0",
    originX: "left",
    originY: "top",
    left: -2048,
    top: 0,
    width: 0,
    height: 2048,
    fill: "rgb(0,0,0)",
    stroke: null,
    strokeWidth: 0,
    strokeDashArray: null,
    strokeLineCap: "butt",
    strokeDashOffset: 0,
    strokeLineJoin: "miter",
    strokeUniform: false,
    strokeMiterLimit: 4,
    scaleX: 1,
    scaleY: 1,
    angle: 0,
    flipX: false,
    flipY: false,
    opacity: 1,
    shadow: null,
    visible: true,
    backgroundColor: "",
    fillRule: "nonzero",
    paintFirst: "fill",
    globalCompositeOperation: "source-over",
    skewX: 0,
    skewY: 0,
    erasable: true,
    cropX: 0,
    cropY: 0,
    src: "",
    crossOrigin: "anonymous",
    filters: [],
  };

  console.log("version:" + version);
  console.log("title: " + title);

  var fab = function (id) {
    return document.getElementById(id);
  };

  onMount(() => {
    console.log("on mount isDrawn", isDrawn);
    setLoader(true);
    const autosave = setInterval(() => {
      if (!saved) {
        let data = {};
        data.type = appType;
        data.name = title;
        if (appType == "drawing" || appType == "house") {
          data.drawing = canvas.toDataURL("image/png", 1);
        }
        // if (appType == "stopmotion" || appType == "avatar") {
        //   data.frames = frames;
        // }
        localStorage.setItem("Drawing", JSON.stringify(data));
        console.log("stored in localstorage");
      }
    }, 20000);
    cursor = new fabric.StaticCanvas(Cursor);
    canvas = new fabric.Canvas(canv, {
      isDrawingMode: true,
    });

    let canvasSize =
      window.innerWidth > window.innerHeight
        ? window.innerHeight
        : window.innerWidth;

    canvas.setWidth(canvasSize - 80);
    canvas.setHeight(canvasSize - 80);

    window.onresize = () => {
      canvasSize =
        window.innerWidth > window.innerHeight
          ? window.innerHeight
          : window.innerWidth;

      canvas.setWidth(canvasSize - 80);
      canvas.setHeight(canvasSize - 80);

      if (canvasSize < 1008 && canvasSize > 640) {
        canvas.setWidth(canvasSize - 140);
        canvas.setHeight(canvasSize - 140);
      }

      if (canvasSize <= 640) {
        canvas.setWidth(canvasSize - 220);
        canvas.setHeight(canvasSize - 220);
      }

      if (canvasSize <= 540) {
        canvas.setWidth(canvasSize - 80);
        canvas.setHeight(canvasSize - 80);
      }

      console.log("canvasSize", canvasSize);

      // if (width != window.innerWidth) {
      //   if (width > height) {
      //     canvas.setWidth(height - 200);
      //     // canvas.setHeight(height - 200);
      //   } else {
      //     canvas.setWidth(width - 200);
      //     // canvas.setHeight(width - 200);
      //   }
      // }
      // if (height != window.innerHeight) {
      //   // if (height > width) {
      //     // canvas.setWidth(width - 200);
      //     // canvas.setHeight(width - 200);
      //   } else {
      //     // canvas.setWidth(height - 200);
      //     // canvas.setHeight(height - 200);
      //   }
      // }
      // var width = window.innerWidth > 0 ? window.innerWidth : screen.width;
      // var height = window.innerHeight > 0 ? window.innerHeight : screen.height;
    };

    MouseIcon;
    savecanvas = new fabric.Canvas(saveCanvas, {
      isDrawingMode: true,
    });

    getImage();
    setLoader(false);

    fabric.Object.prototype.transparentCorners = false;
    resizeCanvas();

    var drawingModeEl = fab("drawing-mode"),
      selectModeEl = fab("select-mode"),
      //fillModeEl = fab("fill-mode"),
      drawingOptionsEl = fab("drawing-mode-options"),
      eraseModeEl = fab("erase-mode"),
      drawingColorEl = fab("drawing-color"),
      //drawingShadowColorEl = fab("drawing-shadow-color"),
      drawingLineWidthEl = fab("drawing-line-width"),
      //drawingShadowWidth = fab("drawing-shadow-width"),
      //drawingShadowOffset = fab("drawing-shadow-offset");
      clearEl = fab("clear-canvas");

    clearEl.onclick = function () {
      // if (window.confirm("are you sure?")) {
      console.log("renewal page button is clicked");
      if (isDrawn) {
        upload();
      }
      canvas.clear();
      localStorage.setItem("Drawing", "");
      isDrawn = false;

      // }
    };

    drawingModeEl.onclick = function () {
      // console.log("mouse is down");
      switchOption("draw");
      canvas.isDrawingMode = true;
      changebrush();
      console.log(drawingColor);
      floodFill(false);
    };

    selectModeEl.onclick = function () {
      canvas.isDrawingMode = false;
      switchOption("select");
      floodFill(false);
    };

    // fillModeEl.onclick = function () {
    //   current = "fill";
    //   floodFill(true);
    // };

    eraseModeEl.onclick = function () {
      // erase functie kapot? recompile: http://fabricjs.com/build/
      var eraseBrush = new fabric.EraserBrush(canvas);
      canvas.freeDrawingBrush = eraseBrush;
      canvas.freeDrawingBrush.width =
        parseInt(drawingLineWidthEl.value, 10) || 1;
      canvas.isDrawingMode = true;
      switchOption("erase");
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
        // brush.shadow = new fabric.Shadow({
        //   blur: parseInt(drawingShadowWidth.value, 10) || 0,
        //   offsetX: 0,
        //   offsetY: 0,
        //   affectStroke: true,
        //   color: drawingShadowColorEl.value,
        // });
      }
    }

    drawingColorEl.onchange = function () {
      var brush = canvas.freeDrawingBrush;
      brush.color = this.value;
      if (brush.getPatternSrc) {
        brush.source = brush.getPatternSrc.call(brush);
      }
    };
    // drawingShadowColorEl.onchange = function () {
    //   canvas.freeDrawingBrush.shadow.color = this.value;
    // };
    drawingLineWidthEl.onchange = function () {
      canvas.freeDrawingBrush.width = parseInt(this.value, 10) || 1;
      this.previousSibling.innerHTML = this.value;
    };

    // drawingShadowWidth.onchange = function () {
    //   canvas.freeDrawingBrush.shadow.blur = parseInt(this.value, 10) || 0;
    //   this.previousSibling.innerHTML = this.value;
    // };
    // drawingShadowOffset.onchange = function () {
    //   canvas.freeDrawingBrush.shadow.offsframes = frames;tX = parseInt(this.value, 10) || 0;
    //   canvas.freeDrawingBrush.shadow.offsetY = parseInt(this.value, 10) || 0;
    //   this.previousSibling.innerHTML = this.value;
    // };

    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = drawingColorEl.value;
      // canvas.freeDrawingBrush.source = canvas.freeDrawingBrush.getPatternSrc.call(this);
      canvas.freeDrawingBrush.width =
        parseInt(drawingLineWidthEl.value, 10) || 1;
      // canvas.freeDrawingBrush.shadow = new fabric.Shadow({
      //   blur: parseInt(drawingShadowWidth.value, 10) || 0,
      //   offsetX: 0,
      //   offsetY: 0,
      //   affectStroke: true,
      //   color: drawingShadowColorEl.value,
      // });
    }
    console.log(params);

    canvas.on("mouse:up", function (element) {
      isDrawn = true;
      mouseEvent();
    });

    //////////////// mouse circle ////////////////////////////

    //mouse cursor layer

    var cursorOpacity = 0.5;
    //create cursor and place it off screen
    var mousecursor = new fabric.Circle({
      left: -100,
      top: -100,
      radius: canvas.freeDrawingBrush.width / 2,
      fill: "rgba(0,0,0," + cursorOpacity + ")",
      stroke: "black",
      originX: "center",
      originY: "center",
    });

    cursor.add(mousecursor);

    //redraw cursor on new mouse position when moved
    canvas.on("mouse:move", function (evt) {
      if (current == "select")
        return mousecursor
          .set({ top: -100, left: -100 })
          .setCoords()
          .canvas.renderAll();
      var mouse = this.getPointer(evt.e);
      mousecursor
        .set({
          top: mouse.y,
          left: mouse.x,
        })
        .setCoords()
        .canvas.renderAll();
    });

    //while brush size is changed show cursor in center of canvas
    document.getElementById("drawing-line-width").oninput = () => {
      changeBrushSize();
    };
    document.getElementById("erase-line-width").oninput = () => {
      changeBrushSize();
    };

    function changeBrushSize() {
      var size = parseInt(lineWidth, 10);
      canvas.freeDrawingBrush.width = size;
      mousecursor
        .center()
        .set({
          radius: size / 2,
        })
        .setCoords()
        .canvas.renderAll();
    }

    //change drawing color
    drawingColorEl.onchange = function () {
      console.log("color");
      canvas.freeDrawingBrush.color = this.value;
      var bigint = parseInt(this.value.replace("#", ""), 16);
      var r = (bigint >> 16) & 255;
      var g = (bigint >> 8) & 255;
      var b = bigint & 255;
      //  mousecursor.fill = "rgba(" + [r,g,b,cursorOpacity].join(",") + ")"

      mousecursor
        .set({
          fill: "rgba(" + [r, g, b, cursorOpacity].join(",") + ")",
        })
        .canvas.renderAll();
    };

    //////////////// mouse circle ////////////////////////////

    //////////////// drawing challenge ////////////////////////
    if (appType == "drawingchallenge") {
      // each mouse-up event sends the drawing
      canvas.on("mouse:up", () => {
        // get the drawing from the canvas in the format of SVG
        const canvasData = canvas.toSVG();

        // convert SVG into the HTML format in order to be able to manipulate inner data
        const parsedSVG = new DOMParser().parseFromString(
          canvasData,
          "text/html"
        );

        // all <g> tags contain drawing action
        const gTagElement = parsedSVG.getElementsByTagName("g");

        // loop through <g> tags, remove all previous drawings and leave only the last one
        for (let i = gTagElement.length - 2; i >= 0; --i) {
          gTagElement[i].remove();
        }

        // get the position of the drawing
        const positionObject = canvas.toJSON().objects;
        // console.log("sending JSON format", positionObject[0]);

        // needed SVG is stored inside of body which we want to send only
        const body = parsedSVG.getElementsByTagName("BODY")[0].innerHTML;

        // all data to send
        const location = "drawingchallenge";
        const JSONToSend = `{ "action": ${JSON.stringify(
          body
        )}, "location": "${location}", "posX": ${
          positionObject[positionObject.length - 1].left
        }, "posY": ${positionObject[positionObject.length - 1].top}}`;

        // send data
        ManageSession.socket.rpc("move_position", JSONToSend);
      });

      // listening to the stream to get actions of other person's drawing
      ManageSession.socket.onstreamdata = (streamdata) => {
        let data = JSON.parse(streamdata.data);

        if ($Session.user_id != data.user_id) {
          // apply drawings to the canvas if only it is received from other participant
          fabric.loadSVGFromString(data.action, function (objects) {
            objects.forEach(function (svg) {
              console.log("svg", svg);
              svg.set({
                scaleX: 1,
                scaleY: 1,
                left: data.posX,
                top: data.posY,
              });
              canvas.add(svg).renderAll();
            });
          });
        } else {
          console.log("The same user!");
        }
      };
    }
    //////////////// drawing challenge ////////////////////////
  });

  const upload = async () => {
    console.log("upload is clicked");
    if (!isDrawn) return;
    if (!invalidTitle) return;
    saving = true;
    setLoader(true);
    if (appType == "drawing") {
      var Image = canvas.toDataURL("image/png", 1);
      var blobData = dataURItoBlob(Image);
      if (!!!title) {
        title = Date.now() + "_" + displayName;
      }
      // replace(`${$location}/${$Session.user_id}/${displayName}`);
      await uploadImage(
        title,
        appType,
        blobData,
        status,
        version,
        displayName
      ).then((url) => {
        savedURL = url;
        saved = true;
        saving = false;
        setLoader(false);
      });
    }
    if (appType == "house") {
      var Image = canvas.toDataURL("image/png", 1);
      var blobData = dataURItoBlob(Image);
      uploadHouse(blobData);
      saved = true;
      saving = false;
      setLoader(false);
    }
    if (appType == "stopmotion") {
      await createStopmotion();
      saved = true;
      saving = false;
      setLoader(false);
    }
    if (appType == "avatar") {
      await createAvatar();
      saved = true;
      saving = false;
      setLoader(false);
    }
  };

  async function download() {
    console.log("download", savedURL);
    let url = await convertImage(savedURL);
    window.location = url;
  }

  const updateFrame = () => {
    frames[currentFrame] = canvas.toJSON();
    frames = frames;

    backgroundFrames[currentFrame] = canvas.toDataURL("image/png", 1);
    backgroundFrames = backgroundFrames;
  };

  const getImage = async () => {
    let localStore = JSON.parse(localStorage.getItem("Drawing"));
    if (!!localStore) {
      console.log(localStore);
      console.log("store " + localStore.name);
      console.log("param " + params.name);
      if (localStore.name == params.name && typeof params.name != "undefined") {
        console.log(localStore.type);
        isDrawn = true;
        console.log("localstorage isDrawn", isDrawn);
        if (localStore.type == "drawing") {
          console.log("test");
          // canvas.loadFromJSON(
          //   localStore.drawing,
          //   canvas.renderAll.bind(canvas)
          // );
          fabric.Image.fromURL(
            localStore.drawing,
            function (oImg) {
              oImg.set({ left: 0, top: 0 });
              oImg.scaleToHeight(2048);
              oImg.scaleToWidth(2048);
              canvas.add(oImg);
            },
            { crossOrigin: "anonymous" }
          );
        }

        //     if (localStore.type == "stopmotion") {
        //       frames = localStore.frames;
        //       canvas.loadFromJSON(
        //         localStore.frames[0],
        //         canvas.renderAll.bind(canvas)
        //       );
        //     }
      }
    }

    if (!!!params.name && (appType == "stopmotion" || appType == "drawing"))
      return setLoader(false);
    console.log("appType", appType);
    // get images
    if (appType == "avatar") {
      lastImg = await convertImage($Profile.avatar_url, "2048", "10000");
    } else if (appType == "house") {
      let Object = await getObject("home", $Profile.meta.Azc, $Profile.user_id);
      lastImg = await convertImage(Object.value.url);
      lastValue = Object.value;
      title = Object.key;
      status = Object.permission_read;
    } else {
      let Object = await getObject(appType, params.name, params.user);
      console.log("object", Object);
      displayName = Object.value.displayname;
      title = Object.key;
      status = Object.permission_read;
      version = Object.value.version + 1;
      console.log("displayName", displayName);
      lastImg = await convertImage(Object.value.url);
    }
    // put images on canvas
    if (appType == "avatar" || appType == "stopmotion") {
      console.log("avatar");
      let frameAmount;
      var framebuffer = new Image();
      framebuffer.src = lastImg;
      framebuffer.onload = function () {
        console.log("img", this.width);
        lastWidth = this.width;
        frameAmount = lastWidth / 2048;

        FrameObject.src = lastImg;
        FrameObject.width = lastWidth;
        frames = [];
        for (let i = 0; i < frameAmount; i++) {
          FrameObject.left = 0;
          FrameObject.width = 2048;
          FrameObject.cropX = i * 2048;
          // FrameObject.clipTo = function (ctx) {
          //   // origin is the center of the image
          //   // var x = rectangle.left - image.getWidth() / 2;
          //   // var y = rectangle.top - image.getHeight() / 2;
          //   // ctx.rect(i * -2048, 2048, (i * -2048)+2048, 2048);
          //   ctx.rect(0,-2048,2048,2048)
          // };
          // FrameObject.setCoords();
          frames.push({
            version: "4.6.0",
            objects: [{ ...FrameObject }],
          });
        }
        frames = frames;
        console.log("frames", frames);
        currentFrame = 0;
        canvas.loadFromJSON(frames[0], function () {
          canvas.renderAll.bind(canvas);
          // for (let i = 0; i < frames.length; i++) {
          //     updateFrame()
          //     changeFrame(i)

          // }
        });
      };
    }
    if (appType == "drawing" || appType == "house") {
      fabric.Image.fromURL(
        lastImg,
        function (oImg) {
          oImg.set({ left: 0, top: 0 });
          oImg.scaleToHeight(2048);
          oImg.scaleToWidth(2048);
          canvas.add(oImg);
        },
        { crossOrigin: "anonymous" }
      );
    }

    if (!!!params.user) {
      console.log(window.location.pathname);
      replace("/" + appType + "/" + $Session.user_id + "/" + displayName);
    }

    setLoader(false);
  };

  function dataURItoBlob(dataURI) {
    var binary = atob(dataURI.split(",")[1]);
    var array = [];
    for (var i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], { type: "image/png" });
  }

  async function getDataUrl(img) {
    //  // Set width and height
    //  savecanvas.width = img.width;
    //  savecanvas.height = img.height;
    //  // Draw the image
    //  savecanvas.drawImage(img, 0, 0);
    //  return savecanvas.toDataURL('image/jpeg');

    // Create canvas
    let image;
    console.log("img", img);
    await fabric.Image.fromURL(img, function (oImg) {
      oImg.set({ left: 0, top: 0 });
      oImg.scaleToHeight(2048);
      oImg.scaleToWidth(2048);
      console.log(oImg);
      console.log(canvas);
      savecanvas.add(oImg);
    });
    image = savecanvas.toDataURL("image/png", 1);
    return image;
  }

  window.addEventListener("resize", resizeCanvas, false);

  function mouseEvent() {
    setTimeout(() => {
      updateFrame();
      saveHistory();
    }, 200);
  }

  function resizeCanvas() {
    if (document.body.clientWidth <= document.body.clientHeight) {
      scaleRatio = Math.min(
        document.body.clientWidth / 2048,
        document.body.clientWidth / 2048
      );
    } else {
      scaleRatio = Math.min(
        window.innerHeight / 2048,
        window.innerHeight / 2048
      );
    }
    canvas.setDimensions({
      width: 2048 * scaleRatio,
      height: 2048 * scaleRatio,
    });
    // savecanvas.setDimensions({ width: (2048 * scaleRatio), height: (2048 * scaleRatio) });
    cursor.setDimensions({
      width: 2048 * scaleRatio,
      height: 2048 * scaleRatio,
    });
    cursor.setZoom(scaleRatio);
    canvas.setZoom(scaleRatio);
    //savecanvas.setZoom(scaleRatio)
  }

  function zoomIt(factor) {
    // canvas.setHeight(canvas.getHeight() * factor);
    // canvas.setWidth(canvas.getWidth() * factor);
    if (canvas.backgroundImage) {
      // Need to scale background images as well
      var bi = canvas.backgroundImage;
      bi.width = bi.width * factor;
      bi.height = bi.height * factor;
    }
    var objects = canvas.getObjects();
    for (var i in objects) {
      var scaleX = objects[i].scaleX;
      var scaleY = objects[i].scaleY;
      var left = objects[i].left;
      var top = objects[i].top;

      var tempScaleX = scaleX * factor;
      var tempScaleY = scaleY * factor;
      var tempLeft = left * factor;
      var tempTop = top * factor;

      objects[i].scaleX = tempScaleX;
      objects[i].scaleY = tempScaleY;
      objects[i].left = tempLeft;
      objects[i].top = tempTop;

      objects[i].setCoords();
    }
    canvas.renderAll();
    canvas.calcOffset();
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
      let scale = 2048 / document.body.clientHeight;
      if (document.body.clientWidth <= document.body.clientHeight) {
        scale = 2048 / document.body.clientWidth;
      }
      if (!play)
        options = {
          opacity: 0.5,
          width: 2048,
          height: 2048,
          scaleX: scale,
          scaleY: scale,
        };
      else options = {};
      canvas.setBackgroundImage(f_img, canvas.renderAll.bind(canvas), options);

      canvas.renderAll();
    };
  }

  const changeFrame = (newFrame) => {
    console.log("newFrame", newFrame);
    if (!play) {
      console.log(frames);
      // save frame
      // put as background of button
      canvas.clear();
      // load frame
      canvas.loadFromJSON(frames[newFrame], canvas.renderAll.bind(canvas));
      if (showBackground) img.src = backgroundFrames[newFrame - 1];

      // change current frame
      currentFrame = newFrame;
      frames[newFrame].backgroundImage;
    }
    if (play || !showBackground) {
      canvas.clear();

      frames[newFrame].backgroundImage = {};
      canvas.loadFromJSON(frames[newFrame], canvas.renderAll.bind(canvas));
    }
  };

  const deleteFrame = (Frame) => {
    console.log("Frame", Frame);
    for (var i = 0; i < frames.length; i++) {
      console.log("frames[i], Frame", frames[i], Frame);
      if (i == Frame) {
        console.log("i", i);

        if (i > 0) {
          frames.splice(i, 1);
          currentFrame = i - 1;
          frames[currentFrame].backgroundImage = {};
          changeFrame(currentFrame);
        } else {
          frames.shift();
          frames[0].backgroundImage = {};
          currentFrame = 0;
          changeFrame(0);
        }
      }
    }
  };

  async function addFrame() {
    await updateFrame();
    if (frames.length >= maxFrames) return;
    console.log("click");
    frames.push({});
    frames = frames;
    await changeFrame(frames.length - 1);
    let framebar = document.getElementById("frame-bar");
    framebar.scrollTo({ left: 0, top: framebar.scrollHeight });
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
    maxFrames = 5;
  }

  async function createAvatar() {
    let size = 2048;
    savecanvas.setHeight(size);
    savecanvas.setWidth(size * frames.length);
    savecanvas.renderAll();
    savecanvas.clear();
    let data = { objects: [] };

    for (let i = 0; i < frames.length; i++) {
      frames[i].backgroundImage = {};
      const newFrames = frames[i].objects.map((object, index) => {
        if (object.type == "image") return;
        const newObject = { ...object };
        newObject.top = newObject.top;
        newObject.left += size * i;
        // newObject.scaleX = scaleRatio/2048;
        // newObject.scaleY = scaleRatio/2048;
        data.objects.push(newObject);
      });
    }
    FrameObject.left = 0;
    data.objects = [{ ...FrameObject }].concat(data.objects);

    console.log("data", data);

    await savecanvas.loadFromJSON(data, savecanvas.renderAll.bind(savecanvas));
    await savecanvas.calcOffset();

    //var Image = savecanvas.toDataURL("image/png", 0.2);
    // console.log(Image);
    // var blobData = dataURItoBlob(Image);
    setTimeout(async () => {
      var Image = savecanvas.toDataURL("image/png", 1);
      var blobData = dataURItoBlob(Image);
      json = JSON.stringify(frames);
      Image = await uploadAvatar(blobData, json, version);
    }, 5000);
  }

  async function createStopmotion() {
    // console.log("saved");
    json = JSON.stringify(frames);
    console.log("json", json);
    // var blobData = dataURItoBlob(frames);
    // uploadImage(title, appType, json, blobData, status);
    let size = 2048;
    savecanvas.setHeight(size);
    savecanvas.setWidth(size * frames.length);
    savecanvas.renderAll();
    savecanvas.clear();
    let data = { objects: [] };

    for (let i = 0; i < frames.length; i++) {
      frames[i].backgroundImage = {};
      const newFrames = frames[i].objects.map((object, index) => {
        //if (object.type == "image") return;
        const newObject = { ...object };
        newObject.top = newObject.top;
        newObject.left += size * i;
        // newObject.scaleX = scaleRatio/2048;
        // newObject.scaleY = scaleRatio/2048;
        data.objects.push(newObject);
      });
    }
    FrameObject.left = 0;
    // data.objects = [{ ...FrameObject }].concat(data.objects);

    console.log("data", data);

    savecanvas.loadFromJSON(data, async function () {
      savecanvas.renderAll.bind(savecanvas);
      savecanvas.calcOffset();

      var saveImage = await savecanvas.toDataURL("image/png", 1);
      console.log("savedImage", saveImage);

      var blobData = dataURItoBlob(saveImage);
      console.log("blobData", blobData);
      if (!!!title) {
        title = Date.now() + "_" + displayName;
      }
      uploadImage(title, appType, blobData, status, version, displayName).then(
        (url) => {
          savedURL = url;
          saving = false;
          setLoader(false);
        }
      );
      //Profile.update(n => n.url = Image);
    });
  }

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
    videocanv.setHeight(videoWidth / 1.33);
    videocanv.setWidth(videoWidth);
    let vidContext = videocanv.getContext("2d");
    vidContext.drawImage(video, 0, 0, videoWidth, videoWidth / 1.33);
    var uri = videoCanvas.toDataURL("image/png", 1);
    fabric.Image.fromURL(uri, function (oImg) {
      oImg.scale(1);
      oImg.set({ left: 0, top: 0 });
      canvas.add(oImg);
    });
    video.srcObject.getTracks()[0].stop();
    current = "select";
  }

  //////////////////// camera functies end ///////////////////////////

  //////////////////// redo/undo function ///////////////////////////

  const saveHistory = () => {};

  const undo = () => {
    let lastObject =
      canvas.toJSON().objects[canvas.toJSON().objects.length - 1];
    history.push(lastObject);
    let newFile = canvas.toJSON();
    newFile.objects.pop();
    canvas.loadFromJSON(newFile, canvas.renderAll.bind(canvas));
    console.log("undo is clicked", canvas.toJSON().objects);
    if (canvas.toJSON().objects.length == 0) {
      isDrawn = false;
    }
  };

  const redo = () => {
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
        img.src = tmpCanvas.toDataURL("image/png", 1);

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
    showBackground = !showBackground;
    if (!showBackground) {
      for (let i = 0; i < frames.length; i++) {
        frames[i].backgroundImage = {};
      }
      canvas.loadFromJSON(frames[currentFrame], canvas.renderAll.bind(canvas));
      frames = frames;
    } else {
      img.src = backgroundFrames[currentFrame - 1];
    }
  }

  function switchOption(option) {
    if (current === option) {
      optionbox = !optionbox;
    } else {
      optionbox = false;
      current = option;
    }
  }

  let transition = { y: 200, duration: 500 };
  if (window.screen.width >= 600) {
    transition = { x: 200, duration: 500 };
  }
</script>

<main on:mouseup={mouseEvent}>
  <div class="main-container">
    <div class="optionbox-container">
      <div class="optionbox">
        <div class="optionbar" class:hidden={optionbox}>
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
            <!-- <div
            class="widthBox"
            style="background-color: {drawingColor};"
            on:click={() => {
              drawingColorEl.click();
            }}
          >
            
          </div> -->
            <input
              type="color"
              bind:value={drawingColor}
              bind:this={drawingColorEl}
              id="drawing-color"
            />
            <img class="colorIcon" src="assets/SHB/svg/AW-icon-paint.svg" />

            <span class="info">{lineWidth}</span><input
              type="range"
              min="10"
              max="500"
              id="drawing-line-width"
              bind:value={lineWidth}
            />

            <!-- <label for="drawing-shadow-color">Shadow color:</label>
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
          /> -->
          </div>
          <div class="eraseTab" class:hidden={current != "erase"}>
            <div class="widthBox">
              <div
                class="lineWidth"
                style="background-color: black;margin:  0px auto;"
              />
            </div>
            <span class="info">{lineWidth}</span><input
              type="range"
              min="10"
              max="500"
              id="erase-line-width"
              bind:value={lineWidth}
            />
          </div>
          <div class="fillTab" class:hidden={current != "fill"}>
            <input type="color" bind:value={fillColor} id="fill-color" />
          </div>
          <div class="selectTab" class:hidden={current != "select"}>
            <a on:click={Copy}
              ><img class="icon" src="assets/SHB/svg/AW-icon-copy.svg" /></a
            >
            <a on:click={Paste}
              ><img class="icon" src="assets/SHB/svg/AW-icon-paste.svg" /></a
            >
            <a on:click={Delete}
              ><img class="icon" src="assets/SHB/svg/AW-icon-trash.svg" /></a
            >
          </div>
          <div class="saveBox" class:hidden={current != "saveToggle"}>
            <div class="saveTab">
              {#if appType != "avatar" && appType != "house"}
                <label for="title">Title</label>
                <NameGenerator bind:value={displayName} bind:invalidTitle />

                <label for="status">Status</label>
                <select bind:value={status} on:change={() => (answer = "")}>
                  {#each statussen as status}
                    <option value={status}>
                      {status}
                    </option>
                  {/each}
                </select>
              {/if}

              <button on:click={upload}
                >{#if saving}Saving{:else if saved}
                  Saved{:else}Save{/if}</button
              >
              {#if saved}
                <button on:click={download}>Download</button>
              {/if}
            </div>
          </div>
        </div>

        <div class="iconbox">
          <a on:click={undo}
            ><img class="icon" src="assets/SHB/svg/AW-icon-rotate-CCW.svg" /></a
          >
          <a on:click={redo}
            ><img class="icon" src="assets/SHB/svg/AW-icon-rotate-CW.svg" /></a
          >
          <a id="drawing-mode" class:currentSelected={current === "draw"}
            ><img class="icon" src="assets/SHB/svg/AW-icon-pen.svg" /></a
          >
          <a id="erase-mode" class:currentSelected={current === "erase"}
            ><img class="icon" src="assets/SHB/svg/AW-icon-erase.svg" /></a
          >
          <!-- <button
          class="icon"
          id="fill-mode"
          class:currentSelected={current === "fill"}><BucketIcon /></button
        > -->
          <a id="select-mode" class:currentSelected={current === "select"}
            ><img class="icon" src="assets/SHB/svg/AW-icon-pointer.svg" /></a
          >
          <!-- {#if "mediaDevices" in navigator && "getUserMedia" in navigator.mediaDevices}
          <button
            class="icon"
            id="camera-mode"
            class:currentSelected={current == "camera"}
            on:click={camera}><CameraIcon /></button
          >
        {/if} -->
          <!-- <button id="clear-canvas" class="btn btn-info icon">
          <TrashIcon />
        </button> -->

          <!-- svelte-ignore a11y-missing-attribute -->
          <a
            class:currentSelected={current === "saveToggle"}
            on:click={() => {
              // console.log("saving is clicked");
              // console.log("length", canvas.toJSON().objects);
              if (isDrawn) {
                if (appType == "drawing" || appType == "stopmotion") {
                  saveToggle = !saveToggle;
                  switchOption("saveToggle");
                }
                upload();
              }
            }}><img class="icon" src="assets/SHB/svg/AW-icon-save.svg" /></a
          >
        </div>
      </div>
    </div>
    <div id="clear-canvas"><img src="assets/SHB/svg/AW-icon-reset.svg" /></div>
    {#if appType == "avatar"}
      <div id="avatarBox">
        <Avatar />
      </div>
    {/if}

    <div class="canvas-frame-container">
      {#if current == "camera"}
        <video bind:this={video} autoplay />
        <button on:click={capturePicture} class="videoButton" />
        <div class="videocanvas">
          <canvas bind:this={videoCanvas} />
        </div>
      {/if}
      <!-- <div class="topbar">
      <div>
        <a on:click={undo}><img class="icon" src="assets/SHB/svg/AW-icon-rotate-CCW.svg"></a>
        <a on:click={redo}><img class="icon" src="assets/SHB/svg/AW-icon-rotate-CW.svg"></a>
      </div>
    </div> -->
      <div class="canvas-box" class:hidden={current === "camera"}>
        <canvas bind:this={canv} class="canvas" />
        <canvas bind:this={Cursor} id="cursor" />
      </div>
      <div class="savecanvas">
        <canvas bind:this={saveCanvas} />
      </div>
      <div class="frame-box">
        {#if appType == "stopmotion" || appType == "avatar"}
          <div id="frame-bar">
            {#each frames as frame, index}
              <div>
                <div
                  id={index}
                  class:selected={currentFrame === index}
                  on:click={() => {
                    changeFrame(index);
                    console.log("debug index of frame:", index); //remove debug
                  }}
                  style="background-image: url({backgroundFrames[index]})"
                >
                  <div>{index + 1}</div>
                </div>
                {#if currentFrame === index && frames.length > 1}
                  <img
                    class="icon"
                    on:click={() => {
                      deleteFrame(index);
                    }}
                    src="assets/SHB/svg/AW-icon-trash.svg"
                  />
                {/if}
              </div>
            {/each}
            {#if frames.length < maxFrames}
              <div>
                <div id="frameNew" on:click={addFrame}><div>+</div></div>
              </div>
            {/if}
          </div>
          <div class="frame-buttons">
            {#if play}
              <a
                id="playPause"
                on:click={() => {
                  play = false;
                  setPlay(false);
                }}
                ><img class="icon" src="assets/SHB/svg/AW-icon-pause.svg" /></a
              >
            {:else}
              <a
                id="playPause"
                on:click={() => {
                  play = true;
                  setPlay(true);
                }}><img class="icon" src="assets/SHB/svg/AW-icon-play.svg" /></a
              >
            {/if}
            <a on:click={backgroundHide}
              ><img
                class="icon"
                class:unselected={!showBackground}
                src="assets/SHB/svg/AW-icon-onion.svg"
              /></a
            >
          </div>
        {/if}
      </div>
    </div>
  </div>
</main>

<style>
  * {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
  }

  .main-container {
    display: flex;
    align-items: center;
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
    box-shadow: -3px 3px #7300ed;
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
    margin: 5px auto;
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

  .videoButton {
    border-radius: 50%;
    padding: 25px;
    margin: 0 auto;
    background: red;
    display: block;
  }

  .lineWidth {
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .widthBox {
    height: 30px;
    position: relative;
    border: solid 2px black;
    border-radius: 25px;
    padding: 10px;
    width: 30px;
  }

  .colorIcon {
    width: 32px;
    position: absolute;
    right: 5px;
    bottom: 5px;
  }

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

  video {
    margin: 0 auto;
    display: block;
  }

  .canvas-frame-container {
    display: flex;
    flex-direction: row;
  }

  .topbar {
    width: unset;
  }

  .topbar {
    float: left;
    height: 100vh;
  }

  .topbar > div {
    display: inline-grid;
    position: relative;
    top: 50%;
    margin: 10px;
    -ms-transform: translateY(-50%);
    transform: translateY(-50%);
  }

  #frame-bar > div:last-child {
    overflow-anchor: auto;
  }

  .optionbox-container {
    margin: 0 10px 0 0;
  }

  .unselected {
    filter: grayscale(1) opacity(0.5);
  }

  #avatarBox {
    position: fixed;
    top: 130px;
    left: 20px;
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
      width: 450px;
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
      /* width: 80%; */
      justify-content: space-between;
      align-self: flex-end;
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
      border-top: 2px dotted #7300ed;
      height: min-content;
      width: initial;
      padding: 0px;
      transition: none;
      animation: growup 0.3s ease-in-out forwards;
      transform-origin: bottom center;
      position: sticky;
      z-index: 40;
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
</style>
