<script>
  import { onMount } from 'svelte';
  import { Profile, CurrentApp } from '../../session';
  import { convertImage, getObject } from '../../api';
  import SceneSwitcher from '../game/class/SceneSwitcher';
  import ManageSession from '../game/ManageSession';
  import { dlog } from '../game/helpers/DebugLog';

  // let url;
  const show = false;
  // const showHistory = false;
  // let version;
  let houseUrl;

  // async function nextVersion() {
  //   if ($Profile.meta.LastAvatarVersion <= version) return;
  //   version++;
  //   // console.log('version', version);
  //   // console.log(
  //   //   '$Profile.meta.LastAvatarVersion',
  //   //   $Profile.meta.LastAvatarVersion,
  //   // );
  //   url = await setAvatar(`avatar/${$Profile.id}/${version}_current.png`);
  //   img.src = url;
  //   img.onerror = () => {
  //     version -= 2;
  //     nextVersion();
  //     console.log('img not availible, gone bacck');
  //   };
  // }

  // async function backVersion() {
  //   if (version <= 1) return console.log('first image reached');
  //   version--;
  //   console.log('version', version);
  //   url = await convertImage(
  //     `avatar/${$Profile.id}/${version}_current.png`,
  //     '150',
  //     '1000',
  //   );
  //   setAvatar(`avatar/${$Profile.id}/${version}_current.png`);
  // }

  // function loadUrl() {
  //   url = $Profile.url;
  //   console.log(url);
  //   version = Number($Profile.avatar_url.split('/')[2].split('_')[0]);
  // }

  async function goHome() {
    SceneSwitcher.switchScene(
      ManageSession.currentScene,
      'DefaultUserHome',
      ManageSession.userProfile.id,
    );
  }

  onMount(async () => {
    try {
      houseUrl = await getObject(
        'home',
        $Profile.meta.Azc || 'Amsterdam',
        $Profile.user_id,
      );
    } catch (err) {
      dlog(err); // TypeError: failed to fetch
    }
    if (typeof houseUrl === 'object') {
      houseUrl = await convertImage(houseUrl.value.url, '150', '150');
    } else {
      houseUrl = '';
    }
  });
</script>

<div class="container-history-nav-buttons">
  <!-- {#if showHistory}
    <div class="backAvatar pointer">
      <img
      alt="Back"
        src="/assets/SHB/svg/AW-icon-previous.svg"
        on:click="{backVersion}"
      />
    </div>
  {/if} -->
  <div
    class="avatar pointer"
    on:click="{() => {
      // show = !show;
      // showHistory = false;
      CurrentApp.set('house');
    }}"
  >
    <img alt="My House" id="house" src="{houseUrl}" />
  </div>
  <!-- {#if showHistory}
    <div class="nextAvatar pointer">
      <img src="/assets/SHB/svg/AW-icon-next.svg" on:click="{nextVersion}" />
    </div>
  {/if} -->
</div>
{#if show}
  <div class="action">
    <img
      alt="Edit House"
      src="/assets/SHB/svg/AW-icon-pen.svg"
      on:click="{() => {
        CurrentApp.set('house');
      }}"
    />
    <img
      alt="Go Home"
      src="assets/SHB/svg/AW-icon-enter-space.svg"
      on:click="{() => {
        goHome();
      }}"
    />

    <!-- <img
      src="/assets/SHB/svg/AW-icon-history.svg"
      on:click={() => {
        showHistory = true;
        show = false;
      }}
    /> -->
  </div>
{/if}

<style>
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
