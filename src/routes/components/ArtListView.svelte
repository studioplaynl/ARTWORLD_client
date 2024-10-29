<script>
/**
 * @file artworkListViewer.svelte
 * @author Maarten
 *
 *  What is this file for?
 *  ======================
 *  artworkListViewer.svelte shows exisiting artworks in a certain category
 *  artworks are associated with apps, users can make a new artwork in that category
 *
 *  the player can adjust visibility of the artwork, trash the artwork, or send the artwork
 *  artworks can be send to friends or other artwork categories
 * 
 * This list view is also used in the EditHome component to show the artworks in the player's home
 * EditHome functions pertain to HomeElements, and is toggles by the showPlaceHomeElement boolean
 * delete and duplicate functionality are handled in ArtListView
 */

import { onDestroy } from 'svelte';
import { push } from 'svelte-spa-router';
import { useFilteredArtworksStore } from '../../storage';
import { dlog } from '../../helpers/debugLog';
import VisibilityToggle from './VisibilityToggle.svelte';
import DeleteButton from './DeleteButton.svelte';
import SendTo from './SendTo.svelte';
import {
  OBJECT_STATE_IN_TRASH,
  OBJECT_STATE_REGULAR,
  OBJECT_STATE_UNDEFINED,
} from '../../constants';
import ArtworkLoader from './ArtworkLoader.svelte';
import PlaceHomeElement from './PlaceHomeElement.svelte';
import { PlayerHistory } from '../game/playerState';

export let dataType = '';
export let showVisibilityToggle = false;
export let showDeleteButton = false;
export let showSendTo = false;
export let showDeletedArtContainer = false;
export let showPlaceHomeElement = false;
export let artClickable = true;

let useraccount;
let id = null;
let CurrentUser;

$: console.log('UIScene debug ARTLISTVIEW filteredArt: ', $store);

const { 
    store, 
    filteredArt, 
    deletedArt,
    visibleArt
} = useFilteredArtworksStore(dataType);

/* Make a new artwork */
function addNew() {
  // open the relevant app
  const value = `/${dataType}`;
  push(value);
  PlayerHistory.push(value);
}

function toggleSendTo(e) {
  if (e.detail) {
    const { rowIndex, toggleMode } = e.detail;
    store.update(currentStore => {
      return currentStore.map((art, index) => {
        if (index === rowIndex) {
          return { ...art, SendToIsOpen: !toggleMode };
        }
        return art;
      });
    });
  }
}

function isCurrentUser() {
  return CurrentUser;
}

async function getUser() {
  CurrentUser = true;
  await store.loadArtworks();
}

getUser();
</script>

<div class="art-app-container">
  {#if showPlaceHomeElement}
    <button on:click={() => addNew( )} class="add-new-button">
      <img class="icon_medium" src="/assets/SHB/svg/AW-icon-plus.svg" alt="add new" />
    </button>
  {/if}
  {#each $filteredArt as row, index (row.key)}
    <div class="artworkListViewer-flex-row" style="flex-direction: {showPlaceHomeElement ? 'row-reverse' : 'row'};">
      <div class="padding">
        <div class="cell">
          <ArtworkLoader
            artClickable={artClickable}
            row={row}
          />
        </div>
      </div>
      <div class="cell action-buttons" id={`row-${index}`}>
        <div class="buttons {row.SendToIsOpen ? 'hidden' : ''}">
          {#if showVisibilityToggle}
            <VisibilityToggle
              {store}
              isCurrentUser={isCurrentUser}
              {row}
              rowIndex={index}
            />
          {/if}
          {#if showDeleteButton}
            <DeleteButton
              {store}
              isCurrentUser={isCurrentUser}
              {row}
              rowIndex={index}
            />
          {/if}
        </div>
        {#if showSendTo}
          <div class={row && row.SendToIsOpen ? 'send-to-open' : ''}>
            <SendTo
              {store}
              isCurrentUser={isCurrentUser}
              rowIndex={index}
              on:toggleComponents={toggleSendTo}
              {row}
            />
          </div>
        {/if}
      </div>
      {#if showPlaceHomeElement}
        <PlaceHomeElement
          {store}
          isCurrentUser={isCurrentUser}
          {row}
          rowIndex={index}
        />
      {/if}
    </div>
  {/each}

  {#if showDeletedArtContainer && $deletedArt.length}
    <div class="deleted-art-container">
      <img
        class="trash-icon"
        src="assets/SHB/svg/AW-icon-trashcan.svg"
        alt="Trash can"
      />
      {#each $deletedArt as row, index (row.key)}
        <div class="artworkListViewer-trash-flex-row">
          <ArtworkLoader
            clickable={false}
            {row}
          />
          <div class="cell trash-action-buttons" id={`row-${index}`}>
            <VisibilityToggle
              {store}
              isCurrentUser={isCurrentUser}
              {row}
              rowIndex={index}
            />
            <DeleteButton
              {store}
              isCurrentUser={isCurrentUser}
              {row}
              rowIndex={index}
            />
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .add-new-button {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.deleted-art-container{
  margin-top: 20px;
  /* box-shadow: 2px 2px rgb(255, 0, 0); */
  border-radius: 25px;
  border: 1px dashed red;
  padding: 4px;
}
.artworkListViewer-trash-flex-row{
  display: flex;
  justify-content: space-evenly;
  border-top: dashed 1px #ff0000;
}
.trash-icon{
  height: 60px;
  display: flex;
  flex-direction: row;
  padding: 10px 0;
}
.trash-action-buttons {
  background-color: transparent;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  width: 100%;
}
.art-app-container{
  margin: 2rem 0 1rem 0;
}

.hidden {
  display: none;
  width: 0;
}

.artworkListViewer-flex-row{
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-evenly;
  align-items: center;
  border-bottom: dashed 1px #7300eb;
}

.cell {
  flex: 1;
  min-width: 0;
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
