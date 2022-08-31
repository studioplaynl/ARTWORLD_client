<script>
  import { onMount } from 'svelte';

  import SceneSwitcher from './game/class/SceneSwitcher';
  import { Profile } from '../session';
  import { listAllNotifications, convertImage } from '../api';
  import {
    NOTIFICATION_MESSAGE_RECEIVED_WHILE_OFFLINE_OR_NOT_IN_CHANNEL,
    NOTIFICATION_FRIENDSHIP_REQUEST_RECEIVED,
    NOTIFICATION_MY_FRIENDSHIP_REQUEST_ACCEPTED,
    NOTIFICATION_MY_GROUP_REQUEST_ACCEPTED,
    NOTIFICATION_GROUP_REQUEST_RECEIVED,
    NOTIFICATION_FRIEND_JOINED_GAME,
    NOTIFICATION_SOCKET_CLOSED,
    NOTIFICATION_ARTWORK_LIKE_RECEIVED,
    NOTIFICATION_ARTWORK_RECEIVED,
    NOTIFICATION_INVITE_RECEIVED,
  } from '../constants';

  let messages = { notifications: [] };
  let posts = [];
  let likes = [];
  onMount(async () => {
    messages = await listAllNotifications();

    for (let i = messages.notifications.length - 1; i > 0; i--) {
      console.log(messages.notifications[i].code);
      if (messages.notifications[i].code === 1) {
        messages.notifications[i].previewUrl = await convertImage(
          messages.notifications[i].content.url,
        );

        likes = [...likes, messages.notifications[i]];
      }
      if (messages.notifications[i].code === 2) {
        posts = [...posts, messages.notifications[i]];
      }
    }

    console.log(posts);
    console.log(likes);
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
        <a on:click="{goHome(notification.userId)}">
          {notification.content.username}</a
        >
        <a
          href="/#/drawing?userId={notification.content
            .userId}&key={notification.content.key}"
          ><img src="{notification.content.previewUrl}" /></a
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
        <a on:click="{goHome(notification.sender_id)}">
          {notification.content.username}</a
        >
        <a
          href="/#/drawing?userId={$Profile.id}&key={notification.content.key}"
        >
          <img src="{notification.previewUrl}" />
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
