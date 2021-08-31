<script>
  import { fabric } from "fabric";
  import { onMount } from 'svelte';
  import {uploadImage} from '../../api.js';

  let canv;
  let canvas;
  let json;
  let title;

  onMount(() => {
    var fab = function(id){return document.getElementById(id)};

canvas = new fabric.Canvas(canv, {
  isDrawingMode: true
});

fabric.Object.prototype.transparentCorners = false;

var drawingModeEl = fab('drawing-mode'),
    drawingOptionsEl = fab('drawing-mode-options'),
    drawingColorEl = fab('drawing-color'),
    drawingShadowColorEl = fab('drawing-shadow-color'),
    drawingLineWidthEl = fab('drawing-line-width'),
    drawingShadowWidth = fab('drawing-shadow-width'),
    drawingShadowOffset = fab('drawing-shadow-offset'),
    clearEl = fab('clear-canvas');

clearEl.onclick = function() { canvas.clear() };

drawingModeEl.onclick = function() {
  canvas.isDrawingMode = !canvas.isDrawingMode;
  if (canvas.isDrawingMode) {
    drawingModeEl.innerHTML = 'Cancel drawing mode';
    drawingOptionsEl.style.display = '';
  }
  else {
    drawingModeEl.innerHTML = 'Enter drawing mode';
    drawingOptionsEl.style.display = 'none';
  }
};

if (fabric.PatternBrush) {
  var vLinePatternBrush = new fabric.PatternBrush(canvas);
  vLinePatternBrush.getPatternSrc = function() {

    var patternCanvas = fabric.document.createElement('canvas');
    patternCanvas.width = patternCanvas.height = 10;
    var ctx = patternCanvas.getContext('2d');

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
  hLinePatternBrush.getPatternSrc = function() {

    var patternCanvas = fabric.document.createElement('canvas');
    patternCanvas.width = patternCanvas.height = 10;
    var ctx = patternCanvas.getContext('2d');

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
  squarePatternBrush.getPatternSrc = function() {

    var squareWidth = 10, squareDistance = 2;

    var patternCanvas = fabric.document.createElement('canvas');
    patternCanvas.width = patternCanvas.height = squareWidth + squareDistance;
    var ctx = patternCanvas.getContext('2d');

    ctx.fillStyle = this.color;
    ctx.fillRect(0, 0, squareWidth, squareWidth);

    return patternCanvas;
  };

  var diamondPatternBrush = new fabric.PatternBrush(canvas);
  diamondPatternBrush.getPatternSrc = function() {

    var squareWidth = 10, squareDistance = 5;
    var patternCanvas = fabric.document.createElement('canvas');
    var rect = new fabric.Rect({
      width: squareWidth,
      height: squareWidth,
      angle: 45,
      fill: this.color
    });

    var canvasWidth = rect.getBoundingRect().width;

    patternCanvas.width = patternCanvas.height = canvasWidth + squareDistance;
    rect.set({ left: canvasWidth / 2, top: canvasWidth / 2 });

    var ctx = patternCanvas.getContext('2d');
    rect.render(ctx);

    return patternCanvas;
  };
/*
  var img = new Image();
  img.src = '../assets/honey_im_subtle.png';

  var texturePatternBrush = new fabric.PatternBrush(canvas);
  texturePatternBrush.source = img;
*/
}

fab('drawing-mode-selector').onchange = function() {

  if (this.value === 'hline') {
    canvas.freeDrawingBrush = vLinePatternBrush;
  }
  else if (this.value === 'vline') {
    canvas.freeDrawingBrush = hLinePatternBrush;
  }
  else if (this.value === 'square') {
    canvas.freeDrawingBrush = squarePatternBrush;
  }
  else if (this.value === 'diamond') {
    canvas.freeDrawingBrush = diamondPatternBrush;
  }
  else if (this.value === 'texture') {
    canvas.freeDrawingBrush = texturePatternBrush;
  }
  else {
    canvas.freeDrawingBrush = new fabric[this.value + 'Brush'](canvas);
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

drawingColorEl.onchange = function() {
  var brush = canvas.freeDrawingBrush;
  brush.color = this.value;
  if (brush.getPatternSrc) {
    brush.source = brush.getPatternSrc.call(brush);
  }
};
drawingShadowColorEl.onchange = function() {
  canvas.freeDrawingBrush.shadow.color = this.value;
};
drawingLineWidthEl.onchange = function() {
  canvas.freeDrawingBrush.width = parseInt(this.value, 10) || 1;
  this.previousSibling.innerHTML = this.value;
};
drawingShadowWidth.onchange = function() {
  canvas.freeDrawingBrush.shadow.blur = parseInt(this.value, 10) || 0;
  this.previousSibling.innerHTML = this.value;
};
drawingShadowOffset.onchange = function() {
  canvas.freeDrawingBrush.shadow.offsetX = parseInt(this.value, 10) || 0;
  canvas.freeDrawingBrush.shadow.offsetY = parseInt(this.value, 10) || 0;
  this.previousSibling.innerHTML = this.value;
};

if (canvas.freeDrawingBrush) {
  canvas.freeDrawingBrush.color = drawingColorEl.value;
 // canvas.freeDrawingBrush.source = canvas.freeDrawingBrush.getPatternSrc.call(this);
  canvas.freeDrawingBrush.width = parseInt(drawingLineWidthEl.value, 10) || 1;
  canvas.freeDrawingBrush.shadow = new fabric.Shadow({
    blur: parseInt(drawingShadowWidth.value, 10) || 0,
    offsetX: 0,
    offsetY: 0,
    affectStroke: true,
    color: drawingShadowColorEl.value,
  });
}

  });

  const upload = () => {
    json = JSON.stringify( canvas.toJSON()  );
    var Image = canvas.toDataURL('jpeg');
    var blobData = dataURItoBlob(Image);
    var type = "drawing"
    uploadImage(title,type,json,blobData)
  }

  const download = () => {
    canvas.loadFromJSON(json, canvas.renderAll.bind(canvas))
  }

  function dataURItoBlob(dataURI) {
    var binary = atob(dataURI.split(',')[1]);
    var array = [];
    for(var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
}



</script>
<main>
    <canvas bind:this={canv} width="500" height="300" />
    <div style="display: inline-block; margin-left: 10px">
        <button id="drawing-mode" class="btn btn-info">Cancel drawing mode</button><br>
        <button id="clear-canvas" class="btn btn-info">Clear</button><br>
      
        <div id="drawing-mode-options">
          <label for="drawing-mode-selector">Mode:</label>
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
          </select><br>
      
          <label for="drawing-line-width">Line width:</label>
          <span class="info">30</span><input type="range" value="30" min="0" max="150" id="drawing-line-width"><br>
      
          <label for="drawing-color">Line color:</label>
          <input type="color" value="#005E7A" id="drawing-color"><br>
      
          <label for="drawing-shadow-color">Shadow color:</label>
          <input type="color" value="#005E7A" id="drawing-shadow-color"><br>
      
          <label for="drawing-shadow-width">Shadow width:</label>
          <span class="info">0</span><input type="range" value="0" min="0" max="50" id="drawing-shadow-width"><br>
      
          <label for="drawing-shadow-offset">Shadow offset:</label>
          <span class="info">0</span><input type="range" value="0" min="0" max="50" id="drawing-shadow-offset"><br>
        </div>
        <label for="title">Title</label>
        <input type="text" bind:value={title} id="title"><br>
        <button on:click={upload} >upload Image</button>
        <button on:click={download} >download Image</button>
      </div>
</main>