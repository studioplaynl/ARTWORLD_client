<script>
  import { fly } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';

  export let open = false;
  export let changes = 0;
  const dispatch = createEventDispatcher();

</script>

{#if open}
  <div
    class="app-container"
    in:fly="{{ y: 100, duration: 280, opacity: 0 }}"
    out:fly="{{ y: 100, duration: 200, opacity: 0 }}"
  >
    <div class="top-controls">
      <button
        class="control-button"
        on:click="{() => {
          dispatch('close');
        }}"
      >
        {#if changes === 0}
          <img alt="Close" src="assets/SHB/svg/AW-icon-plus.svg" class="rotated-icon" />
        {:else}
          <img alt="Close" src="assets/SHB/svg/AW-icon-check.svg" />
        {/if}
      </button>
      {#if changes > 0}
      <button 
        class="control-button"
        on:click={() => dispatch('clearCanvasBegin')}
      >
          <img alt="Clear canvas" src="assets/SHB/svg/AW-icon-trashcan.svg" class="red-icon" />
        </button>
      {/if}
    </div>
   
    <div class="app">
      <slot />
    </div>
  </div>
{/if}

<style>
  * {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .rotated-icon {
    transform: rotate(45deg);
    /* Optional: Adjust the transform origin if needed */
    transform-origin: center; /* This ensures the rotation happens around the center of the icon */
  }

  .app-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    z-index: 12;
  }
  .app {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: white;
  }

  .top-controls {
    position: fixed;
    left: 0.5rem;
    top: 0.5rem;
    display: flex;
    gap: 1rem;
    z-index: 13;
  }

  .control-button {
    max-width: 60px;
    max-height: 60pix;
    width: 2rem;
    height: 2rem;
    box-shadow: 3px 3px 0px #7300ed;
    cursor: pointer;
    padding: 0;
    margin: 0;
    border-radius: 50%;
    background: white;
    border: none;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .control-button > img {
    max-width: 50px;
    max-height: 50px;
    width: 70%;
    height: 70%;
    object-fit: contain;
    display: block;
  }

  .red-icon {
    filter: invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%);
  }
</style>
