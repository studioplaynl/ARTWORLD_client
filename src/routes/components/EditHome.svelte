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
  import { 
    MAX_COUNT_HOME_ELEMENTS_DRAWING, 
    MAX_COUNT_HOME_ELEMENTS_STOPMOTION, 
    MAX_COUNT_HOME_ELEMENTS_ANIMAL_CHALLENGE, 
    MAX_COUNT_HOME_ELEMENTS_FLOWER_CHALLENGE 
  } from '../../constants';


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
    dispatch('deleteHomeElementPhaser', row);
  }

  function handleDuplicateHomeElement(row) {
    console.log('handleDuplicateHomeElement', row);
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
      rotation: row.value.rotation,
      scale: row.value.scale,
      width: row.value.width,
      height: row.value.height
    };
    HomeElements.create(value.key, value);
  }

  function handleArtClicked(element) {
    console.log('handleArtClicked', element);
    homeElement_Selected.set(element);
  }

  // Reactive declarations to count elements by category
  $: drawingCount = Object.keys($homeElements_Store.drawing?.byKey || {}).length;
  $: stopmotionCount = Object.keys($homeElements_Store.stopmotion?.byKey || {}).length;
  $: flowerChallengeCount = 0; // Update when implemented
  $: animalChallengeCount = 0;  // Update when implemented

  // Determine if each app should be shown, based on the counts
  $: showDrawingApp = drawingCount < MAX_COUNT_HOME_ELEMENTS_DRAWING;
  $: showStopmotionApp = stopmotionCount < MAX_COUNT_HOME_ELEMENTS_STOPMOTION;

  // flower and animal challenge apps are not available yet
  const showFlowerChallengeApp = false;
  const showAnimalChallengeApp = false;

  let foldedState = {};

  // Initialize fold state for all groups
  $: {
    if ($homeElements_Store.drawing?.byKey) {
      Object.keys($homeElements_Store.drawing.byKey).forEach(key => {
        if (!(key in foldedState)) {
          foldedState[key] = false;
        }
      });
    }
    if ($homeElements_Store.stopmotion?.byKey) {
      Object.keys($homeElements_Store.stopmotion.byKey).forEach(key => {
        if (!(key in foldedState)) {
          foldedState[key] = false;
        }
      });
    }
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
        <!-- Fixed top section -->
        <div class="fixed-top">
          <button on:click={() => toggleView('addHomeElement')}>
            <img
              src={currentView === 'addHomeElement' 
                ? "assets/SHB/svg/AW-icon-enter.svg" 
                : "assets/SHB/svg/AW-icon-plus.svg"}
              alt={currentView === 'addHomeElement' ? "close art drawer" : "open art drawer"}
              class={currentView === 'addHomeElement' ? "rotate-90" : ""}
            />
          </button>
        </div>

        <!-- Scrollable content -->
        <div class="scrollable-content">
          {#each Object.keys($homeElements_Store) as artType}
            {#if $homeElements_Store[artType]?.byKey}
              {#each Object.entries($homeElements_Store[artType].byKey) as [valueKey, group]}
                <div class="element-group">
                  <div 
                    class="unique-element" 
                    id={group[0].key === $homeElement_Selected.key ? 'selectedHomeElement' : ''}
                    on:click={() => handleArtClicked(group[0])}
                    on:keydown={(e) => e.key === 'Enter' && handleArtClicked(group[0])}
                    role="button"
                    tabindex="0"
                  >
                    <ArtworkLoader 
                      artClickable={false} 
                      row={group[0]} 
                      deleteIcon={true}
                      duplicateIcon={true}
                      previewSize={50} 
                      animateStopmotion={false}
                      on:deleteArtworkInContext={() => handleDeleteHomeElement(group[0])} 
                      on:artClicked={() => handleArtClicked(group[0])}
                      on:duplicateArtworkInContext={() => handleDuplicateHomeElement(group[0])}
                    />
                  </div>

                  {#if group.length > 1}
                    {#each group.slice(1) as duplicate}
                      <div 
                        class="duplicate-element" 
                        id={duplicate.key === $homeElement_Selected.key ? 'selectedHomeElement' : ''}
                        on:click={() => handleArtClicked(duplicate)}
                        on:keydown={(e) => e.key === 'Enter' && handleArtClicked(duplicate)}
                        role="button"
                        tabindex="0"
                      >
                        <ArtworkLoader 
                          artClickable={false} 
                          row={duplicate} 
                          deleteIcon={true}
                          duplicateIcon={true}
                          previewSize={50} 
                          animateStopmotion={false}
                          on:deleteArtworkInContext={() => handleDeleteHomeElement(duplicate)} 
                          on:artClicked={() => handleArtClicked(duplicate)}
                          on:duplicateArtworkInContext={() => handleDuplicateHomeElement(duplicate)}
                        />
                      </div>
                    {/each}
                  {/if}
                </div>
              {/each}
            {/if}
          {/each}
        </div>

        <!-- Fixed bottom section -->
        <div class="fixed-bottom">
          <button on:click={editHomeMenuToggle} class="align-right">
            <img src="./assets/SHB/svg/AW-icon-enter.svg" alt="close edit home" />
          </button>
        </div>
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
  border-radius: 8px;
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
  z-index: 5;
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
  z-index: 4;
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
  flex-direction: column;
  height: 100%;
  padding-right: 10px;
  max-height: 90vh;
  position: relative;
  padding-bottom: 10px;
}

.fixed-top {
  position: sticky;
  top: 0;
  padding: 10px;
  padding-left: 20px;
  z-index: 2;
  width: 100%;
  border-top-right-radius: 40px;
  border-top-left-radius: 40px;
  display: flex;
  justify-content: flex-start;
}

.fixed-bottom {
  position: sticky;
  bottom: 0;
  background-color: transparent;
  padding: 0;
  margin-top: 10px;
  z-index: 2;
  width: 100%;
  border-bottom-right-radius: 120px;
  border-bottom-left-radius: 60px;
  display: flex;
  justify-content: flex-end;
}

.scrollable-content {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
}

.right-column-itemsbar button {
  background-color: #fff;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  width: 50px;
  height: 50px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 5px;
}

.right-column-itemsbar .icon img,
.right-column-itemsbar button img {
  width: 30px;
  height: 30px;
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
.scrollable-content::-webkit-scrollbar {
  width: 6px;
}

.scrollable-content::-webkit-scrollbar-thumb {
  background-color: #7300ed;
  border-radius: 3px;
}

.scrollable-content::-webkit-scrollbar-track {
  background-color: #ffffff;
}

.element-group {
  margin: 10px 0;
}

.unique-element {
  padding-left: 0px;
}

.duplicate-element {
  /* Styles for duplicates */
  margin-left: 20px;
  padding-left: 0px;

}

.align-right {
  margin-left: auto;
}

.rotate-90 {
  transform: rotate(270deg);
}

.fixed-top, .fixed-bottom {
  padding: 10px;
  display: flex;
}

.fixed-top {
  justify-content: flex-start;
}

.fixed-bottom {
  justify-content: flex-end;
}
</style>



