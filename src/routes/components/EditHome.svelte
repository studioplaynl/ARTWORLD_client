<script>
  // import { fly } from 'svelte/transition';
  import { get } from 'svelte/store';
  import { onMount, onDestroy } from 'svelte';
  import { ShowHomeEditBar, HomeEditBarExpanded } from '../../session';
  import { clickOutside } from '../../helpers/clickOutside';
  import { fade } from 'svelte/transition';
  import AppGroup from './AppGroup.svelte';
  import { HomeElements, homeElement_Selected } from '../../storage';
  import { Profile } from '../../session';
  import ArtworkLoader from './ArtworkLoader.svelte';
  
  let currentView;
  let user_id = get(Profile).id;
  let homeElementsArray;
  let homeStore;
  
  const unsubscribe = HomeElements.subscribe(async (value) => {
    // console.log('HomeElements 2', value);
    homeElementsArray = value;
  });
  
  onMount(() => {
    getHomeElements(); //update the store with the right user_id
  });


  onDestroy(() => {
    unsubscribe();
  });

  async function getHomeElements() {
    HomeElements.getFromServer(user_id).then( (value) => {
      homeElementsArray = value;
    });
  }

 $: console.log('homeElement_Selected', $homeElement_Selected);


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
<!-- a div with a clickoutside event-->
{#if $ShowHomeEditBar && $HomeEditBarExpanded}
  <div
    class="edit-home-menu"
    id="currentUser"
    use:clickOutside
    on:click_outside="{closeEditHome}"
    transition:fade="{{ duration: 40 }}"
  >
    <div class="menu-content">
      <!-- the right part of the EditHome, icons and buttons -->
      <div class="right-column-itemsbar">
        <!-- close the EditHome page -->
        <button on:click={editHomeMenuToggle} >
          <img src="./assets/SHB/svg/AW-icon-pen.svg" alt="edit home elements" />
        </button>
        {#each homeElementsArray as row, index (row.key)}
        <div id={row.key == $homeElement_Selected.key ? 'selectedHomeElement' : ''}>
          <ArtworkLoader artClickable={false} row={row} />
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
          showAddNew={false} 
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
    padding:0;
    
  }
/* Position the itemsButton in the bottom right corner */
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
  background-color: #fff;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  padding: 10px;
}

/* Styles for the expanded edit-home-menu */
.edit-home-menu {
  position: fixed;
  bottom: 20px; /* Adjust if needed to ensure it's above the fixed button */
  right: 20px;
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 40px;
  box-shadow: 5px 5px 0px #7300ed;
  z-index: 999;
}

/* Container for the right and left columns */
.menu-content {
  display: flex;
  flex-direction: row-reverse; /* Right column on the right */
}

/* Styles for the right-column-itemsbar */
.right-column-itemsbar {
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
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

/* Styles for the left-column-itemsbar */
.left-column-itemsbar {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 20px; /* Space between the right and left columns */
}
</style>