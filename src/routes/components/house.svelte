 <script>
  /**
 * @file house.svelte
 * @author Lindsey, Maarten
 *
 *  What is this file for?
 *  ======================
 *  house.svelte implements selecting and editing a home image
 *  in the items bar, more specifically the profile.svelte page
 *
 *  The overall structure is:
 *  itemsBar.svelte > click avatar icon > unfolds left side of itemsBar
 *  click avatar icon again > unfolds right side of itemsBar with:
 *  username, avatar.svelte (edit avatar), house.svelte (edit home image), list of artworks
 *
 *  The default is the closed state, in which a 'history' icon is present
 *  When unfolded the user can add a home drawing or select one from the list
 *  All edits to existing drawings are stored as a new drawing
 *  The user can delete drawings from the list, except default homes
 *
 * imagePicker.svelte is used to list and interact with existing avatars and homes
 * imagePicker dataType="house" is used for homes
 * imagePicker dataType='avatar' is used for avatars
 */

  import { myHome } from '../../storage';
  import ImagePicker from './imagePicker.svelte';

  let showHistory = false;
</script>

<div class="homeContainer">
<div class="homeImage">
    <img alt="My House" id="house" src="{$myHome.url}" />
  </div>

<div class="action">
  {#if showHistory}
    <img
      alt="close"
      class="icon"
      src="/assets/SHB/svg/AW-icon-cross.svg"
      on:click="{() => {
        showHistory = !showHistory;
      }}"
    />
  {:else}
    <img
      alt="history"
      class="icon"
      src="/assets/SHB/svg/AW-icon-pen.svg"
      on:click="{() => {
        showHistory = !showHistory;
      }}"
    />
  {/if}
</div>
</div> <!-- homeContainer-->

{#if showHistory}
  <ImagePicker dataType="house" />
{/if}

<style>
  .homeContainer {
    max-width: 100%;
    display: flex;
  }

  .icon {
    max-width: 50px;
    margin: 10px;
    cursor: pointer;
  }

  .homeImage {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
  }
  .action > img {
    width: 70px;
    cursor: pointer;
  }
</style>
