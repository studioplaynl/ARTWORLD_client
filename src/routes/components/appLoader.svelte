<script>
  import { onDestroy, tick } from 'svelte';
  import { parse } from 'qs';
  import { get } from 'svelte/store';
  import {
    pop, push, querystring, loc,
  } from 'svelte-spa-router';
  import Drawing from '../apps/drawing.svelte';
  import Stopmotion from '../apps/stopmotion.svelte';
  import Mariosound from '../apps/marioSequencer.svelte';
  import { CurrentApp, Profile, Error } from '../../session';
  import { AvatarsStore, myHome } from '../../storage';
  import ManageSession from '../game/ManageSession';
  import { dlog } from '../game/helpers/DebugLog';
  import {
    getAccount,
    getObject,
    setLoader,
    getFile,
    getRandomName,
    uploadImage,
    setHome,
    setAvatar,
    getDateAndTimeFormatted,
    updateObject,
    // updateTitle,
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

  // for saving the stopmotion data in a promise
  let drawing;
  let parsedQuery = {};
  $: userIsOwner =
    $Profile !== null &&
    isValidQuery(parsedQuery) &&
    $Profile.id === parsedQuery.userId;

  // Object containing info about the current file
  // Loaded from the server..
  export let currentFile = {
    loaded: false,
  };
  let displayName = ''; // synced with drawing app; to be able to edit and store the name

  // Object containing the current Apps rendered data (whatever needs saving)
  let data = null; // synced with drawing app
  let changes = 0; // synced with drawing app

  // keep the displayName updated in currentFile, always up to date for saving etc
  $: { currentFile.displayName = displayName; }

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
      dlog('pop spa router, PlayerHistory.pop');
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

    //! if only the displayName changed, the object should be updated but not the image
    //! for now: update the object always
    if (changes < 1) {
      setLoader(true);

      if (andClose) {
        if (currentFile.loaded) {
          const tempValue = {
            displayname: displayName,
            url: currentFile.awsUrl,
            version: '0',
          };
          const userID = currentFile.user_id;


          // updateTitle(currentFile.type, currentFile.key, displayName, userID)

          // updateObject(type, name, value, pub, userID)

          Promise.all([updateObject(currentFile.type, currentFile.key, tempValue, currentFile.permission_read, userID)])
            .then(() => {
              console.log(
                'updated object only: values:currentFile.type, currentFile.key, tempValue, currentFile.permission_read',
                currentFile.type,
                currentFile.key,
                tempValue,
                currentFile.permission_read,
              );
            })
            .catch((error) => {
              Error.set(error);
              setLoader(false);
            });
          setLoader(false);
        }
        //! currentFile bug

        setLoader(false);

        closeApp();
      }
      return;
    }

    setLoader(true);

    // save as a new file when having edited Avatar or House
    if ($CurrentApp === 'avatar' || $CurrentApp === 'house') {
      // check if it is a new file
      if (currentFile.new === false) {
        // const { displayName } = currentFile;
        currentFile.key = `${getDateAndTimeFormatted()}_${displayName}`;
        currentFile.new = true;
      }
    }

    // create the data to save

    // if ($CurrentApp === 'stopmotion' ) run the function stopmotionSaveHandler() in drawing.svelte

    if ($CurrentApp === 'stopmotion' || $CurrentApp === 'avatar') await drawing.stopmotionSaveHandler();

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
          currentFile.uploadUrl = url;
          resolve(url);

          // eslint-disable-next-line no-unused-vars
          const setHomePromise = new Promise((resolveSetHomePromise, rejectSetHomePromise) => {
            if (currentFile.new && currentFile.type === 'house') {
              const newHomeUrl = currentFile.uploadUrl;
              setHome(currentFile.uploadUrl)
                .then(() => {
                  myHome.create(newHomeUrl); // update the home
                  resolveSetHomePromise();
                })
                .catch((error) => {
                  dlog('setHomePromise error', error);
                  rejectSetHomePromise();
                });
            } else {
              resolveSetHomePromise();
            }
          });

          // eslint-disable-next-line no-unused-vars
          const setAvatarPromise = new Promise((resolveSetAvatarPromise, rejectSetAvatarPromise) => {
            if (currentFile.new && currentFile.type === 'avatar') {
              setAvatar(currentFile.uploadUrl)
                .then(() => {
                  AvatarsStore.loadAvatars();
                  resolveSetAvatarPromise();
                })
                .catch((error) => {
                  dlog('setAvatarPromise error', error);
                  rejectSetAvatarPromise();
                });
            } else {
              resolveSetAvatarPromise();
            }
          });
        })
        .catch((error) => {
          dlog('Upload ERROR:', error);
          reject();
        });
    });

    // const setHomePromise = new Promise((resolve, reject) => {
    //   if (currentFile.new && currentFile.type === 'house') {
    //     setHome(currentFile.uploadUrl)
    //       .then(() => {
    //         resolve();
    //       })
    //       .catch((error) => {
    //         reject(error);
    //       });
    //   } else {
    //     resolve();
    //   }
    // });

    // const setAvatarPromise = new Promise((resolve, reject) => {
    //   if (currentFile.new && currentFile.type === 'avatar') {
    //     setAvatar(currentFile.uploadUrl)
    //       .then(() => {
    //         AvatarsStore.loadAvatars();
    //         resolve();
    //       })
    //       .catch((error) => {
    //         reject(error);
    //       });
    //   } else {
    //     resolve();
    //   }
    // });

    // Saving should be able to succeed or fail
    Promise.all([uploadPromise]) // ,
      .then(() => {
        dlog('artwork saved:', currentFile);
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
    displayName = await getRandomName();
    const tempKey = await getDateAndTimeFormatted();
    currentFile = {
      userId: $Profile.id,
      loaded: false,
      new: true,
      displayName,
      key: `${tempKey}_${displayName}`,
      type: saveToCollection,
      status: true,
    };
  }

  // Utility functions

  /** Load file information from server and return object with */
  async function getFileInformation(collectionName, userId, key) {
    if (userId && key) {
      try {
        const loadingObject = await getObject(collectionName, key, userId);

        // TODO: Het kan zijn dat een object leeg terugkomt. Dan staan wellicht de permissies fout.

        if (loadingObject) {
          const file = await getFile(loadingObject.value.url);
          // console.log('loadingObject', loadingObject);
          // set the displayName, so it can also be changed in the Drawing app
          displayName = loadingObject.value.displayname;
          return {
            key,
            userId,
            loaded: true,
            new: false,
            displayName: loadingObject.value.displayname,
            type: loadingObject.collection,
            status: loadingObject.permission_read === PERMISSION_READ_PUBLIC,
            url: file,
            awsUrl: loadingObject.value.url,
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

  async function saveToFile() {
    if ($CurrentApp === 'stopmotion' || $CurrentApp === 'avatar') {
      await drawing.stopmotionSaveHandler();
      downloadImage();
    } else if ($CurrentApp === 'drawing' || $CurrentApp === 'house') {
      downloadImage();
    }
  }

    function downloadImage() {
      const filename = `${$Profile.username}_${currentFile.key}.png`;
      const a = document.createElement('a');
      a.download = filename;
      a.href = data;
      document.body.appendChild(a);
      a.click();
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

  // function getDateMillis() {
  //   const dateMillis = new Date();
  //   const dateIsoString = dateMillis.toISOString();
  //   const dateReplaced1 = dateIsoString.replace(/:/g, '_');
  //   return dateReplaced1.split('.')[0];
  // }
</script>

<AppContainer
  open="{$CurrentApp !== null &&
    $CurrentApp !== DEFAULT_APP &&
    isValidApp($CurrentApp)}"
  on:close="{() => saveData(true)}"
  on:saveToFile="{() => saveToFile()}"
>
  {#if (userIsOwner && currentFile.loaded) || currentFile.new}
    {#if $CurrentApp === 'drawing' || $CurrentApp === 'house'}
      <Drawing
        file="{currentFile}"
        bind:data
        bind:changes
        bind:displayName
        bind:this={drawing}
        on:save="{saveData}"
      />

    {:else if $CurrentApp === 'stopmotion' || $CurrentApp === 'avatar'}
      <Stopmotion
        file="{currentFile}"
        bind:data
        bind:changes
        bind:displayName
        bind:drawing
        on:save="{saveData}"
      />
    {:else if $CurrentApp === 'mariosound'}
      <Mariosound />
    {/if}
  {:else if currentFile.loaded}
    <Preview file="{currentFile}" />
  {/if}
</AppContainer>
