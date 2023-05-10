<script>
  import { _ } from 'svelte-i18n';
  import { onMount } from 'svelte';
  import CameraIcon from 'svelte-icons/fa/FaQrcode.svelte';
  import { push, querystring } from 'svelte-spa-router';
  import { Session } from '../../session';
  import { login, checkLoginExpired } from '../../helpers/api';
  import QRscanner from './qrscanner.svelte';
  // eslint-disable-next-line no-unused-vars
  import { dlog } from '../game/helpers/DebugLog';

  export let params;

  // dlog($Session);
  let email;
  let password;
  let qrscanState = false;

  async function onSubmit() {
    login(email, password).catch(() => {
      email = params.user || 'user1@vrolijkheid.nl';
      password = params.password || 'somesupersecretpassword';
    });
  }

  const isMobileDevice = /Mobi/i.test(window.navigator.userAgent);
  const isMobile = !!isMobileDevice;

  // dlog('isMobile', isMobile);
  // dlog('navigator', navigator.userAgent);

  onMount(() => {
    // console.log(
    //   'Login: am I logged in? ',
    //   !!$Session?.token,
    //   checkLoginExpired(),
    // );
    email = params.user || 'user1@vrolijkheid.nl';
    password = params.password || 'somesupersecretpassword';
    if ($Session?.token && checkLoginExpired() !== true) {
      // Note: should a previous position of the user be available in Profile.meta,
      // they will be redirected there after the push below
      push(`/game?${$querystring}`);
    }
  });
</script>

<svelte:head>
  <title>Log in — ArtWorld</title>
</svelte:head>

<main>
  <div class="device-type">
    {#if isMobile}
      <img
        alt="Mobile phone"
        class="icon"
        src="assets/device_type/mobile.png"
      />
    {:else}
      <img alt="Laptop" class="icon" src="assets/device_type/laptop.png" />
    {/if}
  </div>

  <div class="qrModal">
    {#if qrscanState}
      <QRscanner bind:email bind:password />
    {/if}
  </div>

  <div class="register-form">
    <form on:submit|preventDefault="{onSubmit}">
      <div class="container">
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
          type="password"
          placeholder="Enter Password"
          name="psw"
          id="psw"
          bind:value="{password}"
          required
        />

        <button type="submit" class="register-btn">{$_('login.login')}</button>
      </div>
    </form>
    <button
      class="qr-btn"
      on:click="{() => {
        qrscanState = !qrscanState;
      }}"><CameraIcon /></button
    >
  </div>
</main>

<style>
  * {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
  }

  main {
    background: linear-gradient(90deg, white 29px, transparent 0%) center,
      linear-gradient(white 29px, transparent 0%) center, #7300ed;
    background-size: 30px 30px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .register-form {
    max-width: 400px;
    display: flex;
    justify-content: space-around;
    flex-direction: column;
  }

  /* Add padding to containers */
  .container {
    padding: 16px;
  }

  /* Full-width input fields */
  input[type='text'],
  input[type='password'] {
    width: 100%;
    padding: 15px;
    margin: 5px 0 22px 0;
    display: inline-block;
    background: #f1f1f1;
  }

  input[type='text']:focus,
  input[type='password']:focus {
    background-color: #ddd;
    outline: none;
  }

  /* Overwrite default styles of hr */
  /* hr {
    border: 1px solid #f1f1f1;
    margin-bottom: 25px;
  } */

  /* Set a style for the submit/register button */
  .register-btn {
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

  .register-btn:hover {
    opacity: 1;
  }

  /* Set a grey background color and center the text of the "sign in" section */
  .device-type {
    position: absolute;
    bottom: 20px;
    right: 20px;
  }

  .icon {
    position: relative;
    min-width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 2px solid #7300eb;
    padding: 10px;
    background-color: white;
  }

  .qr-btn {
    max-height: 50px;
    padding: 5px;
    margin: 0 auto;
    max-width: 80px;
  }
</style>
