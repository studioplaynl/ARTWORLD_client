<script>
/**
 * @file artworkListViewer.svelte
 * @author Maarten
 *
 *  What is this file for?
 *  ======================
 *  artworkListViewer.svelte shows exisitign artworks in a certain category
 *  artworks are associated with apps, users can make a new artwork in that category
 *
 *  the player can adjust visibility of the artwork, trash the artwork, or send the artwork
 *  artworks can be send to friends or other artwork categories
 */

  // import { onMount } from 'svelte';
  // import SvelteTable from 'svelte-table';

  import { onDestroy } from 'svelte';
  import { createArtworksStore } from '../../storage';
  import { Profile } from '../../session';
  // eslint-disable-next-line no-unused-vars
  import { dlog } from '../../helpers/debugLog';
  import StatusComp from './statusbox.svelte';
  import DeleteComp from './deleteButton.svelte';
import SendTo from './sendTo.svelte';
  import {
    // STOPMOTION_MAX_FRAMES,
    // DEFAULT_PREVIEW_HEIGHT,
    OBJECT_STATE_IN_TRASH,
    OBJECT_STATE_REGULAR,
    OBJECT_STATE_UNDEFINED,
  } from '../../constants';
  import ArtworkLoader from './artworkLoader.svelte';
  // import postSend from './postSend.svelte';


  export let dataType = '';

  const deleteCheck = null;
  let useraccount;
  let filteredArt = [];
  let deletedArt = [];
  let id = null;
  let CurrentUser;
  export let params = {};
  export let userID = null;
  let store;
  let unsubscribe;
  // eslint-disable-next-line svelte/valid-compile
  export let col = null; // add this line

function toggleSendTo(e) {
  if (e.detail) {
    const { rowIndex, toggleMode } = e.detail;
    if (filteredArt[rowIndex].SendToIsOpen) {
      filteredArt[rowIndex].SendToIsOpen = !toggleMode;
    } else {
      filteredArt[rowIndex].SendToIsOpen;
      filteredArt[rowIndex].SendToIsOpen = !toggleMode;
    }
    filteredArt = [...filteredArt];
  }
}

 $: if (store.length) {
   filteredArt = store.filter(
     (el) => el.value.status === OBJECT_STATE_REGULAR ||
            el.value.status === OBJECT_STATE_UNDEFINED,
   );
   filteredArt = [...filteredArt];
 }

$: if (store.length) {
  deletedArt = store.filter(
    (el) => el.value.status === OBJECT_STATE_IN_TRASH,
  );
}
  function isCurrentUser() {
    return CurrentUser;
  }

  async function loadArtworks() {
    store = createArtworksStore(dataType);
    await store.loadArtworks(id, 100);
    // subscribe to the store after loading the artworks
    unsubscribe = store.subscribe((value) => {
      filteredArt = value.filter(
        (el) => el.value.status === OBJECT_STATE_REGULAR ||
        el.value.status === OBJECT_STATE_UNDEFINED,
      );
      filteredArt = [...filteredArt];


      deletedArt = value.filter(
        (el) => el.value.status === OBJECT_STATE_IN_TRASH,
      );
    });
  }

  onDestroy(() => {
    if (unsubscribe) unsubscribe();
  });

  async function getUser() {
    // we get the user NAME AVATAR and HOME
    // if display_name = '' or null then the user can set the NAME
    CurrentUser = true;
    id = $Profile.id;
    useraccount = $Profile;

    await loadArtworks();
  }

  getUser();

</script>

<div class="art-app-container">

 {#each filteredArt as row, index (row.key)}

  <div class="flex-row">
      <div class="padding">
        <ArtworkLoader
            class="cell"
            clickable="{true}"
            row="{row}"
          />
      </div>
    <div class="cell action-buttons" id={`row-${index}`}>
      <div class="buttons {row.SendToIsOpen ? 'hidden' : ''}">
        <StatusComp
          store="{store}"
          isCurrentUser="{isCurrentUser}"
          row="{row}"
          rowIndex="{index}"
        />

        <DeleteComp
          store="{store}"
          isCurrentUser="{isCurrentUser}"
          row="{row}"
          rowIndex="{index}"
        />
      </div>

      <SendTo
        class="{row.SendToIsOpen ? 'send-to-open' : ''}"
        store="{store}"
        isCurrentUser="{isCurrentUser}"
        rowIndex="{index}"
        on:toggleComponents="{toggleSendTo}"
        row="{row}"
      />

    </div>
  </div>
  {/each}

  {#each deletedArt as row, index (row.key)}
  <div class="flex-row">
    <img
      class="icon"
      src="assets/SHB/svg/AW-icon-trashcan.svg"
      alt="Trash can"
    />
        <div class="padding">

          <ArtworkLoader
          class="cell "
          clickable="{false}"
          row="{row}"
          />

        </div>
  <div class="cell action-buttons" id={`row-${index}`}>

    <StatusComp
      store="{store}"
      isCurrentUser="{isCurrentUser}"
      row="{row}"
      rowIndex="{index}"
    />

    <DeleteComp
      store="{store}"
      isCurrentUser="{isCurrentUser}"
      row="{row}"
      rowIndex="{index}"
    />

  </div>
      </div>
    <!-- </div> -->
  {/each}

</div>   <!-- end class="art-app-container" -->

<style>
.art-app-container{
  margin: 2rem 0 1rem 0;
}

.hidden {
  display: none;
  width: 0;
}

.flex-row{
  display: flex;
  justify-content: space-evenly;
  border-bottom: dotted 2px #7300eb;
}

.cell {
  flex: 1;
  min-width: 0;
}

.rounded{
  border: 1px solid;
  border-radius: 8px;
}

.padding{
  padding: 4px;
}

.action-buttons {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.buttons {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.hidden {
  display: none;
}

.send-to-open {
  flex-grow: 3;
}
</style>
