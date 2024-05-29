<script>
  import { location } from 'svelte-spa-router';
  import { onDestroy } from 'svelte';
  import { fade } from 'svelte/transition';
  import {
    convertImage,
    getAccount,
    getObject,
    logout } from '../../helpers/nakamaHelpers';
  import ProfilePage from '../profile.svelte';
  import FriendsPage from '../friends.svelte';
  import LikedPage from '../liked.svelte';
  import MailPage from '../mail.svelte';
  import AppsGroup from './AppGroup.svelte';
  import { Profile, ShowItemsBar, ItemsBarCurrentView } from '../../session';
  import Awards from '../awards.svelte';
  import { Addressbook, myHome } from '../../storage';
  import { clickOutside } from '../../helpers/clickOutside';
  import {
    PlayerPos,
    PlayerLocation,
    PlayerUpdate } from '../game/playerState';

  // ItemsBarCurrentView is a store that holds the current view of the itemsbar

  let userHouseUrl;
  let userHouseObject;

  let addressbookList = [];
  let lastLengthAddressbook = 0;
  // eslint-disable-next-line no-unused-vars
  let addressbookImages = [];
  let enableclickOutsideListener = false;

  getAccount();
  myHome.get();
  // check if player is clicked
  const unsubscribeItemsBar = ShowItemsBar.subscribe(async () => {
    if (!$Profile) return;
    if ($location === '/login') return;
    enableclickOutsideListener = false;

    try {
      if (userHouseUrl === undefined) {
        /** object containing house information (position, image url) */

        // check for meta.azc because for a while there was a server bug that
        // would return azc and role instead of Azc and Role
        let profileAzc = '';
        // dlog('$Profile: ', $Profile)
        if ($Profile.meta.Azc) {
          profileAzc = $Profile.meta.Azc;
        } else if ($Profile.meta.azc) {
          profileAzc = $Profile.meta.azc;
        } else {
          profileAzc = 'GreenSquare';
        }
        // dlog('profileAzc: ', profileAzc)

        userHouseObject = await getObject('home', profileAzc, $Profile.id);

        /** convert image to small size */
        userHouseUrl = await convertImage(
          userHouseObject.value.url,
          '50',
          '50',
          'png',
        );

        // dlog('itemsbar --- userHouseUrl?', userHouseUrl);
      }
    } catch (error) {
      // console.warn('Error:', error);
    } finally {
      setTimeout(() => {
        enableclickOutsideListener = true;
      }, 500);
    }
  });

  const unsubscribeAddressBook = Addressbook.subscribe(async (value) => {
    if (lastLengthAddressbook !== value.length) {
      lastLengthAddressbook = value.length;
      addressbookImages = [];
      addressbookList = value;
      if (addressbookList.length > 0) {
        const tempArray = await Promise.all(addressbookList.map(
          (element) => getObject('home', element.value.meta?.Azc, element.value.user_id),
        ));

        const addressbookImagesPromises = tempArray.map(async (address) => ({
          name: address.value.username,
          id: address.user_id,
          url: await convertImage(address.value.url, '50', '50'),
        }));

        addressbookImages = await Promise.all(addressbookImagesPromises);
      }
    }
  });

  onDestroy(() => {
    unsubscribeItemsBar();
    unsubscribeAddressBook();
  });

  // toggle opens the itemsbar panel to reveal more functionality, the app is passed as a prop
  function toggleView(view) {
    $ItemsBarCurrentView = $ItemsBarCurrentView === view ? null : view;
  }

  function clickOutsideUser() {
    if (enableclickOutsideListener) {
      ShowItemsBar.set(false);
    }
  }

  function openItemsBar() {
    ShowItemsBar.set(true);
  }

  async function goHome() {
    if ($ShowItemsBar) {
      // place user next to nameplate of home
      const playerPosX = userHouseObject.value.posX - 80;
      const playerPosY = userHouseObject.value.posY - 100;

      PlayerLocation.set({
        scene: userHouseObject.key,
        // house: ManageSession.userProfile.id,
      });

      PlayerUpdate.set({ forceHistoryReplace: false });
      PlayerPos.set({
        x: playerPosX,
        y: playerPosY,
      });
    }
  }

  async function doLogout() {
    ItemsBarCurrentView.set('');
    await logout();
  }
</script>

