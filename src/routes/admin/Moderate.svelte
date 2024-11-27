<script>
  import { _ } from 'svelte-i18n';
  import { push } from 'svelte-spa-router';
  import { PERMISSION_READ_PUBLIC } from '../../constants';
  import {
    convertImage,
    listAllObjects,
    deleteObjectAdmin,
    updateObjectAdmin,
  } from '../../helpers/nakamaHelpers';
  import { Profile } from '../../session';
  import StatusComp from '../components/StatusBox.svelte';
  import DeleteComp from '../components/DeleteButton.svelte';
  import DownloadComp from '../components/DownloadButton.svelte';
  import NameEdit from '../components/NameEdit.svelte';

  // const APPS = ['drawing', 'stopmotion', 'avatar', 'house'];

  let SelectedApp = 'drawing';
  let cursor;
  let history = [];
  const limit = 50;

  let useraccount;

  const drawingIcon =
    '<img class="icon" src="assets/SHB/svg/AW-icon-square-drawing.svg" />';
  const stopMotionIcon =
    '<img class="icon" src="assets/SHB/svg/AW-icon-square-animation.svg" />';
  const AudioIcon =
    '<img class="icon" src="assets/SHB/svg/AW-icon-square-music.svg.svg" />';
  const videoIcon =
    '<img class="icon" src="assets/SHB/svg/AW-icon-play.svg" />';

    let user = '',
    role = 'admin',
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
    CurrentUser,
    backActive;

  const columns = [
    'Type',
    'Preview',
    'Title',
    'Date',
    'Username',
    'Status',
    'Download',
    'Delete'
  ];

  function formatDate(timestamp) {
    const d = new Date(timestamp);
    return `${d.getHours()}:${
      d.getMinutes() < 10 ? '0' : ''
    }${d.getMinutes()} ${d.getDate() < 10 ? '0' : ''}${d.getDate()}/${
      d.getMonth() + 1
    }/${d.getFullYear()}`;
  }

  function getTypeIcon(collection) {
    switch(collection) {
      case 'drawing': return drawingIcon;
      case 'stopmotion': return stopMotionIcon;
      case 'audio': return AudioIcon;
      case 'video': return videoIcon;
      default: return '';
    }
  }

  function removeFromTrash(row) {
    deleteObjectAdmin(row.user_id, row.collection, row.key);
    const { key } = row;

    for (let i = 0; i < trash.length; i++) {
      if (!!trash[i] && trash[i].key === key) {
        delete trash[i];
        i = trash.length;
        trash = trash;
      }
    }
  }

  function moveToTrash(row) {
    const { key } = row;
    const { value } = row;
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
        trash.push(art[i]);
        art.splice(i, 1);
        i = art.length;
        trash = trash;
        art = art;
      }
    }
  }

  function moveToArt(row) {
    const { key } = row;
    const { value } = row;
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
    console.log('getArt start')
    console.log("cursor: ", cursor) // undefined at this point
    console.log("limit: ", limit) // 50
    art = [];
    trash = [];
    if (move == 'back') {
      history.pop();
      cursor = history[history.length - 1];
    }

    //  let objects = await listObjects(SelectedApp, null, limit, cursor)
    const objects = await listAllObjects(SelectedApp, undefined, limit, cursor);

    console.log('objects: ', objects)
    if (move == 'next') {
      if (Array.isArray(objects) && objects.length >= limit - 1) {
        cursor = objects[limit - 1].update_time;
        console.log('cursor: ', cursor)
        history.push(cursor);
      } else {
        cursor = undefined;
      }
    }

    if (Array.isArray(objects)) {
      objects.forEach(async (item, index) => {
        if (item.value.json) item.url = item.value.json.split('.')[0];
        if (item.value.url) item.url = item.value.url.split('.')[0];
        item.permission_read = item.permission_read === PERMISSION_READ_PUBLIC;
        item.value.previewUrl = await convertImage(item.value.url, '64', '64');
  
        if (item.value.status === 'trash') {
          trash = [...trash, item];
        } else {
          art = [...art, item];
        }
      });
      // });
    }

    backActive = history.length <= 1;
  }

  const promise = getArt('next');

  function handleChange(e) {
    SelectedApp = e;
    history = [];
    getArt('next');
  }
</script>

