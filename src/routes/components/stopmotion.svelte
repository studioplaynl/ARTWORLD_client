<script>
  import { onDestroy, beforeUpdate, createEventDispatcher } from 'svelte';

  export let artwork;
  export let clickable = false;

  let image;
  let frame = 0;
  let interval;

  beforeUpdate(async () => {
    clearInterval(interval);

    interval = setInterval(() => {
      frame++;
      if (frame >= Math.floor(image.clientWidth / 150)) {
        frame = 0;
        image.style.left = '0px';
      } else {
        image.style.left = `-${frame * 150}px`;
      }
    }, 500);

    // Don't animate if this (assumed) stop-motion is square
    if (
      image &&
      image.clientWidth > 0 &&
      image.clientWidth === image.clientHeight
    ) {
      clearInterval(interval);
    }
  });

  onDestroy(() => {
    clearInterval(interval);
  });

  const dispatch = createEventDispatcher();

  function submitClicked() {
    dispatch('clicked', artwork);
  }
</script>

<div class="stopmotion" on:click="{submitClicked}" class:clickable>
  <img bind:this="{image}" src="{artwork}" alt="Stop motion" />
</div>

<style>
  .stopmotion {
    height: 150px;
    width: 150px;
    overflow: hidden;
    position: relative;
  }
  .clickable {
    cursor: pointer;
  }

  .clickable:hover {
    opacity: 0.75;
  }

  .stopmotion > img {
    height: 150px;
    position: absolute;
    left: 0px;
  }
</style>
