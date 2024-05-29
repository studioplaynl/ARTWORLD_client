<script>
  import { onDestroy, beforeUpdate } from 'svelte';
  import { push } from 'svelte-spa-router';
  import { STOPMOTION_FPS } from '../../constants';

  export let artwork;
  export let row = null;

  export let clickable = false;

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

      // Don't animate if this (assumed) stop-motion is square
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
    // checks if we clicked 'voorbeeld' cell and if it has a value
    // opens the artwork with the appropriate app
    if (typeof row === 'undefined' || row === null) return;

    if (row.value) {
      push(
        `/${row.collection}?userId=${row.user_id}&key=${row.key}`,
      );
    } else if (row.key) {

    }
  }
</script>

<div class="artPreview" style="--avatar-size: {avatarSize}px;"
  on:click="{handleOpenArtwork}" class:clickable="{clickable}">
  <img bind:this="{image}" src="{artwork}" alt="artwork" />
</div>

<style>
  .artPreview {
    height: var(--avatar-size);
    width: var(--avatar-size);
    overflow: hidden;
    position: relative;
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
</style>
