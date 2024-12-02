<script>
  import { fade } from 'svelte/transition';
  import { pop, push } from 'svelte-spa-router';
  import { onMount, onDestroy } from 'svelte';
  import {
    PlayerHistory,
    PlayerZoom,
    PlayerLocation,
    PlayerPos,
    PlayerUpdate,
  } from '../game/playerState';
  import { miniMapDimensions, miniMapPosition, Addressbook } from '../../storage';
  import { DEFAULT_SCENE, SCENE_INFO, MINIMAP_MARGIN } from '../../constants';
  import { getAvatar, getAccount, getObject, convertImage, addFriend } from '../../helpers/nakamaHelpers';
  import { findParentScenes } from '../game/helpers/UrlHelpers';
  import { homeIsOfSelf } from '../../session';
  import ArtworkLoader from './ArtworkLoader.svelte';
  import ManageSession from '../game/ManageSession';
  import { getDeviceType } from '../../helpers/deviceDetection';
  // import { dlog } from '../game/helpers/debugLog';

  let currentLocation = '';
  let userInfo = null;
  let homeImageUrl = '';
  let avatarUrl = '';
  let parentScenes = [];
  let miniMap = {x: MINIMAP_MARGIN, y: MINIMAP_MARGIN};
  let addressbookEntries = [];
  let showAddressbook = false;
  let addressbookContainer;

  function handleClickOutside(event) {
    if (addressbookContainer && !addressbookContainer.contains(event.target) && showAddressbook) {
      showAddressbook = false;
    }
  }

  const updatePillPosition = () => {
    const allPills = document.querySelectorAll('.pill-button, .pill-text, .pill-container');
    const topbar = document.querySelector('.topbar');
    
    console.log('Total pills found:', allPills.length);
    
    allPills.forEach((pill, index) => {
      console.log(`Pill ${index + 1}:`, {
        class: pill.className,
        offsetLeft: pill.offsetLeft,
        offsetWidth: pill.offsetWidth,
        percentagePosition: (pill.offsetLeft / topbar.offsetWidth * 100).toFixed(2) + '%',
        rightEdge: ((pill.offsetLeft + pill.offsetWidth) / topbar.offsetWidth * 100).toFixed(2) + '%'
      });
    });

    const lastPill = allPills[allPills.length - 1];
    if (lastPill) {
      const position = lastPill.offsetLeft / topbar.offsetWidth * 100;
      console.log('Setting last pill position:', position + '%');
      topbar.style.setProperty('--last-pill-position', `${position}%`);
    }
  };

  onMount(async () => {
    PlayerLocation.subscribe(async (value) => {
      currentLocation = value;
      // console.log('currentLocation', currentLocation);

      parentScenes = findParentScenes(currentLocation.scene, SCENE_INFO);
      
      /* Remove 'Artworld' from parentScenes if present
         because the Artworld button is always visible, and is the root scene
      */
      parentScenes = parentScenes.filter(scene => scene !== 'Artworld');
      // console.log('filter out artworld parentScenes', parentScenes);
      
      if (parentScenes.length > 0) {
        // console.log('currentLocation parentScenes', parentScenes);
        // simple case where we have parent scenes
        currentLocation = {scene: value.scene};
      } else {
        /* no parent scenes, case can be:
        1. Artworld
        2. DefaultUserHome
        */
        // console.log(`currentLocation ${currentLocation} has no parent scenes`);

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
              // console.log('currentLocation we have to fetch the user info to find the parent scene of the house');
              userInfo = await getAccount(currentLocation.house);
              // console.log('info userInfo', userInfo);
              
              // Handle both Azc and azc cases, including when meta might be undefined
              let userAzc = 'GreenSquare';  // Default value
              if (userInfo && userInfo.meta) {
                if (userInfo.meta.Azc) {
                  userAzc = userInfo.meta.Azc;
                } else if (userInfo.meta.azc) {
                  userAzc = userInfo.meta.azc;
                }
              }
              
              parentScenes.push(userAzc);
              
              const tempParentScenes = findParentScenes(userAzc, SCENE_INFO);
              const tempParentScenes2 = tempParentScenes.filter(scene => scene !== 'Artworld');
              parentScenes.push(...tempParentScenes2);

              currentLocation = {scene: 'DefaultUserHome', house: value.house};
              if (userInfo && userInfo.url) {
                avatarUrl = userInfo.url;
              }

              const userHouseObject = await getObject(
                'home',
                userAzc,
                userInfo.id);
              homeImageUrl = await convertImage(userHouseObject.value.url, '50', '50');
            } catch (error) {
              console.error('Error fetching user info:', error);
              currentLocation = {house: value.house};

            }
            
        } else {
          console.log('currentLocation Player is in an unknown location without parent');
        }
      }

      // Add scene to addressbook if applicable
      // addToAddressbook();
    });

    miniMapDimensions.subscribe((value) => {
      miniMap = value;
      setTimeout(updatePillPosition, 0);
    });

    //! turned off addressbook
    // Addressbook.subscribe(entries => {
    //   console.log('Addressbook entries updated:', entries);
    //   addressbookEntries = entries;
    // });
    
    //! Initial load of addressbook
    // const initialEntries = await Addressbook.get();
    // console.log('Initial addressbook load:', initialEntries);

    //! Add click listener for closing addressbook
    // document.addEventListener('click', handleClickOutside);

    // Initial measurements
    setTimeout(updatePillPosition, 0);
    setTimeout(updatePillPosition, 100);
    setTimeout(updatePillPosition, 500);

    // Update on resize
    window.addEventListener('resize', updatePillPosition);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updatePillPosition);
    };
  });

  // Add more reactive triggers
  $: if (parentScenes) {
    setTimeout(updatePillPosition, 0);
  }

  $: if (currentLocation) {
    setTimeout(updatePillPosition, 0);
  }

  //! addressbook
  // onDestroy(() => {
  //   // Clean up click listener
  //   document.removeEventListener('click', handleClickOutside);
  // });

  $: showZoomButtons = getDeviceType() === 'desktop';

  $: zoomButtonsStyle = ($miniMapPosition && $miniMapDimensions) ? `
    position: absolute;
    right: ${MINIMAP_MARGIN}px;
    top: ${MINIMAP_MARGIN + $miniMapDimensions.y + 10}px;
    display: ${showZoomButtons ? 'flex' : 'none'};
    flex-direction: row;
    justify-content: center;
    gap: 5px;
    z-index: 1000;
    width: ${$miniMapDimensions.x}px;
  ` : '';

  /** We send the player to the middle of artworld so there is a fixed orientation point
  //  We set the Position after the Location
  //  when we set the position we force the urlparser to do a replace on the history and url,
  //  with PlayerUpdate.set({ forceHistoryReplace: false });
  */
  async function goHome() {
    // this seems to fix an issue on android tablet where the loading would get stuck
    setTimeout(() => {
            PlayerLocation.set({
              scene: DEFAULT_SCENE,
            });
            
            PlayerUpdate.set({ forceHistoryReplace: true });
            PlayerPos.set({
              x: 0,
              y: 0,
            });
        }, 400);  
  }

  /**  pop() sets off a reaction where the url is parsed, and the player is taken back
   *   PlayerHistory.pop() is to reflect the state there
  */
  async function goBack() {
    if ($PlayerHistory.length > 1) {
      const previousState = $PlayerHistory[$PlayerHistory.length - 2];
      console.log('previousState', previousState);
      
      // If returning to Artworld, ensure scene loads first
      // if (previousState.scene === DEFAULT_SCENE) {
        // First set location without position
        
        // this seems to fix an issue on android tablet where the loading would get stuck
         setTimeout(() => {
            PlayerHistory.pop();
            pop();
        }, 100);
        
      // }
      
    }
  }

  async function goToScene(scene) {
    if (currentLocation.scene === 'DefaultUserHome') {
      // Get the house object to find its position
      try {
        const userHouseObject = await getObject(
          'home',
          scene,
          currentLocation.house
        );

        PlayerLocation.set({ scene });

        // Place player next to the house if position exists
        if (typeof userHouseObject.value.posX !== 'undefined' && 
            typeof userHouseObject.value.posY !== 'undefined') {
          const playerPosX = userHouseObject.value.posX - 80;
          const playerPosY = userHouseObject.value.posY - 100;

          PlayerUpdate.set({ forceHistoryReplace: false });
          PlayerPos.set({
            x: playerPosX,
            y: playerPosY,
          });
        }
      } catch (error) {
        console.error('Error fetching house position:', error);
        // Fallback to just scene navigation
        PlayerLocation.set({ scene });
      }
    } else {
      // Simple scene navigation
      PlayerLocation.set({ scene });
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

  function findSceneDisplayName(sceneName) {
    // First check root level
    if (SCENE_INFO.find(s => s.scene === sceneName)?.displayName) {
      return SCENE_INFO.find(s => s.scene === sceneName).displayName;
    }
    
    // Then check children
    const artworld = SCENE_INFO.find(s => s.scene === 'Artworld');
    if (artworld?.children) {
      const child = artworld.children.find(c => c.scene === sceneName);
      return child?.displayName;
    }
    
    return null;
  }

  function findScenePortalImage(sceneName) {
    // First check root level
    if (SCENE_INFO.find(s => s.scene === sceneName)?.locationImage) {
      return SCENE_INFO.find(s => s.scene === sceneName).locationImage;
    }
    
    // Then check children
    const artworld = SCENE_INFO.find(s => s.scene === 'Artworld');
    if (artworld?.children) {
      const child = artworld.children.find(c => c.scene === sceneName);
      return child?.locationImage;
    }
    
    return null;
  }

  //! async function addToAddressbook() {
  //   console.log('Attempting to add scene to addressbook:', currentLocation.scene);
    
  //   if (currentLocation.scene !== 'DefaultUserHome' && 
  //       currentLocation.scene !== DEFAULT_SCENE && 
  //       currentLocation.scene !== 'undefined') {
  //     const sceneInfo = {
  //       scene: currentLocation.scene,
  //       displayName: findSceneDisplayName(currentLocation.scene),
  //       portalImage: findScenePortalImage(currentLocation.scene)
  //     };
      
  //     console.log('Adding scene info to addressbook:', sceneInfo);
  //     // Use the scene name as the key
  //     Addressbook.create(currentLocation.scene, sceneInfo);
  //   }
  // }

  // // Filter out undefined entries when displaying
  // $: filteredAddressbookEntries = addressbookEntries.filter(entry => 
  //   entry?.value?.scene && 
  //   entry.value.scene !== 'undefined' && 
  //   (entry.value.displayName || entry.value.scene !== 'undefined')
  // );

  // function toggleAddressbook() {
  //   showAddressbook = !showAddressbook;
  //   console.log('Toggling addressbook dropdown:', showAddressbook);
  // }
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
      {#if scene}
        <button class="pill-button" on:click={() => goToScene(scene)}>
          {#if findScenePortalImage(scene)}
            <div class="avatar-wrapper">
              <div class="avatar-container">
                <img
                  class="pill-button-icon"
                  src={findScenePortalImage(scene)}
                  alt="Scene Portal"
                />
              </div>
            </div>
          {/if}
          <span class="pill-button-text">
            {findSceneDisplayName(scene) || scene}
          </span>
        </button>
      {/if}
    {/each}
{/if}
  <!-- dont show artworld icon, because that is visible by default-->
  {#if currentLocation.scene !== DEFAULT_SCENE}
    {#if currentLocation.scene === 'DefaultUserHome'}
      <div class="pill-container">
        {#if homeImageUrl}
        <div class="avatar-wrapper">
          <div class="avatar-container">
            <img
              class="pill-button-icon"
              src={homeImageUrl}
              alt="House"
            />
          </div>
        </div>
        {/if}
        {#if avatarUrl}
        <div class="avatar-wrapper">
          <div class="avatar-container">
            <ArtworkLoader
              row={{ img: avatarUrl }}
              artClickable={false}
              previewSize={24}
            />
          </div>
        </div>
      {/if}
        {#if userInfo}
          <span class="pill-button-text">
            {userInfo.display_name || userInfo.username}
          </span>
        {/if}
      </div>
    {:else}
      <div class="pill-text">
        {#if findScenePortalImage(currentLocation.scene)}
          <div class="avatar-wrapper">
            <div class="avatar-container">
              <img
                class="pill-button-icon"
                src={findScenePortalImage(currentLocation.scene)}
                alt="Scene Portal"
              />
            </div>
          </div>
        {/if}
        <span class="pill-button-text">
          {findSceneDisplayName(currentLocation.scene) || currentLocation.scene}
        </span>
      </div>
    {/if}
  {/if}
  <!-- Move the addressbook container here -->
  <!-- <div class="addressbook-container">
    <button on:click={toggleAddressbook}>
      <img
        alt="Addressbook"
        class="icon"
        src="assets/SHB/svg/AW-icon-addressbook-vert-2.svg"
      />
    </button>
    
    {#if showAddressbook}
      <div class="addressbook-dropdown" transition:fade>
        {#if filteredAddressbookEntries.length === 0}
          <div class="empty-state">
            <p>No saved locations yet</p>
          </div>
        {:else}
          {#each filteredAddressbookEntries as entry}
            <button class="pill-button" on:click={() => {
              PlayerLocation.set({ scene: entry.value.scene });
              showAddressbook = false;  // Close dropdown after selection
            }}>
              {#if entry.value.portalImage}
                <div class="avatar-wrapper">
                  <div class="avatar-container">
                    <img
                      class="pill-button-icon"
                      src={entry.value.portalImage}
                      alt="Scene Portal"
                    />
                  </div>
                </div>
              {/if}
              <span class="pill-button-text">
                {entry.value.displayName || entry.value.scene}
              </span>
            </button>
          {/each}
        {/if}
      </div>
    {/if}
  </div> -->
</div>

<div class="topbar-second" style="{zoomButtonsStyle}">
  <button on:click="{zoomOut}" id="zoomOut">
    <img
      class="TopIcon2"
      src="/assets/SHB/svg/AW-icon-minus.svg"
      alt="Zoom out"
    />
  </button>
  <button on:click="{zoomReset}" id="zoomReset">
    <img
      class="TopIcon2"
      src="assets/SHB/svg/AW-icon-zoom-reset.svg"
      alt="Reset zoom"
    />
  </button>
  <button on:click="{zoomIn}" id="zoomIn">
    <img
      class="TopIcon2"
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
    border-radius: 50%;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    padding: 0;
    position: relative;
    z-index: 2;
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
    max-width: calc(100vw - 32px);
    flex-wrap: nowrap;  
    gap: 6px;
    position: relative;
    min-height: 40px;
  }

  .topbar::-webkit-scrollbar {
    display: none;
  }

  .pill-button, .pill-text, .pill-container {
    border-radius: 9999px;
    padding: 0.5em 1em;
    background-color: white;
    border: 2px solid #7300ed;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    line-height: 40px;
    margin: 0;
  }

  .avatar-wrapper {
    width: 28px;
    height: 28px;
    margin-right: 8px;
    flex-shrink: 0;
  }

  .avatar-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pill-button {
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
  }

  .pill-text {
    border-radius: 9999px;
    padding: 0.5em 1em;
    background-color: white;
    border: 2px solid #7300ed;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    margin-left: 0;
  }

  .pill-button-text {
    color: #7300ed;
    font-size: clamp(11px, 1.5vw, 14px);
    line-height: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .pill-button-icon {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: cover;
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

  button:last-child {
    margin-right: 0;
  }

  .topbar-second {
    display: flex;
    flex-direction: row;
    gap: 5px;
    align-items: center;
  }

  /* Update button styles to work better in vertical layout */
  .topbar-second button {
    margin: 0;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .topbar-second .TopIcon2{
    width: 2rem;
    height: 2rem;
    max-width: 32px; /* Slightly smaller for vertical layout */
    max-height: 32px;
  }

  .TopIcon {
    width: 100%;
    height: 100%;
    max-width: 40px;
    max-height: 40px;
    border-radius: 50%;
  }

  #logo {
    box-shadow: 5px 5px 0px #7300ed;
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

  .addressbook-container {
    position: relative;
  }
  
  .addressbook-dropdown {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    border-radius: 8px;
    padding: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 200px;
    max-width: 300px;
    z-index: 1000;
  }
  
  .addressbook-dropdown .pill-button {
    width: 100%;
    justify-content: flex-start;
  }

  .empty-state {
    padding: 16px;
    text-align: center;
    color: #666;
  }

  .debug-info {
    font-size: 10px;
    color: #666;
    white-space: pre-wrap;
    word-break: break-all;
  }

  /* Add media query for small screens or when near screen edge */
  @media (max-width: 768px) {
    .addressbook-dropdown {
      left: auto;
      right: 0;
      transform: none;
    }
  }

  /* Adjust the connecting line */
  .topbar:has(.pill-button, .pill-text, .pill-container)::before {
    content: '';
    position: absolute;
    left: 46px;
    right: calc(100% - var(--last-pill-position, 80%));
    top: 20px;
    height: 3px;
    background-color: #7300ed;
    z-index: 1;
  }

  /* Ensure buttons and pills are above the line, including their active states */
  .topbar > button,
  .pill-button,
  .pill-text,
  .pill-container,
  .topbar > button:active,
  .pill-button:active {
    position: relative;
    z-index: 2;
    background-color: white; /* Ensure background is opaque */
  }

  button:active,
  button:not(:disabled):active,
  .pill-button:active {
    position: relative;
    z-index: 2;
    outline: none;
    background: white; /* Ensure background stays white */
    transform: scale(1.05);
  }

  /* Add this to help visualize where pills end */
  .pill-button:last-of-type {
    position: relative;
  }

  /* Debug outline to see where the topbar is */
  /* .topbar > * {
    outline: 1px solid blue;
  } */

  button:has(#logo) {
    background: transparent;
    box-shadow: none;
  }
</style>