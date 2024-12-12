<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let color = '#000000';
  
  let pickerSize = 200;
  let canvas;
  let ctx;
  let isDragging = false;
  let selectedPoint = { x: pickerSize/2, y: pickerSize/2 };
  
  $: {
    if (canvas) {
      drawColorWheel();
      drawSelector();
    }
  }

  function drawColorWheel() {
    ctx = canvas.getContext('2d');
    
    // Draw color wheel
    for(let x = 0; x < pickerSize; x++) {
      for(let y = 0; y < pickerSize; y++) {
        const centerX = pickerSize / 2;
        const centerY = pickerSize / 2;
        
        // Calculate angle and distance from center
        const angle = Math.atan2(y - centerY, x - centerX);
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        
        // Convert to HSL
        const hue = ((angle * 180 / Math.PI) + 360) % 360;
        const saturation = Math.min(100, (distance / (pickerSize/2)) * 100);
        const lightness = 50;

        if(distance <= pickerSize/2) {
          ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  }

  function drawSelector() {
    // Draw selector circle
    ctx.beginPath();
    ctx.arc(selectedPoint.x, selectedPoint.y, 6, 0, Math.PI * 2);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(selectedPoint.x, selectedPoint.y, 5, 0, Math.PI * 2);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function handleMouseDown(event) {
    isDragging = true;
    updateColor(event);
  }

  function handleMouseMove(event) {
    if (isDragging) {
      updateColor(event);
    }
  }

  function handleMouseUp() {
    isDragging = false;
  }

  function updateColor(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Check if within circle bounds
    const centerX = pickerSize / 2;
    const centerY = pickerSize / 2;
    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    
    if (distance <= pickerSize/2) {
      selectedPoint = { x, y };
      const imageData = ctx.getImageData(x, y, 1, 1).data;
      color = rgbToHex(imageData[0], imageData[1], imageData[2]);
      dispatch('colorChange', { color });
      drawColorWheel();
      drawSelector();
    }
  }

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }
</script>

<div class="color-picker">
  <canvas
    bind:this={canvas}
    width={pickerSize}
    height={pickerSize}
    on:mousedown={handleMouseDown}
    on:mousemove={handleMouseMove}
    on:mouseup={handleMouseUp}
    on:mouseleave={handleMouseUp}
  ></canvas>
</div>

<style>
  .color-picker {
    display: inline-block;
    border-radius: 50%;
    overflow: hidden;
    box-shadow: 0 0 0 1px rgba(0,0,0,0.1),
                0 4px 12px rgba(0,0,0,0.1);
  }

  canvas {
    display: block;
    cursor: crosshair;
    touch-action: none;
  }
</style>