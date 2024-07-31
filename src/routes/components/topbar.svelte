<script>
  import { pop } from 'svelte-spa-router';
  import { onMount } from 'svelte';
  import {
    PlayerHistory,
    PlayerZoom,
    PlayerLocation,
    PlayerPos,
    PlayerUpdate,
  } from '../game/playerState';
  import { miniMapDimensions } from '../../storage';
  import { DEFAULT_SCENE, SCENE_INFO, MINIMAP_MARGIN } from '../../constants';
  import { getFullAccount } from '../../helpers/nakamaHelpers';
  import { findParentScenes } from '../game/helpers/UrlHelpers';
  // import { dlog } from '../game/helpers/debugLog';

  let currentLocation = '';
  let userInfo = null;
  let homeImageUrl = '';
  let avatarUrl = '';
  let parentScenes = [];
  let miniMap = {x: MINIMAP_MARGIN, y: MINIMAP_MARGIN};

  onMount(async () => {
    PlayerLocation.subscribe(async (value) => {
      currentLocation = value;
      console.log('currentLocation', currentLocation);

      parentScenes = findParentScenes(currentLocation.scene, SCENE_INFO);
      
      /* Remove 'Artworld' from parentScenes if present
         because the Artworld button is always visible, and is the root scene
      */
      parentScenes = parentScenes.filter(scene => scene !== 'Artworld');
      console.log('filter out artworld parentScenes', parentScenes);
      
      if (parentScenes.length > 0) {
        console.log('currentLocation parentScenes', parentScenes);
        // simple case where we have parent scenes
        currentLocation = {scene: value.scene};
      } else {
        /* no parent scenes, case can be:
        1. Artworld
        2. DefaultUserHome
        */
        console.log(`currentLocation ${currentLocation} has no parent scenes`);

        if (currentLocation.scene === DEFAULT_SCENE) {
          // we are in Artworld scene
          currentLocation = {scene: value.scene};

        } else if (currentLocation.scene === 'DefaultUserHome') {
          // console.log('currentLocation Player is in DefaultUserHome');
          /* we are in DefaultUserHome scene
             we have to find the parent scene of the house
             by fetching the user info 
          */
            try {
              console.log('currentLocation we have to fetch the user info to find the parent scene of the house');
              userInfo = await getFullAccount(currentLocation.house);
              console.log('currentLocation userInfo', userInfo);
              parentScenes.push(userInfo.meta.Azc);
              // console.log('userInfo.meta.Azc parentScenes', parentScenes);

              // userInfo.meta.Azc is the parent scene of the house
              // now we seach for the parent scene of userInfo.meta.Azc
              const tempParentScenes = findParentScenes(userInfo.meta.Azc, SCENE_INFO);
              //filter out artworld
              const tempParentScenes2 = tempParentScenes.filter(scene => scene !== 'Artworld');
              // parentScenes.push(...tempParentScenes);
              parentScenes.push(...tempParentScenes2);

              console.log('currentLocation parentScenes', parentScenes);

              currentLocation = {scene: 'DefaultUserHome', house: value.house};
            } catch (error) {
              console.error('Error fetching user info:', error);
              currentLocation = {house: value.house};

            }
            
        } else {
          console.log('currentLocation Player is in an unknown location without parent');
        }
      }
    });

    miniMapDimensions.subscribe((value) => {
      miniMap = value;
    });
  });

  $: zoomButtonsStyle = `
    position: absolute;
    right: ${0}px;
    top: ${miniMap.y + MINIMAP_MARGIN}px;
  `;

  $: console.log('parentScenes', parentScenes);
  $: console.log('currentLocation', currentLocation);

  /** We send the player to the middle of artworld so there is a fixed orientation point
  //  We set the Position after the Location
  //  when we set the position we force the urlparser to do a replace on the history and url,
  //  with PlayerUpdate.set({ forceHistoryReplace: false });
  */
  async function goHome() {
    PlayerLocation.set({
      scene: DEFAULT_SCENE,
    });
    PlayerUpdate.set({ forceHistoryReplace: false });
    PlayerPos.set({
      x: 0,
      y: 0,
    });
  }

  /**  pop() sets off a reaction where the url is parsed, and the player is taken back
   *   PlayerHistory.pop() is to reflect the state there
  */
  async function goBack() {
    if ($PlayerHistory.length > 1) {
      PlayerHistory.pop();
      pop();
    }
  }

  function goToScene(scene) {
    const historyIndex = $PlayerHistory.findIndex(entry => entry.scene === scene);
    if (historyIndex !== -1) {
      // Scene is in history, go back to that point
      while ($PlayerHistory.length > historyIndex + 1) {
        PlayerHistory.pop();
        pop();
      }
    } else {
      // Scene is not in history, navigate to it
      PlayerLocation.set({ scene });
      push(`/${scene}`);
    }
  }
 
  async function zoomIn() {
    PlayerZoom.in();
  }

  function zoomReset() {

    PlayerZoom.reset();
  }

  function zoomOut() {
    PlayerZoom.out();
  }
</script>

