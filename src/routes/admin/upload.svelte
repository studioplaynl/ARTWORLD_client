<script>
  /** eslint-disable prefer-destructuring */
  import { getUploadURL, updateObjectAdmin } from '../../api';
  import SaveAnimation from '../components/saveAnimation.svelte';
  import UserSelect from '../components/userSelect.svelte';
  import { dlog } from '../game/helpers/DebugLog';
  import { pop } from 'svelte-spa-router';

  let filesVar;
  let type;
  let name;
  let filetype;
  let value;
  let pub;
  let items = [];
  let id;
  let user;

  let saving = false;

  function checkFileType() {
    const ext = filetype.toLowerCase();
    // if (type === 'audio') {
    //   if (ext === 'mp3' || ext === 'wav') return true;
    // } else if (type === 'video') {
    //   if (ext === 'mpv' || ext === 'mov' || ext === 'mp4') {
    //     return true;
    //   }
    // } else if (type === 'drawing' || type === 'stopmotion') {
    if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'gif') {
      return true;
    }
    // }
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
      value = JSON.stringify({ url: url[1], displayname: name });
      pub = true;
      dlog(id);
      dlog(type);
      dlog(name);
      dlog(value);
      dlog(pub);
      console.log('user', user);
      await updateObjectAdmin(user.user_id, type, name, value, pub);
      saving = false;
    } else {
      // eslint-disable-next-line no-alert
      alert("sorry can't upload file, use other file format");
      saving = false;
    }
  }
</script>

<div class="box">
  <div class="container">
    <label for="userId">Username:</label>
    <UserSelect bind:user />
    <label for="fileType">Filetype:</label>
    <select id="fileType" bind:value="{type}">
      <option value="stopmotion">stopmotion</option>
      <option value="drawing">drawing</option>
      <option value="avatar">avatar</option>
      <option value="house">house</option>
    </select>
    <label for="fileName">Name:</label>
    <input id="fileName" type="text" bind:value="{name}" />

    <label for="fileUpload">File to upload:</label>
    <input id="fileUpload" type="file" bind:files="{filesVar}" />
    <button on:click="{upload}">Upload</button>
  </div>

  <div
    class="app-close"
    on:click="{() => {
      pop();
    }}"
  >
    <img alt="Close" src="assets/SHB/svg/AW-icon-cross.svg" />
  </div>
</div>

<SaveAnimation saving="{saving}" />

<style>
  input {
    width: 100%;
  }

  .Form {
    max-width: 400px;
    margin: 0 auto;
  }

  /* Add padding to containers */
  .container {
    padding: 16px;
  }

  select {
    width: 100%;
    padding: 10px;
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

  @media only screen and (max-width: 640px) {
    .app-close {
      top: unset;
      bottom: 120px;
    }
  }
</style>
