<script>
  import { push } from 'svelte-spa-router';
  import { onDestroy, onMount } from 'svelte';
  import { Profile } from '../../session';
  import { convertImage, setAvatar } from '../../api';
  import { dlog } from '../game/helpers/DebugLog';

  export let showHistory = false;

  let image;
  let frame = 0;
  let interval;
  let url;

  let version;

  // TODO: Should reflect data in history store
  const hasPreviousVersion = true;
  const hasNextVersion = true;

  const img = new Image();

  async function nextVersion() {
    alert('TODO: Next version');
    return false;

    // eslint-disable-next-line no-unreachable
    if ($Profile.meta.LastAvatarVersion <= version) return;
    version++;
    dlog('version', version);
    dlog('$Profile.meta.LastAvatarVersion', $Profile.meta.LastAvatarVersion);
    url = await setAvatar(`avatar/${$Profile.id}/${version}_current.png`);
    img.src = url;
    img.onerror = () => {
      version -= 2;
      nextVersion();
      dlog('img not availible, gone bacck');
    };
  }

  async function backVersion() {
    alert('TODO: Previous version');
    return false;

    // eslint-disable-next-line no-unreachable
    if (version <= 1) return dlog('first image reached');
    version--;
    dlog('version', version);
    url = await convertImage(
      `avatar/${$Profile.id}/${version}_current.png`,
      '150',
      '1000',
    );
    setAvatar(`avatar/${$Profile.id}/${version}_current.png`);
  }

  function loadUrl() {
    url = $Profile.url;
    dlog(url);
    version = Number($Profile.avatar_url.split('/')[2].split('_')[0]);
  }

  Profile.subscribe(loadUrl);

  onMount(async () => {
    loadUrl();
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

<button
  class="avatar"
  on:click="{() => {
    push('/avatar');
  }}"
>
  <img bind:this="{image}" src="{url}" alt="My Avatar" />
</button>

{#if showHistory}
  <div class="avatarHistory">
    <button class="backAvatar" :disabled="{!hasPreviousVersion}">
      <img
        src="/assets/SHB/svg/AW-icon-previous.svg"
        on:click="{backVersion}"
        alt="Previous version"
      />
    </button>
    <button class="nextAvatar" :disabled="{!hasNextVersion}">
      <img
        src="/assets/SHB/svg/AW-icon-next.svg"
        on:click="{nextVersion}"
        alt="Next version"
      />
    </button>
  </div>
{/if}

<style>
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
