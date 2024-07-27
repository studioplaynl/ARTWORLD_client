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
  import { DEFAULT_SCENE, SCENE_INFO } from '../../constants';
  import { getFullAccount } from '../../helpers/nakamaHelpers';
  import { findParentScenes } from '../game/helpers/UrlHelpers';
  // import { dlog } from '../game/helpers/debugLog';

  let currentLocation = '';
  let userInfo;
  let parentScenes = [];

  onMount(async () => {
    PlayerLocation.subscribe(async (value) => {
      currentLocation = value;
      console.log('currentLocation', currentLocation);

      parentScenes = findParentScenes(currentLocation.scene, SCENE_INFO);
      
      /* Remove 'Artworld' from parentScenes if present
         because the Artworld button is always visible, and is the root scene
      */
      parentScenes = parentScenes.filter(scene => scene !== 'Artworld');

      if (parentScenes.length > 0) {
        console.log('currentLocation parentScenes', parentScenes);
        // simple case where we have parent scenes
        currentLocation = {scene: value.scene};
      } else {
        // no parent scenes
        console.log(`currentLocation ${currentLocation} has no parent scenes`);

        if (currentLocation.scene === DEFAULT_SCENE) {
          // no parent scenes, we are in Artworld scene
          currentLocation = {scene: value.scene};

        } else if (currentLocation.scene === 'DefaultUserHome') {
          console.log('currentLocation Player is in DefaultUserHome');
          /* no parent scenes, we are in DefaultUserHome scene
             we have to find the parent scene of the house
             by fetching the user info 
          */
            try {
              console.log('currentLocation we have to fetch the user info to find the parent scene of the house');
              userInfo = await getFullAccount(currentLocation.house);
              console.log('currentLocation userInfo', userInfo.meta.Azc);
              
              // userInfo.meta.Azc is the parent scene of the house
              // now we seach for the parent scene of userInfo.meta.Azc
              parentScenes = findParentScenes(userInfo.meta.Azc, SCENE_INFO);
              console.log('currentLocation parentScenes', parentScenes);

              currentLocation = {house: value.house};
            } catch (error) {
              console.error('Error fetching user info:', error);
              currentLocation = {house: value.house};

            }
            
        } else {
          console.log('currentLocation Player is in an unknown location without parent');
        }
      }
    });
  });

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
  <button on:click="{goHome}">
    <img
      class="TopIcon"
      id="logo"
      src="assets/SHB/svg/AW-icon-logo-A.svg"
      alt="Homepage"
    />
  </button>

  <button on:click="{goBack}">
    <img
      class="TopIcon"
      id="back"
      class:showBack="{$PlayerHistory.length > 1}"
      src="/assets/SHB/svg/AW-icon-previous.svg"
      alt="Go back"
    />
  </button>

  {#each parentScenes as scene, index}
    <button>
      <img
        class="TopIcon"
        id="logo"
        src={`assets/SHB/svg/AW-icon-logo-A.svg`}
        alt="{scene}"
      />
    </button>
    {#if index < parentScenes.length - 1}
      <span class="divider">&gt;</span>
    {/if}
  {/each}
  
  <!-- dont show artworld icon, because that is visible by default-->
  {#if currentLocation.scene !== DEFAULT_SCENE}
    {#if parentScenes.length > 0}
      <span class="divider">&gt;</span>
    {/if}
    {#if currentLocation.house}
      <button class="pill-button">
        <img
          class="pill-button-icon"
          src={`assets/SHB/svg/AW-icon-logo-A.svg`}
          alt="House"
        />
        <span class="pill-button-text">{currentLocation.scene}</span>
      </button>
    {:else}
      <div class="pill-text">
        <span class="pill-button-text">{currentLocation.scene}</span>
      </div>
    {/if}
  {/if}
</div>

<div class="topbar-second">
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

  .pill-button-icon {
    width: 20px;
    height: 20px;
    margin-right: 8px;
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

  .divider {
    margin: 0 6px;
    color: #7300ed;
    font-weight: bold;
  }

  .topbar-second {
    position: fixed;
    left: 0;
    top: calc(2rem + 32px); 
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

  #back {
    visibility: hidden;
  }

  .showBack {
    visibility: visible !important;
  }
  /* .debug {
  } */
</style>
