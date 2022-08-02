<script>
  import SvelteTable from 'svelte-table';
  import { push } from 'svelte-spa-router';
  import { onMount } from 'svelte';
  import {
    getAccount,
    convertImage,
    listAllObjects,
    listObjects,
  } from '../api';
  import { Session, Profile } from '../session';

  import StatusComp from './components/statusbox.svelte';
  import DeleteComp from './components/deleteButton.svelte';
  import NameEdit from './components/nameEdit.svelte';
  import Avatar from './components/avatar.svelte';
  import ArtworkLoader from './components/artworkLoader.svelte';
  import House from './components/house.svelte';

  export let params = {};
  export let userID;

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
  let azc;
  let username = '';
  let id = null;
  let art = [];
  let drawings = [];
  let stopMotion = [];
  let video = [];
  let audio = [];
  let trash = [];
  let picture = [];
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
    {
      key: 'title',
      title: '',
      renderComponent: { component: NameEdit, props: { isCurrentUser } },
    },
    // {
    //   key: "Datum",
    //   title: "",
    //   value: v => {
    //     var d = new Date(v.update_time)
    //     return d.getHours() + ":" + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes() + " " + (d.getDate() < 10 ? '0' : '') + d.getDate() + "/" + (d.getMonth()+1)
    //   },
    //   sortable: true,
    // },
    {
      key: true,
      title: '',
      class: 'iconWidth',
      renderComponent: {
        component: StatusComp,
        props: { moveToArt, isCurrentUser },
      },
    },
    {
      key: 'Delete',
      title: '',
      renderComponent: {
        component: DeleteComp,
        props: { removeFromTrash, moveToTrash, isCurrentUser },
      },
    },
  ];

  function removeFromTrash(key) {
    for (let i = 0; i < trash.length; i++) {
      if (!!trash[i] && trash[i].key == key) {
        delete trash[i];
        i = trash.length;
        trash = trash;
      }
    }
  }

  function moveToTrash(key) {
    for (let i = 0; i < art.length; i++) {
      if (!!art[i] && art[i].key == key) {
        trash.push(art[i]);
        delete art[i];
        i = art.length;
        trash = trash;
        art = art;
      }
    }
  }

  function moveToArt(key) {
    for (let i = 0; i < trash.length; i++) {
      if (!!trash[i] && trash[i].key == key) {
        art.push(trash[i]);
        delete trash[i];
        i = trash.length;
        trash = trash;
        art = art;
      }
    }
  }

  function isCurrentUser() {
    return CurrentUser;
  }

  onMount(async () => {});

  async function getUser() {
    if (!!params.user || !!userID) {
      id = params.user || userID;
      CurrentUser = false;
      if ($Profile.meta.Role == 'admin' || $Profile.meta.Role == 'moderator') {
        drawings = await listAllObjects('drawing', params.user);
        video = await listAllObjects('video', params.user);
        audio = await listAllObjects('audio', params.user);
        stopMotion = await listAllObjects('stopmotion', params.user);
        picture = await listAllObjects('picture', params.user);
      } else {
        drawings = await listObjects('drawing', params.user, 100);
        video = await listObjects('video', params.user, 100);
        audio = await listObjects('audio', params.user, 100);
        stopMotion = await listObjects('stopmotion', params.user, 100);
        picture = await listObjects('picture', params.user, 100);
      }

      console.log('attempt to get account for', id);

      useraccount = await getAccount(id);
      username = useraccount.username;

      azc = useraccount.meta.Azc;
    } else {
      CurrentUser = true;
      drawings = await listObjects('drawing', $Session.user_id, 100);
      stopMotion = await listObjects('stopmotion', $Session.user_id, 100);
      video = await listObjects('video', $Session.user_id, 100);
      audio = await listObjects('audio', $Session.user_id, 100);
      picture = await listObjects('picture', $Session.user_id, 100);
      useraccount = await getAccount();
      username = useraccount.username;

      azc = useraccount.meta.Azc;
    }

    art = [].concat(drawings);
    art = art.concat(stopMotion);
    art = art.concat(video);
    art = art.concat(audio);
    art = art.concat(picture);
    art.forEach(async (item, index) => {
      if (item.value.status === 'trash') {
        trash.push(item);
        delete art[index];
      }
      if (item.value.json) item.url = item.value.json.split('.')[0];
      if (item.value.url) item.url = item.value.url.split('.')[0];
      item.value.previewUrl = await convertImage(
        item.value.url,
        '150',
        '1000',
        'png',
      );

      art = art;
    });

    trash = trash;
    loader = false;
  }
  const promise = getUser();

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
        <Avatar showHistory="{true}" />
        <House />
      </div>
      <div class="bottom">
        <SvelteTable
          columns="{columns}"
          rows="{art}"
          classNameTable="profileTable"
          on:clickCell="{goTo}"
        />
        {#if CurrentUser}
          <img class="icon" src="assets/SHB/svg/AW-icon-trashcan.svg" />
          <SvelteTable
            columns="{columns}"
            rows="{trash}"
            classNameTable="profileTable"
          />
        {/if}
      </div>
    </div>
  </main>
{:else}
  <div class="lds-dual-ring"></div>
{/if}

<style>
  .flex-container {
    display: flex;
    flex-direction: row;
    width: 100vw;
    margin: 0 auto;
    max-width: 1100px;
  }

  .flex-item-left {
    text-align: center;
    padding: 10px;
    flex: 30%;
  }

  .flex-item-right {
    padding: 10px;
    flex: 70%;
  }

  /* Responsive layout - makes a one column-layout instead of two-column layout */
  @media (max-width: 800px) {
    .flex-container {
      flex-direction: column;
    }
  }

  #avatar,
  #house {
    width: 64px;
    height: 64px;
  }

  #avatarDiv {
    width: 75px;
    height: 75px;
    /* position: static; */
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

  .userInfo {
    display: block;
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

  /* eslint-disable-next-line svelte/valid-compile */
  .profileTable .stopmotion {
    cursor: pointer;
  }
</style>
