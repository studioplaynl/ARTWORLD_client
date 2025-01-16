## SpecStory

## Color Picker Size Troubleshooting (23/12/2024, 15:01:25)

_**User**_

When I set a pickerSize of 100 I want to see a canvas of 100x100px

At the moment that is not working like that, why not?

---

_**Assistant**_

Looking at your ColorPicker component, the issue is that while you're setting the canvas dimensions using the `width` and `height` attributes, the actual displayed size might be different due to CSS styling or the device's pixel ratio.

Here's how to fix it:

```svelte:src/components/ColorPicker.svelte
<style>
  .color-picker {
    display: inline-block;
    border-radius: 50%;
    overflow: hidden;
    box-shadow: 0 0 0 1px rgba(0,0,0,0.1),
                0 4px 12px rgba(0,0,0,0.1);
    /* Add these lines to ensure exact sizing */
    width: var(--picker-size);
    height: var(--picker-size);
  }

  canvas {
    display: block;
    cursor: crosshair;
    touch-action: none;
    /* Add these lines to ensure exact sizing */
    width: 100%;
    height: 100%;
  }
</style>

<div class="color-picker" style="--picker-size: {pickerSize}px">
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
```

The changes:
1. Added a CSS variable `--picker-size` to control the exact size of the container
2. Added explicit width/height to the `.color-picker` class using the CSS variable
3. Set the canvas to fill 100% of its container
4. Pass the `pickerSize` value as an inline style variable

This should now ensure that when you set `pickerSize = 100`, you get exactly a 100x100px color picker.

---



---

