<script>
/**
 * @file EditHome.svelte
 * @author Maarten
 *
 *  What is this file for?
 *  ======================
 *  This component is to customize the players Home
 *  When a player is in their home the  edit home icon is visible.
 *  When clicked the EditHome component the player can add artworks to their home
 *  The artworks are stored in the HomeElements storage
 *  EditHome has a left column with artwork categories, and a right column with the list of HomeElements
 *  left column: EditHome> AppGroup> AppItem> ArtlistView> PlaceHomeElement
 *  right column: EditHome> ArtworkLoader
 */
  
  import { createEventDispatcher } from 'svelte';
  import { ShowHomeEditBar, HomeEditBarExpanded } from '../../session';
  // import { clickOutside } from '../../helpers/clickOutside';
  import { fade } from 'svelte/transition';
  import AppGroup from './AppGroup.svelte';
  import { HomeElements, homeElement_Selected, homeElements_Store } from '../../storage';
  import { Profile } from '../../session';
  import ArtworkLoader from './ArtworkLoader.svelte';
  import { MAX_COUNT_HOME_ELEMENTS_DRAWING, MAX_COUNT_HOME_ELEMENTS_STOPMOTION, MAX_COUNT_HOME_ELEMENTS_ANIMAL_CHALLENGE, MAX_COUNT_HOME_ELEMENTS_FLOWER_CHALLENGE } from '../../constants';


  const dispatch = createEventDispatcher();

  let currentView;
  let user_id = $Profile.id;
  let homeStore;

  function closeEditHome() {
    ShowHomeEditBar.set(true);
    HomeEditBarExpanded.set(false);
  }

  function editHomeMenuToggle() {
    HomeEditBarExpanded.update((value) => !value);
  }

  function handleKeyDown(event) {
    // handle keydown event here
    if (event.key === 'Enter' || event.key === ' ') {
      toggleExpand();
    }
  }

  // toggle opens the itemsbar panel to reveal more functionality, the app is passed as a prop
  function toggleView(view) {
    currentView = currentView === view ? null : view;
  }

  function handleDeleteHomeElement(row) {
    HomeElements.delete(row.key);
    // delete HomeElement also in Phaser 
    // by sending this event to App.svelte
    dispatch('deleteHomeElementPhaser', row);
  }

  function handleDuplicateHomeElement(row) {
    // duplicate HomeElement
    console.log('handleDuplicateHomeElement row', row);
    const posX = row.value.posX + 10;
    const posY = row.value.posY + 10;
    const value = {
      collection: row.value.collection,
      key: row.value.key,
      displayName: row.value.displayName,
      previewUrl: row.value.previewUrl,
      url: row.value.url,
      version: row.value.version,
      posX,
      posY,
      rotation: 0,
      scale: 1,
      width: 512,
      height: 512
    };
    HomeElements.create(value.key, value);
  }

  function handleArtClicked(element) {
    homeElement_Selected.set(element);
  }

  // Reactive declarations to count elements by category
  $: drawingCount = new Set($homeElements_Store
    .filter(el => el.value.collection === 'drawing')
    .map(el => el.value.key)
  ).size;

  $: stopmotionCount = new Set($homeElements_Store
    .filter(el => el.value.collection === 'stopmotion')
    .map(el => el.value.key)
  ).size;

  $: flowerChallengeCount = new Set($homeElements_Store
    .filter(el => el.value.collection === 'flowerchallenge')
    .map(el => el.value.key)
  ).size;

  $: animalChallengeCount = new Set($homeElements_Store
    .filter(el => el.value.collection === 'animalchallenge')
    .map(el => el.value.key)
  ).size;

  // Determine if each app should be shown, based on the counts
  $: showDrawingApp = drawingCount < MAX_COUNT_HOME_ELEMENTS_DRAWING;
  $: showStopmotionApp = stopmotionCount < MAX_COUNT_HOME_ELEMENTS_STOPMOTION;
  $: showFlowerChallengeApp = flowerChallengeCount < MAX_COUNT_HOME_ELEMENTS_FLOWER_CHALLENGE;
  $: showAnimalChallengeApp = animalChallengeCount < MAX_COUNT_HOME_ELEMENTS_ANIMAL_CHALLENGE;

  $: sortedHomeElements = [...$homeElements_Store].sort((a, b) => {
    if (a.value.key < b.value.key) return -1;
    if (a.value.key > b.value.key) return 1;
    return 0;
  });


  let groupedElements = {};
  let foldedState = {};

  $: {
    // Group elements by their unique keys
    groupedElements = $homeElements_Store.reduce((acc, row) => {
      const key = row.value.key;
      if (!acc[key]) {
        acc[key] = [];
        foldedState[key] = false; // Initialize folded state for each group
      }
      acc[key].push(row);
      return acc;
    }, {});
  }

  function toggleFold(key) {
    foldedState[key] = !foldedState[key];
  }
</script>

