## SpecStory

## Integrating Excalidraw with Svelte App (30/12/2024, 12:20:40)

_**User**_

this drawing app but I would like to include drawing possibility. I like excalidraw a lot. 

Can you make a suggestion for integrating it, while maintaining the canvas size and file saving logic? I am using svelte

Features
The Excalidraw editor (npm package) supports:

💯 Free & open-source.
🎨 Infinite, canvas-based whiteboard.
✍️ Hand-drawn like style.
🌓 Dark mode.
🏗️ Customizable.
📷 Image support.
😀 Shape libraries support.
👅 Localization (i18n) support.
🖼️ Export to PNG, SVG & clipboard.
💾 Open format - export drawings as an .excalidraw json file.
⚒️ Wide range of tools - rectangle, circle, diamond, arrow, line, free-draw, eraser...
➡️ Arrow-binding & labeled arrows.
🔙 Undo / Redo.
🔍 Zoom and panning support.
Excalidraw.com
The app hosted at excalidraw.com is a minimal showcase of what you can build with Excalidraw. Its source code is part of this repository as well, and the app features:

📡 PWA support (works offline).
🤼 Real-time collaboration.
🔒 End-to-end encryption.
💾 Local-first support (autosaves to the browser).
🔗 Shareable links (export to a readonly link you can share with others).
We'll be adding these features as drop-in plugins for the npm package in the future.

Quick start
Note: following instructions are for installing the Excalidraw npm package when integrating Excalidraw into your own app. To run the repository locally for development, please refer to our Development Guide.

npm install react react-dom @excalidraw/excalidraw
or via yarn

yarn add react react-dom @excalidraw/excalidraw
Check out our documentation for more details!

Contributing
Missing something or found a bug? Report here.
Want to contribute? Check out our contribution guide or let us know on Discord.
Want to help with translations? See the translation guide.
Integrations
VScode extension
npm package

---

_**Assistant**_

I'll help you integrate Excalidraw into your Svelte app while maintaining your existing canvas size and file saving logic. Since Excalidraw is a React component, we'll need to use a wrapper to make it work with Svelte. Here's how we can do it:

1. First, install the necessary dependencies:

```bash
npm install react react-dom @excalidraw/excalidraw svelte-react
```

2. Create a new wrapper component for Excalidraw:

```javascript:src/components/ExcalidrawWrapper.svelte
<script>
  import { React, ReactDOM } from 'svelte-react';
  import { Excalidraw } from '@excalidraw/excalidraw';
  import { createEventDispatcher, onMount } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  export let width;
  export let height;
  export let initialData = null;
  
  let excalidrawAPI;
  
  // Forward the API to parent
  onMount(() => {
    dispatch('ready', excalidrawAPI);
  });
  
  const excalidrawProps = {
    width,
    height,
    initialData,
    viewModeEnabled: false,
    zenModeEnabled: false,
    gridModeEnabled: false,
    theme: "light",
    name: "Excalidraw Editor",
    onChange: (elements, state) => {
      dispatch('change', { elements, state });
    },
    excalidrawAPI: (api) => {
      excalidrawAPI = api;
      dispatch('ready', api);
    }
  };
</script>

<div style="width: {width}px; height: {height}px;">
  <svelte:component this={React} component={Excalidraw} props={excalidrawProps} />
</div>
```

3. Modify your DrawingApp.svelte to use Excalidraw:

```svelte:src/routes/apps/DrawingApp.svelte
<script>
  // ... existing imports ...
  import ExcalidrawWrapper from '../components/ExcalidrawWrapper.svelte';
  
  let excalidrawAPI;
  let canvasData = null;
  
  // Handle Excalidraw ready event
  function handleExcalidrawReady(event) {
    excalidrawAPI = event.detail;
  }
  
  // Handle changes in Excalidraw
  function handleExcalidrawChange(event) {
    changes++; // Increment changes counter
    
    // Update preview if needed
    if (excalidrawAPI) {
      updatePreview();
    }
  }
  
  // Update the preview and data for saving
  async function updatePreview() {
    // Get the current scene data
    const sceneData = excalidrawAPI.getSceneElements();
    
    // Get the exported image
    const blob = await excalidrawAPI.exportToBlob({
      mimeType: 'image/png',
      scale: 1,
      elements: sceneData,
    });
    
    // Convert blob to base64 for preview
    const reader = new FileReader();
    reader.onloadend = () => {
      data = reader.result; // This updates the data variable used for saving
    };
    reader.readAsDataURL(blob);
  }
  
  // Modified save handler
  export async function saveHandler() {
    if (excalidrawAPI) {
      await updatePreview();
      // The data variable will be updated by updatePreview
      return data;
    }
  }
  
  // Modified clear canvas handler
  export function clearCanvas() {
    if (excalidrawAPI) {
      excalidrawAPI.resetScene();
      changes = 0;
      dispatch('clearCanvas');
    }
  }
</script>

<div class="drawing-app-main-container">
  <div class="canvas-with-controls-container">
    <div 
      class="canvas-frame-container"
      style="width: {canvasHeight}px; height: {canvasHeight}px;"
    >
      <ExcalidrawWrapper
        width={canvasHeight}
        height={canvasHeight}
        initialData={canvasData}
        on:ready={handleExcalidrawReady}
        on:change={handleExcalidrawChange}
      />
    </div>
    
    <!-- ... rest of your existing template ... -->
  </div>
</div>

<style>
  /* ... existing styles ... */
  
  /* Add any additional styles needed for Excalidraw integration */
  :global(.excalidraw) {
    --color-primary: #7300ed;
    --color-primary-darker: #5b00ba;
    --color-primary-darkest: #400084;
  }
</style>
```

This integration:

1. Maintains your existing canvas size logic
2. Keeps the file saving functionality
3. Preserves the changes counter
4. Integrates with your existing UI controls
5. Maintains the same look and feel

Key changes:

1. The fabric.js canvas is replaced with Excalidraw
2. The drawing tools are now handled by Excalidraw
3. The save functionality now exports both the Excalidraw scene data and a PNG preview
4. The clear canvas functionality uses Excalidraw's reset function

To use additional Excalidraw features, you can:

1. Add theme support:
```javascript
export let theme = "light";
// Pass to ExcalidrawWrapper props
theme={theme}
```

2. Add library support:
```javascript
// In ExcalidrawWrapper
libraryItems={[]}
onLibraryChange={(items) => {
  dispatch('libraryChange', items);
}}
```

3. Add custom tools:
```javascript
// In ExcalidrawWrapper
tools={[
  { id: "rectangle", name: "Rectangle" },
  { id: "circle", name: "Circle" },
  // etc.
]}
```

Would you like me to explain any part of this integration in more detail?

---



---

