<script>
  import { onDestroy, beforeUpdate } from 'svelte';
  import { push } from 'svelte-spa-router';
  import { STOPMOTION_FPS } from '../../constants';
  import { homeElement_Selected } from '../../storage';

  export let artwork;
  export let row = null;

  export let artClickable = true;

  let image;
  let frame = 0;
  const avatarSize = 75;
  let interval;

  beforeUpdate(async () => {
    if (image) {
      clearInterval(interval);
      interval = setInterval(() => {
        frame++;
        if (frame >= Math.floor(image.clientWidth / avatarSize)) {
          frame = 0;
          image.style.left = '0px';
        } else {
          image.style.left = `-${frame * avatarSize}px`;
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
  });

  function handleOpenArtwork() {
    // console.log('handleOpenArtwork row', row);

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
</script>

<button class="artPreview" on:click="{handleOpenArtwork}" id="{artClickable ? 'clickable' : 'notClickable'}">
  <div class="artPreview" style="--avatar-size: {avatarSize}px;">
  <img bind:this="{image}" src="{artwork}" alt="artwork" />
</div>
</button>

<style>
  .artPreview {
    height: var(--avatar-size);
    width: var(--avatar-size);
    overflow: hidden;
    position: relative;
    border: none;
    border-radius: 0;
  }
  #clickable {
    cursor: pointer;
  }

  #clickable:hover {
    opacity: 0.75;
  }

  #notClickable {
    /* cursor: not-allowed; */
    padding: 0;
    cursor: default;
  }

  .artPreview > img {
    height: var(--avatar-size);
    position: absolute;
    left: 0px;
  }
</style>
