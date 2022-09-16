<script>
  import SvelteTable from 'svelte-table';
  import { push } from 'svelte-spa-router';
  import { ArtworksStore } from '../storage';
  import { getAccount, convertImage, getObject } from '../api';
  import { Session, Profile } from '../session';
  import { dlog } from './game/helpers/DebugLog';

  import StatusComp from './components/statusbox.svelte';
  import DeleteComp from './components/deleteButton.svelte';
  import postSend from './components/postSend.svelte';
  import Avatar from './components/avatar.svelte';
  import ArtworkLoader from './components/artworkLoader.svelte';
  import House from './components/house.svelte';
  import { OBJECT_STATE_IN_TRASH, OBJECT_STATE_REGULAR } from '../constants';

  export let params = {};
  export let userID;
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
  let id = null;
  let CurrentUser;

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

      renderComponent: { component: ArtworkLoader, props: { clickable: true } },
    },
    // {
    //   key: 'title',
    //   title: '',
    //   renderComponent: { component: NameEdit, props: { isCurrentUser } },
    // },
    {
      key: 'post',
      title: '',
      renderComponent: { component: postSend, props: { isCurrentUser } },
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

  $: filteredArt = $ArtworksStore.filter(
    (el) => el.value.status === OBJECT_STATE_REGULAR,
  );
  $: deletedArt = $ArtworksStore.filter(
    (el) => el.value.status === OBJECT_STATE_IN_TRASH,
  );

  function isCurrentUser() {
    return CurrentUser;
  }

  async function loadArtworks() {
    if ($Profile.meta.Role === 'admin' || $Profile.meta.Role === 'moderator') {
      await ArtworksStore.loadArtworks(id);
    } else {
      await ArtworksStore.loadArtworks(id, 100);
    }

    loader = false;
  }

  async function getUser() {
    if (!!params.user || !!userID) {
      CurrentUser = false;
      id = params.user || userID;
      useraccount = await getAccount(id);
      console.log('useraccount', useraccount);
      username = useraccount.username;
      avatar = useraccount.url; // convertImage(useraccount.avatar_url, 150);

      try {
        house = await getObject(
          'home',
          $Profile.meta.Azc || 'Amsterdam',
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
      username = useraccount.username;
    }

    loadArtworks();
  }

  getUser();

  // loadArtworks();

  function goTo(evt) {
    if (evt.detail.key === 'voorbeeld' && evt.detail.row.value) {
      push(
        `/${evt.detail.row.collection}/${evt.detail.row.user_id}/${evt.detail.row.key}`,
      );
    }
  }
</script>

{#if !loader}
  <main>
    <div class="container">
      <div class="top">
        <h1>{username}</h1>
        <br />

        {#if CurrentUser && deletedArt.length}
          <span class="splitter"></span>
          <Avatar showHistory="{true}" />
          <span class="splitter"></span>
          <House />
        {:else}
          <span class="splitter"></span>
          <img src="{avatar}" />
          <span class="splitter"></span>
          <img src="{house}" />
        {/if}
      </div>
      <div class="bottom">
        <SvelteTable
          columns="{columns}"
          rows="{filteredArt}"
          classNameTable="profileTable"
          on:clickCell="{goTo}"
        />
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
      </div>
    </div>
  </main>
{:else}
  <div class="lds-dual-ring"></div>
{/if}

<style>
  :global(.deletedTable tbody tr) {
    opacity: 0.6;
    position: relative;
  }

  :global(.deletedTable tbody tr:after) {
    content: '';
    position: absolute;
    bottom: 50%;
    height: 2px;
    left: 0;
    right: 0;
    opacity: 0.5;
    background-color: gray;
  }

  .bottom {
    margin: 0 auto;
    display: block;
    width: fit-content;
  }

  .top {
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
