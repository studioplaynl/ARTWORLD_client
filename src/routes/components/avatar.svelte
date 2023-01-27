<script>
  import { push } from 'svelte-spa-router';
  import { onDestroy, onMount } from 'svelte';
  import { Profile } from '../../session';
  import { AvatarsStore } from '../../storage';
  import ImagePicker from './imagePicker.svelte';
  import { STOPMOTION_FPS } from '../../constants';

  export let showHistory = false;

  let image;
  let frame = 0;
  let interval;
  let currentAvatar;

  const unsubscribe = AvatarsStore.subscribe((val) => {
    if (val.length > 0) {
      currentAvatar = AvatarsStore.getCurrent();
    }
  });

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
    }, 1000 / STOPMOTION_FPS);
  });

  onDestroy(() => {
    unsubscribe();
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
  <!-- <img
    class="icon"
    alt="Edit House"
    src="/assets/SHB/svg/AW-icon-pen.svg"
    on:click="{() => {
      currentAvatar = AvatarsStore.getCurrent();
      console.log(currentAvatar);
      if (typeof currentAvatar === 'object') {
        push(`/avatar?userId=${$Profile.id}&key=${currentAvatar.key}`);
      } else {
        push('/avatar');
      }
    }}"
  /> -->
  {#if !showHistory}
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

{#if !showHistory}
  <ImagePicker dataType="avatar" />
{/if}

<style>
  .icon {
    max-width: 50px;
    width: 50px;
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
</style>
