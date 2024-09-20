<script>
  // import { fly } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';

  import { ShowHomeEditBar, HomeEditBarExpanded } from '../../session';
  // import { clickOutside } from '../../helpers/clickOutside';
  import { fade } from 'svelte/transition';
  import AppGroup from './AppGroup.svelte';
  import { HomeElements, homeElement_Selected, homeElements_Store } from '../../storage';
  import { Profile } from '../../session';
  import ArtworkLoader from './ArtworkLoader.svelte';
  
  const dispatch = createEventDispatcher(); // sends a custom event to the parent component (EditHome.svelte) delete event

  let currentView;
  let user_id = $Profile.id;
  // let homeElementsArray;
  let homeStore;

  // $: console.log('homeElement_Selected', $homeElement_Selected);
  $: console.log('homeElements_Store', $homeElements_Store);

  function closeEditHome() {
    ShowHomeEditBar.set(true);
    HomeEditBarExpanded.set(false);
  }

  function editHomeMenuToggle() {
    console.log('toggleExpand');
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

  function handleDelete(row) {
    // Implement your delete logic here
    console.log('Deleting:', row);
    HomeElements.delete(row.key);
    dispatch('delete', row);
    // For example:
    // homeElements_Store.update(elements => elements.filter(el => el.key !== row.key));
    // You might also want to call a function to delete the item from the server
  }

  function handleArtClicked(element) {
    console.log('handleArtClicked', element);
    homeElement_Selected.set(element);
  }
</script>

<!-- the EditHome icon is visivle, the page is closed-->
<!-- toggle menu open button -->
{#if $ShowHomeEditBar && !$HomeEditBarExpanded}
  <div id="itemsButton">
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
      <!-- the right part of the EditHome, icons and buttons -->
      <div class="right-column-itemsbar">
        <!-- close the EditHome page -->
        <button on:click={editHomeMenuToggle} >
          <img src="./assets/SHB/svg/AW-icon-pen.svg" alt="edit home elements" />
        </button>
        {#each $homeElements_Store as row, index (row.key)}
          <div id={row.key == $homeElement_Selected.key ? 'selectedHomeElement' : ''}>
            {#if row.key.startsWith('gallery_drawing') || row.value.collection === 'gallery_drawing'}
              <button class="gallery-drawing-icon" on:click={() => handleArtClicked(row)}>
                <img src="./assets/SHB/svg/AW-icon-addressbook.svg" alt="Gallery Drawing" />
              </button>
            {:else}
              <ArtworkLoader 
                artClickable={true} 
                row={row} 
                deleteIcon={true} 
                previewSize={50} 
                on:delete={(event) => handleDelete(event.detail)} 
                on:artClicked={() => handleArtClicked(row)}
              />
            {/if}
          </div>
        {/each}
        <button on:click={() => toggleView('addHomeElement')}>
          <img
            src="assets/SHB/svg/AW-icon-plus.svg"
            alt="Toggle liked"
          />
        </button>
      </div>

      <!-- the left part of the EditHome, content area -->
      <div class="left-column-itemsbar">
        {#if currentView === 'liked'}
          <div>
            <!-- <LikedPage /> -->
          </div>
        {:else if currentView === 'addHomeElement'}
          <AppGroup 
          showAvatarSelector={false} 
          showHomeSelector={false} 
          showAddNew={true} 
          showVisibilityToggle={false} 
          showDeleteButton={false} 
          showSendTo={false} 
          showDeletedArtContainer={false} 
          showPlaceHomeElement={true} 
          artClickable={false}/>
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

#itemsButton {
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

.left-column-itemsbar {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 20px;
  overflow-y: auto;
  max-height: 90vh;
}

/* Scrollbar styles */
.right-column-itemsbar::-webkit-scrollbar,
.left-column-itemsbar::-webkit-scrollbar {
  width: 6px;
}

.right-column-itemsbar::-webkit-scrollbar-thumb,
.left-column-itemsbar::-webkit-scrollbar-thumb {
  background-color: #7300ed;
  border-radius: 3px;
}

.right-column-itemsbar::-webkit-scrollbar-track,
.left-column-itemsbar::-webkit-scrollbar-track {
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