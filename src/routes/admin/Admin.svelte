<script>
  import { push } from 'svelte-spa-router';
  import {
    ListAllUsers,
  } from '../../helpers/nakamaHelpers';
  import { dlog } from '../../helpers/debugLog';
  import { SCENE_INFO } from '../../constants';

  let users = [];
  let Locaties = [];
  let searchTerm = '';
  let selectedRole = '';
  let selectedLocation = '';

  const drawingIcon =
    // eslint-disable-next-line max-len
    '<svg class="icon" viewBox="0 0 576 512"><path d="M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.3 15.2-40 0-55.2zM384 346.2V448H64V128h229.8c3.2 0 6.2-1.3 8.5-3.5l40-40c7.6-7.6 2.2-20.5-8.5-20.5H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V306.2c0-10.7-12.9-16-20.5-8.5l-40 40c-2.2 2.3-3.5 5.3-3.5 8.5z" /></svg>';

  ListAllUsers().then((list) => {
    list.shift();
    list.forEach((user) => {
      if (!user.meta.Azc) user.meta.Azc = 'Unknown';
      if (user.meta.azc || user.meta.role) {
        dlog('Incorrect Profile formatting!!! ', user);
      }
    });
    Locaties = getAllScenes(SCENE_INFO);
    users = list;
  });

  function getAllScenes(obj, options = {}) {
    let scenes = [];
    
    for (let key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (obj[key].scene) {
          scenes.push(options.lowercase ? obj[key].scene.toLowerCase() : obj[key].scene);
        }
        scenes = scenes.concat(getAllScenes(obj[key], options));
      }
    }
    
    return scenes;
  }

  const roles = ['admin', 'speler', 'kunstenaar', 'moderator'];

  $: filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === '' || 
      user.meta.Role === selectedRole;
    const matchesLocation = selectedLocation === '' || 
      user.meta.Azc === selectedLocation;
    
    return matchesSearch && matchesRole && matchesLocation;
  });
</script>

<div class="box">
  <h1>All Users</h1>
  
  <div class="top-controls">
    <div class="buttons">
      <a href="/#/register"><button>Add new user</button></a>
      <a href="/#/printSheet"><button>Print QR Code Sheet</button></a>
    </div>

    <div class="filters">
      <input
        type="text"
        placeholder="Search by username..."
        bind:value={searchTerm}
      />
      <select bind:value={selectedRole}>
        <option value="">All Roles</option>
        {#each roles as role}
          <option value={role}>{role}</option>
        {/each}
      </select>
      <select bind:value={selectedLocation}>
        <option value="">All Locations</option>
        {#each Locaties as location}
          <option value={location}>{location}</option>
        {/each}
      </select>
    </div>
  </div>

  <div class="user-list">
    <div class="header">
      <span>Username</span>
      <span>House Location</span>
      <span>Last Location</span>
      <span>Role</span>
      <span>Edit</span>
    </div>
    {#each filteredUsers as user}
      <div class="user-row">
        <span title={user.name}>{user.name}</span>
        <span title={user.meta.Azc}>{user.meta.Azc}</span>
        <span title={user.meta.Location || '-'}>{user.meta.Location || '-'}</span>
        <span title={user.meta.Role || '-'}>{user.meta.Role || '-'}</span>
        <span>
          <a href="/#/update/{user.user_id}">
            {@html drawingIcon}
          </a>
        </span>
      </div>
    {/each}
  </div>

  <div
    class="app-close"
    on:click={() => push('/')}
  >
    <img alt="Close" src="assets/SHB/svg/AW-icon-cross.svg" />
  </div>
</div>

<style>
  * {
    box-sizing: border-box;
  }

  h1 {
    display: inline;
  }

  button {
    background-color: #7300ed;
    float: right;
    margin: 5px;
  }

  .app-close {
    position: absolute;
    right: 15px;
    top: 15px;
    z-index: 13;
    box-shadow: 5px 5px 0px #7300ed;
    cursor: pointer;
    padding: 0;
    margin: 0;
    border-radius: 50%;
    width: 40px;
    height: 40px;
  }

  .app-close > img {
    width: 40px;
  }

  /* @media only screen and (max-width: 640px) {
    .app-close {
      top: unset;
      bottom: 120px;
    }
  } */

  .top-controls {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin: 1rem 0;
  }

  .buttons {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
  }

  .buttons button {
    background-color: #7300ed;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
  }

  .filters {
    display: flex;
    gap: 1rem;
  }

  .filters input,
  .filters select {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .user-list {
    width: 100%;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .header {
    display: grid;
    grid-template-columns: 150px 150px 150px 100px 40px;
    padding: 0.5rem;
    background: #f5f5f5;
    font-weight: bold;
    border-bottom: 1px solid #ccc;
    gap: 0.5rem;
  }

  .user-row {
    display: grid;
    grid-template-columns: 150px 150px 150px 100px 40px;
    padding: 0.35rem 0.5rem;
    border-bottom: 1px solid #eee;
    gap: 0.5rem;
  }

  .user-row:hover {
    background: #f9f9f9;
  }

  .icon {
    width: 20px;
    height: 20px;
    fill: #7300ed;
  }

  .user-row span, .header span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
    justify-self: start;
    line-height: 1.2;
    position: relative;
    cursor: default;
    min-width: 0;
    width: 100%;
  }

  .user-row span:hover::before {
    content: attr(title);
    position: absolute;
    bottom: 100%;
    left: 0;
    background: white;
    padding: 4px 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    white-space: normal;
    max-width: 200px;
    z-index: 1000;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .user-row span {
    user-select: text;
  }

  .user-row span:first-child, .header span:first-child {
    color: #7300ed;
  }
</style>
