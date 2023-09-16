<script>
  import { onDestroy, beforeUpdate } from 'svelte';
  import { push } from 'svelte-spa-router';
  import { STOPMOTION_FPS } from '../../constants';

  export let artwork;
  export let row;

  export let clickable = false;
  // const dispatch = createEventDispatcher();

  let image;
  let frame = 0;
  let interval;

  beforeUpdate(async () => {
    if (image) {
      clearInterval(interval);
      interval = setInterval(() => {
        frame++;
        if (frame >= Math.floor(image.clientWidth / 75)) {
          frame = 0;
          image.style.left = '0px';
        } else {
          image.style.left = `-${frame * 75}px`;
        }
      }, 1000 / STOPMOTION_FPS);

      // Don't animate if this (assumed) stop-motion is square
      if (image && image.clientWidth > 0 && image.clientWidth === image.clientHeight) {
        clearInterval(interval);
      }
    } else {
      console.log('image: ', image);
    }
  });

  onDestroy(() => {
    clearInterval(interval);
  });

  // const dispatch = createEventDispatcher();

  // function submitClicked() {
  //   console.log('row: ', row);
  //   dispatch('openPreview', row);
  // }

    function handleOpenArtwork() {
    // checks if we clicked 'voorbeeld' cell and if it has a value
    // opens the artwork with the appropriate app

      console.log('row: ', row);

      if (typeof row === 'undefined') return;


      if (row.value) {
        push(
          `/${row.collection}?userId=${row.user_id}&key=${row.key}`,
        );
      } else if (row.key) {

      }
    }
</script>

<div class="artPreview" on:click="{handleOpenArtwork}" class:clickable="{clickable}">
  <img bind:this="{image}" src="{artwork}" alt="artwork" />
</div>

<style>
  .artPreview {
    height: 75px;
    width: 75px;
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
    height: 75px;
    position: absolute;
    left: 0px;
  }
</style>