<!-- the itemsbar with the avatar as the image -->
{#if $location !== '/login' && !$ShowItemsBar}
  <div id="itemsButton">
    <button on:click="{openItemsBar}" class="avatar">
      <img src="{$Profile.url}" alt="{$Profile.username}" />
    </button>
  </div>
{/if}

<!-- open and close the itemsbar -->
{#if $ShowItemsBar}
  <div
    class="itemsbar"
    id="currentUser"
    use:clickOutside
    on:click_outside="{clickOutsideUser}"
    transition:fade="{{ duration: 40 }}"
  >

    <!-- the left part of the items bar, either folds out or opens an app -->
    <div class="left-column-itemsbar">

      <!-- opens panel with edit avatar, edit home, see all artworks -->
      <button on:click={() => toggleView('profilePage')} class="avatar">
        <img src="{$Profile.url}" alt="{$Profile.username}" />
      </button>

      <!-- first item above avatar: home image, takes user next to the house -->
      <button on:click="{() => { goHome(); }}" class="home"> <img src="{$myHome.url}" alt="My Home" /> </button>

      <button on:click={() => toggleView('awards')}>
        <img
          class="icon"
          src="assets/SHB/svg/AW-icon-achievement.svg"
          alt="Toggle Awards"
        />
      </button>

      <button on:click={() => toggleView('mail')}>
        <img
          class="icon"
          src="assets/SHB/svg/AW-icon-post.svg"
          alt="Toggle mailbox"
        />
      </button>

      <button on:click={() => toggleView('friends')}>
        <img
          class="icon"
          src="assets/SHB/svg/AW-icon-friend.svg"
          alt="Toggle Friends"
        />
      </button>

      <button
       on:click={() => toggleView('appsGroup')}>
      <img
          class="icon"
          src="/assets/svg/apps/appsgroup-icon-round2.svg"
          alt="open app containter"
        />
      </button>

      <button on:click={() => toggleView('liked')}>
        <img
          class="icon"
          src="assets/SHB/svg/AW-icon-heart-full-red.svg"
          alt="Toggle liked"
        />
      </button>

      <span>-</span>

      <button on:click="{doLogout}">
        <img
          class="icon"
          src="assets/SHB/svg/AW-icon-exit.svg"
          alt="Log out!"
        />
      </button>
    </div>
    <div class="right-column-itemsbar">
      {#if $ItemsBarCurrentView === 'liked'}
        <div>
          <LikedPage />
        </div>
      {:else if $ItemsBarCurrentView === 'mail'}
        <MailPage />
      {:else if $ItemsBarCurrentView === 'profilePage'}
        <ProfilePage />
      {:else if $ItemsBarCurrentView === 'friends'}
        <FriendsPage />
      {:else if $ItemsBarCurrentView === 'awards'}
        <Awards />
      {:else if $ItemsBarCurrentView === 'appsGroup'}
        <AppsGroup />
      {/if}
    </div>
  </div>
{/if}

<style>
  * {
    user-select: none;
  }

  .itemsbar,
  #itemsButton {
    background-color: white;
    text-align: center;
    border-radius: 40px;
    box-shadow: 5px 5px 0px #7300ed;
    padding: 14px 14px 14px 18px;
    position: fixed;
    z-index: 10;
    transition: 0.01s all ease-in-out;
    max-height: 80vh;
    display: flex;
  }

  #itemsButton {
    border-radius: 50%;
  }

  #currentUser,
  #itemsButton {
    left: 16px;
    bottom: 16px;
  }

  button {
    border: 0;
    background: transparent;
    cursor: pointer;
    border-radius: 0;
    appearance: none;
    padding: 0;
    margin: 0;
  }

  .icon {
    max-width: 40px;
    height: 40px;
    float: left;
    margin-top: 5px;
  }

  #itemsButton button,
  .avatar,
  .home {
    height: 40px;
    width: 40px;
    overflow: hidden;
  }

  button:active {
    background-color: #7300ed;
    border-radius: 50%;
    /* box-shadow: 5px 5px 0px #7300ed; */
  }

  #itemsButton img {
    height: 40px;
    width: auto;
  }

  .left-column-itemsbar {
    display: flex;
    flex-wrap: nowrap;
    float: left;
    margin-right: 5px;
    justify-content: flex-start;
    flex-direction: column-reverse;
  }

  .right-column-itemsbar {
    float: left;
    overflow-x: hidden;
    overflow-y: auto;
    margin: 20px 0px;
  }

  .home {
    margin-bottom: 5px;
  }

  .home > img,
  .avatar > img {
    height: 100%;
  }
</style>
