<script>
  /**
   * @file AppItem.svelte
   * @author Maarten
   *
   *  What is this file for?
   *  ======================
   *  AppItem.svelte implements make a new and editing existing drawings/stopmotion etc
   *  in the items bar
   */
  import { push } from 'svelte-spa-router';
  import { onMount } from 'svelte';
  import { Profile } from '../../session';
  import ArtListView from './ArtListView.svelte';
  import { returnAppIconUrl } from '../../constants';
  import { PlayerHistory } from '../game/playerState';
  import { useFilteredArtworksStore } from '../../storage';

  // local props
  let showHistory = false;
  export let appName = '';
  export let showAddNew = true;
  // passed on props: show or hide components in ArtListView
  export let showVisibilityToggle = false;
  export let showDeleteButton = false;
  export let showSendTo = false;
  export let showDeletedArtContainer = false;
  export let showPlaceHomeElement = false;
  export let artClickable = true;

  // Destructure the props
  let props = { showVisibilityToggle, showDeleteButton, showSendTo, showDeletedArtContainer, showPlaceHomeElement, artClickable };

  const { 
    store, 
    filteredArt, 
    deletedArt,
    visibleArt
  } = useFilteredArtworksStore(appName);

  // Function to check if the store has any items
  $: hasStoreItems = $filteredArt.length > 0 || $deletedArt.length > 0;


  onMount(async () => {
    const id = $Profile.id;
    const useraccount = $Profile;
    await store.loadArtworks(id);
  });
  
  /* Make a new artwork */
  function addNew() {
    // open the relevant app
    const value = `/${appName}`;
    push(value);
    PlayerHistory.push(value);
  }
</script>

<div class="AppItemBorder">
  <div class="AppItemContainer" style="flex-direction: {showPlaceHomeElement ? 'row-reverse' : 'row'};">
    <div class="icon-group" style="flex-direction: {showPlaceHomeElement ? 'row-reverse' : 'row'};">
      <button on:click="{() => {
        if (hasStoreItems) {
          showHistory = !showHistory;
        }
      }}">
        <img class="icon_big" src={returnAppIconUrl(appName, 'square')} alt={appName} />
      </button>
      
      {#if showAddNew && (!showPlaceHomeElement || !hasStoreItems)}
        <button on:click="{addNew}" class="add-new-button">
          <img class="icon_medium" src="/assets/SHB/svg/AW-icon-plus.svg" alt="make new" />
        </button>
      {/if}
    </div>

    {#if hasStoreItems}
      <button on:click="{() => {showHistory = !showHistory;}}" class="history-toggle">
        <img
          alt={showHistory ? "close" : "unfold options"}
          class="icon_medium"
          src={showHistory ? "/assets/SHB/svg/AW-icon-cross.svg" : "/assets/SHB/svg/AW-icon-enter.svg"}
        />
      </button>
    {/if}
  </div>

  {#if showHistory && hasStoreItems}
    <ArtListView dataType={appName} {...props} />
  {/if}
</div>

<style>
  .AppItemBorder {
    border-radius: 25px;
    padding: 10px 15px;
    box-shadow: 2px 2px #7300EC;
    overflow: auto;
  }

  .AppItemContainer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .icon-group {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  button {
    border: 0;
    background: transparent;
    cursor: pointer;
    padding: 0;
    margin: 0;
  }

  .icon_big {
    width: 60px;
    height: 60px;
  }

  .icon_medium {
    width: 40px;
    height: 40px;
  }

  .add-new-button {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .history-toggle {
    margin-left: auto;
  }
</style>