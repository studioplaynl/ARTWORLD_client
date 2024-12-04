<script>
  import { _ } from 'svelte-i18n';
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { push, querystring } from 'svelte-spa-router';
  import { Session } from '../../session';
  import { login, checkLoginExpired } from '../../helpers/nakamaHelpers';
  import QRscanner from './QRScanner.svelte';
  // eslint-disable-next-line no-unused-vars
  import { dlog } from '../../helpers/debugLog';
  import { getDeviceType } from '../../helpers/deviceDetection';

  export let params;

  // dlog($Session);
  let email;
  let password;
  let qrscanState = false;
  let showMoreOptions = false;

  const deviceType = getDeviceType();
  const isMobile = deviceType === 'mobile' || deviceType === 'tablet';

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

  async function clearCache() {
    if ('caches' in window) {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
        window.location.reload(true);
      } catch (err) {
        console.error('Error clearing cache:', err);
      }
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  }

  function toggleMoreOptions() {
    showMoreOptions = !showMoreOptions;
  }

</script>

<svelte:head>
  <title>Log in — ArtWorld</title>
</svelte:head>

<main>
  <div class="device-type">
    {#if deviceType === 'mobile'}
      <img
        alt="Mobile phone"
        class="icon"
        src="assets/device_type/mobile.png"
      />
    {:else if deviceType === 'tablet'}
      <img
        alt="Tablet"
        class="icon"
        src="assets/device_type/mobile.png"
      />
    {:else}
      <img 
        alt="Laptop" 
        class="icon" 
        src="assets/device_type/laptop.png" 
      />
    {/if}
  </div>

  <button class="utility-btn" on:click={toggleFullscreen}>
    <img src="./assets/SHB/svg/AW-icon-fullscreen.svg" alt="Toggle fullscreen" />
    {$_('fullscreen')}
  </button>

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
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 30 30" 
        width="80" 
        height="80"
      >
        <circle cx="15" cy="15" r="14" fill="white" stroke="#7300eb" stroke-width="2"/>
        <path 
          fill="#7300eb" 
          d="M20 11h-2l-1.5-1.5h-3L12 11h-2c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-6c0-1.1-.9-2-2-2zm-5 7c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z"
        />
        <circle 
          cx="15" 
          cy="15" 
          r="1.5" 
          fill="#7300eb"
        />
      </svg>
    </button>
  </div>

  <!--
  <div class="more-menu">
    <button class="more-btn" on:click={toggleMoreOptions}>
      <img 
        src="./assets/SHB/svg/AW-icon-more.svg" 
        alt="More options" 
        class="more-icon"
      />
    </button>
    
    {#if showMoreOptions}
      <div class="utility-buttons">
        <button class="utility-btn" on:click={toggleFullscreen}>
          <img src="./assets/SHB/svg/AW-icon-fullscreen.svg" alt="Toggle fullscreen" />
          {$_('fullscreen')}
        </button>
      </div>
    {/if}
  </div>
  -->
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
    max-height: 80px;
    max-width: 80px;
    padding: 0;
    margin: 0 auto;
    background: none;
    border: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .qr-btn svg {
    width: 100%;
    height: 100%;
  }

  .qr-btn:hover svg path,
  .qr-btn:hover svg circle:last-child {
    fill: #8f33f5;
  }

  .utility-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #7300eb;
    border-radius: 25px;
    color: white;
    padding: 8px 16px;
    border: none;
    cursor: pointer;
    opacity: 0.9;
    white-space: nowrap;
  }

  .utility-btn:hover {
    opacity: 1;
  }

  .utility-btn img {
    width: 20px;
    height: 20px;
  }
</style>
