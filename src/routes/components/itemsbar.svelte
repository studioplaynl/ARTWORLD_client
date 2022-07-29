<script>
  import { location } from 'svelte-spa-router';
  import { onDestroy } from 'svelte';
  import { fade } from 'svelte/transition';
  import { convertImage, getAccount, getObject, logout } from '../../api';
  import ProfilePage from '../profile.svelte';
  import FriendsPage from '../friends.svelte';
  import LikedPage from '../liked.svelte';
  import { Profile, CurrentApp, ShowItemsBar } from '../../session';
  import Awards from '../awards.svelte';
  import { Addressbook } from '../../storage';
  import HistoryTracker from '../game/class/HistoryTracker';
  import ManageSession from '../game/ManageSession';
  import { clickOutside } from '../game/helpers/ClickOutside';
  import { isValidApp } from '../apps/apps';

  let current;
  let userHouseUrl;

  let addressbookList = [];
  let lastLengthAddressbook = 0;
  let alreadySubscribedToAddressbook = false;
  let addressbookImages = [];

  let enableClickOutsideListener = false;

  getAccount();

  // check if player is clicked
  const unsubscribeItemsBar = ShowItemsBar.subscribe(async () => {
    if (!$Profile) return;
    if ($location === '/login') return;

    enableClickOutsideListener = false;

    try {
      if (userHouseUrl === undefined) {
        /** object containing house information (position, image url) */
        const houseObject = await getObject(
          'home',
          $Profile.meta.Azc,
          $Profile.id,
        );

        /** convert image to small size */
        userHouseUrl = await convertImage(houseObject.value.url, '50', '50');
      }
    } finally {
      setTimeout(() => {
        enableClickOutsideListener = true;
      }, 500);
    }
  });

  onDestroy(() => {
    unsubscribeItemsBar();
  });

  function subscribeToAddressbook() {
    alreadySubscribedToAddressbook = true;
    Addressbook.subscribe((value) => {
      if (lastLengthAddressbook !== value.length) {
        lastLengthAddressbook = value.length;
        addressbookImages = [];
        addressbookList = value;
        if (addressbookList.length > 0) {
          const tempArray = [];
          addressbookList.forEach(async (element) => {
            tempArray.push(
              await getObject(
                'home',
                element.value.meta?.Azc,
                element.value.user_id,
              ),
            );

            if (addressbookList.length === tempArray.length) {
              tempArray.forEach(async (address) => {
                addressbookImages = [
                  ...addressbookImages,
                  {
                    name: address.value.username,
                    id: address.user_id,
                    url: await convertImage(address.value.url, '50', '50'),
                  },
                ];
                // addressbookImages = addressbookImages;
              });
            }
          });
        }
      }
    });
  }

  function toggleLiked() {
    current = current === 'liked' ? null : 'liked';
  }

  function toggleFriends() {
    current = current === 'friends' ? null : 'friends';
  }

  function toggleAddressBook() {
    current = current === 'addressbook' ? null : 'addressbook';

    if (!alreadySubscribedToAddressbook) {
      subscribeToAddressbook();
    }
  }
  function toggleHome() {
    current = current === 'home' ? null : 'home';
  }

  function toggleAwards() {
    current = current === 'awards' ? null : 'awards';
  }

  function clickOutsideUser() {
    if (enableClickOutsideListener) {
      ShowItemsBar.set(false);
    }
  }

  function openItemsBar() {
    ShowItemsBar.set(true);
  }

  async function goHome(id) {
    if (typeof id === 'string') {
      HistoryTracker.switchScene(
        ManageSession.currentScene,
        'DefaultUserHome',
        id,
      );
    } else if ($ShowItemsBar) {
      HistoryTracker.switchScene(
        ManageSession.currentScene,
        'DefaultUserHome',
        ManageSession.userProfile.id,
      );
    }
  }

  async function goApp(App) {
    // HistoryTracker.pauseSceneStartApp(ManageSession.currentScene, App)
    if (isValidApp(App)) CurrentApp.set(App);
  }
</script>

