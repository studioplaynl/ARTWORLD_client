<script>
    import { createEventDispatcher, onMount } from 'svelte';
    const dispatch = createEventDispatcher();
  
    export let color = '#000000';
    
    let pickerSize = 200;
    let canvas;
    let ctx;
    let isDragging = false;
    let selectedPoint = { x: pickerSize/2, y: pickerSize/2 };
    let wheelImage;
    let brightness = 100;
    let brightnessRafId = null;
    
    onMount(() => {
      if (canvas) {
        ctx = canvas.getContext('2d', { willReadFrequently: true });
        createColorWheel();
        drawSelector();
      }
    });

    // Adjust brightness value for better visual perception
    function adjustBrightness(value) {
      // Apply a power curve to make changes more noticeable in darker range
      return Math.pow(value / 100, 1.5) * 100;
    }

    function createColorWheel() {
      const adjustedBrightness = adjustBrightness(brightness);
      
      for(let x = 0; x < pickerSize; x++) {
        for(let y = 0; y < pickerSize; y++) {
          const centerX = pickerSize / 2;
          const centerY = pickerSize / 2;
          
          const angle = Math.atan2(y - centerY, x - centerX);
          const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
          const maxDistance = pickerSize/2;
          
          const hue = ((angle * 180 / Math.PI) + 360) % 360;
          const saturation = Math.min(100, (distance / maxDistance) * 100);
  
          if(distance <= maxDistance) {
            const rgb = HSVtoRGB(hue, saturation, adjustedBrightness);
            ctx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
      wheelImage = ctx.getImageData(0, 0, pickerSize, pickerSize);
    }

    function HSVtoRGB(h, s, v) {
      s = s/100;
      v = v/100;
      let r, g, b;
      const i = Math.floor(h/60);
      const f = h/60 - i;
      const p = v * (1 - s);
      const q = v * (1 - f * s);
      const t = v * (1 - (1 - f) * s);

      switch (i % 6) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
      }

      return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
      };
    }
  
    function redraw() {
      ctx.putImageData(wheelImage, 0, 0);
      drawSelector();
    }
  
    function drawSelector() {
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

    function getColorAtPoint(x, y) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      const canvasX = (x - rect.left) * scaleX;
      const canvasY = (y - rect.top) * scaleY;
      
      const centerX = pickerSize / 2;
      const centerY = pickerSize / 2;
      const distance = Math.sqrt((canvasX - centerX) ** 2 + (canvasY - centerY) ** 2);
      
      if (distance <= pickerSize/2) {
        selectedPoint = { x: canvasX, y: canvasY };
        const imageData = ctx.getImageData(Math.round(canvasX), Math.round(canvasY), 1, 1).data;
        return {
          color: rgbToHex(imageData[0], imageData[1], imageData[2]),
          isInBounds: true
        };
      }
      return { color: null, isInBounds: false };
    }
  
    let rafId = null;
    function handlePointerDown(event) {
      isDragging = true;
      updateColor(event);
    }
  
    function handlePointerMove(event) {
      if (!isDragging) return;
      
      if (rafId) cancelAnimationFrame(rafId);
      
      rafId = requestAnimationFrame(() => {
        updateColor(event);
        rafId = null;
      });
    }
  
    function handlePointerUp() {
      isDragging = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }
  
    function updateColor(event) {
      const result = getColorAtPoint(event.clientX, event.clientY);
      if (result.isInBounds && result.color !== color) {
        color = result.color;
        dispatch('colorChange', { color });
        redraw();
      }
    }
  
    function rgbToHex(r, g, b) {
      return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('');
    }

    let isAdjusting = false;
    function handleBrightnessChange(event) {
      if (brightnessRafId) cancelAnimationFrame(brightnessRafId);
      
      brightnessRafId = requestAnimationFrame(() => {
        brightness = Number(event.target.value);
        if (!isAdjusting) {
          isAdjusting = true;
          createColorWheel();
          redraw();
          const result = getColorAtPoint(
            selectedPoint.x + canvas.getBoundingClientRect().left,
            selectedPoint.y + canvas.getBoundingClientRect().top
          );
          if (result.isInBounds) {
            color = result.color;
            dispatch('colorChange', { color });
          }
          isAdjusting = false;
        }
        brightnessRafId = null;
      });
    }

    function handleBrightnessEnd() {
      if (brightnessRafId) {
        cancelAnimationFrame(brightnessRafId);
        brightnessRafId = null;
      }
      createColorWheel();
      redraw();
      const result = getColorAtPoint(
        selectedPoint.x + canvas.getBoundingClientRect().left,
        selectedPoint.y + canvas.getBoundingClientRect().top
      );
      if (result.isInBounds) {
        color = result.color;
        dispatch('colorChange', { color });
      }
    }
</script>
  
<div class="color-picker-container">
  <div class="color-picker">
    <canvas
      bind:this={canvas}
      width={pickerSize}
      height={pickerSize}
      on:pointerdown|preventDefault={handlePointerDown}
      on:pointermove|preventDefault={handlePointerMove}
      on:pointerup|preventDefault={handlePointerUp}
      on:pointerleave|preventDefault={handlePointerUp}
    ></canvas>
  </div>
  
  <div class="brightness-slider">
    <input 
      type="range" 
      min="0" 
      max="100" 
      step="1"
      bind:value={brightness}
      on:input={handleBrightnessChange}
      on:change={handleBrightnessEnd}
    />
  </div>
</div>
  
<style>
  .color-picker-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-end;
    width: 100%;
  }

  .color-picker {
    display: flex;
    justify-content: flex-end;
    border-radius: 50%;
    overflow: hidden;
    box-shadow: 0 0 0 1px rgba(0,0,0,0.1),
                0 4px 12px rgba(0,0,0,0.1);
    touch-action: none;
    margin-right: 4px;
    width: 120px;
  }
  
  canvas {
    display: block;
    cursor: crosshair;
    touch-action: none;
    width: 120px;
    height: 120px;
  }

  .brightness-slider {
    width: 120px;
    padding: 0;
    margin-right: 4px;
  }

  /* Portrait mode styles */
  @media screen and (orientation: portrait) {
      .color-picker-container {
      flex-direction: row;
      align-items: flex-start;
      gap: 8px;
    }

    .brightness-slider {
      width: 80px;
      height: 12px;
      margin: 0;
      padding: 0 8px;
    }

    input[type="range"] {
      width: 80px;
      transform: rotate(-90deg) translate(-90px, 0);
      transform-origin: left top;
    }
  }

  /* Landscape mode styles */
  @media screen and (orientation: landscape) {
    .color-picker-container {
      flex-direction: column;
    }

    input[type="range"] {
      width: 100%;
    }
  }

  input[type="range"] {
    width: 100%;
    -webkit-appearance: none;
    height: 6px;
    background: linear-gradient(to right, #000000 0%, #808080 50%, #FFFFFF 100%);
    border-radius: 3px;
    outline: none;
    border: none;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    background: white;
    border: 2px solid #666;
    border-radius: 50%;
    cursor: pointer;
  }

  input[type="range"]::-moz-range-thumb {
    width: 18px;
    height: 18px;
    background: white;
    border: 2px solid #666;
    border-radius: 50%;
    cursor: pointer;
  }

  :global(.color-picker) {
    transform: none;
  }

  :global(.color-picker canvas) {
    max-width: none;
  }
</style>