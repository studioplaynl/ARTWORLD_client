<script>
  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';
  import { Profile } from '../../session';
  import { myHome } from '../../storage';
  import {
    STOPMOTION_MAX_FRAMES,
    DEFAULT_PREVIEW_HEIGHT,
    STOCK_HOUSES,
    STOCK_AVATARS,
  } from '../../constants';
  import Stopmotion from './stopmotion.svelte';
  import {
    listObjects,
    deleteObject,
    setAvatar,
    convertImage,
  } from '../../api';


  let objects = [];
  export let dataType = '';

  let deleteCheck = null;

  let stockItems = [];

  onMount(async () => {
    if (dataType === 'house') stockItems = STOCK_HOUSES;
    else if (dataType === 'avatar') stockItems = STOCK_AVATARS;

    getImages();

    // get type avatar or house
    // get list of objects
    // listObjects(type, userID, lim)
    // show objects
  });

  async function getImages() {
    const files = await listObjects(dataType, $Profile.id, 100);
    objects = files.objects;
    console.log('objects', objects);

    for (let index = 0; index < objects.length; index++) {
      if (typeof objects[index].value.previewUrl !== 'string') {
        // eslint-disable-next-line no-await-in-loop
        objects[index].value.previewUrl = await convertImage(
          objects[index].value.url,
          DEFAULT_PREVIEW_HEIGHT,
          DEFAULT_PREVIEW_HEIGHT * STOPMOTION_MAX_FRAMES,
          'png',
        );
      }
    }
  }

  async function save(object) {
    if (dataType === 'avatar') {
      setAvatar(object.value.url);
      $Profile.url = object.value.previewUrl;
    }
    if (dataType === 'house') {
      myHome.create(object.value.url);
      console.log('object.value.url', object.value.url);
      //! hier moet set home nog komen

      // await setHome(object.value.url);
      // console.log(await getHome());
    }
  }
  // on click of image, saveChange
  // if avatar -> save url to Profile
  // setAvatar(avatar_url)
  // if house -> save url to home object
  //   updateObject(type, name, value, pub, userID)

  async function deleteObj(object) {
    for (let index = 0; index < objects.length; index++) {
      if (objects[index].key === object.key) {
        if (object.value.url === $Profile.avatar_url && dataType === 'avatar') {
          save({ value: { url: '/avatar/stock/avatarBlauw.png' } });
        }
        if (object.value.url === $myHome.value.url && dataType === 'house') {
          save({ value: { url: '/home/stock/portalBlauw.png' } });
        }

        console.log('deleted');
        objects.splice(index, 1);
        objects = objects;
      }
    }

    deleteObject(object.collection, object.key);
  }

  function addNew() {
    push(`/${dataType}`);
  }
</script>

<div>
  <div class="addNew" on:click="{addNew}">+</div>
  {#each objects as object, i}
    <div
      class="item"
      class:selected="{(object.value.url === $Profile.avatar_url &&
        dataType === 'avatar') ||
        (object.value.url === $myHome.value.url && dataType === 'house')}"
    >
      <p
        class="image"
        on:click="{() => {
          save(object);
        }}"
      >
        <Stopmotion artwork="{object.value.previewUrl}" />
      </p>

      {#if deleteCheck === i}
        <img
          alt="delete"
          class="icon"
          src="/assets/SHB/svg/AW-icon-trash.svg"
          on:click="{() => {
            deleteObj(object);
          }}"
        />
      {:else}
        <img
          alt="shure you want to delete?"
          class="icon"
          src="/assets/SHB/svg/AW-icon-cross.svg"
          on:click="{() => {
            deleteCheck = i;
          }}"
        />
      {/if}
        <img
          class="icon"
          alt="Edit House"
          src="/assets/SHB/svg/AW-icon-pen.svg"
          on:click="{() => {
            console.log('home', $myHome);
            // push('/house');
            if (dataType === 'house') push(`/house?userId=${$Profile.id}&key=${object.key}`);
            if (dataType === 'avatar') push(`/avatar?userId=${$Profile.id}&key=${object.key}`);
          }}"
        />
    </div>
  {/each}

  {#each stockItems as stockItem}
    <div
      class="item"
      class:selected="{(`/avatar/stock/${stockItem}` === $Profile.avatar_url &&
        dataType === 'avatar') ||
        (`/home/stock/${stockItem}` === $myHome.value.url &&
          dataType === 'house')}"
    >
      <p
        class="image"
        on:click="{() => {
          if (dataType === 'avatar') { save({ value: { url: `/avatar/stock/${stockItem}` } }); }
          if (dataType === 'house') { save({ value: { url: `/home/stock/${stockItem}` } }); }
        }}"
      >
        {#if dataType === 'house'}
          <Stopmotion artwork="assets/SHB/portal/{stockItem}" />
        {:else if dataType === 'avatar'}
          <Stopmotion artwork="assets/SHB/avatar/{stockItem}" />
        {/if}
        <!--
        avatar: `/avatar/stock/${avatar}`,
      home: `/home/stock/${house}`, -->
      </p>
    </div>
  {/each}
</div>

<style>
  .item {
    display: flex;
  }

  .selected {
    border: 2px solid #7300ed;
    border-radius: 15px;
    padding: 5px;
    margin: 5px;
  }

  .addNew {
    width: 150px;
    height: 150px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 50px;
    border-radius: 10px;
    background-color: #f0f0f0;
    padding: 5px;
    margin: 5px;
    cursor: pointer;
  }
</style>
