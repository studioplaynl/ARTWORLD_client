<script>
    import { login } from "../../api";

    import { onMount, onDestroy } from 'svelte';
    import jsQR from "jsqr";
    import CameraIcon from "svelte-icons/md/MdSwitchCamera.svelte"
    export let email
    export let password
    
    // function onScanSuccess(decodedText, decodedResult) {
    //   // handle the scanned code as you like, for example:
    //   console.log(`Code matched = ${decodedText}`, decodedResult);
    //   if(decodedText.includes("https://cardchat.app/card/")){
    //     currentcode = decodedText
    //     window.location.href = currentcode;
    //   }
    // }
    var video
    var canvasElement
    var canvas
    var currentcode
    var redirect = false
    
    
    onMount(async () => {
      video = document.createElement("video");
      canvasElement = document.getElementById("canvas");
      canvas = canvasElement.getContext("2d");
    // Use facingMode: environment to attemt to get the front camera on phones
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function(stream) {
        video.srcObject = stream;
        video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
        video.play();
        requestAnimationFrame(tick);
      });
    
    
    });
    
    onDestroy(() => {
        let stream = video.srcObject;
        // now get all tracks
        let tracks = stream.getTracks();
        // now close each track by having forEach loop
        tracks.forEach(function(track) {
          // stopping every track
          track.stop();
        });
        // assign null to srcObject of video
    })
    
    function drawLine(begin, end, color) {
      canvas.beginPath();
      canvas.moveTo(begin.x, begin.y);
      canvas.lineTo(end.x, end.y);
      canvas.lineWidth = 4;
      canvas.strokeStyle = color;
      canvas.stroke();
    }
    
    
    
    function tick() {
      //loadingMessage.innerText = "⌛ Loading video..."
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        //loadingMessage.hidden = true;
        canvasElement.hidden = false;
        //outputContainer.hidden = false;
    
        canvasElement.height = video.videoHeight;
        canvasElement.width = video.videoWidth;
        canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
        var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
        var code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });
        if (code) {
          drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
          drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
          drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
          drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");

          if(code.data.includes(`${window.location.host}/#/login/`) && !redirect){
            console.log('redirected to: ' + code.data)
            let urlChunks = code.data.split('/')
            email = urlChunks[urlChunks.length-2]
            password = urlChunks[urlChunks.length-1]
            login(email, password);
            redirect = true

          }
        } else {

        }
      }
      requestAnimationFrame(tick);
    }
    
    </script>
    
    <main>
        <!-- <div class="topmenu"><span class="icon" on:click="{switchCamera}"><CameraIcon/></span></div> -->
        <!-- <video autoplay="true" id="reader"></video> -->
        <canvas id="canvas"></canvas>
    </main>
    
    <style>
      .icon {
        color: white;
        width: 32px;
        height: 32px;
        z-index: 1;
        float: right;
        margin: 10px;
        position: relative;
    
      }
    
      #reader {
        position: initial!important;
      }
    
      canvas {
        /* position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0; */
        display: block;
        /* height: 100vh; */
        /* transform: translate(-25%,0%); */
     }
    
    </style>
    
    
    
    
    <!-- var video = document.createElement("video");await login(email, password);
    var canvas = canvasElement.getContext("2d");
    var loadingMessage = document.getElementById("loadingMessage");
    var outputContainer = document.getElementById("output");
    var outputMessage = document.getElementById("outputMessage");
    var outputData = document.getElementById("outputData"); -->
    
    
    
    
    
    