<script>
  import { location,
    // push
  } from 'svelte-spa-router';
  import { onDestroy } from 'svelte';
  import { fade } from 'svelte/transition';
  import {
    convertImage,
    getAccount,
    getObject,
    logout,
  } from '../../helpers/nakamaHelpers';
  import ProfilePage from '../profile.svelte';
  import FriendsPage from '../friends.svelte';
  import LikedPage from '../liked.svelte';
  import MailPage from '../mail.svelte';
  import AppsGroup from './appsGroup.svelte';
  import { Profile, ShowItemsBar } from '../../session';
  import Awards from '../awards.svelte';
  import { Addressbook, myHome } from '../../storage';
  import { clickOutside } from '../../helpers/clickOutside';
  import {
    // PlayerHistory,
    PlayerPos,
    PlayerLocation,
    PlayerUpdate,
  } from '../game/playerState';

  // TODO: current moet een store worden
  // zodat de state van de itemsbar extern kan worden aangestuurd (bijvoorbeeld vanuit notificaties of vanuit de game)
  let current;
  let userHouseUrl;
  let userHouseObject;

  let addressbookList = [];
  let lastLengthAddressbook = 0;
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

  onDestroy(() => {
    unsubscribeItemsBar();
    unsubscribeAddressBook();
  });

  // toggle opens the itemsbar panel to reveal more functionality
  function toggleLiked() {
    current = current === 'liked' ? null : 'liked';
  }

  function toggleFriends() {
    current = current === 'friends' ? null : 'friends';
  }

  function toggleMailbox() {
    current = current === 'mail' ? null : 'mail';
  }

  // first item in the items bar on the bottom
  // opens the panel where the user can edit it's avatar, home and
  // see all its artworks
  function toggleProfilePage() {
    current = current === 'profilePage' ? null : 'profilePage';
  }

  function toggleAwards() {
    current = current === 'awards' ? null : 'awards';
  }

  function toggleAppGroup() {
    current = current === 'appsGroup' ? null : 'appsGroup';
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
    current = '';
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
      <button on:click="{toggleProfilePage}" class="avatar">
        <img src="{$Profile.url}" alt="{$Profile.username}" />
      </button>

      <!-- first item above avatar: home image, takes user next to the house -->
      <button
        on:click="{() => {
          goHome();
        }}"
        class="home"
      >
        <img src="{$myHome.url}" alt="My Home" />
      </button>

      <button on:click="{toggleAwards}">
        <img
          class="icon"
          src="assets/SHB/svg/AW-icon-achievement.svg"
          alt="Toggle Awards"
        />
      </button>

      <button on:click="{toggleMailbox}">
        <img
          class="icon"
          src="assets/SHB/svg/AW-icon-post.svg"
          alt="Toggle mailbox"
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
       on:click="{toggleAppGroup}">
      <img
          class="icon"
          src="/assets/svg/apps/appsgroup-icon-round2.svg"
          alt="open app containter"
        />
      </button>

      <button on:click="{toggleLiked}">
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
      {#if current === 'liked'}
        <div>
          <LikedPage />
        </div>
      {:else if current === 'mail'}
        <MailPage />
      {:else if current === 'profilePage'}
        <ProfilePage />
      {:else if current === 'friends'}
        <FriendsPage />
      {:else if current === 'awards'}
        <Awards />
      {:else if current === 'appsGroup'}
        <AppsGroup />
      {/if}
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
  .itemsbar,
  #itemsButton {
    background-color: white;
    text-align: center;
    border-radius: 40px;
    box-shadow: 5px 5px 0px #7300ed;
    padding: 14px 14px 14px 18px;
    position: fixed;
    z-index: 10;
    -webkit-transition: 0.01s all ease-in-out;
    -moz-transition: 0.01s all ease-in-out;
    -o-transition: 0.01s all ease-in-out;
    transition: 0.01s all ease-in-out;
    /* pointer-events: none; */
    max-height: 80vh;
    display: flex;
  }

  #itemsButton {
    /* Force circle */
    border-radius: 50%;
  }

  #currentUser,
  #itemsButton {
    left: 16px;
    bottom: 16px;
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
    max-width: 40px;
    height: 40px;
    float: left;
    margin-top: 5px;
  }

  #itemsButton button {
    height: 40px;
    width: 40px;
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

  .avatar {
    height: 40px;
    width: 40px;
    overflow: hidden;
    /* margin-top: 5px; */
  }

  .home {
    height: 40px;
    width: 40px;
    overflow: hidden;
    margin-bottom: 5px;
  }

  .avatar > img {
    height: 100%;
  }
</style>
