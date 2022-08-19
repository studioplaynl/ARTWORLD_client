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
    <div
      class="app-close"
      on:click="{() => {
        dispatch('close');
      }}"
    >
      <img alt="Close" src="assets/SHB/svg/AW-icon-cross.svg" />
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

  .app-close {
    position: fixed;
    left: 8px;
    top: 20px;
    z-index: 13;
    box-shadow: 5px 5px 0px #7300ed;
    cursor: pointer;
    padding: 0;
    margin: 0;
    border-radius: 50%;
    width: 40px;
    height: 40px;
  }

  .app-close > img {
    width: 40px;
  }

  @media only screen and (max-width: 640px) {
    .app-close {
      top: unset;
      bottom: 120px;
    }
  }
</style>
