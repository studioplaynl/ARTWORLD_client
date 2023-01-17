<script>
  import { _ } from 'svelte-i18n';
  import SvelteTable from 'svelte-table';
  import { push } from 'svelte-spa-router';
  import Select from 'svelte-select';
  import {
    PERMISSION_READ_PUBLIC,
  } from '../../constants';
  import {
    getAccount,
    convertImage,
    listAllObjects,
    deleteObjectAdmin,
    updateObjectAdmin,
  } from '../../api';
 // import { APPS } from '../apps/apps'
  import { Session, Profile } from '../../session';
  import StatusComp from '../components/statusbox.svelte';
  import DeleteComp from '../components/deleteButton.svelte';
  import DownloadComp from '../components/downloadButton.svelte'
  import NameEdit from '../components/nameEdit.svelte';
  let APPS = ["drawing" , "stopmotion", "avatar", "house"]
  let SelectedApp = "drawing";
  let cursor = undefined;
  let history = []
  let limit = 50;


  let useraccount;
  const drawingIcon =
    '<img class="icon" src="assets/SHB/svg/AW-icon-square-drawing.svg" />';
  const stopMotionIcon =
    '<img class="icon" src="assets/SHB/svg/AW-icon-square-animation.svg" />';
  const AudioIcon =
    '<img class="icon" src="assets/SHB/svg/AW-icon-square-music.svg.svg" />';
  const videoIcon =
    '<img class="icon" src="assets/SHB/svg/AW-icon-play.svg" />';
  console.log($Session);
  let user = '',
    role = '',
    avatar_url = '',
    house_url = '',
    azc = '',
    id = null,
    art = [],
    drawings = [],
    stopMotion = [],
    video = [],
    audio = [],
    trash = [],
    picture = [],
    CurrentUser;

  const columns = [
    {
      key: 'Soort',
      title: 'Soort',
      value: (v) => {
        if (v.collection == 'drawing') {
          return drawingIcon;
        }
        if (v.collection == 'stopmotion') {
          return stopMotionIcon;
        }
        if (v.collection == 'audio') {
          return AudioIcon;
        }
        if (v.collection == 'video') {
          return videoIcon;
        }
      },
      sortable: true,
    },
    {
      key: 'voorbeeld',
      title: 'voorbeeld',
      value: (v) => `<img src="${v.value.previewUrl}">`,
    },
    {
      key: 'title',
      title: 'Title',
      renderComponent: { component: NameEdit, props: { isCurrentUser } },
    },
    {
      key: 'Datum',
      title: 'Datum',
      value: (v) => v.update_time,
      filterValue: (v) => v.update_time,
      renderValue: (v) => {
        const d = new Date(v.update_time);
        return `${d.getHours()}:${
          d.getMinutes() < 10 ? '0' : ''
        }${d.getMinutes()} ${d.getDate() < 10 ? '0' : ''}${d.getDate()}/${
          d.getMonth() + 1}/${
          d.getFullYear()
        }`;
      },
      sortable: true,
    },
    {
      key: 'Username',
      title: 'Username',
      value: (v) => `<a >${v.username}</a>`, // href="/#/profile/${v.user_id}"
      sortable: true,
    },
    {
      key: 'Status',
      title: 'Status',
      class: 'iconWidth',
      renderComponent: {
        component: StatusComp,
        props: { moveToArt, isCurrentUser },
      },
    },
    {
      key: 'Download',
      title: 'Download',
      renderComponent: {
        component: DownloadComp,
      },
    },
    {
      key: 'Delete',
      title: 'Delete',
      renderComponent: {
        component: DeleteComp,
        props: { removeFromTrash, moveToTrash, isCurrentUser, role },
      },
    },
  ];

  function removeFromTrash(row) {
    deleteObjectAdmin(row.user_id, row.collection, row.key);
    const key = row.key;

    for (let i = 0; i < trash.length; i++) {
      if (!!trash[i] && trash[i].key === key) {
        delete trash[i];
        i = trash.length;
        trash = trash;
      }
    }
  }

  function moveToTrash(row) {
    const key = row.key;
    const value = row.value;
    value.status = 'trash';
    updateObjectAdmin(
      row.user_id,
      row.collection,
      row.key,
      value,
      row.permission_read,
    );

    for (let i = 0; i < art.length; i++) {
      if (!!art[i] && art[i].key === key) {
        console.log(art[i]);
        trash.push(art[i]);
        art.splice(i,1);
        i = art.length;
        trash = trash;
        art = art;
      }
    }
  }

  function moveToArt(row) {
    const key = row.key;
    const value = row.value;
    value.status = '';
    updateObjectAdmin(
      row.user_id,
      row.collection,
      row.key,
      value,
      row.permission_read,
    );
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

  async function getArt(move) {
    art = [];
    trash = [];
    if(move == 'back'){
      history.pop()
      cursor = history[history.length-1]
    } else {
      history.push(cursor)
    }
    //  let objects = await listObjects(SelectedApp, null, limit, cursor)
    let objects = await listAllObjects(SelectedApp, undefined, limit, cursor)

    if(move == 'next'){
      if(typeof objects[limit-1] != 'undefined'){
        cursor = objects[limit-1].update_time
      }else {
        cursor = undefined
      }
    }
      
    art = objects 
  
    art.forEach(async (item, index) => {
      if (item.value.status === 'trash') {
        trash.push(item);
        delete art[index];
      }
      if (item.value.json) item.url = item.value.json.split('.')[0];
      if (item.value.url) item.url = item.value.url.split('.')[0];
      item.permission_read = item.permission_read === PERMISSION_READ_PUBLIC;
      item.value.previewUrl = await convertImage(item.value.url, '64', '64');
    });
    art = [...art];
    trash = [...trash];
    console.log(art)

  }
  const promise = getArt('next');
 
  function handeChange(e) {
    console.log(e.detail.value);
    SelectedApp = e.detail.value
    history = [];
    getArt('next');
  }
</script>

<div class="box">
  <h1>kunstwerken</h1>
  <Select items={APPS} value="{SelectedApp}" on:change={handeChange} clearable={false}/>
  {#if typeof cursor != "undefined"}
  <button class="next-button" on:click="{()=>{getArt('next')}}">&gt;</button>
  {/if} 
  <button class="back-button" on:click="{()=>{getArt('back')}}">&lt;</button>
  <SvelteTable columns="{columns}" rows="{art}" classNameTable="profileTable" />
  {#if CurrentUser || $Profile.meta.Role == 'moderator' || $Profile.meta.Role == 'admin'}
  {#if typeof cursor != "undefined"}
    <button class="next-button" on:click="{()=>{getArt('next')}}">&gt;</button>
  {/if} 
  <button class="back-button" on:click="{()=>{getArt('back')}}">&lt;</button>  
  <h1>Prullenmand</h1>
    <SvelteTable
      columns="{columns}"
      rows="{trash}"
      classNameTable="profileTable"
    />
  {/if}
  <button class="back-button" on:click="{()=>{getArt('back')}}">&lt;</button>
  {#if typeof cursor != "undefined"}
    <button class="next-button" on:click="{()=>{getArt('next')}}">&gt;</button>
  {/if}  
  <div
    class="app-close"
    on:click="{() => {
      push('/');
    }}"
  >
    <img alt="Close" src="assets/SHB/svg/AW-icon-cross.svg" />
  </div>
</div>

<style>
  .app-close {
    position: absolute;
    right: 15px;
    top: 15px;
    z-index: 13;
    box-shadow: 5px 5px 0px #7300ed;
    cursor: pointer;
    padding: 0;
    margin: 0;
    border-radius: 50%;
    width: 40px;
    height: 40px;
  }

  .app-close > img {
    width: 40px;
  }

  @media only screen and (max-width: 640px) {
    .app-close {
      top: unset;
      bottom: 120px;
    }
  }

  .back-button {
    width: 80px;
    float: left;
}

  .next-button {
    width: 80px;
    float: right;
}
</style>
