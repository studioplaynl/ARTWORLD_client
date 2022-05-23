<script>
  import { fabric } from "./fabric";
  import { onMount } from "svelte";
  import ManageSession from "../game/ManageSession";

  let canvas;
  let canv;
  let posX, posY;
  let isDrawing = false;

  onMount(async () => {
    fabric.Object.prototype.transparentCorners = false;

    console.log("managesession.socket", ManageSession.socket);

    ManageSession.socket.onstreamdata = (streamdata) => {
      let data = JSON.parse(streamdata.data);
      console.log("Receiving data from stream", data);
    };

    canvas = new fabric.Canvas(canv, {
      isDrawingMode: true,
    });

    canvas.on("mouse:down", () => {
      isDrawing = true;
    });

    canvas.on("mouse:move", (options) => {
      // start capturing the data to send only after pointer is down
      if (isDrawing) {
        console.log("Started drawing!");

        // all data to send
        posX = options.e.layerX;
        posY = options.e.layerY;
        const location = "drawingchallenge";
        const data = `{ "posX": ${posX}, "posY": ${posY}, "location": "${location}" }`;

        // send data
        ManageSession.socket.rpc("move_position", data);
      }
    });

    canvas.on("mouse:up", () => {
      isDrawing = false;
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
