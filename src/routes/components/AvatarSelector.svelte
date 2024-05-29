<script>
    /**
 * @file avatar.svelte
 * @author Lindsey, Maarten
 *
 *  What is this file for?
 *  ======================
 *  AvatarSelector.svelte implements selecting and editing a avatar stopmotion
 *  it resides in the items bar, more specifically the profile.svelte page
 *
 *  The overall structure is:
 *  ItemsBar.svelte > click avatar icon > unfolds left side of itemsBar
 *  click avatar icon again > unfolds right side of itemsBar with:
 *  username, avatar.svelte (edit avatar), HomeSelector.svelte (edit home image), list of artworks
 *
 *  The default is the closed state, in which a 'history' icon is present
 *  When unfolded the user can add a avatar drawing or select one from the list
 *  All edits to existing drawings are stored as a new drawing
 *  The user can delete drawings from the list, except default avatars
 *
 * ImagePicker.svelte is used to list and interact with existing avatars and homes
 * imagePicker dataType="house" is used for homes
 * imagePicker dataType='avatar' is used for avatars
 */

  // import { push } from 'svelte-spa-router';
  import { onDestroy, onMount } from 'svelte';
  import { Profile } from '../../session';
  import { AvatarsStore } from '../../storage';
  import ImagePicker from './ImagePicker.svelte';
  import { STOPMOTION_FPS } from '../../constants';

  export let showHistory = false;

  const avatarSize = 75;
  let image;
  let frame = 0;
  let interval;
  // eslint-disable-next-line no-unused-vars
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
      if (frame >= Math.floor(image.clientWidth / avatarSize)) {
        frame = 0;
        image.style.left = '0px';
      } else {
        image.style.left = `-${frame * avatarSize}px`;
      }
    }, 1000 / STOPMOTION_FPS);
  });

  onDestroy(() => {
    unsubscribe();
    clearInterval(interval);
  });
</script>

<div class="avatarContainer" >
<div class="avatar" style="--avatar-size: {avatarSize}px;">
  <img bind:this="{image}" src="{$Profile.url}" alt="My Avatar" />
</div>
<!-- <div class="avatarButtons"> -->

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
      src="/assets/SHB/svg/AW-icon-pen.svg"
      on:click="{() => {
        showHistory = !showHistory;
      }}"
    />
  {/if}
<!-- </div> -->
</div> <!--avatarContainer-->

{#if !showHistory}
  <ImagePicker dataType="avatar" />
{/if}

<style>
  .avatarContainer {
    max-width: 100%;
    display: flex;
  }

  .icon {
    max-width: 50px;
    width: 50px;
    margin: 10px;
    cursor: pointer;
  }

  .avatar {
    height: var(--avatar-size);
    width: var(--avatar-size);
    overflow: hidden;
    position: relative;
  }

  .avatar > img {
    height: var(--avatar-size);
    position: absolute;
    left: 0px;
    top: 0;
  }
</style>
