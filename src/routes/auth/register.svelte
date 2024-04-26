<script>
  // import QrCode from 'svelte-qrcode';
  import QRCode from 'qrcode';
  import { _ } from 'svelte-i18n';
  import { push } from 'svelte-spa-router';
  import { onMount, onDestroy } from 'svelte';
  import { Session } from '../../session';
  // import { client } from '../../nakama.svelte';
  import { dlog } from '../../helpers/debugLog';
  import { createAccountAdmin } from '../../helpers/nakamaHelpers';
  import { SCENE_INFO, STOCK_HOUSES, STOCK_AVATARS, ARTWORLD_IP, BETAWORLD_IP } from '../../constants';
  import { client } from '../../nakama.svelte';

  let QRUrl;
  let email = '@vrolijkheid.nl';
  let username = 'user';
  let password = '';
  let role = 'speler';
  let azc = null;
  let batchUserPasteBoard = '';
  let registerNextUser = 0;
  let incrementUser = 0;
  let fromUser = 0;
  let toUser = 0;
  let batchCreation = false;
  const server = client.host;
  let serverName = 'ARTWORLD';

  onMount(async () => {
    // check if server is artworld or betaworld, so that we not make new accounts on the wrong server.
    // we present the server in de UI to the admin
    if (server === ARTWORLD_IP) {
      serverName = 'ARTWORLD';
    } else if (server === BETAWORLD_IP) {
      serverName = 'BETA-WORLD';
    }
    genKidsPassword();
    updateQrCanvas();
  });

  $: {
    dlog(azc);
    updateQrCanvas();
    dlog('Locaties: ', Locaties);
  }

  $: {
    if (username) {
      if (!batchCreation) {
        updateFormWhenUserNameChanges();
      }
    }
  }

  const Locaties = SCENE_INFO.map((i) => i.scene);

  let house = STOCK_HOUSES[Math.floor(STOCK_HOUSES.length * Math.random())];

  let avatar = STOCK_AVATARS[Math.floor(STOCK_AVATARS.length * Math.random())];

  async function register() {
    // update the email from the username
    // email = `${username}@vrolijkheid.nl`;
    dlog('email: ', email);
    dlog('password: ', password);
    const data = {
      email,
      password,
      username,
      userId: $Session.user_id,
      azc,
      role,
      avatar: `/avatar/stock/${avatar}`,
      home: `/home/stock/${house}`,
    };
    // dlog('data', data);
    createAccountAdmin(data);
  }

  function copyToClipboard() {
    dlog(batchUserPasteBoard);
    if (navigator.clipboard) {
      // clipboard API is available
      navigator.clipboard.writeText(batchUserPasteBoard);
    } else {
      // clipboard API is not available
    }
  }

  function batchUserGenerator(_incrementUser) {
    batchCreation = true;
    incrementUser = _incrementUser;
    if (azc === null) {
      alert('Please select an AZC');
      return;
    }

    if (toUser - fromUser < 0) {
      alert('Please select a valid range');
      return;
    }

    if (incrementUser > toUser - fromUser) {
      dlog('done');
      incrementUser = 0;
      dlog('batchUserPasteBoard');
      dlog(batchUserPasteBoard);
      batchCreation = false;
      return;
    }

    let userName = '';

    const incrementedUser = fromUser + incrementUser;
    userName = `user${incrementedUser}`;
    fillAndSubmitForm(userName);
  }

  function updateFormWhenUserNameChanges() {
    email = `${username}@vrolijkheid.nl`;
    genKidsPassword();
    updateQrCanvas();
    house = STOCK_HOUSES[Math.floor(STOCK_HOUSES.length * Math.random())];
    avatar = STOCK_AVATARS[Math.floor(STOCK_AVATARS.length * Math.random())];
  }

  function fillAndSubmitForm(_username) {
    // Set the value of the username variable in the component's data
    username = _username; // assuming $: username is declared in your component's script
    dlog('username', username);
    updateFormWhenUserNameChanges();

    // Trigger the submit event on the form element
    const form = document.querySelector('.registerForm form');
    // dlog('form', form);
    form.dispatchEvent(new Event('submit'));
  }

  function onSubmit() {
    register();
    // dlog('register done');
    setTimeout(() => {
      downloadLoginImage();

      // clipboard formatting
      const pasteUser = `${username}\t${password}\t${azc}\n`;
      batchUserPasteBoard += pasteUser;
      copyToClipboard();

      // dlog('batchUserPasteBoard');
      // dlog(batchUserPasteBoard);
      registerNextUser++;
      batchUserGenerator(registerNextUser);
    }, 1000);
  }

  function genKidsPassword() {
    // removed confusing charecters like 0 O o l l q S k and made the chance for numbers bigger
    const chars =
      '123456789abcdefghijmnprstuvwxyz123456789ABCDEFGHJKLMNPQRTUVWXYZ123456789';
    // eslint-disable-next-line no-mixed-spaces-and-tabs
    const passwordLength = 7;
    password = '';
    for (let i = 0; i <= passwordLength; i++) {
      const randomNumber = Math.floor(Math.random() * chars.length);
      password += chars.substring(randomNumber, randomNumber + 1);
    }
  }

  function updateQrCanvas() {
    QRUrl = `https://artworld.vrolijkheid.nl/#/login/${email}/${password}`;
    // const qrCodeImage = document.getElementById('qrCodeImage').innerHTML;

    QRCode.toDataURL(QRUrl)
      .then((qrCodeImage) => {
        // dlog(qrCodeImage);

        const startTextX = 176;
        const canvas = document.getElementById('qrCanvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const img = new Image();
        img.onload = function () {
          ctx.drawImage(img, -5, -5); // Or at whatever offset you like
        };
        img.src = qrCodeImage;

        ctx.font = 'oblique 14px arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'left';
        ctx.fillText('Email:', startTextX, 25);
        ctx.font = 'bold 14px arial';
        ctx.fillText(email, startTextX, 45);
        ctx.font = 'oblique 14px arial';
        ctx.fillText('Wachtwoord:', startTextX, 85);
        ctx.font = 'bold 18px arial';
        ctx.fillText(password, startTextX, 110);
        ctx.font = 'oblique 14px arial';
        ctx.fillText(azc, startTextX, 156);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  function downloadLoginImage() {
    const link = document.createElement('a');
    link.download = `${email}_${azc}.png`;
    link.href = document.getElementById('qrCanvas').toDataURL();
    link.click();
  }

  function handleKeyPress() {
    // prevent 'Generate Multiple Users' button from being clicked when pressing enter
    // and inadvertently creating multiple users when pressing enter in the username field
  }

  // add the event listener to the window object
  window.addEventListener('keydown', handleKeyPress);

  // remove the event listener when the component is destroyed
  onDestroy(() => {
    window.removeEventListener('keydown', handleKeyPress);
  });
</script>

<div class="box">
  <div class="registerForm">
    <form
      on:submit|preventDefault="{() => {
        if (incrementUser < 1) {
          dlog('initialization, clear clipboard');
          batchUserPasteBoard = '';
        }
        onSubmit();
      }}"
    >
      <div class="container">
        <!-- check if server is artworld or betaworld.
          So that we not make new accounts on the wrong server.
          server should be checked against ARTWORLD_IP and BETAWORLD_IP -->
        <h1 style="color: red;">{serverName}</h1>
        <h1>{$_('register.title')}</h1>

        <hr />
        <label for="username"><b>{$_('register.username')}</b></label>
        <input
          type="text"
          placeholder="Enter Username"
          name="username"
          id="username"
          bind:value="{username}"
          required
        />

        <label for="email"><b>{$_('register.email')}</b></label>
        <input
          type="text"
          placeholder="Enter Email"
          name="email"
          id="email"
          bind:value="{email}"
          required
        />

        <label for="psw"><b>{$_('register.password')}</b></label>
        <input
          type="text"
          placeholder="Enter Password"
          name="psw"
          id="psw"
          bind:value="{password}"
          on:change="{() => {
            updateQrCanvas();
          }}"
          required
        />

        <hr />

        <label for="Role"><b>{$_('register.role')}</b></label>
        <select name="Role" bind:value="{role}" required>
          <option value="speler">{$_('role.speler')}</option>
          <option value="kunstenaar">{$_('role.artist')}</option>
          <option value="moderator">{$_('role.moderator')}</option>
          <option value="admin">{$_('role.admin')}</option>
        </select>

        <label for="AZC"><b>{$_('register.location')}</b></label>
        <select name="AZC" bind:value="{azc}" required>
          <option value="null">{$_('register.none')}</option>
          {#each Locaties as locatie}
            <option value="{locatie}">{locatie}</option>
          {/each}
        </select>
        <label for="avatar"><b>avatar</b></label>
        <img alt="User avatar" src="{`assets/SHB/avatar/${avatar}`}" />
        <label for="house"><b>House</b></label>
        <img alt="User house" src="{`assets/SHB/portal/${house}`}" />

        <button type="submit" class="registerbtn">Register</button>
      </div>
    </form>
    <button on:click="{genKidsPassword}" class="registerbtn"
      >new Password</button
    >

    <div class="imageCanvas">
      <canvas id="qrCanvas" width="340" height="174" style="border:3px solid"
      ></canvas>
    </div>
    <button on:click="{downloadLoginImage}" class="registerbtn"
      >Download QR Code</button
    >
  </div>

  <!-- two input fields for integers, first labeled "from" and second labeled "to" -->
  <hr />
  <h1>Batch create multiple users</h1>
  <label for="fromUser"><b>from: user number</b></label>
  <input type="number" bind:value="{fromUser}" />

  <label for="toUser"><b>to: user number</b></label>
  <input type="number" bind:value="{toUser}" />

  <p>{toUser - fromUser + 1} number of users</p>

  <!-- a button that, when clicked, sets registerNextUser to 0, then calls the batchUserGenerator fuction -->
  <button class="registerbtn"
    on:click="{() => {
      registerNextUser = 0;
      batchUserGenerator(registerNextUser);
    }}"
  >
    Generate Multiple Users
  </button>

  <pre>{batchUserPasteBoard}</pre>
  <button class="registerbtn" on:click="{copyToClipboard}">Copy user data to clipboard</button>

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
  .registerForm {
    max-width: 400px;
    margin: 0 auto;
  }

  /* Add padding to containers */
  .container {
    padding: 16px;
  }

  /* Full-width input fields */
  input[type='text'] {
    width: 100%;
    padding: 15px;
    margin: 5px 0 22px 0;
    display: inline-block;
    background: #f1f1f1;
  }

  input[type='text']:focus {
    background-color: #ddd;
    outline: none;
  }

  /* Overwrite default styles of hr */
  hr {
    border: 1px solid #f1f1f1;
    margin-bottom: 25px;
  }

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

  select {
    width: 100%;
    padding: 10px;
  }
</style>
