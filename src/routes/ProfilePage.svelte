<script>
// @ts-nocheck

  /**
 * @file ProfilePage.svelte
 * @author Lindsey, Maarten
 *
 *  What is this file for?
 *  ======================
 *  ProfilePage.svelte displays to the user:
 *  in the items bar, more specifically the ProfilePage.svelte page
 *  username, AvatarSelector.svelte (edit avatar), HomeSelector.svelte (edit home image), list of artworks
 *
 *  The over all structure is:
 *  ItemsBar.svelte > click avatar icon > unfolds left side of itemsBar
 *  click avatar icon again > unfolds right side of itemsBar with:
 *  username, AvatarSelector.svelte (edit avatar), HomeSelector.svelte (edit home image), list of artworks
 */

  import SvelteTable from 'svelte-table';

  import { ArtworksStore, AvatarsStore } from '../storage';
  import {
    getAccount,
    convertImage,
    getObject,
    setDisplayName,
  } from '../helpers/nakamaHelpers';

  import { Session, Profile } from '../session';
  import { dlog } from '../helpers/debugLog';

  // import IconRenderer from './components/IconRenderer.svelte';
  import StatusComp from './components/VisibilityToggle.svelte';
  import DeleteComp from './components/DeleteButton.svelte';
  import PostSend from './components/PostSend.svelte';
  import AvatarSelector from './components/AvatarSelector.svelte';
  import ArtworkLoader from './components/ArtworkLoader.svelte';
  import HomeSelector from './components/HomeSelector.svelte';
  import {
    OBJECT_STATE_IN_TRASH,
    OBJECT_STATE_REGULAR,
    OBJECT_STATE_UNDEFINED,
  } from '../constants';
  import APP_VERSION from '../version_dev';
  import { hasSpecialCharacter, removeSpecialCharacters } from '../validations';

  export let params = {};
  export let userID = null;
  let avatar;
  let house;
  let columns = [];

  const drawingIcon =
    '<img class="icon" src="assets/SHB/svg/AW-icon-square-drawing.svg" />';
  const stopMotionIcon =
    '<img class="icon" src="assets/SHB/svg/AW-icon-square-animation.svg" />';
  const AudioIcon =
    '<img class="icon" src="assets/SHB/svg/AW-icon-square-music.svg.svg" />';
  const videoIcon =
    '<img class="icon" src="assets/SHB/svg/AW-icon-play.svg" />';
  const animalChallengeIcon = '<img class="icon" src="/assets/svg/apps/animalChallenge-icon.svg" />';
  const flowerChallengeIcon = '<img class="icon" src="/assets/svg/apps/flowerChallenge-icon.svg" />';

  let loader = true;
  let useraccount;
  let username = '';
  let prevUserName = '';
  let id = null;
  let CurrentUser;
  let usernameEditable = false;
  let usernameIsEditting = false;
  let store;


  // remove forbidden characters from username reactively
  $: if (hasSpecialCharacter(username)) {
    username = removeSpecialCharacters(username);
  }

  // ART that is not in trash
  $: filteredArt = $ArtworksStore.filter(
    (el) =>
      // eslint-disable-next-line implicit-arrow-linebreak
      el.value.status === OBJECT_STATE_REGULAR ||
      el.value.status === OBJECT_STATE_UNDEFINED,
  );

  // ART that is in trash
  $: deletedArt = $ArtworksStore.filter(
    (el) => el.value.status === OBJECT_STATE_IN_TRASH,
  );

  function isCurrentUser() {
    return CurrentUser;
  }

  async function loadArtworks() {
    if ($Profile.meta.Role === 'admin' || $Profile.meta.Role === 'moderator') {
      dlog('$Profile.meta.Role: ', $Profile.meta.Role);
      await ArtworksStore.loadArtworks(id);
      store = ArtworksStore;
    } else {
      await ArtworksStore.loadArtworks(id, 100);
      store = ArtworksStore;
    }
    loader = false;

    columns = [

      {
        key: 'voorbeeld',
        title: '',

        renderComponent: {
          component: ArtworkLoader,
          props: {
            artClickable: true,
          },
        },
      },
      // {
      //   key: 'title',
      //   title: '',
      //   renderComponent: { component: NameEdit, props: { isCurrentUser } },
      // },
      {
        key: 'post',
        title: '',
        renderComponent: {
          component: PostSend,
          props: {
            isCurrentUser,
          },
        },
      },
      // {
      //   key: 'Datum',
      //   title: '',
      //   value: (v) => {
      //     const d = new Date(v.update_time);
      //     eslint-disable-next-line max-len
      //     return `${d.getHours()}:${d.getMinutes() < 10 ? '0' : ''}${d.getMinutes()} ${d.getDate() < 10 ? '0' : ''}${d.getDate()}/${d.getMonth() + 1}`;
      //   },
      //   sortable: true,
      // },
      {
        key: true,
        title: '',
        class: 'iconWidth',
        renderComponent: {
          component: StatusComp,
          props: {
            store,
            isCurrentUser,
          },
        },
      },
      {
        key: 'Delete',
        title: '',
        renderComponent: {
          component: DeleteComp,
          props: {
            store,
            isCurrentUser,
          },
        },
      },
    ];
  }

  async function loadAvatars() {
    if ($Profile.meta.Role === 'admin' || $Profile.meta.Role === 'moderator') {
      await AvatarsStore.loadAvatars(id);
    } else {
      await AvatarsStore.loadAvatars(id, 100);
    }
    loader = false;
  }

  async function getUser() {
    // we get the user NAME, AVATAR and HOME
    // if display_name = '' or null then the user can set the NAME

    // TODO here we are getting user account again
    // but we should have it in $Profile
    if (!!params.user || !!userID) {
      CurrentUser = false;
      id = params.user || userID;
      useraccount = await getAccount(id);
      // username = useraccount.username;
      avatar = useraccount.url; // convertImage(useraccount.avatar_url, 150);

      try {
        house = await getObject(
          'home',
          $Profile.meta.Azc || 'GreenSquare',
          $Profile.user_id,
        );
      } catch (err) {
        dlog(err); // TypeError: failed to fetch
      }
      if (typeof house === 'object') {
        house = await convertImage(house.value.url, '150', '150');
      } else {
        house = '';
      }
      // TODO here we are getting user account again
    // but we should have it in $Profile
    } else {
      CurrentUser = true;
      id = $Session.user_id;
      useraccount = await getAccount();
    }

    // we check if the user has a display_name
    // if not, the user can set it. The user can only set the display_name once
    if (useraccount.display_name && useraccount.display_name !== '') {
      // the user has a display_name
      usernameEditable = false;
      username = useraccount.display_name;
    } else {
      // the user does not have a display_name
      // we show username (userxx)
      // the user can set the display_name
      usernameEditable = true;
      username = useraccount.username;
      //
      /*
      The user can only change the name once
      the admin can put the username is a changeable state by making the display_name ''

      1. edit button
      2. confirm button
      3. cancel button

      */
    }
    // prevUserName to be able to cancel the edit of the username
    prevUserName = username;
    loadArtworks();
    loadAvatars();
  }

  getUser();

  // loadArtworks();

  // function goTo(evt) {
  //   if (evt.detail.key === 'voorbeeld' && evt.detail.row.value) {
  //     push(
  //       `/${evt.detail.row.collection}?userId=${evt.detail.row.user_id}&key=${evt.detail.row.key}`,
  //     );
  //   }
  // }
