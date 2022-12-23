    <script>
      import Konva from 'konva';
      import { onMount } from 'svelte';
     // export let data

  export let file;
  export let data;
  export let changes;


      var width = window.innerWidth;
      var height = window.innerHeight - 25;


      onMount(() => {
        console.log(file, 'file');
        // first we need Konva core things: stage and layer
        const stage = new Konva.Stage({
          container: 'container',
          width,
          height,
        });

        const layer = new Konva.Layer();
        stage.add(layer);

        // then we are going to draw into special canvas element
        const canvas = document.createElement('canvas');
        canvas.width = stage.width();
        canvas.height = stage.height();

        // created canvas we can add to layer as "Konva.Image" element
        const image = new Konva.Image({
          image: canvas,
          x: 0,
          y: 0,
        });
        layer.add(image);

        if (!file.new) {
          Konva.Image.fromURL(
            file.url,
            (img) => {
              img.setAttrs({
                width: 300,
                height: 100,
                x: 80,
                y: 100,
                name: 'image',
                draggable: false,
              });
              layer.add(img);
            },
          );
        }


        // Good. Now we need to get access to context element
        const context = canvas.getContext('2d');
        context.strokeStyle = '#df4b26';
        context.lineJoin = 'round';
        context.lineWidth = 5;

        let isPaint = false;
        let lastPointerPosition;
        let mode = 'brush';

        // now we need to bind some events
        // we need to start drawing on mousedown
        // and stop drawing on mouseup
        image.on('mousedown touchstart', () => {
          isPaint = true;
          lastPointerPosition = stage.getPointerPosition();
        });

        // will it be better to listen move/end events on the window?

        stage.on('mouseup touchend', () => {
          isPaint = false;
        });

        // and core function - drawing
        stage.on('mousemove touchmove', () => {
          if (!isPaint) {
            return;
          }

          if (mode === 'brush') {
            context.globalCompositeOperation = 'source-over';
          }
          if (mode === 'eraser') {
            context.globalCompositeOperation = 'destination-out';
          }
          context.beginPath();

          let localPos = {
            x: lastPointerPosition.x - image.x(),
            y: lastPointerPosition.y - image.y(),
          };
          context.moveTo(localPos.x, localPos.y);
          const pos = stage.getPointerPosition();
          localPos = {
            x: pos.x - image.x(),
            y: pos.y - image.y(),
          };
          context.lineTo(localPos.x, localPos.y);
          context.closePath();
          context.stroke();

          lastPointerPosition = pos;
          // redraw manually
          layer.batchDraw();
        });

        const select = document.getElementById('tool');
        select.addEventListener('change', () => {
          mode = select.value;
        });
      });
    </script>


    Tool:
    <select id="tool">
      <option value="brush">Brush</option>
      <option value="eraser">Eraser</option>
    </select>
    <div id="container"></div>

