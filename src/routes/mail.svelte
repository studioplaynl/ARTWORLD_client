<script>
  import { onMount } from 'svelte';

  import SceneSwitcher from './game/class/SceneSwitcher';
  import { Profile } from '../session';
  import { listAllNotifications, convertImage } from '../api';
  import {
    NOTIFICATION_ARTWORK_LIKE_RECEIVED,
    NOTIFICATION_ARTWORK_RECEIVED,
  } from '../constants';

  let messages = { notifications: [] };
  let posts = [];
  let likes = [];
  onMount(async () => {
    messages = await listAllNotifications();

    for (let i = messages.notifications.length - 1; i > 0; i--) {
      if (messages.notifications[i].code === NOTIFICATION_ARTWORK_LIKE_RECEIVED) {
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
    SceneSwitcher.switchScene('DefaultUserHome', id);
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
        <p on:click="{goHome(notification.userId)}">
          {notification.content.username}</p
        >
        <a
          href="/#/drawing?userId={notification.content
            .userId}&key={notification.content.key}"
          ><img alt="previewURL" src="{notification.content.previewUrl}" /></a
        >
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
        <p on:click="{goHome(notification.sender_id)}">
          {notification.content.username}</p
        >
        <a
          href="/#/drawing?userId={$Profile.id}&key={notification.content.key}"
        >
          <img alt="previewURL" src="{notification.previewUrl}" />
        </a>
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
</style>
