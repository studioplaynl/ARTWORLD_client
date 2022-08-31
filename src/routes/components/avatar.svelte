<script>
  import { push } from 'svelte-spa-router';
  import { onDestroy, onMount } from 'svelte';
  import { Profile } from '../../session';
  import { convertImage, setAvatar } from '../../api';
  import ImagePicker from './imagePicker.svelte';
  import { dlog } from '../game/helpers/DebugLog';

  export let showHistory = false;

  let image;
  let frame = 0;
  let interval;
  let url;

  // function loadUrl() {
  //   url = $Profile.url;
  //   dlog(url);
  //   version = Number($Profile.avatar_url.split('/')[2].split('_')[0]);
  // }

  // Profile.subscribe(loadUrl);

  onMount(async () => {
    //   loadUrl();
    interval = setInterval(() => {
      frame++;
      if (frame >= Math.floor(image.clientWidth / 150)) {
        frame = 0;
        image.style.left = '0px';
      } else {
        image.style.left = `-${frame * 150}px`;
      }
    }, 200);
  });

  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<!-- <button
  class="avatar"
  on:click="{() => {
    showHistory = !showHistory;
  }}"
>
  <img bind:this="{image}" src="{$Profile.url}" alt="My Avatar" />
</button> -->
<div class="avatar">
  <img bind:this="{image}" src="{$Profile.url}" alt="My Avatar" />
</div>
<div class="avatarButtons">
  <img
    class="icon"
    alt="Edit House"
    src="/assets/SHB/svg/AW-icon-pen.svg"
    on:click="{() => {
      push('/avatar');
    }}"
  />
  {#if !showHistory}
  <img
    class="icon"
    src="/assets/SHB/svg/AW-icon-cross.svg"
    on:click="{() => {
      showHistory = !showHistory;
    }}"
  />
  {:else }
  <img
  class="icon"
  src="/assets/SHB/svg/AW-icon-history.svg"
  on:click="{() => {
    showHistory = !showHistory;
  }}"
/>
  {/if}
</div>

{#if !showHistory}
  <ImagePicker dataType="avatar" />
{/if}

<style>
  .icon {
    max-width: 50px;
    margin: 10px;
    cursor: pointer;
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
    top: 0;
  }

  .avatarHistory {
    display: flex;
  }

  button {
    border: 0;
    background: transparent;
    cursor: pointer;
    border-radius: 0;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    display: inline-block;
    width: auto;
    transform-origin: center;
    transform: scale(1);
    padding: 0;
    margin: 0;
  }
  button:active,
  button:not(:disabled):active {
    outline: none;
    background: transparent;
    transform: scale(1.05);
  }
</style>
