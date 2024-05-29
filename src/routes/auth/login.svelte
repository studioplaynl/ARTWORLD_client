<script>
  import { _ } from 'svelte-i18n';
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import CameraIcon from 'svelte-icons/fa/FaQrcode.svelte';
  import { push, querystring } from 'svelte-spa-router';
  import { Session } from '../../session';
  import { login, checkLoginExpired } from '../../helpers/nakamaHelpers';
  import QRscanner from './QRScanner.svelte';
  // eslint-disable-next-line no-unused-vars
  import { dlog } from '../../helpers/debugLog';

  export let params;

  // dlog($Session);
  let email;
  let password;
  let qrscanState = false;

  const isMobileDevice = /Mobi/i.test(window.navigator.userAgent);
  const isMobile = !!isMobileDevice;

  const showPassword = writable(false);

  onMount(() => {
    email = params.user || 'user1@vrolijkheid.nl';
    password = params.password || 'somesupersecretpassword';
    if ($Session?.token && checkLoginExpired() !== true) {
      // Note: should a previous position of the user be available in Profile.meta,
      // they will be redirected there after the push below
      push(`/game?${$querystring}`);
    }
  });
  
  async function onSubmit() {
    login(email, password).catch(() => {
      email = params.user || 'user1@vrolijkheid.nl';
      password = params.password || 'somesupersecretpassword';
    });
  }

  function togglePasswordVisibility() {
    showPassword.update(value => !value);
  }

  function handleInput(event) {
    password = event.target.value;
  }

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
      <QRscanner bind:email="{email}" bind:password="{password}" />
    {/if}
  </div>

  <div class="register-form">
    <form on:submit|preventDefault="{onSubmit}">
      <div class="container">
        <label for="email"><b>{$_('register.email')}</b></label>
        <input
          class="input-field"
          type="text"
          placeholder="Enter Email"
          name="email"
          id="email"
          bind:value="{email}"
          required
        />

        <div class="password-container">
          <label for="psw"><b>{$_('register.password')}</b></label>
          <button class="toggle-visibility" type="button" on:click={togglePasswordVisibility}>
            <img src={$showPassword ? './assets/SHB/svg/AW-icon-visible.svg' : './assets/SHB/svg/AW-icon-invisible.svg'} alt="Toggle password visibility" />
          </button>
        </div>

        {#if $showPassword}
          <input
            class="input-field"
            type="text"
            placeholder="Enter Password"
            name="psw"
            id="psw"
            bind:value={password}
            on:input={handleInput}
            required
          />
        {:else}
          <input
            class="input-field"
            type="password"
            placeholder="Enter Password"
            name="psw"
            id="psw"
            bind:value={password}
            on:input={handleInput}
            required
          />
        {/if}

        <button type="submit" class="register-btn">{$_('login.login')}</button>
      </div>
    </form>
    <button
      class="qr-btn"
      on:click="{() => {
        qrscanState = !qrscanState;
      }}"
    >
      <CameraIcon />
    </button>
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

  button {
    background-color: #7300eb;
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
  .input-field {
    width: 100%;
    padding: 15px;
    margin: 5px 0 22px 0;
    display: inline-block;
    background: #f1f1f1;
  }

  .password-container {
    display: flex;
    align-items: center;
  }

  .toggle-visibility {
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
    margin-left: 10px;
  }

  .toggle-visibility img {
    height: 20px;
  }

  input[type='text']:focus,
  input[type='password']:focus {
    background-color: #ddd;
    outline: none;
  }

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
