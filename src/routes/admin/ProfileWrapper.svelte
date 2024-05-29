<script>
  import { pop } from 'svelte-spa-router';
  import Profile from '../profile.svelte';

  export let params = {};
</script>

<div class="box">
  <Profile bind:params="{params}" />
  <button
    class="app-close"
    on:click="{() => {
      pop();
    }}"
    aria-label="Close"
  >
    <img alt="Close" src="assets/SHB/svg/AW-icon-cross.svg" />
  </button>
</div>

<style>
  button{
    background-color: #7300ed;
  }

  .app-close {
    position: absolute;
    right: 15px;
    top: 15px;
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
