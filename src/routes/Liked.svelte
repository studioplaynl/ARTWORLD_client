<script>
  import { beforeUpdate, onDestroy } from 'svelte';
  import { Liked } from '../storage';
  import { PlayerPos, PlayerLocation, PlayerUpdate } from './game/playerState';
  import ArtworkLoader from './components/ArtworkLoader.svelte';
  import ToggleLikeButton from './components/ToggleLikeButton.svelte';
  import {
    convertImage,
    getAccount,
    getObject,
  } from '../helpers/nakamaHelpers';
  import { DEFAULT_PREVIEW_HEIGHT } from '../constants';
  import { returnPartsOfArtUrl } from './game/helpers/UrlHelpers';

  let alreadysubbed = false;
  let unsubscribe;
  let lastLengthArtworks;
  let likedArtworks;
  let images = [];

  beforeUpdate(() => {
    if (!alreadysubbed) subscribeToLiked();
  });

  onDestroy(() => {
    if (unsubscribe) unsubscribe();
  });

  function subscribeToLiked() {
    unsubscribe = Liked.subscribe((value) => {
      alreadysubbed = true;

      if (lastLengthArtworks !== value.length) {
        lastLengthArtworks = value.length;
        images = [];
        likedArtworks = value;

        if (likedArtworks.length > 0) {
          likedArtworks.forEach(async (liked) => {
            if (liked.value && liked.value?.url) {
              const img = await convertImage(
                liked.value.url,
                DEFAULT_PREVIEW_HEIGHT,
              );

              images = [
                ...images,
                {
                  img,
                  url: liked.value.url,
                  collection: liked.value.collection,
                },
              ];
            }
          });
        }
      }
    });
  }

  async function handleArtworkClick(row) {
    const likedArtUrl = row.url;
    const parts = returnPartsOfArtUrl(likedArtUrl);

    if (parts === null) return;

    const { userId } = parts;
    const friendAccount = await getAccount(userId);
    const friendHomeLocation = friendAccount.meta.Azc;
    const friendHome = await getObject('home', friendHomeLocation, userId);

    PlayerLocation.set({
      scene: friendHomeLocation,
    });

    if (typeof friendHome.value.posX !== 'undefined' && typeof friendHome.value.posY !== 'undefined') {
      const playerPosX = friendHome.value.posX - 80;
      const playerPosY = friendHome.value.posY - 100;

      PlayerUpdate.set({ forceHistoryReplace: false });
      PlayerPos.set({
        x: playerPosX,
        y: playerPosY,
      });
    } else {
      PlayerUpdate.set({ forceHistoryReplace: false });
      PlayerPos.set({
        x: -80,
        y: -100,
      });
    }
  }
</script>

<div class="liked-container">
  {#each images as artwork}
    <div class="artwork-row">
      <button 
        type="button"
        class="artwork-preview"
        on:click={() => handleArtworkClick(artwork)}
        on:keydown={(e) => e.key === 'Enter' && handleArtworkClick(artwork)}
      >
        <ArtworkLoader
          row={artwork}
          artClickable={false}
        />
      </button>
      
      <ToggleLikeButton row={artwork} />
    </div>
  {/each}
</div>

<style>
  .liked-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .artwork-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem;
    border: 2px solid lightgrey;
    border-radius: 10px;
  }

  .artwork-preview {
    flex-grow: 1;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    text-align: left;
  }

  .artwork-preview:focus {
    outline: 2px solid #7300ed;
    outline-offset: -2px;
  }
</style>
