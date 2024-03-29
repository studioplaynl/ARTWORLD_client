---
title: "Log: BugFix: Drawing over the edge"
date: "2022-12-26"
---

WE DONT HAVE ENOUGH TIME TO REFACTOR TO PAINTERRO

so I am trying to implement a new solution:

1. DrawingCanvas

3. SaveCanvas

This workes and is done, after this is it still good to refactor to Painterro, because performance is lacking on an iPad for instance.

* * *

Working code so far:

```
var canvas = new fabric.Canvas(document.getElementById('canvasId'))
var canvas2 = new fabric.Canvas(document.getElementById('canvasId2'))

var canvas3 = new fabric.Canvas(document.getElementById('canvasId3'))

canvas.isDrawingMode = true;
canvas.freeDrawingBrush.width = 5;
canvas.freeDrawingBrush.color = '#00aeff';

canvas2.isDrawingMode = true;
canvas2.freeDrawingBrush.width = 10;
canvas2.freeDrawingBrush.color = '#ffaeff';

canvas.on('path:created', function(e) {
  e.path.set();
  canvas.renderAll();
  
  const preview = canvas.toDataURL({
        format: 'png',
        height: 400,
        width: 400,
      });
  
   fabric.Image.fromURL(preview, (img) => {      
    canvas3.add(img.set({ left: 0, top: 0, height: 400,
        width: 400 }))
 },{ crossOrigin: 'anonymous' },
);
  
});

canvas2.on('path:created', function(e) {
  e.path.set();
  canvas2.renderAll();
  
  const preview2 = canvas2.toDataURL({
        format: 'png',
        height: 400,
        width: 400,
      });
  
   fabric.Image.fromURL(preview2, (img) => {      
    canvas3.add(img.set({ left: 400, top: 0, height: 400,
        width: 400 }))
 },{ crossOrigin: 'anonymous' },
);
  
});
```

