<script>
  import { get } from 'svelte/store';
  import { PlayerPos } from "../game/playerState";
  import { HomeElements } from '../../storage';
  
  export let row;

  function placeHomeElement() {
    console.log('placeHomeElement row: ', row);
    const playerPos = get(PlayerPos);
    console.log('placeHomeElement playerPos: ', playerPos);
    const value = {
      collection: row.collection,
      key: row.key,
      displayName: row.value.displayName,
      previewUrl: row.value.previewUrl,
      url: row.value.url,
      version: row.value.version,
      posX: playerPos.x,
      posY: playerPos.y,
      rotation: 0,
      scale: 1,
      width: 512,
      height: 512
    }
    console.log('placeHomeElement value: ', value);
    const key = row.key;
    HomeElements.create(key, value);
  }
</script>

<button on:click="{placeHomeElement}">
  <img src="/assets/SHB/svg/AW-icon-previous.svg" alt="Home" />
</button>



<style>
  img{
    height: 60px;
  }
</style>