<div class="box">
  <h1>kunstwerken</h1>
  <div class="buttonbox">
    <button
      class:unactive="{backActive}"
      on:click="{() => {
        if (history.length > 1) getArt('back');
      }}"
    >
      &lt;
    </button>
    <button
      class:unactive="{SelectedApp !== 'drawing'}"
      on:click="{() => {
        handleChange('drawing');
      }}"
    >
      Drawing
    </button>
    <button
      class:unactive="{SelectedApp !== 'stopmotion'}"
      on:click="{() => {
        handleChange('stopmotion');
      }}"
    >
      Stopmotion
    </button>
    <button
      class:unactive="{SelectedApp !== 'avatar'}"
      on:click="{() => {
        handleChange('avatar');
      }}"
    >
      Avatar
    </button>
    <button
      class:unactive="{SelectedApp !== 'house'}"
      on:click="{() => {
        handleChange('house');
      }}"
    >
      House
    </button>

    <button
      class:unactive="{cursor == undefined}"
      on:click="{() => {
        if (cursor != undefined) getArt('next');
      }}"
    >
      &gt;
    </button>
  </div>

  <div class="art-list">
    <div class="header">
      {#each columns as column}
        <span>{column}</span>
      {/each}
    </div>

    {#each art as item}
      <div class="art-row">
        <span class="type-icon">
          {@html getTypeIcon(item.collection)}
        </span>
        <span class="preview">
          <img src={item.value.previewUrl} alt="Preview" />
        </span>
        <span class="title">
          <NameEdit 
            row={item} 
            isCurrentUser={isCurrentUser} 
          />
        </span>
        <span class="date">
          {formatDate(item.update_time)}
        </span>
        <span class="username">
          <a href="/#/profile/{item.user_id}">{item.username}</a>
        </span>
        <span class="status">
          <StatusComp 
            row={item} 
            moveToArt={moveToArt}
            isCurrentUser={isCurrentUser}
          />
        </span>
        <span class="download">
          <DownloadComp row={item} />
        </span>
        <span class="delete">
          <DeleteComp 
            row={item}
            removeFromTrash={removeFromTrash}
            moveToTrash={moveToTrash}
            isCurrentUser={isCurrentUser}
          />
        </span>
      </div>
    {/each}
  </div>

  {#if CurrentUser || $Profile.meta.Role == 'moderator' || $Profile.meta.Role == 'admin'}
    <h1>Prullenmand</h1>
    <div class="art-list">
      <div class="header">
        {#each columns as column}
          <span>{column}</span>
        {/each}
      </div>

      {#each trash as item}
        <div class="art-row">
          <span class="type-icon">
            {@html getTypeIcon(item.collection)}
          </span>
          <span class="preview">
            <img src={item.value.previewUrl} alt="Preview" />
          </span>
          <span class="title">
            <NameEdit 
              row={item} 
              isCurrentUser={isCurrentUser} 
            />
          </span>
          <span class="date">
            {formatDate(item.update_time)}
          </span>
          <span class="username">
            <a href="/#/profile/{item.user_id}">{item.username}</a>
          </span>
          <span class="status">
            <StatusComp 
              row={item} 
              moveToArt={moveToArt}
              isCurrentUser={isCurrentUser}
            />
          </span>
          <span class="download">
            <DownloadComp row={item} />
          </span>
          <span class="delete">
            <DeleteComp 
              row={item}
              removeFromTrash={removeFromTrash}
              moveToTrash={moveToTrash}
              isCurrentUser={isCurrentUser}
            />
          </span>
        </div>
      {/each}
    </div>
  {/if}

  <div class="buttonbox">
    <button
      class:unactive="{backActive}"
      on:click="{() => {
        if (history.length > 1) getArt('back');
      }}"
    >
      &lt;
    </button>
    <button
      class:unactive="{SelectedApp !== 'drawing'}"
      on:click="{() => {
        handleChange('drawing');
      }}"
    >
      Drawing
    </button>
    <button
      class:unactive="{SelectedApp !== 'stopmotion'}"
      on:click="{() => {
        handleChange('stopmotion');
      }}"
    >
      stopmotion
    </button>
    <button
      class:unactive="{SelectedApp !== 'avatar'}"
      on:click="{() => {
        handleChange('avatar');
      }}"
    >
      Avatar
    </button>
    <button
      class:unactive="{SelectedApp !== 'house'}"
      on:click="{() => {
        handleChange('house');
      }}"
    >
      House
    </button>

    <button
      class:unactive="{cursor == undefined}"
      on:click="{() => {
        if (cursor != undefined) getArt('next');
      }}"
    >
      &gt;
    </button>
  </div>
  <button
    class="app-close"
    on:click="{() => {
      push('/');
    }}"
    aria-label="Close"
  >
    <img alt="Close" src="assets/SHB/svg/AW-icon-cross.svg" />
  </button>
</div>

<style>
  .art-list {
    width: 100%;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin: 1rem 0;
  }

  .header {
    display: grid;
    grid-template-columns: 40px 64px 200px 150px 150px 80px 80px 80px;
    padding: 0.5rem;
    background: #f5f5f5;
    font-weight: bold;
    border-bottom: 1px solid #ccc;
    gap: 0.5rem;
  }

  .art-row {
    display: grid;
    grid-template-columns: 40px 64px 200px 150px 150px 80px 80px 80px;
    padding: 0.35rem 0.5rem;
    border-bottom: 1px solid #eee;
    gap: 0.5rem;
    align-items: center;
  }

  .art-row:hover {
    background: #f9f9f9;
  }

  .preview img {
    width: 64px;
    height: 64px;
    object-fit: cover;
    border-radius: 4px;
  }

  .type-icon img {
    width: 24px;
    height: 24px;
  }

  .art-row span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  button{
    background-color: #7300ed;
  }
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

  .buttonbox {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    margin: 1rem 0;
  }

  button.unactive {
    background-color: grey;
  }
</style>