</script>

{#if !loader}
  <main>
    <div class="profilePageContainer">

      <!-- user name, avatar picker, house picker -->
      <div class="profilePage-top">
        <br />
        <br />
        <!-- username that can be edited if it has not been set before -->
        {#if usernameEditable && !usernameIsEditting}
        <!-- the username is editable: show pen icon on the right -->
          <div class="usernameEditable">
            <div class="userName">
              <h2>{username}</h2>
            </div>
            <!-- <div class="icon"> -->
              <img
                alt="edit display name"
                class="icon"
                src="/assets/SHB/svg/AW-icon-pen.svg"
                on:click="{() => {
                  usernameIsEditting = true;
                }}"
              />
            <!-- </div> end div class='icon' -->
          </div> <!-- end div class='usernameEditable' -->

          {:else if usernameEditable && usernameIsEditting}
          <!-- the pen icon is pressed: user can change display_name -->
          <div class="usernameEditable">
            <div class="userName">
              <!-- <h1>{username}</h1> -->
              <input type="text" bind:value="{username}" />
            </div>

            <!-- <div class="icon"> -->
            <img
              alt="save display name"
              class="icon"
              src="/assets/SHB/svg/AW-icon-check.svg"
              on:click="{() => {
                setDisplayName(username);
                usernameIsEditting = false;
                usernameEditable = false;
              }}"
            />

            <img
              alt="cancel edit display name"
              class="icon"
              src="/assets/SHB/svg/AW-icon-trash.svg"
              on:click="{() => {
                username = prevUserName;
                usernameIsEditting = false;
              }}"
            />
            <!-- </div> end div class='icon' -->
          </div> <!-- end div class='usernameEditable' -->

        {:else}
          <h1>{username}</h1>
        {/if}
      <br />

