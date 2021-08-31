<script>
  import {listImages} from '../api.js';
  import { Session } from "../session.js";
  import { client } from "../nakama.svelte";
  import { _ } from 'svelte-i18n'
  import SvelteTable from "svelte-table";
  import IconBase from 'svelte-icons/components/IconBase.svelte';

  let editIcon = '<svg class="icon" viewBox="0 0 576 512"><path d="M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.3 15.2-40 0-55.2zM384 346.2V448H64V128h229.8c3.2 0 6.2-1.3 8.5-3.5l40-40c7.6-7.6 2.2-20.5-8.5-20.5H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V306.2c0-10.7-12.9-16-20.5-8.5l-40 40c-2.2 2.3-3.5 5.3-3.5 8.5z" /></svg>'
  let deleteIcon = '<svg class="icon" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" /></svg>'
  console.log($Session);
  let user = "",
    role = "",
    avatar_url = "",
    azs = "",
    drawings = [];

    const columns = [
      {
        key: "Soort",
        title: "Soort",
        value: v => v.collection,
        sortable: true,
      },
      {
        key: "title",
        title: "Title",
        value: v => v.key,
      },
      {
        key: "Datum",
        title: "Datum",
        value: v => { 
          var d = new Date(v.update_time)
          return d.getHours() + ":" + (d.getUTCMinutes()) + " " + d.getDate() + "/" + (d.getMonth()+1)
        },
        sortable: true,
      },
      {
        key: "Edit",
        title: "Edit",
        value: v => `<a href='/#/drawing?use=${v.value.json}'>${editIcon}</a>`
      },
      {
        key: "Delete",
        title: "Delete",
        value: v => `<a href='/#/delete?use=${v.value.json}'>${deleteIcon}</a>`
      }
      

  ];

  async function getAccount() {
    const account = await client.getAccount($Session);
    user = account.user.username;
    console.info(account.user.username);
    let meta = JSON.parse(account.user.metadata);
    role = meta.role;
    azs = meta.azs || null;
    let url = account.user.avatar_url
    getAvatar(url).then((url) => avatar_url = url)
    console.info(account.user);

    drawings = await listImages("drawing",$Session.user_id, 10)
    console.log(drawings)
  }

  let promise = getAccount();

  async function getAvatar(avatar_url) {
      const payload = {"url": avatar_url};
        const rpcid = "download_file";
        const fileurl = await client.rpc($Session, rpcid, payload);
        let url = fileurl.payload.url
        console.log(url)
        return url
    }

</script>

<main>
  <div class="flex-container">
    <div class="flex-item-left">
      <img id="avatar" src={avatar_url} /><br />
      <a href="/#/uploadAvatar/">Create</a>
      <p>{$_('register.username')}: {user}</p>
      <p>{$_('register.role')}: {$_('role.' + role)}</p>
      <p>{$_('register.location')}: {azs}</p>
      <a href="/#/">edit</a>
    </div>
    <div class="flex-item-right">
      <h1>Mijn kunstwerken</h1>
      <SvelteTable columns="{columns}" rows="{drawings}"></SvelteTable>
    </div>
  </div>
</main>

<style>
  .flex-container {
    display: flex;
    flex-direction: row;
    font-size: 30px;
    text-align: center;
  }

  .flex-item-left {
    background-color: #f1f1f1;
    padding: 10px;
    flex: 30%;
  }

  .flex-item-right {
    background-color: dodgerblue;
    padding: 10px;
    flex: 70%;
  }

  /* Responsive layout - makes a one column-layout instead of two-column layout */
  @media (max-width: 800px) {
    .flex-container {
      flex-direction: column;
    }
  }

  #avatar {
    width: 50%;
    max-width: 250px;
  }

  

</style>