<div class="topbar">
  <!-- go back in history button -->
  <button on:click="{goBack}" class="back-button" class:hidden="{$PlayerHistory.length <= 1}">
    <img
      class="TopIcon"
      id="back"
      src="/assets/SHB/svg/AW-icon-previous.svg"
      alt="Go back"
    />
  </button>

  <!-- go back to artworld 0,0 button -->
  <button on:click="{goHome}">
    <img
      class="TopIcon"
      id="logo"
      src="assets/SHB/svg/AW-icon-logo-A.svg"
      alt="Homepage"
    />
  </button>

  <!-- a scene below the current one, styled as pill text
  clickable, takes us to that scene, if it is present in the history, it takes that position-->

  {#if parentScenes.length > 0}
    {#each parentScenes as scene}
      <button class="pill-button" on:click={() => goToScene(scene)}>
        <span class="pill-button-text">{scene}</span>
      </button>
    {/each}
{/if}
  <!-- dont show artworld icon, because that is visible by default-->
  {#if currentLocation.scene !== DEFAULT_SCENE}
    {#if currentLocation.scene === 'DefaultUserHome'}
      <div class="pill-container">
        <img
          class="pill-button-icon"
          src={homeImageUrl || 'assets/SHB/svg/AW-icon-logo-A.svg'}
          alt="House"
        />
        <img
          class="pill-button-icon avatar"
          src={avatarUrl || 'assets/SHB/svg/AW-icon-logo-A.svg'}
          alt="Avatar"
        />
        {#if userInfo}
          <span class="pill-button-text">{userInfo.display_name || userInfo.name}</span>
        {/if}
      </div>
    {:else}
      <div class="pill-text">
        <span class="pill-button-text">{currentLocation.scene}</span>
      </div>
    {/if}
  {/if}
</div>

<div class="topbar-second" style="{zoomButtonsStyle}">
  <button on:click="{zoomOut}" id="zoomOut">
    <img
      class="TopIcon"
      src="/assets/SHB/svg/AW-icon-minus.svg"
      alt="Zoom out"
    />
  </button>
  <button on:click="{zoomReset}" id="zoomReset">
    <img
      class="TopIcon"
      src="assets/SHB/svg/AW-icon-zoom-reset.svg"
      alt="Reset zoom"
    />
  </button>
  <button on:click="{zoomIn}" id="zoomIn">
    <img
      class="TopIcon"
      src="./assets/SHB/svg/AW-icon-plus.svg"
      alt="Zoom in"
    />
  </button>

</div>


<style>

  button {
    border: 0;
    background: transparent;
    cursor: pointer;
    border-radius: 0;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    display: inline-block;
    width: auto;
    transform-origin: center;
    transform: scale(1);
  }
  button:active,
  button:not(:disabled):active {
    outline: none;
    background: transparent;
    transform: scale(1.05);
  }
  button:focus {
    outline: none;
  }

  * {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .topbar {
    position: fixed;
    left: 0;
    top: 0;
    margin: 16px;
    display: flex;
    align-items: center;
  }

  .pill-button, .pill-text {
    border-radius: 9999px;
    padding: 0.5em 1em;
    background-color: #d8c7eb;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    margin-left: 6px;
  }

  .pill-button-icon.avatar {
    margin-left: 4px;
    border-radius: 50%;
  }

  .pill-button {
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
  }

  .pill-text {
    border: none;
  }

  .pill-button-text {
    color: #7300ed;
    font-size: 14px;
    line-height: 1;
  }

  .pill-container {
    border-radius: 9999px;
    padding: 0.5em 1em;
    background-color: #d8c7eb;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    margin-left: 6px;
  }

  .pill-button-icon {
    width: 20px;
    height: 20px;
    margin-right: 8px;
  }

  .pill-button-icon.avatar {
    margin-left: 4px;
    border-radius: 50%;
  }

  .pill-button-text {
    color: #7300ed;
    font-size: 14px;
    line-height: 1;
  }

  /* Adjust the existing button styles */
  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-right: 6px;
  }

  /* Remove the margin-right from the last button */
  button:last-child {
    margin-right: 0;
  }

  .topbar-second {
    /* position: fixed;
    left: 0;
    top: calc(2rem + 32px);  */
    margin: 16px;
    display: flex; /* Add this to align items horizontally */
    align-items: center; /* This will vertically center the buttons and dividers */
  }

  .TopIcon {
    width: 2rem;
    height: 2rem;
    max-width: 40px;
    max-height: 40px;
    border-radius: 50%;
    background-color: white;
  }

  #logo {
    box-shadow: 5px 5px 0px #7300ed;

    /* fix ios logo cut-off */
    margin-right: 6px;
    margin-bottom: 2px;
  }

  .back-button {
    width: 2rem;
    height: 2rem;
    margin-right: 6px;
    transition: width 0.3s ease, margin-right 0.3s ease, opacity 0.3s ease;
  }

  .back-button.hidden {
    width: 0;
    margin-right: 0;
    opacity: 0;
    pointer-events: none;
  }
  /* .debug {
  } */
</style>
