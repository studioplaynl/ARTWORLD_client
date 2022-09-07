<script>
  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';
  import { myHome } from '../../storage';
  import SceneSwitcher from '../game/class/SceneSwitcher';
  import ManageSession from '../game/ManageSession';
  import ImagePicker from './imagePicker.svelte';

  // let url;
  let show = false;
  let showHistory = false;
  // let version;

  async function goHome() {
    SceneSwitcher.switchScene('DefaultUserHome', ManageSession.userProfile.id);
  }

  onMount(async () => {
    // try {
    //   houseUrl = await getObject(
    //     'home',
    //     $Profile.meta.Azc || 'Amsterdam',
    //     $Profile.user_id,
    //   );
    // } catch (err) {
    //   dlog(err); // TypeError: failed to fetch
    // }
    // if (typeof houseUrl === 'object') {
    //   houseUrl = await convertImage(houseUrl.value.url, '150', '150');
    // } else {
    //   houseUrl = '';
    // }
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
      show = !show;
      showHistory = false;
      // push('/house');
    }}"
  >
    <img alt="My House" id="house" src="{$myHome.url}" />
  </div>
</div>

<div class="action">
  <img
    class="icon"
    alt="Edit House"
    src="/assets/SHB/svg/AW-icon-pen.svg"
    on:click="{() => {
      push('/house');
    }}"
  />
  <img
    class="icon"
    alt="Go Home"
    src="assets/SHB/svg/AW-icon-enter-space.svg"
    on:click="{() => {
      goHome();
    }}"
  />
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
