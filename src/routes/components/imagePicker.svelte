<script>
/**
 * @file imagePicker.svelte
 * @author Lindsey, Maarten
 *
 *  What is this file for?
 *  ======================
 *  imagePicker.svelte is used for pick an avatar or house
 *  it shows the available avatars and houses
 *  the player can choose one, or make a new one
 *
 *  it resides in the items bar, more specifically the ProfilePage.svelte page
 *
 *  The overall structure is:
 *  ItemsBar.svelte > click avatar icon > unfolds left side of itemsBar
 *  click avatar icon again > unfolds right side of itemsBar with:
 *  username, ArtworkLoader.svelte (edit avatar), HomeSelector.svelte (edit home image), list of artworks
 *
 *  The default is the closed state, in which a 'history' icon is present
 *  When unfolded the user can add a avatar drawing or select one from the list
 *  When unfolded IMAGEPICKER.svelte is used
 */

  import { onMount } from 'svelte';
  import { push } from 'svelte-spa-router';
  import { Profile } from '../../session';
  import { myHome } from '../../storage';
  import { dlog } from '../../helpers/debugLog';
  import {
    STOPMOTION_MAX_FRAMES,
    DEFAULT_PREVIEW_HEIGHT,
    STOCK_HOUSES,
    STOCK_AVATARS,
  } from '../../constants';
  import ArtworkLoader from './ArtworkLoader.svelte';
  import {
    listObjects,
    deleteObject,
    setAvatar,
    convertImage,
  } from '../../helpers/nakamaHelpers';
  import { PlayerHistory } from '../game/playerState';

  let objects = [];
  export let dataType = '';

  let deleteCheck = null;

  let stockItems = [];
  let houseUrl = '';

  let selectedItem = '';


  onMount(async () => {
    if (dataType === 'house') stockItems = STOCK_HOUSES;
    else if (dataType === 'avatar') stockItems = STOCK_AVATARS;

    // if the user has a home image, use that, otherwise show a placeholder
    if ($myHome.url) {
      houseUrl = $myHome.url;
    } else {
      houseUrl = '/assets/SHB/portal/' + STOCK_HOUSES[1];
    }

      getImages();
  });

  async function getImages() {
    const files = await listObjects(dataType, $Profile.id, 100);
    objects = files.objects;
    // dlog('objects', objects);

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

  async function save(object, item) {
    if (dataType === 'avatar') {
      setAvatar(object.value.url);
      $Profile.url = object.value.previewUrl;
      selectedItem = item;
    }
    if (dataType === 'house') {
      myHome.create(object.value.url);
      selectedItem = item;
    }
  }
 

  async function deleteObj(object) {
    for (let index = 0; index < objects.length; index++) {
      if (objects[index].key === object.key) {
        if (object.value.url === $Profile.avatar_url && dataType === 'avatar') {
          save({ value: { url: '/avatar/stock/avatarBlauw.png' } });
        }
        if (object.value.url === $myHome.value.url && dataType === 'house') {
          save({ value: { url: '/home/stock/portalBlauw.png' } });
        }

        dlog('deleted');
        objects.splice(index, 1);
        objects = objects;
      }
    }

    deleteObject(object.collection, object.key);
  }

  function addNew() {
    // open the relevant app
    const value = `/${dataType}`;
    push(value);
    PlayerHistory.push(value);
  }
</script>

<div>
  <button class="addNew" type="button" on:click="{addNew}" aria-label="Add New">+</button>

  {#each objects as object, i}
  <!-- show the item image and if the item is selected -->
    <div
      class="item"
      class:selected="{(object.value.url === $Profile.avatar_url &&
        dataType === 'avatar') ||
        (object.value.url === $myHome.value.url && dataType === 'house')}"
    >
    <!-- select the item when clicking on the image -->
      <button
        class="image"
        on:click="{() => {
          save(object);
        }}"
        on:keydown="{(event) => {
          if (event.key === 'Enter') {
            save(object);
          }
        }}"
      >
      <ArtworkLoader 
      row={{
        value: { previewUrl: object.value.previewUrl },
        collection: dataType,
        user_id: $Profile.id,
        key: object.key
      }}
      artClickable={false}
    />
    
      </button>

      <!-- show delete button -->
      {#if deleteCheck === i}
        <button
          class="icon"
          on:click="{() => {
            deleteObj(object);
          }}"
          on:keydown="{(event) => {
            if (event.key === 'Enter') {
              deleteObj(object);
            }
          }}"
        >
          <img alt="delete" src="/assets/SHB/svg/AW-icon-trash.svg" />
        </button>
      {:else}
        <button
          class="icon"
          on:click="{() => {
            deleteCheck = i;
          }}"
          on:keydown="{(event) => {
            if (event.key === 'Enter') {
              deleteCheck = i;
            }
          }}"
        >
          <img alt="shure you want to delete?" src="/assets/SHB/svg/AW-icon-cross.svg" />
        </button>
      {/if}

      <!-- show edit button -->
      <button
        class="icon"
        aria-label="Edit"
        on:click="{() => {
          dlog('home', $myHome);
          // push('/house');
          if (dataType === 'house') {
            const value = `/house?userId=${$Profile.id}&key=${object.key}`;
            push(value);
            PlayerHistory.push(value);
          }
          if (dataType === 'avatar') {
            const value = `/avatar?userId=${$Profile.id}&key=${object.key}`;
            push(value);
            PlayerHistory.push(value);
          }
        }}"
      >
       <img alt="edit" src="/assets/SHB/svg/AW-icon-pen.svg" />
      </button>
    </div> <!-- end of items list div class='item' -->
  {/each}

  {#each stockItems as stockItem}
<div
  class="item"

  class:selected="{stockItem === selectedItem}"
>

      <button
        class="image"
        on:click="{() => {
          if (dataType === 'avatar') {
            save({ value: { url: `/avatar/stock/${stockItem}` } }, stockItem);
          }
          if (dataType === 'house') {
            save({ value: { url: `/home/stock/${stockItem}` } }, stockItem);
          }
        }}"
      >
      {#if dataType === 'house'}
      <ArtworkLoader 
        row={{
          value: { previewUrl: `assets/SHB/portal/${stockItem}` },
          collection: 'house',
          user_id: $Profile.id,
          key: stockItem
        }}
        artClickable={false}
      />
    {:else if dataType === 'avatar'}
      <ArtworkLoader 
        row={{
          value: { previewUrl: `assets/SHB/avatar/${stockItem}` },
          collection: 'avatar',
          user_id: $Profile.id,
          key: stockItem
        }}
        artClickable={false}
      />
    {/if}
    </div>
  {/each}
</div>

<style>
  img {
    width: 30px;
    height: 30px;
  }

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
    width: 100px;
    height: 100px;
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

  button {
    border: 0;
    background: transparent;
    cursor: pointer;
    border-radius: 0;
    appearance: none;
    /* padding: 0; */
    /* margin: 0; */
    box-sizing: border-box;
  }

  button:active {
    /* background-color: white; */
    background-color: #7300ed;
    border-radius: 50%;
    /* border: 2px solid #7300ed; */
    /* box-sizing: border-box; */
    /* box-shadow: 5px 5px 0px #7300ed; */
  }
</style>
