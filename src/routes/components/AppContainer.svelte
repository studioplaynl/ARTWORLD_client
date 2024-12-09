<script>
  import { fly } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';

  export let open = false;

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
        <img alt="Close" src="assets/SHB/svg/AW-icon-check.svg" />
      </button>
      <button 
        class="control-button"
        on:click={() => dispatch('clearCanvasBegin')}
      >
        <img alt="Clear canvas" src="assets/SHB/svg/AW-icon-trashcan.svg" class="red-icon" />
      </button>
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
    left: 16px;
    top: 16px;
    display: flex;
    gap: 16px;
    z-index: 13;
  }

  .control-button {
    width: 40px;
    height: 40px;
    box-shadow: 5px 5px 0px #7300ed;
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
    width: 70%;
    height: 70%;
    object-fit: contain;
    display: block;
  }

  @media only screen and (max-width: 600px) {
    .control-button {
      width: 32px;
      height: 32px;
      padding: 0;
    }
  }

  .red-icon {
    filter: invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%);
  }
</style>
