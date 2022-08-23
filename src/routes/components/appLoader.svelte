<script>
  import { onDestroy } from 'svelte';
  import { parse } from 'qs';
  import { get } from 'svelte/store';
  import { pop, push, querystring } from 'svelte-spa-router';
  // import DrawingApp from '../apps/drawing.svelte';
  import DevDrawing from '../apps/dev_drawing.svelte';
  import DevStopmotion from '../apps/dev_stopmotion.svelte';
  import { CurrentApp, Profile, Error } from '../../session';
  import ManageSession from '../game/ManageSession';
  import { getAccount, getObject, setLoader, getFile } from '../../api';
  import { isValidApp, DEFAULT_APP } from '../apps/apps';
  import { playerHistory } from '../game/playerState';
  import { DEFAULT_SCENE, PERMISSION_READ_PUBLIC } from '../../constants';

  import AppContainer from './appContainer.svelte';

  /**
   * /drawing?user_id=UUID&key=KEY&version=VERSION ---> Object met oa URL
   * /
   *
   *
   */

  // Object containing info about the current file
  // Loaded from the server..
  let currentFile = {
    loaded: false,
  };
  // Object containing the current Apps rendered data (whatever needs saving)
  let data = null;

  const unsubscribe = CurrentApp.subscribe((val) => {
    if (isValidApp(val) && isValidQuery()) {
      load();
    }
  });

  function isValidQuery() {
    const parsedQuery = parse($querystring);
    const userId = parsedQuery.userId ?? null;
    return userId;
  }

  onDestroy(() => {
    unsubscribe();
  });

  async function closeApp() {
    if ($CurrentApp === 'avatar') {
      getAccount(ManageSession.userProfile.id);
    }

    currentFile = { loaded: false };
    data = null;
    // If a user has been here for a little while, just bring them where they were before
    if (get(playerHistory).length > 1) {
      pop();
      playerHistory.pop();
    } else {
      // Else, if a user came here through a deep link, forward to app defaults
      push(`/${DEFAULT_APP}?location=${DEFAULT_SCENE}`);
    }
  }

  async function saveData(andClose) {
    setLoader(true);

    // Fake a delay in saving..
    const promise = new Promise((resolve, reject) => {
      // Fake an error that could occur while saving. (reject the promise!)
      if (currentFile?.error) {
        setTimeout(() => {
          reject(currentFile.error);
        }, 1500);
      }

      setTimeout(() => {
        resolve(data);
      }, 1500);
    });

    // Saving should be able to succeed or fail
    promise
      .then((imgData) => {
        console.log('here is the image!', imgData);
        setLoader(false);
        if (andClose) closeApp();
      })
      .catch((error) => {
        Error.set(error);
        setLoader(false);
      });
  }

  async function load() {
    currentFile.loaded = false;

    const parsedQuery = parse($querystring);
    const userId = parsedQuery.userId ?? null;
    let key = parsedQuery.key ?? null;

    // Temporarily make dev_ versions of apps work too
    let loadFromCollection = $CurrentApp;
    if ($CurrentApp === 'dev_drawing') {
      loadFromCollection = 'drawing';
    } else if ($CurrentApp === 'dev_stopmotion') {
      loadFromCollection = 'stopmotion';
    } else if ($CurrentApp === 'dev_house') {
      loadFromCollection = 'home';
      key = $Profile.meta.Azc || 'Amsterdam';
    } else if ($CurrentApp === 'dev_avatar') {
      loadFromCollection = 'avatar';
    }

    currentFile = await getFileInformation(loadFromCollection, userId, key);
  }

  // Utility functions

  /** Load file information from server and return object with */
  async function getFileInformation(collectionName, userId, key) {
    if (userId && key) {
      const loadingObject = await getObject(collectionName, key, userId);

      if (loadingObject) {
        try {
          const file = await getFile(loadingObject.value.url);

          return {
            key,
            userId,
            loaded: true,
            displayName: loadingObject.value.displayname,
            type: loadingObject.collection,
            status: loadingObject.permission_read === PERMISSION_READ_PUBLIC,
            url: file,
            frames: 1, // Maybe use this instead of width/height ratio to calculate framecount?
          };
        } catch (error) {
          return {
            key,
            userId,
            loaded: false,
          };
        }
      }
    }

    return { loaded: false };
  }
</script>

<AppContainer
  open="{$CurrentApp !== null &&
    $CurrentApp !== DEFAULT_APP &&
    isValidApp($CurrentApp)}"
  on:close="{() => saveData(true)}"
>
  {#if $CurrentApp === 'dev_drawing' && currentFile.loaded}
    <DevDrawing file="{currentFile}" bind:data on:save="{saveData}" />
  {:else if $CurrentApp === 'dev_house' && currentFile.loaded}
    <DevDrawing file="{currentFile}" bind:data on:save="{saveData}" />
  {:else if $CurrentApp === 'dev_stopmotion' && currentFile.loaded}
    <DevStopmotion file="{currentFile}" bind:data on:save="{saveData}" />
  {:else if $CurrentApp === 'dev_avatar' && currentFile.loaded}
    <DevStopmotion file="{currentFile}" bind:data on:save="{saveData}" />
  {:else}
    <!-- Default = current solution -->
    <!-- <DrawingApp bind:appType="{$CurrentApp}" /> -->
  {/if}
</AppContainer>
