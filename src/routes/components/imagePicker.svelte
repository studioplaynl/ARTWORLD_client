<script>
  import { onMount, onDestroy } from 'svelte';
  import { Profile } from '../../session';
  import { myHome } from '../../storage';
  import Stopmotion from './stopmotion.svelte';
  import {push} from 'svelte-spa-router'
  import {
    updateObject,
    listObjects,
    setAvatar,
    convertImage,
  } from '../../api';
  import { fileURLToPath } from 'url';
  let objects = [];
  export let dataType = '';
  export let currentlySet = '';

  let image;
  let frame = 0;
  let interval;

  onMount(async () => {
    objects = await listObjects(dataType, Profile.userID, 100);

    for (let index = 0; index < objects.length; index++) {
      if (typeof objects[index].value.previewUrl !== 'string') {
        objects[index].value.previewUrl = await convertImage(
          objects[index].value.url,
          '128',
          '1000',
          'png',
        );
      }
    }
    console.log(objects);

    // get type avatar or house
    // get list of objects
    //listObjects(type, userID, lim)
    // show objects
  });

  async function save(object) {
    console.log('saving', object);
    if (dataType === 'avatar') {
      setAvatar(object.value.url);
      $Profile.url = object.value.previewUrl;
    }
    if (dataType === 'house') {
      myHome.create(object.value.url);
      //await setHome(object.value.url);
      // console.log(await getHome());
    }
  }
  // on click of image, saveChange
  // if avatar -> save url to Profile
  //setAvatar(avatar_url)
  // if house -> save url to home object
  //   updateObject(type, name, value, pub, userID)

  function addNew() {
    console.log('addNew');
    push('/'+dataType)
  }
</script>

<div>
  <div class="addNew" on:click="{addNew}">+</div>
  {#each objects as object, i}
    <div
      class:selected="{(object.value.url === $Profile.avatar_url &&
        dataType == 'avatar') ||
        (object.value.url === $myHome.value.url && dataType == 'house')}"
    >
      <a
        class="image"
        on:click="{() => {
          save(object);
        }}"
      >
        <Stopmotion artwork="{object.value.previewUrl}" />
      </a>
    </div>
  {/each}
  
</div>

<style>
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
