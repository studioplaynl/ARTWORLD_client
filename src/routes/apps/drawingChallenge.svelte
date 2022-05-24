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
    fabric.Object.prototype.transparentCorners = false;

    // console.log("managesession.socket", ManageSession.socket);

    ManageSession.socket.onstreamdata = (streamdata) => {
      let data = JSON.parse(streamdata.data);

      // console.log("$Session.user_id", $Session.user_id);
      // console.log("data.user_id", data.user_id);

      console.log("data received", data.action);

      if ($Session.user_id != data.user_id) {
        fabric.loadSVGFromString(data.action, function (objects, options) {
          objects.forEach(function (svg) {
            // svg.set({
            //   top: 90,
            //   left: 90,
            //   originX: "center",
            //   originY: "center",
            // });
            // svg.scaleToWidth(50);
            // svg.scaleToHeight(50);
            canvas.add(svg).renderAll();
          });
        });
      } else {
        console.log("The same user!");
      }
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
      const canvasData = canvas.toSVG();
      console.log("canvasData", canvasData);

      const parsedSVG = new DOMParser().parseFromString(
        canvasData,
        "text/html"
      );

      console.log("parsedSVG", parsedSVG);

      const tagElement = parsedSVG.getElementsByTagName("g");
      console.log("tagElement", tagElement);

      for (let i = 0; i < tagElement.length - 2; i++) {
        tagElement[i].remove;
      }

      console.log("parsedSVG", parsedSVG);

      const body = parsedSVG.getElementsByTagName("BODY")[0].innerHTML;

      console.log("body", body);

      // all data to send

      const location = "drawingchallenge";
      const dataToSend = `{ "action": ${JSON.stringify(
        body
      )}, "location": "${location}" }`;
      console.log("dataToSend", dataToSend);
      // // send data
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
