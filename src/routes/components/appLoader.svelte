<script>
  import { onMount, onDestroy } from 'svelte';
  import { get } from 'svelte/store';
  import { pop, push } from 'svelte-spa-router';
  import DrawingApp from '../apps/drawing.svelte';
  import DevDrawing from '../apps/dev_drawing.svelte';
  import DevStopmotion from '../apps/dev_stopmotion.svelte';
  import { CurrentApp, Error } from '../../session';
  import ManageSession from '../game/ManageSession';
  import { getAccount, setLoader } from '../../api';
  import { isValidApp, DEFAULT_APP } from '../apps/apps';
  import { playerHistory } from '../game/playerState';
  import { DEFAULT_SCENE } from '../../constants';

  import AppContainer from './appContainer.svelte';

  let currentFile = {};

  async function closeApp() {
    if ($CurrentApp === 'avatar') {
      getAccount(ManageSession.userProfile.id);
    }

    currentFile = {};
    // If a user has been here for a little while, just bring them where they were before
    if (get(playerHistory).length > 1) {
      pop();
      playerHistory.pop();
    } else {
      // Else, if a user came here through a deep link, forward to app defaults
      push(`/${DEFAULT_APP}?location=${DEFAULT_SCENE}`);
    }
  }

  const unsubscribe = CurrentApp.subscribe((val) => {
    if (isValidApp(val)) {
      load(val);
    }
  });

  onDestroy(() => {
    unsubscribe();
  });

  async function onSave(evt) {
    const fileDetails = evt.detail;
    setLoader(true);

    // Fake a delay in saving..
    const promise = new Promise((resolve, reject) => {
      // Fake an error that could occur while saving. (reject the promise!)
      if (fileDetails?.error) {
        setTimeout(() => {
          reject(fileDetails.error);
        }, 1500);
      }

      setTimeout(() => {
        resolve();
      }, 1500);
    });

    // Saving should be able to succeed or fail
    promise
      .then(() => {
        CurrentApp.set('game');
        setLoader(false);
      })
      .catch((error) => {
        Error.set(error);
        setLoader(false);
      });
  }

  $: hasCurrentFile = currentFile !== {};

  function load(type) {
    switch (type) {
      case 'dev_drawing':
        // TODO: Load file URL from server
        currentFile = {
          id: 123123,
          type: 'drawing',
          path: 'https://picsum.photos/id/1/400/300/',
          frames: 1,
        };
        break;

      case 'dev_stopmotion':
        currentFile = {
          id: 234234,
          type: 'stopmotion',
          path: 'https://picsum.photos/id/2/2000/400/',
          frames: 5,
        };
        break;

      case 'dev_house':
        currentFile = {
          id: 345345,
          type: 'house',
          path: 'https://picsum.photos/id/234/400/300/',
          frames: 1,
        };
        break;

      case 'dev_avatar':
        currentFile = {
          id: 456456,
          type: 'avatar',
          path: 'https://picsum.photos/id/1/1200/400/',
          frames: 3,
        };
        break;

      default:
        break;
    }
  }
</script>

<AppContainer
  open="{$CurrentApp !== null &&
    $CurrentApp !== DEFAULT_APP &&
    isValidApp($CurrentApp)}"
  on:close="{closeApp}"
>
  {#if $CurrentApp === 'dev_drawing' && hasCurrentFile}
    <DevDrawing file="{currentFile}" on:save="{onSave}" />
  {:else if $CurrentApp === 'dev_house' && hasCurrentFile}
    <DevDrawing file="{currentFile}" on:save="{onSave}" />
  {:else if $CurrentApp === 'dev_stopmotion' && hasCurrentFile}
    <DevStopmotion file="{currentFile}" on:save="{onSave}" />
  {:else if $CurrentApp === 'dev_avatar' && hasCurrentFile}
    <DevStopmotion file="{currentFile}" on:save="{onSave}" />
  {:else}
    <!-- Default = current solution -->
    <DrawingApp bind:appType="{$CurrentApp}" />
  {/if}
</AppContainer>
