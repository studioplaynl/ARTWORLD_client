<script>
  import { onMount } from 'svelte';
  import { myHome, Profile } from '../../session';
  import {
    updateObject,
    listObjects,
    setAvatar,
    convertImage,
    setHome,
getHome,
  } from '../../api';
  let objects = [];
  export let dataType = '';
  export let currentlySet = '';

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
      await setHome(object.value.url);
      console.log(await getHome());
    }
  }
  // on click of image, saveChange
  // if avatar -> save url to Profile
  //setAvatar(avatar_url)
  // if house -> save url to home object
  //   updateObject(type, name, value, pub, userID)
</script>

<div>
  <ul>
    {#each objects as object, i}
      <li>
        <a
          on:click="{() => {
            save(object);
          }}"
        >
          <img src="{object.value.previewUrl}" alt="img{i}" />
        </a>
      </li>
    {/each}
  </ul>
</div>

<style>
</style>
