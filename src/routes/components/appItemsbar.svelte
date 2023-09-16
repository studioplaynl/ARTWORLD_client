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

import ArtworkListViewer from './artworkListViewer.svelte';
import { returnAppIconUrl } from '../../constants';

let showHistory = false;
export let appName = '';

</script>
<div class="appItemsbarContainer">

  <!-- get the appropreate app icon from the function returnAppIconUrl -->
 <img src={returnAppIconUrl(appName, 'square')} alt={appName}
        on:click="{() => {
          showHistory = !showHistory;
        }}"
    />

  {#if showHistory}
    <img
      alt="close"
      class="icon"
      src="/assets/SHB/svg/AW-icon-cross.svg"
      on:click="{() => {
        showHistory = !showHistory;
      }}"
    />

  {/if}
  <!-- </div>  action -->
</div> <!-- drawingContainer -->

{#if showHistory}
    <ArtworkListViewer dataType={appName} />
{/if}

<style>

.icon {
    max-width: 50px;
    margin: 10px;
    cursor: pointer;
}

.appItemsbarContainer {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
}

#actionImage{
    max-width: 80%;
    width: 30%;
    cursor: pointer;
}
</style>
