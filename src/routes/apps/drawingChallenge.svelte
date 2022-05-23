<script>
  import { fabric } from "./fabric";
  import { onMount } from "svelte";
  import ManageSession from "../game/ManageSession";

  let canvas;
  let canv;
  // let posX, posY;
  // let isDrawing = false;
  // let receivedLayers;

  onMount(async () => {
    fabric.Object.prototype.transparentCorners = false;

    // console.log("managesession.socket", ManageSession.socket);

    ManageSession.socket.onstreamdata = (streamdata) => {
      let data = JSON.parse(streamdata.data);
      console.log("Receiving data from stream", data);

      fabric.loadSVGFromString(data.action, function (objects, options) {
        objects.forEach(function (svg) {
          svg.set({
            top: 90,
            left: 90,
            originX: "center",
            originY: "center",
          });
          svg.scaleToWidth(50);
          svg.scaleToHeight(50);
          canvas.add(svg).renderAll();
        });
      });
    };

    canvas = new fabric.Canvas(canv, {
      isDrawingMode: true,
    });

    // canvas.on("mouse:down", () => {
    //   isDrawing = true;
    // });

    // canvas.on("mouse:move", (options) => {
    //   // // start capturing the data to send only after pointer is down
    //   // if (isDrawing) {
    //   //   console.log("Started drawing!");

    //   //   // // all data to send
    //   //   // posX = options.e.layerX;
    //   //   // posY = options.e.layerY;
    //   //   // const location = "drawingchallenge";
    //   //   // const data = `{ "posX": ${posX}, "posY": ${posY}, "location": "${location}" }`;

    //   //   // // send data
    //   //   // ManageSession.socket.rpc("move_position", data);
    //   // }
    // });

    canvas.on("mouse:up", () => {
      // console.log("canvas.toJSON()", canvas.toJSON());
      const canvasData = JSON.stringify(canvas.toSVG());
      // console.log("canvasData", canvasData);

      // all data to send

      const location = "drawingchallenge";
      const dataToSend = `{ "action": ${canvasData}, "location": "${location}" }`;
      console.log("dataToSend", dataToSend);
      // send data
      ManageSession.socket.rpc("move_position", dataToSend);

      // isDrawing = false;
    });
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
