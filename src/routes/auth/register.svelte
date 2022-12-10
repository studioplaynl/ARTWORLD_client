<script>
  // import QrCode from 'svelte-qrcode';
  import QRCode from 'qrcode';
  import { _ } from 'svelte-i18n';
  import { push } from 'svelte-spa-router';
  import { onMount } from 'svelte';
  import { Session } from '../../session';
  // import { client } from '../../nakama.svelte';
  // import { dlog } from '../game/helpers/DebugLog';
  import { createAccountAdmin } from '../../api';

  let QRUrl;
  let email = '@vrolijkheid.nl';
  let username = 'user';
  let password = '';
  let role = 'speler';
  let azc = 'Amsterdam';

  onMount(async () => {
    genKidsPassword();
    updateQrCanvas();
  });


const Locaties = [
  'GreenSquare',
  'RedStar',
  'TurquioseTriangle',
  'YellowDiamond',
  'BlueSail',
];

  const houses = [
    'portalBlauw.png',
    'portalDonkerBlauw.png',
    'portalGeel.png',
    'portalGifGroen.png',
    'portalGroen.png',
    'portalRood.png',
    'portalRoze.png',
    'portalZwart.png',
  ];

  const house = houses[Math.floor(houses.length * Math.random())];

  const avatars = [
    'avatarBlauw.png',
    'avatarGeel.png',
    'avatarGroen.png',
    'avatarPaars.png',
    'avatarRood.png',
    'avatarRoze.png',
  ];

  const avatar = avatars[Math.floor(avatars.length * Math.random())];

  async function register() {
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

    createAccountAdmin(data);
  }

  function onSubmit() {
    register();
  }


  function genKidsPassword() {
    // removed confusing charecters like 0 O o l l q S and made the chance for number bigger
    const chars = '123456789abcdefghijkmnprstuvwxyz0123456789ABCDEFGHJKLMNPQRTUVWXYZ123456789';
    // eslint-disable-next-line no-mixed-spaces-and-tabs
    const passwordLength = 9;
    password = '';
    for (let i = 0; i <= passwordLength; i++) {
      const randomNumber = Math.floor(Math.random() * chars.length);
      password += chars.substring(randomNumber, randomNumber + 1);
    }
  }

  // function print() {
  //   QRUrl = `https://artworld.vrolijkheid.nl/#/login/${email}/${password}`;
  //   setTimeout(() => {
  //     const printArea = window.open();
  //     printArea.document.write(printDiv.innerHTML);
  //     printArea.document.close();
  //     printArea.focus();
  //     printArea.print();
  //     printArea.close();
  //   }, 1000);
  // }

function updateQrCanvas() {
  QRUrl = `https://artworld.vrolijkheid.nl/#/login/${email}/${password}`;
  // const qrCodeImage = document.getElementById('qrCodeImage').innerHTML;

  QRCode.toDataURL(QRUrl)
    .then((qrCodeImage) => {
      // console.log(qrCodeImage);

      const startTextX = 180;
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
      ctx.fillText('Email:', startTextX, 30);
      ctx.font = 'bold 14px arial';
      ctx.fillText(email, startTextX, 55);
      ctx.font = 'oblique 14px arial';
      ctx.fillText('Password:', startTextX, 105);
      ctx.font = 'bold 18px arial';
      ctx.fillText(password, startTextX, 135);
    })
    .catch((err) => {
      console.error(err);
    });
}
function downloadLoginImage() {
  const link = document.createElement('a');
  link.download = `${email}.png`;
  link.href = document.getElementById('qrCanvas').toDataURL();
  link.click();
}
</script>

<div class="box">
  <div class="registerForm">
    <form on:submit|preventDefault="{onSubmit}">
      <div class="container">
        <h1>{$_('register.title')}</h1>

        <hr />
        <label for="username"><b>{$_('register.username')}</b></label>
        <input
          type="text"
          placeholder="Enter Username"
          name="username"
          id="username"
          bind:value="{username}"
          on:change="{() => {
            email = `${username}@vrolijkheid.nl`;
            updateQrCanvas();
          }}"
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
     <button on:click="{genKidsPassword}" class="registerbtn">new Password</button>
    <!-- <button on:click="{print}" class="registerbtn">print userdata</button> -->
    <!-- <div class="printarea" bind:this="{printDiv}">
      <table>
        <tr>
          <td id="qrCodeImage">
            <QrCode value="{QRUrl}" />
          </td>
          <td>
            <h5>Email adress:</h5>
            <b>{email}</b>
            <h5>Password:</h5>
            <b>{password}</b>
          </td>
        </tr>
      </table>
    </div> -->
    <div class="imageCanvas" >
    <canvas id="qrCanvas" width="340"
            height="174"
            style="border:3px solid">
    </canvas>
      </div>
      <button on:click="{downloadLoginImage}" class="registerbtn">Download QR Code</button>
  </div>

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
  input[type='text']
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
