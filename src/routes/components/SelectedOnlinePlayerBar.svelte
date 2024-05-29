<script>
  import { onDestroy } from 'svelte';
  import { fly } from 'svelte/transition';
  import {
    convertImage,
    getObject,
    addFriend,
  } from '../../helpers/nakamaHelpers';
  import LikedPage from '../Liked.svelte';
  import { SelectedOnlinePlayer } from '../../session';
  import { Addressbook } from '../../storage';
  // import ManageSession from '../game/ManageSession';
  import { clickOutside } from '../../helpers/clickOutside';
  import { PlayerPos, PlayerLocation } from '../game/playerState';
  import { dwarn } from '../../helpers/debugLog';

  let current;
  let houseUrl;
  let enableclickOutsideListener = false;
  let userHouseObject;

  // check if player is clicked
  const unsubscribeSelectedOnlinePlayer = SelectedOnlinePlayer.subscribe(
    async () => {
      if ($SelectedOnlinePlayer && 'id' in $SelectedOnlinePlayer) {
        try {
          enableclickOutsideListener = false;
          // check for meta.azc because for a while there was a server bug that
          // would return azc and role instead of Azc and Role
          let profileAzc = '';
          // dlog('$Profile: ', $Profile)
          if ($SelectedOnlinePlayer.meta.Azc) {
            profileAzc = $SelectedOnlinePlayer.meta.Azc;
          } else if ($SelectedOnlinePlayer.meta.azc) {
            profileAzc = $SelectedOnlinePlayer.meta.azc;
          } else {
            profileAzc = 'GreenSquare';
          }

          userHouseObject = await getObject(
            'home',
            profileAzc,
            $SelectedOnlinePlayer.id,
          );
          // dlog('userHouseObject', userHouseObject);
          // dlog('$SelectedOnlinePlayer', $SelectedOnlinePlayer);
          houseUrl = await convertImage(userHouseObject.value.url, '50', '50');
        } catch (err) {
          dwarn(err);
        } finally {
          setTimeout(() => {
            enableclickOutsideListener = true;
          }, 500);
        }
      }
    },
  );

  /** toggle the open state of the panel "liked" */
  function toggleLiked() {
    current = current === 'liked' ? null : 'liked';
  }

  /** toggle the open state of the panel "home" */
  // function toggleHome() {
  //   current = current === 'home' ? null : 'home';
  // }

  function saveHome() {
    if ($SelectedOnlinePlayer) {
      Addressbook.create($SelectedOnlinePlayer.user_id, $SelectedOnlinePlayer);
    }
  }

  function goHome() {
    // place user next to nameplate of home
    const playerPosX = userHouseObject.value.posX - 80;
    const playerPosY = userHouseObject.value.posY - 100;

    // const value = `/game?location=${userHouseObject.key}&x=${playerPosX}&y=${playerPosY}`;
    // push(value);
    // PlayerHistory.push(value);

    PlayerPos.set({
      x: playerPosX,
      y: playerPosY,
    });

    PlayerLocation.set({
      scene: userHouseObject.key,
    });
  }

  function clickOutsideUser() {
    if (enableclickOutsideListener) {
      SelectedOnlinePlayer.set(null);
    }
  }

  onDestroy(() => {
    unsubscribeSelectedOnlinePlayer();
  });
</script>

<!-- online user -->
{#if $SelectedOnlinePlayer}
  <div
    class="itemsbar"
    id="onlineUser"
    use:clickOutside
    on:click_outside="{clickOutsideUser}"
    transition:fly|local="{{
      delay: 50,
      duration: 160,
      opacity: 0,
      y: 200,
    }}"
  >
    <div class="right">
      {#if current === 'liked'}
        <div>
          <LikedPage />
        </div>
      {/if}

      {#if current === 'home'}
        <br />
        <br />
        <br />

        <button on:click="{saveHome}">
          <img
            alt="Save Home"
            class="icon"
            src="assets/SHB/svg/AW-icon-save.svg"
          />
        </button>

        <button on:click="{goHome}">
          <img
            class="icon"
            src="assets/SHB/svg/AW-icon-enter-space.svg"
            alt="Go Home"
          />
        </button>
      {/if}
    </div>
    <div class="left">
      {#if $SelectedOnlinePlayer.display_name && $SelectedOnlinePlayer.display_name !== ''}
      <p>{$SelectedOnlinePlayer.display_name}</p>
      {:else }
      <p>{$SelectedOnlinePlayer.username}</p>
      {/if}

      <button class="avatar" id="no-pointer">
        <img
          alt="{$SelectedOnlinePlayer.username}"
          src="{$SelectedOnlinePlayer.url}"
        />
      </button>

      <button on:click="{goHome}">
        <img alt="House" id="house" src="{houseUrl}" />
      </button>

      <button
        on:click="{() => {
          addFriend($SelectedOnlinePlayer.id);
        }}"
      >
        <img
          alt="Add friend"
          class="icon"
          src="assets/SHB/svg/AW-icon-add-friend.svg"
        />
      </button>

      <button on:click="{toggleLiked}">
        <img
          alt="Toggle Liked page"
          class="icon"
          src="assets/SHB/svg/AW-icon-heart-full-red.svg"
        />
      </button>
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
  .itemsbar {
    background-color: white;
    text-align: center;
    border-radius: 50px;
    box-shadow: 5px 5px 0px #7300ed;
    padding: 14px 14px 14px 18px;
    position: fixed;
    z-index: 10;
    -webkit-transition: 0.01s all ease-in-out;
    -moz-transition: 0.01s all ease-in-out;
    -o-transition: 0.01s all ease-in-out;
    transition: 0.01s all ease-in-out;
    max-height: 90vh;
    display: flex;
  }

  .avatar {
    height: 50px;
    width: 50px;
    overflow: hidden;
  }

  .avatar > img {
    height: 50px;
  }

  #house {
    min-width: 30px;
    min-height: 30px;
  }

  #no-pointer{
    cursor:auto;
  }

  .left {
    display: flex;
    flex-wrap: nowrap;
    float: left;
    margin-right: 5px;
    justify-content: flex-start;
    flex-direction: column-reverse;
  }

  .right {
    float: left;
    overflow-x: hidden;
    overflow-y: auto;
    margin: 20px 0px;
  }

  @media screen and (max-width: 600px) {
    #onlineUser {
      right: 16px;
      bottom: 16px;
    }
  }

  @media screen and (min-width: 600px) {
    #onlineUser {
      right: 16px;
      bottom: 16px;
    }
  }

  .itemsbar button {
    border: 0;
    background: transparent;
    cursor: pointer;
    border-radius: 0;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    border-radius: 0;
    padding: 0;
    margin: 0;
  }
</style>
