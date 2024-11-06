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
  export let duplicateIcon = false;
  export let animateStopmotion = true;

  let image;
  let frame = 0;
  let interval;
  let artworkUrl;
  let deleteCheck = false;
  let deleteButton; // check if delete button is clicked

  let isStopmotion = false;
  let frameCount = 1;

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
      // Determine if it's a stopmotion based on image dimensions
      isStopmotion = false;
    }
  }

  onMount(() => {
    // for cancelling delete
    window.addEventListener('click', handleClickOutsideDeleteButton);
  });

  beforeUpdate(async () => {
    if (image) {
      clearInterval(interval);
      // Check if it's a stopmotion after the image has loaded
      isStopmotion = image.naturalWidth > image.naturalHeight;
      
      if (isStopmotion) {
        frameCount = Math.floor(image.naturalWidth / image.naturalHeight);
        if (animateStopmotion) {
          interval = setInterval(() => {
            frame = (frame + 1) % frameCount;
            image.style.transform = `translateX(-${frame * 100 / frameCount}%)`;
          }, 1000 / STOPMOTION_FPS);
        } else {
          // For non-animated stopmotions, ensure we show the first frame (position 0)
          frame = 0;
          image.style.transform = 'translateX(0)';
        }
      }
    }
  });

  onDestroy(() => {
    clearInterval(interval);
    window.removeEventListener('click', handleClickOutsideDeleteButton);
  });


  function handleClickOutsideDeleteButton (event) {
      deleteCheck = false;
  }


  function handleOpenArtwork() {
    console.log('handleOpenArtwork row', row);

    dispatch('artClicked', row);

    if (row.collection === 'homeElement') {
      // we want to make this selected in editHome menu
      // and Phaser
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
    if (deleteCheck) {
      //where is delete handled?
      dispatch('deleteArtworkInContext', row);
    } else {
      deleteCheck = true;
    }
  }

  function handleDuplicate() {
    event.stopPropagation();  // Prevent the click from triggering handleOpenArtwork
    dispatch('duplicateArtworkInContext', row);
    console.log('handleDuplicate row', row);
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
        <img bind:this="{image}" src="{artworkUrl}" alt="artwork" class:stopmotion={isStopmotion} style="--frame-count: {frameCount};" />
      </button>
    {:else}
      <button 
        class="artPreview" 
        on:click
        style="--avatar-size: {previewSize}px;"
      >
        <img bind:this="{image}" src="{artworkUrl}" alt="artwork" class:stopmotion={isStopmotion} style="--frame-count: {frameCount};" />
      </button>
    {/if}
    <div class="artwork-actions">
      {#if duplicateIcon}
      <button class="icon duplicate-button" on:click={handleDuplicate}>
        <img alt="duplicate HomeElement" src="/assets/SHB/svg/AW-icon-copy.svg" />
      </button>
      {/if}
      {#if deleteIcon}
        <button bind:this={deleteButton} class="icon delete-button" on:click={handleDelete}>
          {#if deleteCheck}
            <img alt="delete intent" src="/assets/SHB/svg/AW-icon-trash.svg" />
          {:else}
            <img alt="delete for sure" src="/assets/SHB/svg/AW-icon-cross.svg" />
          {/if}
        </button>
      {/if}
    </div>
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
    height: 100%;
    width: 100%;
    object-fit: cover;
  }
  .artPreview > img.stopmotion {
    width: calc(100% * var(--frame-count, 1));
    height: 100%;
    max-width: none;
    position: absolute;
    left: 0;
    top: 0;
  }
  .artwork-actions {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-left: 10px; /* Add some space between the image and actions */
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
