<script>
  import { fly } from 'svelte/transition';
  import { writable } from 'svelte/store';
  import { ShowHomeEditBar } from '../../session';

  const isExpanded = writable(false);

  function closeEditHome() {
    ShowHomeEditBar.set(false);
    isExpanded.set(false);
  }

  function toggleExpand() {
    isExpanded.update((value) => !value);
  }

  function handleKeyDown(event) {
    // handle keydown event here
    if (event.key === 'Enter' || event.key === ' ') {
      toggleExpand();
    }
  }
</script>

{#if $ShowHomeEditBar}
<div class="edit-home-menu" on:clickoutside={closeEditHome}>

  <button class="menu-icon" id="editHome"
     on:click={toggleExpand} on:keydown={handleKeyDown}
  transition:fly|local="{{
    duration: 160,
    opacity: 0,
    y: 100,
  }}" aria-label="Edit Home">
    {#if $isExpanded}
    <img src="/assets/SHB/svg/AW-icon-plus.svg" alt="Expand" />
    {/if}
    <img src="/assets/SHB/svg/AW-icon-pen.svg" alt="Edit Home" />
  </button>

</div>
{/if}

<style>
  .menu-icon {
    height: 50px;
    width: 50px;
    overflow: hidden;
  }

  .menu-icon img {
    height: 50px;
  }

  #editHome {
    background-color: white;
    text-align: center;
    border-radius: 50px;
    box-shadow: 5px 5px 0px #7300ed;
    padding: 14px 14px 14px 18px;
    position: fixed;
    z-index: 10;
    transition: 0.01s all ease-in-out;
    max-height: 90vh;
    display: flex;
    right: 16px;
    bottom: 16px;
  }

  #editHome:active {
    max-height: 90%;
  }

  @media screen and (max-width: 600px) {
    #editHome {
    right: 16px;
    bottom: 16px;
    }
  }

  @media screen and (min-width: 600px) {
    #editHome {
    right: 16px;
    bottom: 16px;
    }
  }
</style>