<!-- the EditHome icon is visible, the page is closed-->
<!-- toggle menu open button -->
{#if $ShowHomeEditBar && !$HomeEditBarExpanded}
  <div id="editHomeOpenButton">
    <button on:click="{editHomeMenuToggle}" id="clear" class="icon">
      <img src="./assets/SHB/svg/AW-icon-pen.svg" alt="edit home elements" />
    </button>
  </div>
{/if}

<!-- the EditHome icon is visivle, the page is open-->
{#if $ShowHomeEditBar && $HomeEditBarExpanded}
  <!-- a div with a clickoutside event--> 
  <!-- <div
    class="edit-home-menu"
    id="currentUser"
    use:clickOutside
    on:click_outside="{closeEditHome}"
    transition:fade="{{ duration: 40 }}"
  > -->
  <div
    class="edit-home-menu"
    id="currentUser"
  > 
    <div class="menu-content">
      <!-- the right part of the EditHome: list of HomeElements -->
      <div class="right-column-itemsbar">
        <!-- close the EditHome page -->
        <button on:click={editHomeMenuToggle} >
          <img src="./assets/SHB/svg/AW-icon-pen.svg" alt="edit home elements" />
        </button>
        {#each Object.entries(groupedElements) as [key, rows]}
          {#if rows.length > 0} <!-- Ensure there is at least one element in the group -->
            <div>
              <div id={rows[0].key == $homeElement_Selected.key ? 'selectedHomeElement' : ''}>
                <!-- Render the first element with a toggle button only if there are multiple elements -->
                <!-- {#if rows.length > 1} -->
                  <!-- <button on:click={() => toggleFold(key)}> -->
                    <!-- <img src="public/assets/SHB/svg/AW-icon-enter.svg" alt="Toggle" style="transform: rotate({foldedState[key] ? 90 : 0}deg);" /> -->
                  <!-- </button> -->
                <!-- {/if} -->
                <ArtworkLoader 
                  artClickable={true} 
                  row={rows[0]} 
                  deleteIcon={true}
                  duplicateIcon={true}
                  previewSize={50} 
                  on:deleteArtworkInContext={(event) => handleDeleteHomeElement(event.detail)} 
                  on:artClicked={() => handleArtClicked(rows[0])}
                  on:duplicateArtworkInContext={(event) => handleDuplicateHomeElement(event.detail)}
                />
              </div>

              <!-- Render the rest of the elements indented, only if unfolded -->
              {#if rows.length > 1 && !foldedState[key]}
                {#each rows.slice(1) as row}
                  <div style="margin-left: 20px;" id={row.key == $homeElement_Selected.key ? 'selectedHomeElement' : ''}>
                    <ArtworkLoader 
                      artClickable={true} 
                      row={row} 
                      deleteIcon={true}
                      duplicateIcon={true}
                      previewSize={50} 
                      on:deleteArtworkInContext={(event) => handleDeleteHomeElement(event.detail)} 
                      on:artClicked={() => handleArtClicked(row)}
                      on:duplicateArtworkInContext={(event) => handleDuplicateHomeElement(event.detail)}
                    />
                  </div>
                {/each}
              {/if}
            </div>
          {/if}
        {/each}
        <!-- show/hide artwork categories -->
        <button on:click={() => toggleView('addHomeElement')}>
          <img
            src="assets/SHB/svg/AW-icon-plus.svg"
            alt="open art drawer"
          />
        </button>
      </div>

      <!-- the left part of the EditHome: artwork categories -->
      <div class="left-column-editHome">
        
        {#if currentView === 'addHomeElement'}
          <AppGroup 
          showAvatarSelector={false} 
          showHomeSelector={false} 
          showAddNew={true} 
          showVisibilityToggle={false} 
          showDeleteButton={false} 
          showSendTo={false} 
          showDeletedArtContainer={false} 
          showPlaceHomeElement={true} 
          artClickable={false}
          {showDrawingApp}
          {showStopmotionApp}
          {showFlowerChallengeApp}
          {showAnimalChallengeApp}
          />
        {/if}
        </div>
    </div>
  </div>
{/if}
<style>
#clear {
  margin: 0;
  padding: 0;
}

img {
  width: 50px;
  height: 50px;
}

#selectedHomeElement {
  border: 2px solid #7300ed;
  border-radius: 15px;
  padding: 5px;
  margin: 5px;
}

.icon {
  background-color: #fff;
  border: none;
  cursor: pointer;
  width: 100%;
  height: auto;
}

#editHomeOpenButton {
  position: fixed;
  width: 50px;
  height: 50px;
  bottom: 20px;
  right: 20px;
  background-color: #fff;
  border-radius: 50%;
  box-shadow: 5px 5px 0px #7300ed;
  z-index: 1000;
  cursor: pointer;
  padding: 10px;
}

.edit-home-menu {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #fff;
  border-radius: 40px;
  box-shadow: 5px 5px 0px #7300ed;
  z-index: 999;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.menu-content {
  display: flex;
  flex-direction: row-reverse;
  height: 100%;
  overflow: hidden;
}

.right-column-itemsbar {
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  overflow-y: auto;
  padding-right: 10px;
  max-height: 90vh;
}

.right-column-itemsbar,
.right-column-itemsbar button {
  background-color: #fff;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  margin: 5px 0;
  padding: 10px;
}

.right-column-itemsbar .icon img,
.right-column-itemsbar button img {
  width: 50px;
  height: 50px;
}

.left-column-editHome {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 20px;
  overflow-y: auto;
  max-height: 90vh;
}

/* Scrollbar styles */
.right-column-itemsbar::-webkit-scrollbar,
.left-column-editHome::-webkit-scrollbar {
  width: 6px;
}

.right-column-itemsbar::-webkit-scrollbar-thumb,
.left-column-editHome::-webkit-scrollbar-thumb {
  background-color: #7300ed;
  border-radius: 3px;
}

.right-column-itemsbar::-webkit-scrollbar-track,
.left-column-editHome::-webkit-scrollbar-track {
  background-color: #f1f1f1;
}

.gallery-drawing-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.gallery-drawing-icon img {
  width: 50px;
  height: 50px;
}
</style>



