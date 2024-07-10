<script>
  import { onMount } from 'svelte';
  import { PlayerLocation, PlayerPos, PlayerUpdate } from './game/playerState';
  // import { Profile } from '../session';
  import { listAllNotifications, convertImage } from '../helpers/nakamaHelpers';
  import {
    DEFAULT_HOME,
    NOTIFICATION_ARTWORK_LIKE_RECEIVED,
    NOTIFICATION_ARTWORK_RECEIVED,
    SCENE_INFO,
    AVATAR_BASE_SIZE,
  } from '../constants';
  import { dlog } from '../helpers/debugLog';
  import ArtworkLoader from './components/ArtworkLoader.svelte';


  let messages = {
    notifications: [],
  };
  let posts = [];
  let likes = [];

  onMount(async () => {
    messages = await listAllNotifications();
    for (let i = messages.notifications.length - 1; i > 0; i--) {
      if (
        messages.notifications[i].code === NOTIFICATION_ARTWORK_LIKE_RECEIVED
      ) {
        // eslint-disable-next-line no-await-in-loop
        messages.notifications[i].previewUrl = await convertImage(
          messages.notifications[i].content.url,
        );

        likes = [...likes, messages.notifications[i]];
      }
      if (messages.notifications[i].code === NOTIFICATION_ARTWORK_RECEIVED) {
        posts = [...posts, messages.notifications[i]];
      }
    }
  });

  async function goHome(id) {
    /** We send the player to the left side of the user's home so that the artworks can be seen
    //  We set the Position after the Location
    //  when we set the position we force the urlparser to do a replace on the history and url,
    //  with PlayerUpdate.set({ forceHistoryReplace: false });
    */
    dlog('id: ', id);
    const targetScene = SCENE_INFO.find((i) => i.scene === DEFAULT_HOME);
    const PosX = -(targetScene.sizeX / 2) + (AVATAR_BASE_SIZE * 2);

    PlayerLocation.set({
      scene: DEFAULT_HOME,
      house: id,
    });

    PlayerUpdate.set({ forceHistoryReplace: false });
    PlayerPos.set({
      x: PosX,
      y: 0,
    });
  }

  function handleArtworkClick(notification) {
    goHome(notification.sender_id);
  }
</script>

<div>
  <div class="post">
    <div class="icon header">
      <img
        class="icon"
        src="assets/SHB/svg/AW-icon-post.svg"
        alt="Someone sent you an artwork"
      />
    </div>
    {#each posts as notification}
      <div class="notification">
        <div class="icon">
          <img
            class="icon"
            src="assets/SHB/svg/AW-icon-post.svg"
            alt="Someone sent you an artwork"
          />
        </div>
        <button class="font-size" on:click={() => goHome(notification.sender_id)}>
          {notification.content.username}
        </button>
        <ArtworkLoader
          row={{
            value: { previewUrl: notification.content.previewUrl },
            user_id: notification.sender_id,
            collection: 'notification'
          }}
          artClickable={true}
          on:click={() => handleArtworkClick(notification)}
        />
      </div>
    {/each}
  </div>

  <div class="likes">
    <div class="icon header">
      <img
        class="icon"
        src="assets/SHB/svg/AW-icon-heart-full-red.svg"
        alt="Someone liked your artwork"
      />
    </div>
    {#each likes as notification}
      <div class="notification">
        <div class="icon">
          <img
            class="icon"
            src="assets/SHB/svg/AW-icon-heart-full-red.svg"
            alt="Someone liked your artwork"
          />
        </div>
        <button class="font-size" type="button" on:click={() => goHome(notification.sender_id)}>
          {notification.content.username}
        </button>
        <ArtworkLoader
          row={{
            value: { previewUrl: notification.previewUrl },
            user_id: notification.sender_id,
            collection: 'notification'
          }}
          artClickable={true}
          on:click={() => handleArtworkClick(notification)}
        />
      </div>
    {/each}
  </div>
</div>

<style>
  .notification {
    display: flex;
    align-items: center;
    margin: 3px;
    border: 2px solid lightgrey;
    border-radius: 10px;
  }

  .notification img {
    width: 50px;
  }

  .icon.header .icon {
    width: 50px;
    max-width: 50px;
  }

  .icon.header {
    margin: 0 auto;
  }

  button {
    /*  purple */
    color: #7300ed;
    background-color: transparent;
    border: none;
    cursor: pointer;
    font-size: 1.5em;
    margin: 0 10px;
  }

  .font-size {
    font-size: 1em;
  }
</style>
