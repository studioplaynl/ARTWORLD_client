<script>
  import { createEventDispatcher } from 'svelte';

  export let artwork;
  export let clickable = false;

  const dispatch = createEventDispatcher();

  function submitClicked() {
    dispatch('clicked', artwork);
  }
</script>

<div class="artwork" on:click="{submitClicked}" class:clickable>
  <img src="{artwork}" alt="Artwork" />
</div>

<style>
  .artwork {
    height: 5rem;
    width: 5rem;
    overflow: hidden;
    position: relative;
  }
  .artwork > img {
    height: 5rem;
    position: absolute;
    left: 0;
    top: 0;
  }

  .clickable {
    cursor: pointer;
  }

  .clickable:hover {
    opacity: 0.75;
  }
</style>
