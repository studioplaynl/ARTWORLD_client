<script>
  import { fabric } from "./fabric";
  import { onMount } from "svelte";
  import ManageSession from "../game/ManageSession";
  import { Session } from "../../session";

  let canvas;
  let canv;
  // let posX, posY;
  // let isDrawing = false;
  // let receivedLayers;

  onMount(async () => {
    // canvas settings
    fabric.Object.prototype.transparentCorners = false;
    canvas = new fabric.Canvas(canv, {
      isDrawingMode: true,
    });

    // listening to the stream to get actions of other person's drawing
    ManageSession.socket.onstreamdata = (streamdata) => {
      let data = JSON.parse(streamdata.data);

      if ($Session.user_id != data.user_id) {
        // apply drawings to the canvas if only it is received from other participant
        fabric.loadSVGFromString(data.action, function (objects, options) {
          objects.forEach(function (svg) {
            canvas.add(svg).renderAll();
          });
        });
      } else {
        console.log("The same user!");
      }
    };

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
      for (let i = 0; i < gTagElement.length - 2; i++) {
        gTagElement[i].remove;
      }

      // needed SVG is stored inside of body which we want to send only
      const body = parsedSVG.getElementsByTagName("BODY")[0].innerHTML;

      // all data to send
      const location = "drawingchallenge";
      const dataToSend = `{ "action": ${JSON.stringify(
        body
      )}, "location": "${location}" }`;

      // send data
      ManageSession.socket.rpc("move_position", dataToSend);
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
