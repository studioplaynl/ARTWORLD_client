<script>
  import { location, push } from 'svelte-spa-router';
  import { onDestroy } from 'svelte';
  import { fade } from 'svelte/transition';
  import { convertImage, getAccount, getObject, logout } from '../../helpers/api';
  import ProfilePage from '../profile.svelte';
  import FriendsPage from '../friends.svelte';
  import LikedPage from '../liked.svelte';
  import MailPage from '../mail.svelte';
  import { Profile, ShowItemsBar } from '../../session';
  import Awards from '../awards.svelte';
  import { Addressbook, myHome } from '../../storage';
  import SceneSwitcher from '../game/class/SceneSwitcher';
  import ManageSession from '../game/ManageSession';
  import { clickOutside } from '../game/helpers/ClickOutside';
  import { PlayerHistory } from '../game/playerState';

  // TODO: current moet een store worden
  // zodat de state van de itemsbar extern kan worden aangestuurd (bijvoorbeeld vanuit notificaties)
  let current;
  let userHouseUrl;
  let userHouseObject;

  let addressbookList = [];
  let lastLengthAddressbook = 0;
  let alreadySubscribedToAddressbook = false;
  let addressbookImages = [];

  let enableClickOutsideListener = false;

  getAccount();
  myHome.get();
  // check if player is clicked
  const unsubscribeItemsBar = ShowItemsBar.subscribe(async () => {
    if (!$Profile) return;
    if ($location === '/login') return;
    enableClickOutsideListener = false;

    try {
      if (userHouseUrl === undefined) {
        /** object containing house information (position, image url) */

        // check for meta.azc because for a while there was a server bug that
        // would return azc and role instead of Azc and Role
        let profileAzc = '';
        // console.log('$Profile: ', $Profile)
        if ($Profile.meta.Azc) {
          profileAzc = $Profile.meta.Azc;
        } else if ($Profile.meta.azc) {
          profileAzc = $Profile.meta.azc;
        } else {
          profileAzc = 'GreenSquare';
        }
        // console.log('profileAzc: ', profileAzc)

        userHouseObject = await getObject('home', profileAzc, $Profile.id);

        /** convert image to small size */
        userHouseUrl = await convertImage(houseObject.value.url, '50', '50', 'png');

        // console.log('itemsbar --- userHouseUrl?', userHouseUrl);
      }
    } catch (error) {
      // console.warn('Error:', error);
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
            tempArray.push(await getObject('home', element.value.meta?.Azc, element.value.user_id));

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

  function toggleMailbox() {
    current = current === 'mail' ? null : 'mail';

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
      SceneSwitcher.switchScene('DefaultUserHome', id);
    } else if ($ShowItemsBar) {
      // place user next to nameplate of home
      const playerPosX = userHouseObject.value.posX - 80;
      const playerPoxY = userHouseObject.value.posY - 100;

      const value = `/game?location=${userHouseObject.key}&x=${playerPosX}&y=${playerPoxY}`;
      push(value);
      PlayerHistory.push(value);
      // SceneSwitcher.switchScene(
      //   'DefaultUserHome',
      //   ManageSession.userProfile.id,
      // );
    }
  }
</script>

<!-- {#if $Profile}
  <h1>FOUND PROFILE, {$Profile.url}</h1>
{:else}
  <h2>No profile found</h2>
{/if} -->

{#if $location !== '/login' && !$ShowItemsBar}
  <div id="itemsButton">
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
        <img src="{$myHome.url}" alt="My Home" />
      </button>

      <button on:click="{toggleAwards}">
        <img class="icon" src="assets/SHB/svg/AW-icon-achievement.svg" alt="Toggle Awards" />
      </button>

      <button on:click="{toggleMailbox}">
        <img class="icon" src="assets/SHB/svg/AW-icon-post.svg" alt="Toggle mailbox" />
      </button>

      <button on:click="{toggleFriends}">
        <img class="icon" src="assets/SHB/svg/AW-icon-friend.svg" alt="Toggle Friends" />
      </button>

      <button
        on:click="{() => {
          // toggleLiked();
          const value = '/drawing';
          push(value);
          PlayerHistory.push(value);
        }}"
      >
        <img class="icon" src="assets/SHB/svg/AW-icon-drawing.svg" alt="Start drawing!" />
      </button>

      <button
        on:click="{() => {
          const value = '/stopmotion';
          push(value);
          PlayerHistory.push(value);
        }}"
      >
        <img class="icon" src="assets/SHB/svg/AW-icon-animation.svg" alt="Start stop motion!" />
      </button>

      <button
        on:click="{() => {
          const url = 'https://minghai.github.io/MarioSequencer/';
          const s = window.open(url, '_parent');

          if (s && s.focus) {
            s.focus();
          } else if (!s) {
            window.location.href = url;
          }

          // push('/mariosound');
          // setTimeout(() => { window.location.reload(); }, 300);
        }}"
      >
        <img class="icon" src="assets/SHB/svg/AW-icon-sound.svg" alt="Start mariosound!" />
      </button>

      <button on:click="{toggleLiked}">
        <img class="icon" src="assets/SHB/svg/AW-icon-heart-full-red.svg" alt="Toggle liked" />
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
      <button
        on:click="{() => {
          current = '';
          logout();
        }}"
      >
        <img class="icon" src="assets/SHB/svg/AW-icon-exit.svg" alt="Log out!" />
      </button>
    </div>
    <div class="right">
      {#if current === 'liked'}
        <div>
          <LikedPage />
        </div>
      {:else if current === 'mail'}
        <MailPage />
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
    border-radius: 40px;
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
    max-width: 50px;
    height: 50px;
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

  /* .right > div {
    display: flex;
    flex-direction: column;
    padding: 15px;
    overflow-y: auto;
    overscroll-behavior-y: contain;
    scroll-snap-type: y proximity;
    max-height: 80vh;
    margin: 0px;
    align-items: flex-start;
  } */
  .avatar {
    height: 50px;
    width: 50px;
    overflow: hidden;
  }

  .avatar > img {
    height: 100%;
  }

  /* .addressbook-image {
    display: block;
    height: 50px;
    width: 50px;
  } */
</style>
