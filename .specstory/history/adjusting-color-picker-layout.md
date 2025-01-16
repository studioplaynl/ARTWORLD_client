## SpecStory

## Adjusting Color Picker Layout (23/12/2024, 15:49:05)

_**User**_

In landscape orientation the colorpicker canvas and brightness slider are good.

I just want to move the brightness slider from below the canvas to next to canvas

---

_**Assistant**_

I'll help you modify the layout to place the brightness slider next to the canvas in landscape orientation. Here are the necessary changes to the style section:

```css:src/routes/components/ColorPicker.svelte
/* ... existing styles ... */

/* Landscape mode styles */
@media screen and (orientation: landscape) {
  .color-picker-container {
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  .brightness-slider {
    width: 32px;
    height: 120px; /* Match canvas height */
    margin: 0;
    padding: 0 8px;
  }

  input[type="range"] {
    width: 120px;
    transform: rotate(-90deg) translate(-120px, 0);
    transform-origin: left top;
  }
}

/* ... remaining styles ... */
```

These changes will:
1. Change the container to use `flex-direction: row` in landscape mode to place items side by side
2. Center-align the items vertically using `align-items: center`
3. Apply the same vertical slider styling that was previously only used in portrait mode
4. Adjust the gap between the canvas and slider

The brightness slider will now appear vertically next to the color picker canvas when in landscape orientation, while maintaining the existing portrait mode layout.

---



---

