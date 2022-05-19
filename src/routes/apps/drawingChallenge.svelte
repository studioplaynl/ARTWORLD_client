<script>
  import { fabric } from "./fabric";
  import { onMount } from "svelte";
  import ManageSession from "../game/ManageSession";

  let canvas;
  let canv;
  let posX, posY;

  onMount(async () => {
    // await ManageSession.socket.rpc("join", "drawingChallenge");

    // ManageSession.socket.onstreamdata = (streamdata) => {
    //   console.log("streamdata", streamdata);
    // };

    console.log("managesession.socket", ManageSession.socket);

    ManageSession.socket.onstreamdata = (streamdata) => {
      //console.info("Received stream data:", streamdata)
      let data = JSON.parse(streamdata.data);
      console.log(data);
    };

    canvas = new fabric.Canvas(canv, {
      isDrawingMode: true,
    });

    fabric.Object.prototype.transparentCorners = false;

    // catching the movement of mouse pointer over canvas
    canvas.on("mouse:down", function (options) {
      // coords
      posX = options.e.layerX;
      posY = options.e.layerY;
      console.log(posX, posY);

      const location = "drawingchallenge";

      // send
      const data = `{ "posX": ${posX}, "posY": ${posY}, "location": "${location}" }`;
      console.log("data", data);

      ManageSession.socket.rpc("move_position", data);
    });

    // function getMouseCoords(event) {
    //   const pointer = canvas.getPointer(event.e);
    //   const posX = pointer.x;
    //   const posY = pointer.y;
    //   console.log(posX + ", " + posY);
    // }
    // function mouseMoved(event) {
    //   var canvasMouseX =
    //     event.clientX - (canvas.offsetLeft - window.pageXOffset);
    //   var canvasMouseY =
    //     event.clientY - (canvas.offsetTop - window.pageYOffset);
    // }

    // var drawingModeEl = getElement("drawing-mode"),
    //   drawingOptionsEl = getElement("drawing-mode-options"),
    //   drawingColorEl = getElement("drawing-color"),
    //   drawingShadowColorEl = getElement("drawing-shadow-color"),
    //   drawingLineWidthEl = getElement("drawing-line-width"),
    //   drawingShadowWidth = getElement("drawing-shadow-width"),
    //   drawingShadowOffset = getElement("drawing-shadow-offset"),
    // clearEl = getElement("clear-canvas");

    // // clearEl.onclick = function () {
    // //   canvas.clear();
    // // };

    // // drawingModeEl.onclick = function () {
    // //   canvas.isDrawingMode = !canvas.isDrawingMode;
    // //   if (canvas.isDrawingMode) {
    // //     drawingModeEl.innerHTML = "Cancel drawing mode";
    // //     drawingOptionsEl.style.display = "";
    // //   } else {
    // //     drawingModeEl.innerHTML = "Enter drawing mode";
    // //     drawingOptionsEl.style.display = "none";
    // //   }
    // // };

    // if (fabric.PatternBrush) {
    //   var vLinePatternBrush = new fabric.PatternBrush(canvas);
    //   vLinePatternBrush.getPatternSrc = function () {
    //     var patternCanvas = fabric.document.createElement("canvas");
    //     patternCanvas.width = patternCanvas.height = 10;
    //     var ctx = patternCanvas.getContext("2d");

    //     ctx.strokeStyle = this.color;
    //     ctx.lineWidth = 5;
    //     ctx.beginPath();
    //     ctx.moveTo(0, 5);
    //     ctx.lineTo(10, 5);
    //     ctx.closePath();
    //     ctx.stroke();

    //     return patternCanvas;
    //   };

    //   var hLinePatternBrush = new fabric.PatternBrush(canvas);
    //   hLinePatternBrush.getPatternSrc = function () {
    //     var patternCanvas = fabric.document.createElement("canvas");
    //     patternCanvas.width = patternCanvas.height = 10;
    //     var ctx = patternCanvas.getContext("2d");

    //     ctx.strokeStyle = this.color;
    //     ctx.lineWidth = 5;
    //     ctx.beginPath();
    //     ctx.moveTo(5, 0);
    //     ctx.lineTo(5, 10);
    //     ctx.closePath();
    //     ctx.stroke();

    //     return patternCanvas;
    //   };

    //   var squarePatternBrush = new fabric.PatternBrush(canvas);
    //   squarePatternBrush.getPatternSrc = function () {
    //     var squareWidth = 10,
    //       squareDistance = 2;

    //     var patternCanvas = fabric.document.createElement("canvas");
    //     patternCanvas.width = patternCanvas.height =
    //       squareWidth + squareDistance;
    //     var ctx = patternCanvas.getContext("2d");

    //     ctx.fillStyle = this.color;
    //     ctx.fillRect(0, 0, squareWidth, squareWidth);

    //     return patternCanvas;
    //   };

    //   var diamondPatternBrush = new fabric.PatternBrush(canvas);
    //   diamondPatternBrush.getPatternSrc = function () {
    //     var squareWidth = 10,
    //       squareDistance = 5;
    //     var patternCanvas = fabric.document.createElement("canvas");
    //     var rect = new fabric.Rect({
    //       width: squareWidth,
    //       height: squareWidth,
    //       angle: 45,
    //       fill: this.color,
    //     });

    //     var canvasWidth = rect.getBoundingRect().width;

    //     patternCanvas.width = patternCanvas.height =
    //       canvasWidth + squareDistance;
    //     rect.set({ left: canvasWidth / 2, top: canvasWidth / 2 });

    //     var ctx = patternCanvas.getContext("2d");
    //     rect.render(ctx);

    //     return patternCanvas;
    //   };

    //   var img = new Image();
    //   img.src = "../assets/honey_im_subtle.png";

    //   var texturePatternBrush = new fabric.PatternBrush(canvas);
    //   texturePatternBrush.source = img;
    // }

    // getElement("drawing-mode-selector").onchange = function () {
    //   if (this.value === "hline") {
    //     canvas.freeDrawingBrush = vLinePatternBrush;
    //   } else if (this.value === "vline") {
    //     canvas.freeDrawingBrush = hLinePatternBrush;
    //   } else if (this.value === "square") {
    //     canvas.freeDrawingBrush = squarePatternBrush;
    //   } else if (this.value === "diamond") {
    //     canvas.freeDrawingBrush = diamondPatternBrush;
    //   } else if (this.value === "texture") {
    //     canvas.freeDrawingBrush = texturePatternBrush;
    //   } else {
    //     canvas.freeDrawingBrush = new fabric[this.value + "Brush"](canvas);
    //   }

    //   if (canvas.freeDrawingBrush) {
    //     var brush = canvas.freeDrawingBrush;
    //     brush.color = drawingColorEl.value;
    //     if (brush.getPatternSrc) {
    //       brush.source = brush.getPatternSrc.call(brush);
    //     }
    //     brush.width = parseInt(drawingLineWidthEl.value, 10) || 1;
    //     brush.shadow = new fabric.Shadow({
    //       blur: parseInt(drawingShadowWidth.value, 10) || 0,
    //       offsetX: 0,
    //       offsetY: 0,
    //       affectStroke: true,
    //       color: drawingShadowColorEl.value,
    //     });
    //   }
    // };

    // drawingColorEl.onchange = function () {
    //   var brush = canvas.freeDrawingBrush;
    //   brush.color = this.value;
    //   if (brush.getPatternSrc) {
    //     brush.source = brush.getPatternSrc.call(brush);
    //   }
    // };
    // drawingShadowColorEl.onchange = function () {
    //   canvas.freeDrawingBrush.shadow.color = this.value;
    // };
    // drawingLineWidthEl.onchange = function () {
    //   canvas.freeDrawingBrush.width = parseInt(this.value, 10) || 1;
    //   this.previousSibling.innerHTML = this.value;
    // };
    // drawingShadowWidth.onchange = function () {
    //   canvas.freeDrawingBrush.shadow.blur = parseInt(this.value, 10) || 0;
    //   this.previousSibling.innerHTML = this.value;
    // };
    // drawingShadowOffset.onchange = function () {
    //   canvas.freeDrawingBrush.shadow.offsetX = parseInt(this.value, 10) || 0;
    //   canvas.freeDrawingBrush.shadow.offsetY = parseInt(this.value, 10) || 0;
    //   this.previousSibling.innerHTML = this.value;
    // };

    // if (canvas.freeDrawingBrush) {
    //   canvas.freeDrawingBrush.color = "#2f53a1";
    //   canvas.freeDrawingBrush.source =
    //     canvas.freeDrawingBrush.getPatternSrc.call(this);
    //   canvas.freeDrawingBrush.width = 1;
    // }
  });
</script>

<div>
  <h1 style="text-align: center">Welcome to Drawing Challenge</h1>
  <div class="canvas-container">
    <canvas bind:this={canv} class="canvas-box" />
  </div>
</div>

<style>
  .canvas-container {
    display: flex;
    justify-content: center;
  }

  .canvas-box {
    border: 2px solid blue;
  }
</style>
