<script>
  import { onMount } from 'svelte';
  import { client, SSL } from '../../nakama.svelte';
  import { Session, Profile, Error } from '../../session';
  import {
    updateObjectAdmin,
    listAllObjects,
    deleteObjectAdmin,
    convertImage,
  } from '../../helpers/nakamaHelpers';
  import { dlog } from '../../helpers/debugLog';

  const verboseLogging = false;
  const socket = client.createSocket(SSL, verboseLogging);
  let AllUsers = [];
  let status = 'left';
  const locations = ['lab', 'home', 'library'];
  let selected;
  let id;

  onMount(() => {
    id = $Profile.id;
    dlog(id);
  });

  async function chat() {
    const createStatus = true;
    dlog($Profile);

    await socket.connect($Session, createStatus);

    // own join
    // var joined = await socket.rpc('join')

    // stream
    socket.onstreamdata = (streamdata) => {
      console.info('Received stream data:', streamdata);
      const data = JSON.parse(streamdata.data);
      dlog(data);
      for (const user of AllUsers) {
        if (user.user_id == data.user_id) {
          dlog('test');
          user.posX = data.posX;
          user.posY = data.posY;
        }
      }
      dlog(AllUsers);
      const newPos = AllUsers;
      AllUsers = newPos;
    };
    socket.onstreampresence = (streampresence) => {
      dlog('Received presence event for stream: %o', streampresence);

      dlog(`leaves:${streampresence.leaves}`);
      if (streampresence.leaves) {
        streampresence.leaves.forEach((left) => {
          dlog('User left: %o', left.username);
          AllUsers = AllUsers.filter((item) => item.name !== left.username);
        });
      }
      if (streampresence.joins) {
        streampresence.joins.forEach(() => {
          getUsers();
        });
      }
      dlog('all user:');
      dlog(AllUsers);
    };

    // current user array
  }

  // chat();

  export function onclick() {
    const action = 'walk'; // stop, too, move
    const opCode = 1;
    const data = `{ "action": "${action}",
              "posX": ${Math.floor(Math.random() * 100)},
              "posY": ${Math.floor(Math.random() * 100)},
              "location": "${selected}"
             }`;
    dlog(data);
    socket.rpc('move_position', data).then((rec) => {});
  }

  export async function join() {
    await socket.rpc('join', selected).then((rec) => {
      AllUsers = JSON.parse(rec.payload) || [];
      dlog(`joined ${selected}`);
      dlog('join users:');
      dlog(AllUsers);
      status = 'joined';
    });
  }

  export async function getUsers() {
    await socket.rpc('get_users', selected).then((rec) => {
      AllUsers = JSON.parse(rec.payload) || [];
      dlog('all current users in home:');
      dlog(AllUsers);
    });
  }

  export async function leave() {
    await socket.rpc('leave', selected).then((rec) => {
      dlog('left');
      AllUsers = [];
      status = 'left';
    });
  }

  export async function kill() {
    await socket.rpc('kill', selected).then((rec) => {
      dlog('left');
      AllUsers = [];
      status = 'left';
    });
  }

  socket.ondisconnect = (event) => {
    console.info('Disconnected from the server. Event:', event);
    $Error = 'Disconnected from the server.';
  };

  socket.onstatuspresence = (statusPresence) => {
    console.info('Received status presence update:', statusPresence);
  };
  socket.onstreampresence = (streamPresence) => {
    console.info('Received stream presence update:', streamPresence);
  };

  /// ///////////////////// locatie ////////////////////////
  let locatie = '',
    posX = Math.floor(Math.random() * 100),
    posY = Math.floor(Math.random() * 100),
    where,
    name,
    value = '{"posX": "123", "posY": "123"}';
    
  async function addLocation() {
    const type = where; // plaats hier de soort locatie
    const pub = true; // is het publiek zichtbaar of enkel voor de gebruiker die het creert
    // await updateObject(type, name, value, pub)
    dlog(id + type + name + value + pub);
    await updateObjectAdmin(id, type, name, value, pub);

    getUserLocations();
  }

  let whereList;
  let locationsList = [];

  async function getUserLocations() {
    locationsList = await listAllObjects(whereList);
    dlog(locationsList);
  }

  function renewObject(loc) {
    dlog(loc);
    where = loc.collection;
    name = loc.key;
    value = JSON.stringify(loc.value);
    id = loc.user_id;
  }

  /// /////////////////////// image converter /////////////////////////////

  let imgUrl = 'drawing/72c773d8-365f-409b-ae51-ec6e81e94ff9/0_2024-05-20T12_37_13_GeelKogelvis.png';
  let imgSize = '64';
  let fileFormat = 'png';
  let url;

  async function convert() {
    url = await convertImage(imgUrl, imgSize, imgSize, fileFormat);
    dlog(url);
  }
