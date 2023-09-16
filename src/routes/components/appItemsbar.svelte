 <script>
  /**
 * @file appItemsbar.svelte
 * @author Maarten
 *
 *  What is this file for?
 *  ======================
 *  appItemsbar.svelte implements make a new and editing existing drawings/stopmotion etc
 *  in the items bar
 *
 * imagePicker.svelte is used to list and interact with existing drawings
 * imagePicker dataType="drawing" is used for drawings
 * imagePicker dataType="stopmotion" is used for stopmtion
 *
 */
import { push } from 'svelte-spa-router';
import ArtworkListViewer from './artworkListViewer.svelte';
import { returnAppIconUrl } from '../../constants';
import { PlayerHistory } from '../game/playerState';

let showHistory = false;
export let appName = '';

function addNew() {
  // open the relevant app
  const value = `/${appName}`;
  push(value);
  PlayerHistory.push(value);
}

</script>
<div class="appItemsbarBorder">
  <div class="appItemsbarContainer">

    <!-- get the appropreate app icon from the function returnAppIconUrl -->
  <img class="icon_big flex-row" src={returnAppIconUrl(appName, 'square')} alt={appName}
          on:click="{() => {
            showHistory = !showHistory;
          }}"
      />

    <div class="addNew flex-row" >
      <img class="icon_medium flex-row" src="/assets/SHB/svg/AW-icon-plus.svg" alt="make new"
          on:click="{addNew}"
      />
    </div>

    {#if showHistory}
      <img
        alt="close"
        class="icon_medium flex-row"
        src="/assets/SHB/svg/AW-icon-cross.svg"
        on:click="{() => {
          showHistory = !showHistory;
        }}"
      />

      {:else}
          <img
        alt="unfold options"
        class="icon_medium flex-row"
        src="/assets/SHB/svg/AW-icon-enter.svg"
        on:click="{() => {
          showHistory = !showHistory;
        }}"
      />
    {/if}
  </div> <!-- appItemsbarContainer -->

  {#if showHistory}
      <ArtworkListViewer dataType={appName} />
  {/if}
</div> <!-- appItemsbarBorder -->

<style>
  .appItemsbarBorder{
    border: 2px dashed;
    border-radius: 25px;
    padding: 8px;
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
.appItemsbarContainer {
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
