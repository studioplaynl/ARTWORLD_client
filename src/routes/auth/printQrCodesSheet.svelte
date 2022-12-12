<script>
  // import { _ } from 'svelte-i18n';
  import { push } from 'svelte-spa-router';
  import { onMount } from 'svelte';

let canvasContext;
let labelSheetTemplate;
let files;
let filesCount = 0;

$: if (files) {
  // Note that `files` is of type `FileList`, not an Array:
  // https://developer.mozilla.org/en-US/docs/Web/API/FileList
  // console.log(files);

  filesCount = -1;

  canvasContext.clearRect(0, 0, canvasContext.width, canvasContext.height * 2);
  canvasContext.width = 1190;
  canvasContext.height = 1684;
  for (const file of files) {
    handleMultipleFileUpload(file);
  }
  // files.forEach((file, index) => handleMultipleFileUpload(file, index));
}
onMount(async () => {
  createCanvasContext();
  // load24LabelTemplate();
  // handleFileUpload();
});

function createCanvasContext() {
  canvasContext = document.getElementById('fullSheetCanvas');

  if (canvasContext.getContext) {
    canvasContext = canvasContext.getContext('2d');
  }
}

// eslint-disable-next-line no-unused-vars
function load24LabelTemplate() {
  // Loading of the image
  labelSheetTemplate = new Image();
  // drawing of the image
  labelSheetTemplate.onload = function () {
    // draw background image
    canvasContext.drawImage(labelSheetTemplate, 0, 0);
  };
  labelSheetTemplate.src = './assets/printQrSheet/24label_template.png';
}

function handleMultipleFileUpload(_file) {
  filesCount++;
  let offsetX = 50;
  let rowCount = filesCount;

  if (filesCount > 15) {
    offsetX = 800;
    rowCount -= 16;
  } else if (filesCount > 7) {
    offsetX = 420;
    rowCount -= 8;
  }


  const offsetY = 192;
  const startY = 80;
  const yPlacement = (rowCount * offsetY) + startY;
  // console.log('filesCount, yPlacement', rowCount, yPlacement);
  const reader = new FileReader();
  const imageFile = _file; // here we get the image file

  reader.readAsDataURL(imageFile);

  reader.onloadend = (e) => {
    const myImage = new Image();
    myImage.onload = () => {
      canvasContext.drawImage(myImage, offsetX, yPlacement); // Draws the image on canvas
    };
    myImage.src = e.target.result; // Assigns converted image to image object
  };
}

function download() {
  const link = document.createElement('a');
  link.download = 'filename.png';
  link.href = document.getElementById('fullSheetCanvas').toDataURL();
  link.click();
}
</script>

<div class="box">
  <!-- <input type="file" id="imageInput" accept = "image/*" class="registerbtn"> -->
  <label for="many">Upload multiple QR Codes</label>
<input
  accept="image/png, image/jpeg"
bind:files
id="many"
multiple
type="file"
/>
 <button on:click="{download}" class="registerbtn">download sheet</button>
  <canvas id = "fullSheetCanvas" width="1190" height="1684" style="border: 0px solid black;">
  </canvas>
<div
      class="app-close"
      on:click="{() => {
        push('/admin');
      }}"
    >
      <img alt="Close" src="assets/SHB/svg/AW-icon-cross.svg" />
    </div>
</div>

<style>
  * {
    box-sizing: border-box;
  }
  /* .registerForm {
    max-width: 400px;
    margin: 0 auto;
  } */

  /* Add padding to containers */
  /* .container {
    padding: 16px;
  } */

  /* Full-width input fields */
  /* input[type='text']
   {
    width: 100%;
    padding: 15px;
    margin: 5px 0 22px 0;
    display: inline-block;
    background: #f1f1f1;
  }

  input[type='text']:focus
  {
    background-color: #ddd;
    outline: none;
  } */

  /* Overwrite default styles of hr */
  /* hr {
    border: 1px solid #f1f1f1;
    margin-bottom: 25px;
  }  */

  /* Set a style for the submit/register button */
  .registerbtn {
    background-color: #7300eb;
    border-radius: 25px;
    color: white;
    padding: 16px 20px;
    margin: 8px 0;
    border: none;
    cursor: pointer;
    width: 100%;
    opacity: 0.9;
  }

  .registerbtn:hover {
    opacity: 1;
  }

  /* Add a blue text color to links */
  /* a {
    color: dodgerblue;
  } */

  /* Set a grey background color and center the text of the "sign in" section */
  /* .signin {
    background-color: #f1f1f1;
    text-align: center;
  }  */

  /* .printarea {
    display: none;
  } */

  img {
    width: 60px;
  }

  .app-close {
    position: absolute;
    right: 15px;
    top: 15px;
    z-index: 13;
    box-shadow: 5px 5px 0px #7300ed;
    cursor: pointer;
    padding: 0;
    margin: 0;
    border-radius: 50%;
    width: 40px;
    height: 40px;
  }

  .app-close > img {
    width: 40px;
  }

  @media only screen and (max-width: 640px) {
    .app-close {
      top: unset;
      bottom: 120px;
    }
  }

  /* select {
    width: 100%;
    padding: 10px;
  } */
</style>
