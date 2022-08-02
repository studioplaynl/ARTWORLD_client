<script>
  /** eslint-disable prefer-destructuring */
  import { getUploadURL, ListAllUsers, updateObjectAdmin } from '../../api';
  import SaveAnimation from '../components/saveAnimation.svelte';
  import { dlog } from '../game/helpers/DebugLog';

  let filesVar;
  let type;
  let name;
  let filetype;
  let value;
  let pub;
  let users = [];
  let id;

  let saving = false;
  async function getUsers() {
    users = await ListAllUsers();
    dlog(users);
  }
  getUsers();

  function checkFileType() {
    const ext = filetype.toLowerCase();
    if (type === 'audio') {
      if (ext === 'mp3' || ext === 'wav') return true;
    } else if (type === 'video') {
      if (ext === 'mpv' || ext === 'mov' || ext === 'mp4') {
        return true;
      }
    } else if (type === 'picture') {
      if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'gif') {
        return true;
      }
    }
    return false;
  }

  async function upload() {
    saving = true;
    dlog(filesVar);
    // eslint-disable-next-line prefer-destructuring
    filetype = filesVar[0].name.split('.')[1];
    if (checkFileType()) {
      const url = await getUploadURL(type, name, filetype);

      dlog(url);
      await fetch(url[0], {
        method: 'PUT',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: filesVar[0],
      });
      value = JSON.stringify({ url: url[1] });
      pub = true;
      dlog(id);
      dlog(type);
      dlog(name);
      dlog(value);
      dlog(pub);
      await updateObjectAdmin(id, type, name, value, pub);
      saving = false;
    } else {
      // eslint-disable-next-line no-alert
      alert("sorry can't upload file, use other file format");
      saving = false;
    }
  }
</script>

<div class="Form">
  <div class="container">
    <label for="userId">Username:</label>
    <select id="userId" bind:value="{id}">
      {#each users as user}
        <option value="{user.user_id}">{user.name}</option>
      {/each}
    </select>
    <label for="fileType">Filetype:</label>
    <select id="fileType" bind:value="{type}">
      <option value="picture">picture</option>
      <option value="video">Video</option>
      <option value="audio">Audio</option>
    </select>
    <label for="fileName">Name:</label>
    <input id="fileName" type="text" bind:value="{name}" />

    <label for="fileUpload">File to upload:</label>
    <input id="fileUpload" type="file" bind:files="{filesVar}" />
    <button on:click="{upload}">Upload</button>
  </div>
</div>

<SaveAnimation saving="{saving}" />

<style>
  .Form {
    max-width: 400px;
    margin: 0 auto;
  }

  /* Add padding to containers */
  .container {
    padding: 16px;
  }
</style>