![](https://artworlddev.maartenvanderglas.com/wp-content/uploads/2022/12/Screenshot-from-2022-12-29-16-32-27.png)

* * *

code with 2 canvas and filtering out the last drawing (other wise fabric adds an image each time when having drawn, in effect creating an undo /redo stack!

```
var canvas = new fabric.Canvas(document.getElementById('canvasId'))
var clearCanvas = document.getElementById('clear-canvas');


var canvas2 = new fabric.Canvas(document.getElementById('canvasId2'))

var canvas3 = new fabric.Canvas(document.getElementById('canvasId3'))

canvas.isDrawingMode = true;
canvas.freeDrawingBrush.width = 5;
canvas.freeDrawingBrush.color = '#00aeff';

canvas2.isDrawingMode = true;
canvas2.freeDrawingBrush.width = 10;
canvas2.freeDrawingBrush.color = '#ffaeff';


clearCanvas.onclick = function() { canvas.clear();         pushCanvasToPreview(canvas, 0);
};

function pushCanvasToPreview(_canvas, frameNumber) {
const previewCanvasObjects = canvas3.getObjects();

    //remnove all objects with frame: frameNumber
    // that way there is only 1; the last one
    previewCanvasObjects.forEach((element) => {
      if (element.frame === frameNumber){
        canvas3.remove(element);
      }
    })
 
  const leftOffset = frameNumber * 400
  
  const preview = _canvas.toDataURL({
        format: 'png',
        height: 400,
        width: 400,
      });
  
   fabric.Image.fromURL(preview, (img) => {      
    canvas3.add(img.set({ left: leftOffset, top: 0, height: 400,
        width: 400, frame: frameNumber}))
 },{ crossOrigin: 'anonymous' },
);
  const canvasObjects = canvas3.getObjects();
  console.log(canvasObjects)
  return preview;
}

canvas.on('path:created', function(e) {
  e.path.set();
  canvas.renderAll();
  
  pushCanvasToPreview(canvas, 0)
  
});

canvas2.on('path:created', function(e) {
  e.path.set();
  canvas2.renderAll();
  
  pushCanvasToPreview(canvas2, 1);
});
```

* * *

Select between drawing canvas:

```
var canvas = new fabric.Canvas(document.getElementById('canvasId'))
var clearCanvas = document.getElementById('clear-canvas');
var selectedCanvas = 1;

var selectedCanvas1 = document.getElementById('selectCanvas1');
var selectedCanvas2 = document.getElementById('selectCanvas2');
// var canvas2 = new fabric.Canvas(document.getElementById('canvasId2'))

var canvas3 = new fabric.Canvas(document.getElementById('previewCanvas'))

canvas.isDrawingMode = true;
canvas.freeDrawingBrush.width = 5;
canvas.freeDrawingBrush.color = '#00aeff';

canvas.on('path:created', function(e) {
  e.path.set();
  canvas.renderAll();
  
  pushCanvasToPreview(canvas, selectedCanvas)
  
});

clearCanvas.onclick = function() { canvas.clear(); pushCanvasToPreview(canvas, selectedCanvas);
};

selectedCanvas1.onclick = function () {
  selectedCanvas = 0; 
  canvas.clear();
};

selectedCanvas2.onclick = function () {
  selectedCanvas = 1; 
  canvas.clear();                
};


function pushCanvasToPreview(_canvas, frameNumber) {
  const previewCanvasObjects = canvas3.getObjects();
    //remnove all objects with frame: frameNumber
    // that way there is only 1 image layer; the last one
    previewCanvasObjects.forEach((element) => {
      if (element.frame === frameNumber){
        canvas3.remove(element);
      }
    })
 
  const leftOffset = frameNumber * 400
  
  const preview = _canvas.toDataURL({
        format: 'png',
        height: 400,
        width: 400,
      });
  
   fabric.Image.fromURL(preview, (img) => {      
    canvas3.add(img.set({ left: leftOffset, top: 0, height: 400,
        width: 400, frame: frameNumber}))
 },{ crossOrigin: 'anonymous' },
);
  const canvasObjects = canvas3.getObjects();
  console.log(canvasObjects)
  return preview;
}
```

* * *

Working code for drawing canvas, SaveCanvas, can switch between canvas and keep drawing. Undo is disabled (filtered out), but could be turned on again

```
var canvas = new fabric.Canvas(document.getElementById('canvasId'))
var clearCanvas = document.getElementById('clear-canvas');
var selectedCanvas = 0;

var selectedCanvas1 = document.getElementById('selectCanvas1');
var selectedCanvas2 = document.getElementById('selectCanvas2');
// var canvas2 = new fabric.Canvas(document.getElementById('canvasId2'))

var canvas3 = new fabric.Canvas(document.getElementById('previewCanvas'))

canvas.isDrawingMode = true;
canvas.freeDrawingBrush.width = 5;
canvas.freeDrawingBrush.color = '#00aeff';

canvas.on('path:created', function(e) {
  e.path.set();
  canvas.renderAll();
  pushCanvasToPreview(canvas, selectedCanvas)
});

clearCanvas.onclick = function() { 
  canvas.clear(); 
  pushCanvasToPreview(canvas, selectedCanvas);
};

selectedCanvas1.onclick = function () {
  selectedCanvas = 0; 
  canvas.clear();
  // get the object for frame1 of the renderCanvas
  pushImageFromSaveCanvasToDrawingCanvas()
};

selectedCanvas2.onclick = function () {
  selectedCanvas = 1; 
  canvas.clear();
  // get the object for frame1 of the renderCanvas
  pushImageFromSaveCanvasToDrawingCanvas()
};

function pushImageFromSaveCanvasToDrawingCanvas(){
    const previewCanvasObjects = canvas3.getObjects();
    // remnove all objects with frame: frameNumber
    // that way there is only 1 image layer; the last one
    previewCanvasObjects.forEach((element) => {
      if (element.frame === selectedCanvas){
        const cloned = canvas3.clone(element);
        canvas.add(element.set({ left: 0, top: 0, height: 400,
        width: 400}))                    
      }
    })
}

function getCroppedImageFromCanvas(ToCanvas, frameNumber){
  var cropped = new Image();
    cropped.src = canvas3.toDataURL({
        left: 400,
        top: 0,
        width: 400,
        height: 400
    });
  fabric.Image.fromURL(preview, (img) => {      
    ToCanvas.add(img.set({ left: 0, top: 0, height: 400,
        width: 400}))
 },{ crossOrigin: 'anonymous' });
};


function pushCanvasToPreview(_canvas, frameNumber) {
  const previewCanvasObjects = canvas3.getObjects();
    //remnove all objects with frame: frameNumber
    // that way there is only 1 image layer; the last one
    previewCanvasObjects.forEach((element) => {
      if (element.frame === frameNumber){
        canvas3.remove(element);
      }
    })
 
  const leftOffset = frameNumber * 400
  
  const preview = _canvas.toDataURL({
        format: 'png',
        height: 400,
        width: 400,
      });
  
   fabric.Image.fromURL(preview, (img) => {      
    canvas3.add(img.set({ left: leftOffset, top: 0, height: 400,
        width: 400, frame: frameNumber}))
 },{ crossOrigin: 'anonymous' }
);
  //show how many objects there are in canvas3
  const canvasObjects = canvas3.getObjects();
  console.log(canvasObjects)
  return preview;
}
```

Next step:  
make SaveCanvas invisible  
use it to make previews  
Load in imagebefore on the saveCanvas, then push a crop back to the drawCanvas

```
var canvas = new fabric.Canvas(document.getElementById('canvasId'))
var clearCanvas = document.getElementById('clear-canvas'); // button
var selectedCanvas = 0;

var selectedCanvas1 = document.getElementById('selectCanvas1'); // button
var selectedCanvas2 = document.getElementById('selectCanvas2'); // button

var saveCanvas = new fabric.Canvas(document.getElementById('previewCanvas'))

canvas.isDrawingMode = true;
canvas.freeDrawingBrush.width = 5;
canvas.freeDrawingBrush.color = '#00aeff';

canvas.on('path:created', function(e) {
  e.path.set();
  canvas.renderAll();
  pushCanvasToPreview(canvas, selectedCanvas)
});

clearCanvas.onclick = function() { 
  canvas.clear(); 
  pushCanvasToPreview(canvas, selectedCanvas);
};

selectedCanvas1.onclick = function () {
  selectedCanvas = 0; 
  canvas.clear();
  // get the object for frame1 of the renderCanvas
  // pushImageFromSaveCanvasToDrawingCanvas()
  getCroppedImageFromCanvas(canvas, selectedCanvas)
};

selectedCanvas2.onclick = function () {
  selectedCanvas = 1; 
  canvas.clear();
  // get the object for frame1 of the renderCanvas
  // pushImageFromSaveCanvasToDrawingCanvas()
  getCroppedImageFromCanvas(canvas, selectedCanvas)
};

function pushImageFromSaveCanvasToDrawingCanvas(){
    const previewCanvasObjects = saveCanvas.getObjects();
    // remnove all objects with frame: frameNumber
    // that way there is only 1 image layer; the last one
    previewCanvasObjects.forEach((element) => {
      if (element.frame === selectedCanvas){
        const cloned = saveCanvas.clone(element);
        canvas.add(element.set({ left: 0, top: 0, height: 400,
        width: 400}))                    
      }
    })
}

function getCroppedImageFromCanvas(ToCanvas, frameNumber){
  const leftOffset = frameNumber * 400
  // var cropped = new Image();
  const cropped = saveCanvas.toDataURL({
        left: leftOffset,
        top: 0,
        width: 400,
        height: 400
    });
  fabric.Image.fromURL(cropped, (img) => {      
    ToCanvas.add(img.set({ left: 0, top: 0, height: 400,
        width: 400}))
 },{ crossOrigin: 'anonymous' });
};


function pushCanvasToPreview(_canvas, frameNumber) {
  const previewCanvasObjects = saveCanvas.getObjects();
    //remnove all objects with frame: frameNumber
    // that way there is only 1 image layer; the last one
    previewCanvasObjects.forEach((element) => {
      if (element.frame === frameNumber){
        saveCanvas.remove(element);
      }
    })
 
  const leftOffset = frameNumber * 400
  
  const preview = _canvas.toDataURL({
        format: 'png',
        height: 400,
        width: 400,
      });
  
   fabric.Image.fromURL(preview, (img) => {      
    saveCanvas.add(img.set({ left: leftOffset, top: 0, height: 400,
        width: 400, frame: frameNumber}))
 },{ crossOrigin: 'anonymous' }
);
  //show how many objects there are in canvas3
  const canvasObjects = saveCanvas.getObjects();
  console.log(canvasObjects)
  return preview;
}
```

HTML:

```
<canvas id="canvasId" width="400" height="400"></canvas>
<button id="clear-canvas" class="btn btn-info">Clear</button><br>
<button id="selectCanvas1" class="btn btn-info">selectCanvas1</button><br>
<button id="selectCanvas2" class="btn btn-info">selectCanvas2</button><br>

<canvas hidden id="previewCanvas" width="400" height="400" ></canvas>
```

This version works with cropping the SaveCanvas back to the DrawingCanvas: this should work with loaded images and the like;

* * *

Konva was pretty slow, so not a good replacement.

So we switched to: SPAINTER a basic paixel based canvas drawing framework.

[https://github.com/akoidan/spainter](https://github.com/akoidan/spainter)

Painterro is also an option:

[https://github.com/devforth/painterro](https://github.com/devforth/painterro)

* * *

![](https://artworlddev.maartenvanderglas.com/wp-content/uploads/2022/12/Screenshot-from-2022-12-15-16-32-27.png)

I fixed the "drawing over the border" bug by by adding a clipPath to each frame, and then clipping each stroke to that clipPath (sort of a mask). That worked, but fell apart when erasing.

The eraser also uses something like a clipPath, but it gets all wonky when erasing. The stack order doesn't make sense and the erase stroke is applied to other objects etc.

And when I would turn off the clipPath before erasing, the eraser would be able to erase in the adjacent frames.

I could try to implement eraser my self and see what is going on...

I looked into creating a mask and using it both for the eraser and for the frame.

But before trying that I tried another method: removing the points that are outside the frame after drawing. This works! But now also has to be implemented for the eraser. Because we are changing the paths after execution, we have to undo the erase and then do it again with the adjusted path.

let lineWidth = 25;  
let drawingColor = '#000000';  
let currentTab = null; make this pencil so we don't have to click twice in the beginning  
let applyBrush; where / for what is this used?  
let selectedBrush = 'Pencil';

* * *

## Alternative ideas

Wat als je een verse clippath maakt nadat de eraser bezig is geweest? Dus bij het selecteren van een brush

- - Dus: er is een clipPath en alles, er wordt geerased.
    
    - Er wordt weer getekend: de clipPath wordt weer vers aangemaakt
        - en op alle lijnen weer toegepast?

Werkt niet, want: erasen over de clipPath, in het eerste frame wordt er sowieso een groot deel van de linkerbovenhoek af geknipt

Dus dan zou de clipPath eerst op null gezet moeten worden als er erased wordt...

* * *

Andere methode: esare = bush en die deel uit laten maken van clipPath group: https://jsfiddle.net/almozdmr/yjmx6751/

* * *

Deze mask methode? https://jsfiddle.net/Fidel90/md6rwg4b/

* * *

This does not work:

```
canvas.freeDrawingBrush.limitedToCanvasSize = true;
```

Because the canvas is spread across frames.

* * *

Alternatief voor de erase tool?

//eraser

canvas.on('path:created', function (opt) {

opt.path.globalCompositeOperation = 'destination-out';

opt.path.lineWidth = strokeWidth;

opt.path.stroke = 'rgba(0,0,0,0)';

//opt.path.fill = 'black';

canvas.requestRenderAll();

});

//draw

canvas.on('path:created', function (opt) {

opt.path.globalCompositeOperation = 'source-over';

opt.path.lineWidth = strokeWidth;

opt.path.stroke = 'black';

//opt.path.fill = 'black';

canvas.requestRenderAll();

});

* * *

Trying to implement the eraser as a special brush:

```
 // Set frameNumber on object, to refer to when deleting frames
    canvas.on('path:created', (e) => {
      const idx = canvas.getObjects().length - 1;
      const index = currentFrame - 1;
      
      // is e and the last item the same? - no; e is the path of the item
      console.log("canvas.item(idx), e", canvas.item(idx), e)
      const obj = e.path;
      canvas.item(idx).frameNumber = currentFrame;
      canvas.item(idx).eraser = 'false'

      if (currentTab === 'erase'){
        canvas.item(idx).eraser = 'true'
      //   // console.log("eraser: canvas.item(idx)", canvas.item(idx))
      //   const top = canvas.item(idx).top;
      //   const left = canvas.item(idx).left;

      //   // de eraser vernietigen en weer maken met meer properties
      //   canvas.remove(obj);
      //   const newObj = new fabric.Path(obj.path, {
      //   fill: '',
      //   top: top,
      //   left: left,
      //   absolutePositioned: true,
      //   stroke: 'white',
      //   strokeWidth: lineWidth,
      //   name: 'erase_clipPath',
      //   hasControls: false,
      //   hasBorders: false,
      //   objectCaching: false,
      //   // globalCompositionOperation: 'destination-out',
      //   controlsAboveOverlay: true,
      //   perPixelTargetFind: true,
      // });
      // canvas.add(newObj);
        
      // const allCanvasObjects = canvas.getObjects()
      // console.log("allCanvasObjects", allCanvasObjects)
      // allCanvasObjects.forEach((element) => {
      //     if (element.frameNumber === currentFrame && element.eraser === 'false'){
      //       console.log("element", element)
      //       console.log("element.clipPath", element.clipPath)
      //       element.clipPath = null;
      //       element.clipPath = newObj;
      //     }
      //   })
      e.path.globalCompositionOperation = 'destination-out';
      canvas.remove(canvas.item(idx));

      const newObj = new fabric.Path(obj.path, {
        fill: '',
        // top: top,
        // left: left,
        // absolutePositioned: true,
        stroke: 'white',
        strokeWidth: lineWidth,
        name: 'erase_clipPath',
        hasControls: false,
        hasBorders: false,
        objectCaching: false,
        globalCompositionOperation: 'destination-out',
        controlsAboveOverlay: true,
        perPixelTargetFind: true,
      });
      canvas.add(newObj);

      } else if (currentTab ==='draw'){
        // clip the path with the canvasClipper so as to not draw into the next frame
        canvas.item(idx).clipPath = canvasClipperArray[index];
        console.log("canvas.item(idx).clipPath", canvas.item(idx).clipPath)
      }



      // start fix for drawing over the edge
      // const obj = e.path;
      // console.log("obj", obj);
      // console.log("selectedBrush", selectedBrush)
      // // different burshes have different line types
      // let points
      // if (selectedBrush === 'Pencil' || selectedBrush === 'Pattern'){
      //   points = [...obj.path];
      // } else if (selectedBrush === 'Circle' || selectedBrush === 'Spray'){
      //   points = [...obj.lineCoords];
      // }

      // for (let i = 0; i < points.length; i++) {
      //   const element = points[i];

      //   if (
      //     element[1] < baseSize * (currentFrame - 1) ||
      //     element[2] < 0 ||
      //     element[1] > baseSize * currentFrame ||
      //     element[2] > baseSize
      //   ) {
      //     console.log('points[i]', points[i]);
      //     points.splice(i, 1);
      //   }

      //   if (
      //     obj.left < baseSize * (currentFrame - 1) ||
      //       obj.top < 0 ||
      //       obj.left + obj.width > baseSize * currentFrame ||
      //       obj.top + obj.height > baseSize
      //   ) {
      //   // clip borders
      //     console.log('outside of acceptable borders');
      //     for (let i = 0; i < points.length; i++) {
      //       const element = points[i];
      //       if (
      //       element[1] < baseSize * (currentFrame - 1) ||
      //       element[2] < 0 ||
      //       element[1] > baseSize * currentFrame ||
      //       element[2] > baseSize
      //       ) {
      //         console.log('points[i]', points[i]);
      //         points.splice(i, 1);
      //       }
      //     }
      //   // update value if > or < then border, ajust value to border value ( -line width)
      //   }
      // }
      // obj.set({ path: points });
      // obj.setCoords();
      // const modObj = obj;

      // // console.log('after', obj.path.length);
      // // console.log('obj', obj);
      // // console.log('obj.path', obj.path);
      // canvas.remove(obj);

      // const newObj = new fabric.Path(modObj.path, {
      //   fill: '',
      //   stroke: drawingColor,
      //   strokeWidth: lineWidth,
      //   name: 'line',
      //   hasControls: false,
      //   hasBorders: false,
      //   objectCaching: false,
      // });
      // canvas.add(newObj);


    });
```

* * *

\- perPixelTargetFind: true ?

* * *

An other framework that has an eraser implemented: KONVA

[https://konvajs.org/docs/index.html](https://konvajs.org/docs/index.html)

Free drawing with erase: [https://konvajs.org/docs/sandbox/Free\_Drawing.html](https://konvajs.org/docs/sandbox/Free_Drawing.html)

undo /redo : [https://codesandbox.io/s/0o9xmkno0](https://codesandbox.io/s/0o9xmkno0)  

Transparent layers/ groups: [https://konvajs.org/docs/sandbox/Transparent\_Group.html](https://konvajs.org/docs/sandbox/Transparent_Group.html)

Zooming the stage

https://longviewcoder.com/2021/07/12/konva-zooming-the-stage-under-the-mouse/

[https://konvajs.org/docs/sandbox/Zooming\_Relative\_To\_Pointer.html](https://konvajs.org/docs/sandbox/Zooming_Relative_To_Pointer.html)

[https://konvajs.org/docs/sandbox/Responsive\_Canvas.html](https://konvajs.org/docs/sandbox/Responsive_Canvas.html)

* * *

## Flood Fill and Line Tool for HTML Canvas (also color picker)

[https://cantwell-tom.medium.com/flood-fill-and-line-tool-for-html-canvas-65e08e31aec6](https://cantwell-tom.medium.com/flood-fill-and-line-tool-for-html-canvas-65e08e31aec6)

* * *

https://ben.akrin.com/an-html5-canvas-flood-fill-that-doesnt-kill-the-browser/

* * *

[http://www.williammalone.com/projects/html5-canvas-javascript-drawing-app-with-bucket-tool/](http://www.williammalone.com/projects/html5-canvas-javascript-drawing-app-with-bucket-tool/)

* * *

## Color picker in svelte

[https://www.npmjs.com/package/svelte-awesome-color-picker](https://www.npmjs.com/package/svelte-awesome-color-picker)

[https://svelte.dev/repl/8b00804d417b4fe89f42f90d6ed485e7?version=3.47.0](https://svelte.dev/repl/8b00804d417b4fe89f42f90d6ed485e7?version=3.47.0)

* * *

Chips oude implementatie van de stopmotion/ drawing app:

git checkout 4d3f4a6be6e1659aa6175415e530fafb6fc9c5d4

```
<script>
  import { fabric } from "./fabric";
  import { location, replace } from "svelte-spa-router";
  import { onMount, beforeUpdate, onDestroy } from "svelte";
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
  let saveCanvas, savecanvas, videoCanvas;
  // saving = false;
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
  // const statussen = [true, false];
  export let appType = $location.split("/")[1];
  let version = 0;
  let optionbox = true;

  let status = true;
  let displayName;
  let isDrawn = false;
  let isPreexistingArt = false;
  let isAlreadyUploaded = false;
  let isTitleChanged = false;

  let applyBrush; // declaring the variable to be available globally, onMount assinging a function to it
  let selectedBrush = "Pencil"; // by default the Pencil is chosen

  let Object = {};

  let FrameObject = {
    type: "image",
    version: "4.6.0",
    originX: "left",
    originY: "top",
    left: -1024,
    top: 0,
    width: 0,
    height: 1024,
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

  var fab = function (id) {
    return document.getElementById(id);
  };

  function adaptCanvasSize() {
    // the canvas size is set by the least of two (width / height)
    const canvasSize =
      window.innerWidth > window.innerHeight
        ? window.innerHeight
        : window.innerWidth;

    // setting default width and height
    canvas.setWidth(canvasSize);
    canvas.setHeight(canvasSize);
    cursor.setWidth(canvasSize);
    cursor.setHeight(canvasSize);

    const canvasReductionAmount = 200;

    // for medium screens
    if (canvasSize < 1008 && canvasSize > 640) {
      canvas.setWidth(canvasSize - canvasReductionAmount);
      canvas.setHeight(canvasSize - canvasReductionAmount);
      cursor.setWidth(canvasSize - canvasReductionAmount);
      cursor.setHeight(canvasSize - canvasReductionAmount);
    }

    // for mobile screens
    if (canvasSize <= 640) {
      canvas.setWidth(canvasSize - canvasReductionAmount * 0, 55);
      canvas.setHeight(canvasSize - canvasReductionAmount * 0, 55);
      cursor.setWidth(canvasSize - canvasReductionAmount * 0, 55);
      cursor.setHeight(canvasSize - canvasReductionAmount * 0, 55);
    }

    // for mobile screens
    if (canvasSize <= 540) {
      canvas.setWidth(canvasSize - canvasReductionAmount * 0, 4);
      canvas.setHeight(canvasSize - canvasReductionAmount * 0, 4);
      cursor.setWidth(canvasSize - canvasReductionAmount * 0, 4);
      cursor.setHeight(canvasSize - canvasReductionAmount * 0, 4);
    }

    // for correct and adapted scaling of the preexisting artworks
    scaleRatio = Math.min(canvas.width / 1024, canvas.width / 1024);
    cursor.setZoom(scaleRatio);
    canvas.setZoom(scaleRatio);
  }

  onMount(() => {
    setLoader(true);
    const autosave = setInterval(() => {
      if (!saved) {
        let data = {};
        data.type = appType;
        data.name = title;
        if (appType == "drawing" || appType == "house") {
          data.drawing = canvas.toDataURL("image/png", 1);
        }

        localStorage.setItem("Drawing", JSON.stringify(data));
        console.log("stored in localstorage");
      }
    }, 20000);
    cursor = new fabric.StaticCanvas(Cursor);
    canvas = new fabric.Canvas(canv, {
      isDrawingMode: true,
    });

    // always adapting the canvas size on screen size change
    window.onresize = () => {
      adaptCanvasSize();
    };

    MouseIcon;
    savecanvas = new fabric.Canvas(saveCanvas, {
      isDrawingMode: true,
    });

    getImage();
    setLoader(false);

    fabric.Object.prototype.transparentCorners = false;

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
      // if anything is drawn on the canvas and it has not been uploaded,
      // save the artwork and clear the canvas
      if (isDrawn && !isAlreadyUploaded) {
        upload();
        isDrawn = false;
      }
      canvas.clear();
      localStorage.setItem("Drawing", "");
    };

    drawingModeEl.onclick = function () {
      // console.log("mouse is down");
      switchOption("draw");
      canvas.isDrawingMode = true;
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

    // fab("drawing-mode-selector").onchange = () => changebrush();

    // function changebrush() {
    //   brush = fab("drawing-mode-selector");
    //   console.log(brush);
    //   if (brush.value === "hline") {
    //     canvas.freeDrawingBrush = vLinePatternBrush;
    //   } else if (brush.value === "vline") {
    //     canvas.freeDrawingBrush = hLinePatternBrush;
    //   } else if (brush.value === "square") {
    //     canvas.freeDrawingBrush = squarePatternBrush;
    //   } else if (brush.value === "diamond") {
    //     canvas.freeDrawingBrush = diamondPatternBrush;
    //   } else if (brush.value === "texture") {
    //     canvas.freeDrawingBrush = texturePatternBrush;
    //   } else {
    //     canvas.freeDrawingBrush = new fabric[brush.value + "Brush"](canvas);

    //   }

    //   if (canvas.freeDrawingBrush) {
    //     var brush = canvas.freeDrawingBrush;
    //     brush.color = drawingColorEl.value;
    //     if (brush.getPatternSrc) {
    //       brush.source = brush.getPatternSrc.call(brush);
    //     }
    //     brush.width = parseInt(drawingLineWidthEl.value, 10) || 1;
    //     // brush.shadow = new fabric.Shadow({
    //     //   blur: parseInt(drawingShadowWidth.value, 10) || 0,
    //     //   offsetX: 0,
    //     //   offsetY: 0,
    //     //   affectStroke: true,
    //     //   color: drawingShadowColorEl.value,
    //     // });
    //   }
    // }

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

    canvas.on("mouse:up", function () {
      // once there is anything is drawn on the canvas
      isDrawn = true;
      isPreexistingArt = false;
      isAlreadyUploaded = false;
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
        // .center()
        .set({
          radius: size / 2,
          top: 500,
          left: 1300,
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

    adaptCanvasSize();

    applyBrush = (brushType) => {
      if (typeof brushType == "string") selectedBrush = brushType;
      canvas.freeDrawingBrush = new fabric[selectedBrush + "Brush"](canvas);
      if (canvas.freeDrawingBrush) {
        var brush = canvas.freeDrawingBrush;
        brush.color = drawingColorEl.value;
        if (brush.getPatternSrc) {
          brush.source = brush.getPatternSrc.call(brush);
        }
        brush.width = parseInt(drawingLineWidthEl.value, 10) || 1;
      }
    };
  });
  /////////////////// end onMount ///////////////////////

  // to change visible/hidden status of the artwork
  const changeVisibility = async () => {
    setLoader(true);
    status = !status;
    if (isPreexistingArt) {
      // we update the name of the preexisting artwork
      await updateObject(Object.collection, Object.key, Object.value, status);
    }
    setLoader(false);
  };

  const upload = async () => {
    if (!invalidTitle) return;

    // we upload the artwork if either something added to the art itself or when it is title changed
    if (isDrawn || isTitleChanged) {
      version = version + 1; // with every new update of the artwork, it is version gets +1

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
          // in every appType we assign url to the savedURL variable, it is needed for downloading
          // by default savedURL equals ""
          savedURL = url;
          setLoader(false);
        });
      }
      if (appType == "house") {
        var Image = canvas.toDataURL("image/png", 1);
        var blobData = dataURItoBlob(Image);
        await uploadHouse(blobData).then((response) => {
          savedURL = response;
        });
        setLoader(false);
      }
      if (appType == "stopmotion") {
        await createStopmotion();
        setLoader(false);
      }
      if (appType == "avatar") {
        createAvatar().then((resp) => {
          setLoader(false);
        });
      }
      isAlreadyUploaded = true; // once it is uploaded, we don't have to upload it again on the close button click
      isTitleChanged = false;
    }
  };

  onDestroy(() => {
    // upload the artwork on the close button click,
    // if it is not uploaded yet or if the title has been changed
    if (!isAlreadyUploaded || isTitleChanged) {
      upload();
    }
  });

  async function download() {
    // check first if we are dealing with preexisting artwork
    // if it is the case, simply download from the url of the artwork on the addressbar
    if (isPreexistingArt) {
      if (!savedURL) {
        let url = lastImg;
        window.location = url;
        return; // don't proceed
      }
    }

    // start the process of downloading, only if something is drawn on the canvas
    if (isDrawn) {
      // if the user missed clicking the save button (upload function), then upload it first
      if (!isAlreadyUploaded) {
        await upload();
      }
      if (appType == "stopmotion") {
        // the stopmotion function is not awaiting properly, a further investigation is needed (!)
        // once fixed, there is no need to use setTimeout
        setTimeout(async () => {
          const url = await convertImage(savedURL);
          window.location = url;
        }, 4500);
      } else {
        // for the rest of appTypes no need to set Timeout
        const url = await convertImage(savedURL);
        window.location = url;
      }
    }
  }

  const updateFrame = () => {
    frames[currentFrame] = canvas.toJSON();
    console.log("currentFrame", currentFrame)
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
        // isDrawn = true;
        // console.log("localstorage isDrawn", isDrawn);
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
              oImg.scaleToHeight(1024);
              oImg.scaleToWidth(1024);
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
      lastImg = await convertImage($Profile.avatar_url, "1024", "10000");
      isPreexistingArt = true;
    } else if (appType == "house") {
      let Object = await getObject("home", $Profile.meta.Azc, $Profile.user_id);
      lastImg = await convertImage(Object.value.url, "1024", "1024");
      lastValue = Object.value;
      title = Object.key;
      status = Object.permission_read == 2 ? true : false;
      isPreexistingArt = true;
    } else {
      Object = await getObject(appType, params.name, params.user);
      console.log("object", Object);
      displayName = Object.value.displayname;
      title = Object.key;
      status = Object.permission_read == 2 ? true : false;
      console.log("status in getImage", status);
      version = Object.value.version;
      console.log("displayName", displayName);
      lastImg = await convertImage(Object.value.url);
      isPreexistingArt = true;
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
        frameAmount = lastWidth / 1024;

        FrameObject.src = lastImg;
        FrameObject.width = lastWidth;
        frames = [];
        for (let i = 0; i < frameAmount; i++) {
          FrameObject.left = 0;
          FrameObject.width = 1024;
          FrameObject.cropX = i * 1024;
          // FrameObject.clipTo = function (ctx) {
          //   // origin is the center of the image
          //   // var x = rectangle.left - image.getWidth() / 2;
          //   // var y = rectangle.top - image.getHeight() / 2;
          //   // ctx.rect(i * -1024, 1024, (i * -1024)+1024, 1024);
          //   ctx.rect(0,-1024,1024,1024)
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
          canvas.renderAll.bind(canvas);});
      };
    }
    if (appType == "drawing" || appType == "house") {
      fabric.Image.fromURL(
        lastImg,
        function (oImg) {
          oImg.set({ left: 0, top: 0 });
          oImg.scaleToHeight(1024);
          oImg.scaleToWidth(1024);
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
      oImg.scaleToHeight(1024);
      oImg.scaleToWidth(1024);
      console.log(oImg);
      console.log(canvas);
      savecanvas.add(oImg);
    });
    image = savecanvas.toDataURL("image/png", 1);
    return image;
  }

  function mouseEvent() {
    setTimeout(() => {
      updateFrame();
      saveHistory();
    }, 200);
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
      let scale = 1024 / canvas.height;
      if (canvas.width <= canvas.height) {
        scale = 1024 / canvas.width;
      }
      if (!play)
        options = {
          opacity: 0.5,
          width: 1024,
          height: 1024,
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
    let size = 1024;
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
        // newObject.scaleX = scaleRatio/1024;
        // newObject.scaleY = scaleRatio/1024;
        data.objects.push(newObject);
      });
    }
    FrameObject.left = 0;
    // data.objects = [{ ...FrameObject }].concat(data.objects);

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
    console.log("111");
    // console.log("saved");
    json = JSON.stringify(frames);
    // console.log("json", json);
    // var blobData = dataURItoBlob(frames);
    // uploadImage(title, appType, json, blobData, status);
    let size = 1024;
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
        // newObject.scaleX = scaleRatio/1024;
        // newObject.scaleY = scaleRatio/1024;
        data.objects.push(newObject);
      });
    }
    FrameObject.left = 0;
    // data.objects = [{ ...FrameObject }].concat(data.objects);

    // console.log("data", data);

    savecanvas.loadFromJSON(data, async () => {
      console.log("222");
      savecanvas.renderAll.bind(savecanvas);
      savecanvas.calcOffset();

      var saveImage = await savecanvas.toDataURL("image/png", 1);
      // console.log("savedImage", saveImage);

      var blobData = dataURItoBlob(saveImage);
      // console.log("blobData", blobData);
      if (!!!title) {
        title = Date.now() + "_" + displayName;
      }
      await uploadImage(
        title,
        appType,
        blobData,
        status,
        version,
        displayName
      ).then((url) => {
        console.log("333");
        savedURL = url;
        console.log("savedURL stopmotion", savedURL);
        // saving = false;
        setLoader(false);
      });
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

    // once all previously drawn objects are deleted, isDrawn is set to false
    if (canvas.toJSON().objects.length == 0) {
      isDrawn = false;
    }
  };

  const redo = () => {
    let newFile = canvas.toJSON();
    newFile.objects.push(history[history.length - 1]);
    history.pop();
    canvas.loadFromJSON(newFile, canvas.renderAll.bind(canvas));

    // once the elements that has been removed are brought back, isDrawn is set back to true
    if (canvas.toJSON().objects.length > 0) {
      isDrawn = true;
    }
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
  <div class="optionbox-container">
    <div class="optionbox">
      <div class="optionbar" class:hidden={optionbox}>
        <div class="colorTab" class:hidden={current != "draw"}>
          <div class="drawing-options-container">
            <img
              on:click={() => applyBrush("Pencil")}
              class="icon"
              class:selected={selectedBrush == "Pencil"}
              src="assets/svg/drawing_pencil2.svg"
            />
            <img
              on:click={() => applyBrush("Circle")}
              class="icon"
              class:selected={selectedBrush == "Circle"}
              src="assets/svg/drawing_circle2.svg"
            />
            <img
              on:click={() => applyBrush("Spray")}
              class="icon"
              class:selected={selectedBrush == "Spray"}
              src="assets/svg/drawing_spray.svg"
            />
            <img
              on:click={() => applyBrush("Pattern")}
              class="icon"
              class:selected={selectedBrush == "Pattern"}
              src="assets/svg/drawing_pattern.svg"
            />
          </div>
          <!-- <div id="drawing-mode-options">
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
          </div> -->
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
          <!-- <img class="colorIcon" src="assets/SHB/svg/AW-icon-paint.svg" /> -->

          <!-- <span class="info">{lineWidth}</span> -->
          <div class="range-container">
            <div class="circle-box-small" />
            <input
              type="range"
              min="10"
              max="500"
              id="drawing-line-width"
              bind:value={lineWidth}
            />
            <div class="circle-box-big" />
          </div>

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
          <!-- <div class="widthBox">
            <div
              class="lineWidth"
              style="background-color: black;margin:  0px auto;"
            />
          </div>
          <span class="info">{lineWidth}</span> -->
          <div class="range-container">
            <div class="circle-box-small" />
            <input
              type="range"
              min="10"
              max="500"
              id="erase-line-width"
              bind:value={lineWidth}
            />
            <div class="circle-box-big" />
          </div>
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
              <NameGenerator
                bind:value={displayName}
                bind:invalidTitle
                bind:isTitleChanged
              />
            {/if}
            <!-- <label for="status">Status</label>
              <select bind:value={status} on:change={() => (answer = "")}>
                {#each statussen as status}
                  <option value={status}>
                    {status}
                  </option>
                {/each}
              </select> -->
            <div class="status-save-download-container">
              {#if appType != "avatar" && appType != "house"}
                <div on:click={changeVisibility}>
                  {#if status}
                    <img
                      class="icon selected"
                      src="assets/SHB/svg/AW-icon-visible.svg"
                    />
                  {:else}
                    <img
                      class="icon selected"
                      src="assets/SHB/svg/AW-icon-invisible.svg"
                    />
                  {/if}
                </div>
              {/if}

              <div>
                <!-- {#if saving} -->
                <!-- <img
                    on:click={upload}
                    class="icon selected"
                    src="assets/SHB/svg/AW-icon-history.svg"
                  /> -->
                <!-- {:else if saved} -->
                <img
                  on:click={upload}
                  class="icon selected"
                  src="assets/SHB/svg/AW-icon-check.svg"
                />
                <!-- {/if} -->
              </div>
              <!-- <button on:click={upload}
              >{#if saving}Saving{:else if saved}
                Saved{:else}Save{/if}</button
            > -->
              <div>
                <!-- {#if saved} -->
                <img
                  on:click={download}
                  class="icon selected"
                  src="assets/SHB/svg/AW-icon-save.svg"
                />
                <!-- {/if} -->
              </div>
            </div>
            <!-- {#if saved}
              <button >Download</button>
            {/if} -->
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
        <a
          on:click={applyBrush}
          id="drawing-mode"
          class:currentSelected={current === "draw"}
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
            if (
              appType == "drawing" ||
              appType == "stopmotion" ||
              appType == "house" ||
              appType == "avatar"
            ) {
              saveToggle = !saveToggle;
              switchOption("saveToggle");
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

  input[type="range"] {
    -webkit-appearance: none;
    -moz-apperance: none;
    border-radius: 6px;
    border: 4px solid #7300ed;
    height: 4px;
    margin: 0 10px;
  }

  input[type="range"]::-webkit-slider-thumb {
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
</style>
```

Het gaat vooral om deze componenten:

```
    let FrameObject = {
    type: "image",
    version: "4.6.0",
    originX: "left",
    originY: "top",
    left: -1024,
    top: 0,
    width: 0,
    height: 1024,
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
  
  const updateFrame = () => {
    frames[currentFrame] = canvas.toJSON();
    console.log("currentFrame", currentFrame)
    frames = frames;

    backgroundFrames[currentFrame] = canvas.toDataURL("image/png", 1);
    backgroundFrames = backgroundFrames;
  };
  
  
  lastImg = await convertImage(Object.value.url); // dit moet ingeladen worden zonder convertImage, maar met de raw versie
      isPreexistingArt = true;
  
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
          frames.push({
            version: "4.6.0",
            objects: [{ ...FrameObject }],
          });
```