</script>

<div class="box">
  <h1>test</h1>
  <p>Status: {status}</p>

  <select bind:value="{selected}" on:change="{() => dlog(selected)}">
    {#each locations as location}
      <option value="{location}">
        {location}
      </option>
    {/each}
  </select>

  <button on:click="{join}">join</button>
  <button type="button" onclick="{leave}" aria-label="Leave">leave</button>
  <button type="button" on:click="{kill}">kill stream</button>
  <button type="button" on:click="{onclick}">move</button>
  <button type="button" on:click="{getUsers}" on:keydown="{getUsers}" tabindex="0">get Users</button>
  <h1>Your avatar:</h1>
  <p>{$Profile.user}</p>
  <h1>Other players:</h1>
  {#each AllUsers as user}
    <p>{user.name}</p>
    <img src="{user.avatar_url}" alt="User Avatar" height="100px" />
    <p>position: {user.posX} x {user.posY}</p>
  {/each}

  <h2>Create objects, eg for locations</h2>

  <label for="object-select">select object</label>
  <select bind:value="{where}">
    <option value="home">home</option>
    <option value="location">location</option>
    <option value="world">world</option>
    <option value="addressbook">addressbook</option>
  </select>
  <label for="object-name">type object name</label>
  <input type="text" bind:value="{where}" />

  <label for="value-input">value (alle keys and values need to be placed within " " to not error)</label>
  <textarea bind:value="{value}"></textarea>
  <label for="name-input">name</label>
  <input type="text" bind:value="{name}" />
  <label for="user-id-input">user_id</label>
  <input type="text" bind:value="{id}" />

  <button on:click="{addLocation(id)}">creeer</button>

  <h2>List of Objects</h2>
  <select bind:value="{whereList}">
    <option value="home">home</option>
    <option value="location">location</option>
    <option value="world">world</option>
    <option value="addressbook">addressbook</option>
  </select>
  <label for="object-name">type object name</label>
  <input type="text" bind:value="{whereList}" />

  <button on:click="{getUserLocations}">Get</button>
  {#each locationsList as location}
    <div
      class:blueBack="{location.user_id === $Session.user_id}"
      class="redBack"
    >
      <p>username: {location.username}</p>
      <p>userID: {location.user_id}</p>
      <p>name:{location.key}</p>
      <p>
        value: {JSON.stringify(location.value)}
        <button
          on:click="{async () => {
            await deleteObjectAdmin(
              location.user_id,
              location.collection,
              location.key,
            );
            getUserLocations();
          }}"
        >
          delete
        </button>
        <button
          on:click="{async () => {
            await renewObject(location);
            getUserLocations();
          }}"
        >
          update
        </button>
      </p>
    </div>
  {/each}

  <h2>Get Converted Image</h2>
  <labe>img url</labe>
  <input type="text" bind:value="{imgUrl}" />

  <input type="text" bind:value="{imgSize}" />
  <input type="text" bind:value="{fileFormat}" />
  <button on:click="{convert}">Convert</button>

  {#if url}
  <img src="{url}" alt="Image description" aria-hidden="true" />
  {/if}  
</div>

<style>
  .blueBack {
    background-color: rgba(0, 0, 255, 0.6);
    padding: 10px;
    border-radius: 5px;
  }
  .redBack {
    background-color: rgba(255, 0, 0, 0.6);
    padding: 10px;
    border-radius: 5px;
  }

  button{
    background-color: #7300ed;
  }
</style>
