<script>
  import { fly } from 'svelte/transition';
  import { location, push, querystring } from 'svelte-spa-router';
  import { onDestroy, onMount, tick } from 'svelte';
  import DrawingApp from '../apps/drawing.svelte';
  import { CurrentApp } from '../../session';
  import SceneSwitcher from '../game/class/SceneSwitcher';
  import ManageSession from '../game/ManageSession';
  import { getAccount } from '../../api';
  import { dlog } from '../game/helpers/DebugLog';
  import { isValidApp } from '../apps/apps';

  // import DrawingChallenge from '../apps/drawingChallenge.svelte';

  let appOpen = null;
  /**
   * URL structuur
   * - /# --> root
   * - /#/ --> root
   * - /#/?location=Artworld
   * - /#/?location=Artworld/stopmotion
   */
  const unsubscribe = CurrentApp.subscribe(async () => {
    await tick();

    if ($CurrentApp === 'game') return null;

    if ($CurrentApp) {
      await SceneSwitcher.pauseSceneStartApp(
        ManageSession.currentScene,
        $CurrentApp,
      );
    } else {
      await SceneSwitcher.startSceneCloseApp(
        ManageSession.currentScene,
        appOpen,
      );
    }
    // TODO: Apps should just load by URL instead of the other way around
    if ($CurrentApp) {
      push(`/${$CurrentApp}?${$querystring}`);
    } else {
      push(`/?${$querystring}`); // No app..
    }
    return null;
  });

  const unsubscribe2 = location.subscribe(async () => {
    // eslint-disable-next-line prefer-destructuring
    const app = $location.split('/')[1];
    if (isValidApp(app)) appOpen = app;
    dlog(appOpen);
  });

  async function closeApp() {
    dlog('closeApp');

    if (appOpen === 'avatar') {
      dlog('closeApp avatar, appOpen:', appOpen);
      dlog('avatar user id:', ManageSession.userProfile.id);
      getAccount(ManageSession.userProfile.id);
    }

    CurrentApp.set(null);
    appOpen = '';
    console.log('Pushing to / ');
    push('/');
  }

  // async function reloadApp() {
  //   const app = $CurrentApp;
  //   CurrentApp.set(null);
  //   await tick();
  //   CurrentApp.set(app);
  // }

  onMount(() => {
    const app = $location.split('/')[1];
    if (isValidApp(app)) CurrentApp.set(app);
  });

  onDestroy(() => {
    unsubscribe();
    unsubscribe2();
  });
</script>

{#if !!appOpen}
  <div
    class="app"
    transition:fly="{{ y: window.innerHeight, duration: 700, opacity: 1 }}"
  >
    <div id="close" on:click="{closeApp}">
      <img alt="Close" src="assets/SHB/svg/AW-icon-cross.svg" />
    </div>
    {#if isValidApp(appOpen)}
      <DrawingApp bind:appType="{appOpen}" />
    {/if}

    <!-- {#if appOpen == "drawingchallenge"}
            <DrawingChallenge bind:appType={appOpen} />
        {/if} -->
  </div>
{/if}

<style>
  * {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  .app {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    min-width: 100vw;
    z-index: 12;
    background-color: white;
  }

  #close {
    position: fixed;
    left: 8px;
    top: 20px;
    z-index: 13;
    box-shadow: 5px 5px 0px #7300ed;
    cursor: pointer;
    padding: 0;
    margin: 0;
    border-radius: 50%;
    width: 40px;
    height: 40px;
  }

  #close > img {
    width: 40px;
  }

  @media only screen and (max-width: 640px) {
    #close {
      top: unset;
      bottom: 120px;
    }
  }
</style>
