<script>
  /**
 * @file ArtworkLoader.svelte
 * @author Lindsey, Maarten
 *
 *  What is this file for?
 *  ======================
 *  ArtworkLoader.svelte is used in the itemsBar to load artworks
 *  it opens the artwork in the drawing app, but now there is no on:clicked handler
 *
 *  Opening is handled in the parent component with the on:clickCell="{goTo}" method
 *  (handling the clicked event from Previewer component)
 *  these components names should be changed because they are confusion and nondescriptive
 *
 *  It is used in the frieds, liked, profile page
 */
  import { onMount, onDestroy, beforeUpdate, createEventDispatcher } from 'svelte';
  import { push } from 'svelte-spa-router';
  import { STOPMOTION_FPS } from '../../constants';
  import { homeElement_Selected } from '../../storage';

  const dispatch = createEventDispatcher(); // sends a custom event to the parent component (EditHome.svelte) delete event

  
  export let row = null;
  export let artClickable = true;
  export let deleteIcon = false;  
  export let previewSize = 75;

  let image;
  let frame = 0;
  let interval;
  let artworkUrl;
  let deleteCheck = false;
  let deleteButton; // check if delete button is clicked

  $: {
    // console.log('row', row);
    if (row) {
      if (row.user) {
        artworkUrl = row.user.url;
      } else if (row.value && row.value.previewUrl) {
        artworkUrl = row.value.previewUrl;
      } else if (row.img) {
        artworkUrl = row.img;
      }
    }
  }

  onMount(() => {
    window.addEventListener('click', handleClickOutsideDeleteButton);
  });

  beforeUpdate(async () => {
    if (image) {
      clearInterval(interval);
      interval = setInterval(() => {
        frame++;
        if (frame >= Math.floor(image.clientWidth / previewSize)) {
          frame = 0;
          image.style.left = '0px';
        } else {
          image.style.left = `-${frame * previewSize}px`;
        }
      }, 1000 / STOPMOTION_FPS);

      // Don't animate if this (assumed) artwork is square
      if (image && image.clientWidth > 0 && image.clientWidth === image.clientHeight) {
        clearInterval(interval);
      }
    } else {
    }
  });

  onDestroy(() => {
    clearInterval(interval);
    window.removeEventListener('click', handleClickOutsideDeleteButton);
  });


  function handleClickOutsideDeleteButton (event) {
    if (deleteButton && !deleteButton.contains(event.target)) {
      deleteCheck = false;
    }
  }


  function handleOpenArtwork() {
    console.log('handleOpenArtwork row', row);

    dispatch('artClicked', row);

    if (row.collection === 'homeElement') {
      // we want to make this selected in editHome menu
      // and Phaser
      console.log('homeElement_Selected', row);
      homeElement_Selected.set(row);
    }
    if (!artClickable) return;
    // checks if we clicked 'voorbeeld' cell and if it has a value
    // opens the artwork with the appropriate app
    if (typeof row === 'undefined' || row === null) return;

    if (row.value) {
      // case: from self
      push(
        `/${row.collection}?userId=${row.user_id}&key=${row.key}`,
      );
    } else if (row.key) {
      artClickable = false;
      //case: art from others, open in drawing but without editing
      //! not working reliably, so off for now
      // push(
      //   `/${row.collection}?userId=${row.userId}&key=${row.key}`,
      // );
    }
  }

  function handleDelete(event) {
    event.stopPropagation();  // Prevent the click from triggering handleOpenArtwork
    // Implement delete logic here
    // You might want to emit an event here for the parent component to handle the deletion
    // For example: dispatch('delete', row);
    if (deleteCheck) {
      console.log('Delete clicked for:', row);

      dispatch('delete', row);
    } else {
      deleteCheck = true;
    }
  }
</script>

{#if artworkUrl}
  <div class="artwork-container">
    {#if artClickable}
      <button 
        class="artPreview clickable" 
        on:click="{handleOpenArtwork}" 
        style="--avatar-size: {previewSize}px;"
      >
        <img bind:this="{image}" src="{artworkUrl}" alt="artwork" />
      </button>
    {:else}
      <div 
        class="artPreview" 
        style="--avatar-size: {previewSize}px;"
      >
        <img bind:this="{image}" src="{artworkUrl}" alt="artwork" />
      </div>
    {/if}
    {#if deleteIcon}
      <button bind:this={deleteButton} class="icon delete-button" on:click={handleDelete}>
        {#if deleteCheck}
          <img alt="delete" src="/assets/SHB/svg/AW-icon-trash.svg" />
        {:else}
          <img alt="sure you want to delete?" src="/assets/SHB/svg/AW-icon-cross.svg" />
        {/if}
      </button>
    {/if}
  </div>
{/if}

<style>
  .artwork-container {
    display: flex;
    align-items: center;
  }
  .artPreview {
    height: var(--avatar-size);
    width: var(--avatar-size);
    overflow: hidden;
    position: relative;
    border: none;
    border-radius: 0;
  }
  .clickable {
    cursor: pointer;
  }
  .clickable:hover {
    opacity: 0.75;
  }
  .artPreview > img {
    height: var(--avatar-size);
    position: absolute;
    left: 0px;
  }
  .icon {
    background-color: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    margin-left: 5px;
  }
  .delete-button {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .icon img {
    width: 100%;
    height: 100%;
  }
  .icon:hover {
    opacity: 0.8;
  }
</style>