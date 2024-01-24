---
title: "Feature: download FLIPBOOKS"
date: "2023-08-21"
categories: 
  - "feature"
---

* * *

1. download stopmotion

3. put stopmotion in memory

5. cut stopmotion in frames

7. repeat the frames at least until 24 total, and finish the last remainder  
    (24/x ) round up = pages

9. per frame indicate sheet no / cell no with dots also

11. make a sheet per 8

13. download all sheets

* * *

flipbook calculations

[https://docs.google.com/spreadsheets/d/1VdhPDLWH2CBSFVM77cHzO1YU78DRSl\_G1FIJza1O4qE/edit#gid=0](https://docs.google.com/spreadsheets/d/1VdhPDLWH2CBSFVM77cHzO1YU78DRSl_G1FIJza1O4qE/edit#gid=0)

old version, new version below:

```
 async function downloadFlipbook() {
      // we put the user name and displayName in the file name
    // retrieve those details
      const userProfile = get(Profile);

      let filename = `${userProfile.username}`;
      // if a display_name exists we also add that to the filename
      if (userProfile.display_name) {
        filename += `_${userProfile.display_name}`;
      }

      filename += `_${file.key}_${displayName}.png`;

      await saveFlipbookHandler(filename);
    } 

export async function saveFlipbookHandler(filename) {
    const flipbookCanvasWidth = 2480;
    const flipbookCanvasHeight = 3508;

    const numRows = 4;
    const numCols = 2;

    let currentTemplateFrame = 0;
    const offsetX = 468;
    const offsetY = 123;
    const templateImageWidth = 730;
    // const totalCanvases = 1;
    const totalCanvases = Math.ceil((numRows * numCols) / framesArray.length);

    dlog('totalCanvases: ', totalCanvases);

    /* load all images before the loop to avoid waiting
        first we load the flipbooktemplate image
        then  we load the frames into a new array
    */
    const flipbookTemplate = new Image();

    await new Promise((resolve) => {
      flipbookTemplate.onload = function () {
        resolve();
      };
      flipbookTemplate.src = './assets/printSheet/fb_00_leeg.png';
    });

    const imgPromises = framesArray.map((frame) => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve(img);
      };
      img.src = frame;
    }));

    const images = await Promise.all(imgPromises);

    const mainContainer = document.querySelector('.drawing-app');

    for (let i = 0; i < totalCanvases; i++) {
      const canvas = document.createElement('canvas');
      canvas.className = 'flipbook-canvas'; // Set the class name
      canvas.id = (i + 1).toString(); // Set the id

      // Hide the canvas
      canvas.style.display = 'none';

      if (mainContainer) {
        mainContainer.parentNode.insertBefore(canvas, mainContainer);
      }

      const ctx = canvas.getContext('2d');
      canvas.width = flipbookCanvasWidth; // Set canvas width
      canvas.height = flipbookCanvasHeight; // Set canvas height

      // /* load the template image into the canvas */
      ctx.drawImage(
        flipbookTemplate,
        0,
        0,
      );

      for (let j = 0; j < numRows; j++) {
        for (let k = 0; k < numCols; k++) {
          const x = k * templateImageWidth + offsetX * (k + 1);
          const y = j * templateImageWidth + offsetY * (j + 1);

          ctx.drawImage(
            images[currentTemplateFrame],
            x,
            y,
            templateImageWidth,
            templateImageWidth,
          );

          currentTemplateFrame++;
          if (currentTemplateFrame === framesArray.length) currentTemplateFrame = 0;
        }
      }

      // Create a button element for downloading the canvas
      const downloadButton = document.createElement('button');
      downloadButton.textContent = `flipbook_${canvas.id}`;
      downloadButton.style.position = 'absolute';
      const topDistance = `${canvas.id}00px`;
      downloadButton.style.top = topDistance;

      downloadButton.addEventListener('click', () => {
        downloadFlipbookCanvas(canvas, `_${canvas.id}_FB_${filename}`);
        // Remove the download button and canvas after download
        downloadButton.remove();
        canvas.remove();
      });


      // Append the container to the mainContainer
      mainContainer.appendChild(downloadButton);

      // Trigger a click event on the download button
      downloadButton.click();
    }
  }


  function downloadFlipbookCanvas(canvas, downloadFileName) {
    canvas.toBlob((blob) => {
      const link = document.createElement('a');
      link.download = downloadFileName;
      link.href = URL.createObjectURL(blob);
      link.click();
    }, 'image/png');
  }
```

* * *

New version:

```
 async function downloadFlipbook() {
      // we put the user name and displayName in the file name
    // retrieve those details
      const userProfile = get(Profile);

      let filename = `${userProfile.username}`;
      // if a display_name exists we also add that to the filename
      if (userProfile.display_name) {
        filename += `_${userProfile.display_name}`;
      }

      filename += `_${file.key}_${displayName}.png`;

      await saveFlipbookHandler(filename);
    } 

export async function saveFlipbookHandler(filename) {
    const flipbookCanvasWidth = 2480;
    const flipbookCanvasHeight = 3508;

    const numRows = 4;
    const numCols = 2;
    const minNumSheets = 3; // printing 3 sheets of stopmotion was the norm

    let currentTemplateFrame = 0;
    const offsetX = 468;
    const offsetY = 123;
    const templateImageWidth = 730;

    // how many repeats fit in 3 sheets, then round up
    const repeatsRoundedUp = Math.ceil((numRows * numCols * minNumSheets) / framesArray.length);

    // total of frames we will be using
    const framesTotal = repeatsRoundedUp * framesArray.length;

    let framesTotalSoFar = 0;
    const totalCanvases = Math.ceil(framesTotal / (numRows * numCols));
    // const totalCanvases = Math.ceil((numRows * numCols) / framesArray.length);

    /* load all images before the loop to avoid waiting
        first we load the flipbooktemplate image
        then  we load the frames into a new array
    */
    const flipbookTemplate = new Image();

    await new Promise((resolve) => {
      flipbookTemplate.onload = function () {
        resolve();
      };
      flipbookTemplate.src = './assets/printSheet/fb_00_leeg.png';
    });

    const imgPromises = framesArray.map((frame) => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve(img);
      };
      img.src = frame;
    }));

    const images = await Promise.all(imgPromises);

    const mainContainer = document.querySelector('.drawing-app');

    for (let i = 0; i < totalCanvases; i++) {
      const canvas = document.createElement('canvas');
      canvas.className = 'flipbook-canvas'; // Set the class name
      canvas.id = (i + 1).toString(); // Set the id

      // Hide the canvas
      canvas.style.display = 'none';

      if (mainContainer) {
        mainContainer.parentNode.insertBefore(canvas, mainContainer);
      }

      const ctx = canvas.getContext('2d');
      canvas.width = flipbookCanvasWidth; // Set canvas width
      canvas.height = flipbookCanvasHeight; // Set canvas height

      /* load the template image into the canvas */
      ctx.drawImage(
        flipbookTemplate,
        0,
        0,
      );

      for (let j = 0; j < numRows; j++) {
        for (let k = 0; k < numCols; k++) {
          const x = k * templateImageWidth + offsetX * (k + 1);
          const y = j * templateImageWidth + offsetY * (j + 1);

          // if we reach the framesTotal, we stop adding frames to the sheet
          if (framesTotalSoFar >= framesTotal) break;

          ctx.drawImage(
            images[currentTemplateFrame],
            x,
            y,
            templateImageWidth,
            templateImageWidth,
          );

          // if we reach the framesTotal, we stop adding frames to the sheet
          framesTotalSoFar++;

          // we cycle through the available frames of the stopmotion
          currentTemplateFrame++;
          if (currentTemplateFrame === framesArray.length) currentTemplateFrame = 0;
        }
      }

      // Create a button element for downloading the canvas
      const downloadButton = document.createElement('button');
      downloadButton.textContent = `flipbook_${canvas.id}`;
      downloadButton.style.position = 'absolute';
      const topDistance = `${canvas.id}00px`;
      downloadButton.style.top = topDistance;

      downloadButton.addEventListener('click', () => {
        downloadFlipbookCanvas(canvas, `_${canvas.id}_FB_${filename}`);
        // Remove the download button and canvas after download
        downloadButton.remove();
        canvas.remove();
      });


      // Append the container to the mainContainer
      mainContainer.appendChild(downloadButton);

      // Trigger a click event on the download button
      downloadButton.click();
    }
  }


  function downloadFlipbookCanvas(canvas, downloadFileName) {
    canvas.toBlob((blob) => {
      const link = document.createElement('a');
      link.download = downloadFileName;
      link.href = URL.createObjectURL(blob);
      link.click();
    }, 'image/png');
  }
```
