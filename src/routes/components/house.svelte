<script>
  import { myHome } from '../../storage';
  import ImagePicker from './imagePicker.svelte';

  // let url;
  let show = false;
  let showHistory = false;
</script>

<div class="container-history-nav-buttons">
  <div
    class="avatar pointer"
    on:click="{() => {
      show = !show;
      showHistory = false;
    }}"
  >
    <img alt="My House" id="house" src="{$myHome.url}" />
  </div>
</div>

<div class="action">
  {#if showHistory}
    <img
      alt="close"
      class="icon"
      src="/assets/SHB/svg/AW-icon-cross.svg"
      on:click="{() => {
        showHistory = !showHistory;
      }}"
    />
  {:else}
    <img
      alt="history"
      class="icon"
      src="/assets/SHB/svg/AW-icon-history.svg"
      on:click="{() => {
        showHistory = !showHistory;
      }}"
    />
  {/if}
</div>
{#if showHistory}
  <ImagePicker dataType="house" />
{/if}

<style>
  .icon {
    max-width: 50px;
    margin: 10px;
    cursor: pointer;
  }

  .container-history-nav-buttons {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
  }
  .avatar {
    height: 150px;
    width: 150px;
    overflow: hidden;
    position: relative;
  }

  .avatar > img {
    height: 150px;
    position: absolute;
    left: 0px;
  }

  .action > img {
    width: 70px;
    cursor: pointer;
  }

  .pointer {
    cursor: pointer;
  }
</style>
