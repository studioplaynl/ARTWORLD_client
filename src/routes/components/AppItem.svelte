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
import ArtListView from './ArtListView.svelte';
import { returnAppIconUrl } from '../../constants';
import { PlayerHistory } from '../game/playerState';

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
let props = { showVisibilityToggle, showDeleteButton, showSendTo, showDeletedArtContainer, showPlaceHomeElement, artClickable};

/* Make a new artwork */
function addNew() {
  // open the relevant app
  const value = `/${appName}`;
  push(value);
  PlayerHistory.push(value);
}

</script>
<div class="AppItemBorder">
    <!-- we reverse the icon order if the menu is PlaceHomeElement because the menu is on the right side of the screen -->
  <div class="AppItemContainer" style="flex-direction: {showPlaceHomeElement ? 'row-reverse' : 'row'};">

<!-- get the appropreate app icon from the function returnAppIconUrl -->
<button on:click="{() => {
  showHistory = !showHistory;
}}">
<img class="icon_big flex-row" src={returnAppIconUrl(appName, 'square')} alt={appName}
      />
      </button>

{#if showAddNew}
    <div class="addNew flex-row" >
      <button on:click="{addNew}">
      <img class="icon_medium flex-row" src="/assets/SHB/svg/AW-icon-plus.svg" alt="make new"
      />
      </button>
    </div>
{/if}

{#if showHistory}
<button on:click="{() => {showHistory = !showHistory;}}">
  <img
    alt="close"
    class="icon_medium flex-row"
    src="/assets/SHB/svg/AW-icon-cross.svg"
  />
</button>
  {:else}
  <button on:click="{() => {showHistory = !showHistory;}}">
      <img
    alt="unfold options"
    class="icon_medium flex-row"
    src="/assets/SHB/svg/AW-icon-enter.svg"
  />
  </button>
{/if}
</div> <!-- AppItemContainer -->

{#if showHistory}
    <ArtListView dataType={appName} {...props} />
{/if}
</div> <!-- AppItemBorder -->

<style>

  button {
    border: 0;
    background: white;
    cursor: pointer;
    border-radius: 0;
    appearance: none;
    padding: 0;
    margin: 0;
    box-sizing: border-box;
  }

  button:active {
    /* background-color: white; */
    background-color: #7300ed;
    border-radius: 50%;
    /* border: 2px solid #7300ed; */
    /* box-sizing: border-box; */
    /* box-shadow: 5px 5px 0px #7300ed; */
  }

  .AppItemBorder{
    /* border: 1px solid #7300eb; */
    border-radius: 25px;
    padding: 6px;
    box-shadow: 2px 2px #7300EC;
    overflow: auto;
  }

.icon_big {
    width: 60px;
    height: 60px;
    margin: 5px;
    cursor: pointer;
}

.icon_medium {
    width: 40px;
    height: 40px;
    margin: 5px;
    cursor: pointer;
}

.flex-row{
  display: flex;
  justify-content: space-evenly;
}

.AppItemContainer {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    flex-wrap: nowrap;
    align-items: center;
    /* border-bottom: 1px solid #7300eb; */
}

.addNew {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 50px;
    border-radius: 10px;
    background-color: #f0f0f0;
    cursor: pointer;
  }
</style>