<!-- avatar picker, house picker -->
        {#if CurrentUser}
          <span class="splitter"></span>
          <br />
          <AvatarSelector showHistory="{true}" />
          <span class="splitter"></span>
          <br />
          <HomeSelector />
        {:else}
          <span class="splitter"></span>
          <img src="{avatar}" alt="avatar" />
          <span class="splitter"></span>
          <img src="{house}" alt="avatar" />
        {/if}
      </div>

<!-- list of artworks, and trash can -->
      <div class="profilePage-bottom">
        <!-- list of artworks with send mail, visibility and delete buttons -->
        <SvelteTable
          columns="{columns}"
          rows="{filteredArt}"
          classNameTable="profileTable"
        />
        <!-- artworks in the trash -->
        {#if CurrentUser && deletedArt.length}
          <img
            class="icon"
            src="assets/SHB/svg/AW-icon-trashcan.svg"
            alt="Trash can"
          />
          <SvelteTable
            columns="{columns}"
            rows="{deletedArt}"
            classNameTable="profileTable deletedTable"
          />
        {/if}
        <p>{APP_VERSION}</p>
      </div>
    </div>
  </main>
{:else}
  <div class="lds-dual-ring"></div>
{/if}

<style>
  .usernameEditable {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-content: space-between;
    justify-content: space-between;
    align-items: center;
  }

  .userName{
    /* float: right; */
  }
  .icon {
    max-width: 4rem;
    height: 4rem;
    float: left;
    margin-left: 0.3em;
    /* margin-top: 5px; */
  }

  :global(.deletedTable tbody tr) {
    opacity: 1;
    position: relative;
  }

  /* line across deleted item in trash */
  /* :global(.deletedTable tbody tr:after) {
    content: '';
    position: absolute;
    bottom: 50%;
    height: 2px;
    left: 0;
    right: 0;
    opacity: 1;
    background-color: gray;
  } */

  .profilePage-bottom {
    margin: 0 auto;
    display: block;
    width: fit-content;
  }

  .profilePage-top {
    margin: 0 auto;
    display: flex;
    width: max-content;
    align-items: center;
    justify-content: space-evenly;
    text-align: center;
    flex-direction: column;
  }

  /* loader */
  .lds-dual-ring {
    width: 70px;
    height: 70px;
    position: relative;
    top: 40%;
  }
  .lds-dual-ring:after {
    content: ' ';
    display: block;
    width: 40px;
    height: 40px;
    margin: 8px;
    border-radius: 50%;
    border: 6px solid #7300ed;
    border-color: #7300ed transparent #7300ed transparent;
    animation: lds-dual-ring 1.2s linear infinite;
  }
  @keyframes lds-dual-ring {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .splitter {
    background-color: #7300eb;
    width: 100%;
    height: 2px;
  }
</style>
