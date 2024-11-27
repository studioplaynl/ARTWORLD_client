<script>
  import { push } from 'svelte-spa-router';
  import {
    ListAllUsers,
  } from '../helpers/nakamaHelpers';
  
  let users = [];
  let Onlineusers = [];

  // Load users similar to Admin.svelte
  ListAllUsers().then((list) => {
    list.shift();
    list.forEach((user) => {
      if (!user.meta.Azc) user.meta.Azc = 'Unknown';
    });
    users = list.filter(user => !user.online);
    Onlineusers = list.filter(user => user.online);
  });

  const drawingIcon = '<svg class="icon" viewBox="0 0 576 512"><path d="M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.3 15.2-40 0-55.2zM384 346.2V448H64V128h229.8c3.2 0 6.2-1.3 8.5-3.5l40-40c7.6-7.6 2.2-20.5-8.5-20.5H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V306.2c0-10.7-12.9-16-20.5-8.5l-40 40c-2.2 2.3-3.5 5.3-3.5 8.5z" /></svg>';
</script>

<div class="users-container">
  <section class="users-section">
    <h1>Online Users</h1>
    <div class="users-list">
      {#each Onlineusers as user}
        <div class="user-row">
          <div class="user-info">
            <p class="username">{user.name}</p>
            <p class="location">{user.meta.Azc}</p>
            <p class="last-location">Last seen: {user.meta.Location || 'Unknown'}</p>
            <p class="role">Role: {user.meta.Role || 'Unknown'}</p>
          </div>
          <button 
            class="edit-button" 
            on:click={() => push(`/update/${user.user_id}`)}
            aria-label="Edit user"
          >
            {@html drawingIcon}
          </button>
        </div>
      {/each}
    </div>
  </section>

  <section class="users-section">
    <h1>Offline Users</h1>
    <div class="users-list">
      {#each users as user}
        <div class="user-row">
          <div class="user-info">
            <p class="username">{user.name}</p>
            <p class="location">{user.meta.Azc}</p>
            <p class="last-location">Last seen: {user.meta.Location || 'Unknown'}</p>
            <p class="role">Role: {user.meta.Role || 'Unknown'}</p>
          </div>
          <button 
            class="edit-button" 
            on:click={() => push(`/update/${user.user_id}`)}
            aria-label="Edit user"
          >
            {@html drawingIcon}
          </button>
        </div>
      {/each}
    </div>
  </section>
</div>

<style>
  .users-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .users-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .users-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .user-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    gap: 1rem;
    border: 1px solid #eee;
    border-radius: 8px;
  }

  .user-info {
    flex-grow: 1;
  }

  .username {
    color: #7300ed;
    font-weight: bold;
    margin: 0;
  }

  .location, .last-location, .role {
    color: #666;
    margin: 0.2rem 0;
    font-size: 0.9em;
  }

  .edit-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    color: #7300ed;
  }

  .edit-button:hover {
    opacity: 0.8;
  }

  .icon {
    width: 20px;
    height: 20px;
    fill: currentColor;
  }
</style>
