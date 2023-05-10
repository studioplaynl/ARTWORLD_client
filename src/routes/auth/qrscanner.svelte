<script>
  import { onMount, onDestroy } from 'svelte';
  import jsQR from 'jsqr';
  import { login } from '../../helpers/api';
  import { dlog } from '../game/helpers/DebugLog';

  export let email;
  export let password;

  let video;
  let canvasElement;
  let canvas;
  let redirect = false;
  let doRequest = false;

  onMount(async () => {
    video = document.createElement('video');
    canvasElement = document.getElementById('canvas');
    canvas = canvasElement.getContext('2d');
    // Use facingMode: environment to attemt to get the front camera on phones
    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: 'environment',
        },
      })
      .then((stream) => {
        video.srcObject = stream;
        video.setAttribute('playsinline', true); // required to tell iOS safari we don't want fullscreen
        video.play();
        doRequest = true;
        requestAnimationFrame(tick);
      });
  });

  onDestroy(() => {
    doRequest = false;
    const stream = video.srcObject;
    // now get all tracks
    const tracks = stream.getTracks();

    // now close each track by having forEach loop
    tracks.forEach((track) => {
      // stopping every track
      track.stop();
    });
    // assign null to srcObject of video
  });

  function drawLine(begin, end, color) {
    canvas.beginPath();
    canvas.moveTo(begin.x, begin.y);
    canvas.lineTo(end.x, end.y);
    canvas.lineWidth = 4;
    canvas.strokeStyle = color;
    canvas.stroke();
  }

  function tick() {
    if (doRequest) {
      // loadingMessage.innerText = "⌛ Loading video..."
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // loadingMessage.hidden = true;
        canvasElement.hidden = false;
        // outputContainer.hidden = false;

        canvasElement.height = video.videoHeight;
        canvasElement.width = video.videoWidth;
        canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
        const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });
        // dlog(code);
        if (code) {
          drawLine(code.location.topLeftCorner, code.location.topRightCorner, '#FF3B58');
          drawLine(code.location.topRightCorner, code.location.bottomRightCorner, '#FF3B58');
          drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, '#FF3B58');
          drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, '#FF3B58');

          // TODO: Checken op array van geldige hostnames, ipv enkele window.location.host
          // Hostnames per environment (dev, live) strakker instellen (live = alleen artworld.vrolijkheid.nl)
          if (
            // eslint-disable-next-line operator-linebreak
            !redirect &&
            code.data.includes('/#/login/')
          ) {
            dlog(`redirected to: ${code.data}`);
            const urlChunks = code.data.split('/');
            email = urlChunks[urlChunks.length - 2];
            password = urlChunks[urlChunks.length - 1];
            login(email, password);
            redirect = true;
          }
        }
      }
      requestAnimationFrame(tick);
    }
  }
</script>

<main>
  <canvas id="canvas"></canvas>
</main>