<!-- {#if $Profile}
  <h1>FOUND PROFILE, {$Profile.url}</h1>
{:else}
  <h2>No profile found</h2>
{/if} -->

{#if $location !== '/login' && !$ShowItemsBar}
  <div id="itemsButton" transition:fade>
    <button on:click="{openItemsBar}" class="avatar">
      <img src="{$Profile.url}" alt="{$Profile.username}" />
    </button>
  </div>
{/if}

{#if $ShowItemsBar}
  <div
    class="itemsbar"
    id="currentUser"
    use:clickOutside
    on:click_outside="{clickOutsideUser}"
    transition:fade="{{ duration: 40 }}"
  >
    <div class="left">
      <button on:click="{toggleHome}" class="avatar">
        <img src="{$Profile.url}" alt="{$Profile.username}" />
      </button>

      <button
        on:click="{() => {
          goHome();
        }}"
        class="avatar"
      >
        <img src="{userHouseUrl}" alt="My Home" />
      </button>

      <button on:click="{toggleAwards}">
        <img
          class="icon"
          src="assets/SHB/svg/AW-icon-achievement.svg"
          alt="Toggle Awards"
        />
      </button>

      <button on:click="{toggleAddressBook}">
        <img
          class="icon"
          src="assets/SHB/svg/AW-icon-addressbook-vert.svg"
          alt="Toggle Address book"
        />
      </button>

      <button on:click="{toggleFriends}">
        <img
          class="icon"
          src="assets/SHB/svg/AW-icon-friend.svg"
          alt="Toggle Friends"
        />
      </button>

      <button
        on:click="{() => {
          toggleLiked();
          goApp('drawing');
        }}"
      >
        <img
          class="icon"
          src="assets/SHB/svg/AW-icon-drawing.svg"
          alt="Start drawing!"
        />
      </button>

      <button
        on:click="{() => {
          goApp('stopmotion');
        }}"
      >
        <img
          class="icon"
          src="assets/SHB/svg/AW-icon-animation.svg"
          alt="Start stop motion!"
        />
      </button>

      <button on:click="{toggleLiked}">
        <img
          class="icon"
          src="assets/SHB/svg/AW-icon-heart-full-red.svg"
          alt="Toggle liked"
        />
      </button>

      <!-- <button
      on:click={() => {
        goApp("drawingchallenge");
        console.log("Drawing Challenge is clicked");
      }}
      class="avatar"
    >
      <h3>DC</h3></button
    > -->

      <span>-</span>
      <button on:click="{logout}">
        <img
          class="icon"
          src="assets/SHB/svg/AW-icon-exit.svg"
          alt="Log out!"
        />
      </button>
    </div>
    <div class="right">
      {#if current === 'liked'}
        <div>
          <LikedPage />
        </div>
      {:else if current === 'addressbook'}
        {#each addressbookImages as address}
          <div style="display: flex; flex-direction: row">
            <div>
              <button
                style="margin-bottom: 20px"
                on:click="{() => {
                  goHome(address.id);
                }}"
              >
                <img
                  class="addressbook-image"
                  src="{address.url}"
                  alt="{address.name}"
                />
                {address.name}
              </button>
            </div>

            <button
              on:click="{() => {
                Addressbook.delete(address.id);
              }}"
            >
              <img
                class="icon"
                src="assets/SHB/svg/AW-icon-trash.svg"
                alt="Remove from Address book"
              />
            </button>
          </div>
        {/each}
      {:else if current === 'home'}
        <ProfilePage />
      {:else if current === 'friends'}
        <FriendsPage />
      {:else if current === 'awards'}
        <Awards />
      {/if}
    </div>
  </div>
{/if}

<!-- {#if $itemsBar.playerClicked}
  <div
    on:click="{() => {
      $itemsBar.playerClicked = false;
      current = false;
    }}"
    id="backdrop"
  ></div>
{/if} -->
<style>
  * {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  .itemsbar,
  #itemsButton {
    background-color: white;
    text-align: center;
    border-radius: 50px;
    /* border: 2px solid #7300ed; */
    box-shadow: 5px 5px 0px #7300ed;
    padding: 14px 14px 14px 18px;
    position: fixed;
    z-index: 10;
    -webkit-transition: 0.01s all ease-in-out;
    -moz-transition: 0.01s all ease-in-out;
    -o-transition: 0.01s all ease-in-out;
    transition: 0.01s all ease-in-out;
    /* pointer-events: none; */
    max-height: 90vh;
    display: flex;
  }

  @media screen and (max-width: 600px) {
    #currentUser,
    #itemsButton {
      left: 3px;
      bottom: 8px;
    }
  }

  @media screen and (min-width: 600px) {
    #currentUser,
    #itemsButton {
      left: 9px;
      bottom: 9px;
    }
  }

  /* Clear button styling */
  button {
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

  .icon {
    max-width: 50px;
    height: 50px;
    float: left;
    margin-top: 5px;
  }

  #itemsButton > button > img {
    margin-top: 0px;
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

  div#right > div {
    display: flex;
    flex-direction: column;
    padding: 15px;
    overflow-y: auto;
    overscroll-behavior-y: contain;
    scroll-snap-type: y proximity;
    max-height: 80vh;
    margin: 0px;
    align-items: flex-start;
  }
  .avatar {
    height: 50px;
    width: 50px;
    overflow: hidden;
  }

  .avatar > img {
    height: 50px;
  }

  .addressbook-image {
    display: block;
    height: 50px;
    width: 50px;
  }
</style>
