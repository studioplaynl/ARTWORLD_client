<script>
  /**
 * @file profile.svelte
 * @author Lindsey, Maarten
 *
 *  What is this file for?
 *  ======================
 *  profile.svelte displays to the user:
 *  in the items bar, more specifically the profile.svelte page
 *  username, avatar.svelte (edit avatar), house.svelte (edit home image), list of artworks
 *
 *  The over all structure is:
 *  itemsBar.svelte > click avatar icon > unfolds left side of itemsBar
 *  click avatar icon again > unfolds right side of itemsBar with:
 *  username, avatar.svelte (edit avatar), house.svelte (edit home image), list of artworks
 */

  import SvelteTable from 'svelte-table';
  import { push } from 'svelte-spa-router';

  import { ArtworksStore, AvatarsStore } from '../storage';
  import {
    getAccount,
    convertImage,
    getObject,
    setDisplayName,
  } from '../helpers/nakamaHelpers';

  import { Session, Profile } from '../session';
  import { dlog } from '../helpers/debugLog';

  import StatusComp from './components/statusbox.svelte';
  import DeleteComp from './components/deleteButton.svelte';
  import postSend from './components/postSend.svelte';
  import Avatar from './components/avatar.svelte';
  import ArtworkLoader from './components/artworkLoader.svelte';
  import House from './components/house.svelte';
  import {
    OBJECT_STATE_IN_TRASH,
    OBJECT_STATE_REGULAR,
    OBJECT_STATE_UNDEFINED,
    APP_VERSION_INFO,
  } from '../constants';
  import { hasSpecialCharacter, removeSpecialCharacters } from '../validations';

  export let params = {};
  export let userID = null;
  let avatar;
  let house;

  const drawingIcon =
    '<img class="icon" src="assets/SHB/svg/AW-icon-square-drawing.svg" />';
  const stopMotionIcon =
    '<img class="icon" src="assets/SHB/svg/AW-icon-square-animation.svg" />';
  const AudioIcon =
    '<img class="icon" src="assets/SHB/svg/AW-icon-square-music.svg.svg" />';
  const videoIcon =
    '<img class="icon" src="assets/SHB/svg/AW-icon-play.svg" />';

  let loader = true;
  let useraccount;
  let username = '';
  let prevUserName = '';
  let id = null;
  let CurrentUser;
  let usernameEditable = false;
  let usernameIsEditting = false;

  const columns = [
    {
      key: 'Soort',
      title: '',
      value: (v) => {
        if (v.collection === 'drawing') {
          return drawingIcon;
        }
        if (v.collection === 'stopmotion') {
          return stopMotionIcon;
        }
        if (v.collection === 'audio') {
          return AudioIcon;
        }
        if (v.collection === 'video') {
          return videoIcon;
        }
        return null;
      },
      sortable: true,
    },
    {
      key: 'voorbeeld',
      title: '',

      renderComponent: {
        component: ArtworkLoader,
        props: {
          clickable: true,
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
        component: postSend,
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
          isCurrentUser,
        },
      },
    },
  ];

  // remove forbidden characters from username reactively
  $: if (hasSpecialCharacter(username)) {
    username = removeSpecialCharacters(username);
  }

  $: filteredArt = $ArtworksStore.filter(
    (el) =>
      // eslint-disable-next-line implicit-arrow-linebreak
      el.value.status === OBJECT_STATE_REGULAR ||
      el.value.status === OBJECT_STATE_UNDEFINED,
  );
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
    } else {
      await ArtworksStore.loadArtworks(id, 100);
    }
    loader = false;
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
    // we get the user NAME AVATAR and HOME
    // if display_name = '' or null then the user can set the NAME

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
    } else {
      CurrentUser = true;
      id = $Session.user_id;
      useraccount = await getAccount();
      // dlog('useraccount', useraccount);
      // username = useraccount.display_name;
      // username = useraccount.username;
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
      // TODO:
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

  function goTo(evt) {
    if (evt.detail.key === 'voorbeeld' && evt.detail.row.value) {
      push(
        `/${evt.detail.row.collection}?userId=${evt.detail.row.user_id}&key=${evt.detail.row.key}`,
      );
    }
  }
</script>

{#if !loader}
  <main>
    <div class="profilePageContainer">
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

        {#if CurrentUser}
          <span class="splitter"></span>
          <br />
          <Avatar showHistory="{true}" />
          <span class="splitter"></span>
          <br />
          <House />
        {:else}
          <span class="splitter"></span>
          <img src="{avatar}" alt="avatar" />
          <span class="splitter"></span>
          <img src="{house}" alt="avatar" />
        {/if}
      </div>
      <div class="profilePage-bottom">
        <!-- list of artworks with send mail, visibility and delete buttons -->
        <SvelteTable
          columns="{columns}"
          rows="{filteredArt}"
          classNameTable="profileTable"
          on:clickCell="{goTo}"
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
        <p>{APP_VERSION_INFO}</p>
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
    max-width: 40px;
    height: 40px;
    float: left;
    margin-left: 0.3em;
    /* margin-top: 5px; */
  }

  :global(.deletedTable tbody tr) {
    opacity: 1;
    position: relative;
  }

  :global(.deletedTable tbody tr:after) {
    content: '';
    position: absolute;
    bottom: 50%;
    height: 2px;
    left: 0;
    right: 0;
    opacity: 1;
    background-color: gray;
  }

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
