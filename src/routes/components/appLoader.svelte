<script>
  import { onDestroy, tick } from 'svelte';
  import { parse } from 'qs';
  import { get } from 'svelte/store';
  import { pop, push, querystring, loc } from 'svelte-spa-router';
  import Drawing from '../apps/drawing.svelte';
  import Stopmotion from '../apps/stopmotion.svelte';
  import Mariosound from '../apps/marioSequencer.svelte';
  import { CurrentApp, Profile, Error } from '../../session';
  import { AvatarsStore } from '../../storage';
  import ManageSession from '../game/ManageSession';
  import {
    getAccount,
    getObject,
    setLoader,
    getFile,
    getRandomName,
    uploadImage,
    setHome,
    setAvatar,
  } from '../../api';
  import { isValidApp, DEFAULT_APP } from '../apps/apps';
  import { PlayerHistory } from '../game/playerState';
  import { DEFAULT_SCENE, PERMISSION_READ_PUBLIC } from '../../constants';

  import AppContainer from './appContainer.svelte';
  import Preview from '../apps/preview.svelte';

  /**
   * - Check userId === $Profile.userId : edit; preview only
   * /drawing?userId=UUID&key=KEY ---> Object met oa URL
   * /house?userId=UUID&key=KEY
   * /avatar?userId=UUID&key=KEY
   * /stopmotion?userId=UUID&key=KEY
   * /sound?userId=UUID&key=KEY
   */

  let parsedQuery = {};
  $: userIsOwner =
    $Profile !== null &&
    isValidQuery(parsedQuery) &&
    $Profile.id === parsedQuery.userId;

  // Object containing info about the current file
  // Loaded from the server..
  let currentFile = {
    loaded: false,
  };
  // Object containing the current Apps rendered data (whatever needs saving)
  let data = null;
  let changes = 0;

  /** Subscribe to 'loc', as changes to location AND querystring should trigger this evaluation */
  const unsubscribe = loc.subscribe(async () => {
    // We need to wait a tick, as sometimes querystring and locations dont match yet (??)
    await tick();

    // Update the parsedQuery (used in various places)
    parsedQuery = parse($querystring);

    if (
      isValidLoaderApp($CurrentApp) && // Dont run on the game
      isValidQuery(parsedQuery) // AND when the query is valid (to open an existing file)
    ) {
      loadFile();
    } else if (isValidLoaderApp($CurrentApp)) {
      newFile();
    }
  });

  /** App may be loaded if it is NOT the game but IS listed as valid */
  function isValidLoaderApp(appName) {
    return (
      appName !== DEFAULT_APP && // Dont run on the game
      isValidApp(appName) // But do run for valid apps
    );
  }

  /** Query is valid if it contains both userId & key */
  function isValidQuery(query) {
    return 'userId' in query && 'key' in query;
  }

  onDestroy(() => {
    unsubscribe();
  });

  /** Close the app, and send user to a previous location OR the default scene */
  async function closeApp() {
    // First update the avatar for the user
    if ($CurrentApp === 'avatar') {
      getAccount(ManageSession.userProfile.id);
    }

    // Reset local variables
    currentFile = { loaded: false };
    data = null;

    // If a user has been here for a little while, just bring them where they were before
    if (get(PlayerHistory).length > 1) {
      pop();
      PlayerHistory.pop();
    } else {
      // Else, if a user came here through a deep link, forward to app defaults
      push(`/${DEFAULT_APP}?location=${DEFAULT_SCENE}`);
    }
  }

  /** Save the current data to the appropriate targets
   * @param {boolean} andClose Should the AppContainer afterwards?
   */
  async function saveData(andClose) {
    // NO changes? We don't need to save anything.
    if (changes < 1) {
      if (andClose) closeApp();
      return;
    }

    setLoader(true);

    /** Attempt to save the file, then resolve or reject after doing so */
    const uploadPromise = new Promise((resolve, reject) => {
      const blobData = dataURItoBlob(data);

      uploadImage(
        currentFile.key, // ook wel title/name
        currentFile.type, // collection
        blobData, // img as blob
        currentFile.status,
        0, // version
        currentFile.displayName,
      )
        .then((url) => {
          // console.log('Upload result:', url);
          currentFile.uploadUrl = url;
          resolve(url);
        })
        .catch((error) => {
          // console.log('Upload ERROR:', error);
          reject();
        });
    });

    const setHomePromise = new Promise((resolve, reject) => {
      if (currentFile.new && currentFile.type === 'house') {
        setHome(currentFile.uploadUrl)
          .then(() => {
            resolve();
          })
          .catch((error) => {
            reject();
          });
      } else {
        resolve();
      }
    });

    const setAvatarPromise = new Promise((resolve, reject) => {
      if (currentFile.new && currentFile.type === 'avatar') {
        setAvatar(currentFile.uploadUrl)
          .then(() => {
            AvatarsStore.loadAvatars();
            resolve();
          })
          .catch((error) => {
            reject();
          });
      } else {
        resolve();
      }
    });

    // Saving should be able to succeed or fail
    Promise.all([uploadPromise, setHomePromise, setAvatarPromise])
      .then(() => {
        // console.log('here is the image!', data);
        setLoader(false);
        if (andClose) closeApp();
      })
      .catch((error) => {
        Error.set(error);
        setLoader(false);
      });
  }

  async function loadFile() {
    currentFile.loaded = false;

    const userId = parsedQuery?.userId ?? null;
    const key = parsedQuery?.key ?? null;
    const loadFromCollection = $CurrentApp;

    currentFile = await getFileInformation(loadFromCollection, userId, key);
  }

  async function newFile() {
    const saveToCollection = $CurrentApp;
    const displayName = await getRandomName();
    currentFile = {
      userId: $Profile.id,
      loaded: false,
      new: true,
      displayName,
      key: `${getDateMillis()}_${displayName}`,
      type: saveToCollection,
      status: true,
    };
    // console.log({ currentFile });
  }

  // Utility functions

  /** Load file information from server and return object with */
  async function getFileInformation(collectionName, userId, key) {
    if (userId && key) {
      try {
        const loadingObject = await getObject(collectionName, key, userId);

        // TODO: Het kan zijn dat een object leeg terugkomt. Dan staan wellicht de permissies fout.

        // console.log(...arguments, { loadingObject });
        if (loadingObject) {
          const file = await getFile(loadingObject.value.url);

          return {
            key,
            userId,
            loaded: true,
            new: false,
            displayName: loadingObject.value.displayname,
            type: loadingObject.collection,
            status: loadingObject.permission_read === PERMISSION_READ_PUBLIC,
            url: file,
            frames: 1, // Maybe use this instead of width/height ratio to calculate framecount?
          };
        }
      } catch (error) {
        return {
          key,
          userId,
          loaded: false,
          new: false,
        };
      }
    }

    return {
      loaded: false,
      new: false,
    };
  }

  function dataURItoBlob(dataURI) {
    // const binary = Buffer.from(dataURI.split(',')[1], 'base64');
    const binary = atob(dataURI.split(',')[1]);
    const array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], { type: 'image/png' });
  }

  function getDateMillis() {
    const dateMillis = new Date();
    const dateIsoString = dateMillis.toISOString();
    const dateReplaced1 = dateIsoString.replace(/:/g, '_');
    return dateReplaced1.split('.')[0];
  }
</script>

<AppContainer
  open="{$CurrentApp !== null &&
    $CurrentApp !== DEFAULT_APP &&
    isValidApp($CurrentApp)}"
  on:close="{() => saveData(true)}"
>
  {#if (userIsOwner && currentFile.loaded) || currentFile.new}
    {#if $CurrentApp === 'drawing' || $CurrentApp === 'house'}
      <Drawing
        file="{currentFile}"
        bind:data
        bind:changes
        on:save="{saveData}"
      />
    {:else if $CurrentApp === 'stopmotion' || $CurrentApp === 'avatar'}
      <Stopmotion
        file="{currentFile}"
        bind:data
        bind:changes
        on:save="{saveData}"
      />
    {:else if $CurrentApp === 'mariosound'}
      <Mariosound />
      <!-- <Stopmotion
        file="{currentFile}"
        bind:data
        bind:changes
        on:save="{saveData}"
      /> -->
    {/if}
  {:else if currentFile.loaded}
    <Preview file="{currentFile}" />
  {/if}
</AppContainer>
