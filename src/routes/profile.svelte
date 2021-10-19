<script>
  import {listImages, getAccount} from '../api.js';
  import { Session } from "../session.js";
  import { client } from "../nakama.svelte";
  import { _ } from 'svelte-i18n'
  import SvelteTable from "svelte-table";
  import StatusComp from "./components/statusbox.svelte"
  import DeleteComp from "./components/deleteButton.svelte"
  import {Card} from "attractions"

  export let params = {}

  let drawingIcon = '<svg class="icon" viewBox="0 0 576 512"><path d="M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.3 15.2-40 0-55.2zM384 346.2V448H64V128h229.8c3.2 0 6.2-1.3 8.5-3.5l40-40c7.6-7.6 2.2-20.5-8.5-20.5H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V306.2c0-10.7-12.9-16-20.5-8.5l-40 40c-2.2 2.3-3.5 5.3-3.5 8.5z" /></svg>'
  let stopMotionIcon = '<svg class="icon" viewBox="0 0 24 24"><path d="M13.05 9.79L10 7.5v9l3.05-2.29L16 12zm0 0L10 7.5v9l3.05-2.29L16 12zm0 0L10 7.5v9l3.05-2.29L16 12zM11 4.07V2.05c-2.01.2-3.84 1-5.32 2.21L7.1 5.69c1.11-.86 2.44-1.44 3.9-1.62zM5.69 7.1L4.26 5.68C3.05 7.16 2.25 8.99 2.05 11h2.02c.18-1.46.76-2.79 1.62-3.9zM4.07 13H2.05c.2 2.01 1 3.84 2.21 5.32l1.43-1.43c-.86-1.1-1.44-2.43-1.62-3.89zm1.61 6.74C7.16 20.95 9 21.75 11 21.95v-2.02c-1.46-.18-2.79-.76-3.9-1.62l-1.42 1.43zM22 12c0 5.16-3.92 9.42-8.95 9.95v-2.02C16.97 19.41 20 16.05 20 12s-3.03-7.41-6.95-7.93V2.05C18.08 2.58 22 6.84 22 12z" /></svg>'
  console.log($Session);
  let user = "",
    role = "",
    avatar_url = "",
    azc = "",
    id = null,
    art = [],
    drawings = [],
    stopMotion = [], 
    trash = [],
    CurrentUser;

    const columns = [
      {
        key: "Soort",
        title: "Soort",
        value: v => {
          if(v.collection == "drawing") {
            return drawingIcon
          }
          if(v.collection == "stopmotion"){
            return stopMotionIcon
          }
        },
        sortable: true,
      },
      {
        key: "title",
        title: "Title",
        value: v => `<a href='/#/${v.value.json.split(".")[0]}'>${v.key}</a>`
      },
      {
        key: "Datum",
        title: "Datum",
        value: v => { 
          var d = new Date(v.update_time)
          return d.getHours() + ":" + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes() + " " + (d.getDate() < 10 ? '0' : '') + d.getDate() + "/" + (d.getMonth()+1)
        },
        sortable: true,
      },
      {
        key: "Zichtbaar",
        title: "Zichtbaar",
        class: 'iconWidth',
        renderComponent: { component: StatusComp, props: {moveToArt, isCurrentUser}}
      },
      {
        key: "Delete",
        title: "Delete",  
        renderComponent: {component: DeleteComp, props: {removeFromTrash,moveToTrash, isCurrentUser}}
      }
      

  ];
    
  function removeFromTrash(key) {
    for(let i = 0; i < trash.length; i++){
      if(!!trash[i] && trash[i].key == key){
        delete trash[i]
        i = trash.length
        trash = trash
      }
    }
  }

function moveToTrash(key) {
    for(let i = 0; i < art.length; i++){
      if(!!art[i] && art[i].key == key){
        console.log(art[i])
        trash.push(art[i])
        delete(art[i])
        i = art.length
        trash = trash
        art = art
      }
    }
  }


  function moveToArt(key) {
    console.log(trash)
    for(let i = 0; i < trash.length; i++){
      if(!!trash[i] && trash[i].key == key){
        art.push(trash[i])
        delete(trash[i])
        i = trash.length
        trash = trash
        art = art
      }
    }
  }

  function isCurrentUser(){
    console.log(CurrentUser)
    return CurrentUser
  }

  async function getUser() {
    if(!!params.user){
      id = params.user
      CurrentUser = false;
      drawings = await listImages("drawing",params.user, 10)
      stopMotion = await listImages("stopmotion",params.user, 10)
      let useraccount = await getAccount(id)
      console.log(useraccount)
      user = useraccount.username
      role = useraccount.metadata.role
      azc = useraccount.metadata.azc
      avatar_url = useraccount.url
    } else {
      CurrentUser = true;
      drawings = await listImages("drawing",$Session.user_id, 10)
      stopMotion = await listImages("stopmotion",$Session.user_id, 10)
      let useraccount = await getAccount()
      console.log(useraccount)
      user = useraccount.username
      role = JSON.parse(useraccount.metadata).role
      azc = JSON.parse(useraccount.metadata).azc
      avatar_url = useraccount.url
    }
  
    art = [].concat(drawings)
    art = art.concat(stopMotion)

    art.forEach((item, index) => {
      if(item.value.status === "trash"){
        trash.push(item)
        delete art[index]
      }
    })
    trash = trash;

  
  }
  let promise = getUser();

  
</script>

<main>
  <div class="flex-container">
    <div class="flex-item-left">
      <Card class="card">
      <img id="avatar" src={avatar_url} /><br />
      <a href="/#/avatar">Create</a>
      <p>{$_('register.username')}: {user}</p>
      <p>{$_('register.role')}: {$_('role.' + role)}</p>
      <p>{$_('register.location')}: {azc}</p>
      <a href="/#/">edit</a>
      </Card>
    </div>
    <div class="flex-item-right">
      <h1>Mijn kunstwerken</h1>
      <SvelteTable columns="{columns}" rows="{art}" classNameTable="profileTable"></SvelteTable>
      <h1>Prullenmand</h1>
      <SvelteTable columns="{columns}" rows="{trash}" classNameTable="profileTable"></SvelteTable>
    </div>
  </div>
</main>

<style>
  .flex-container {
    display: flex;
    flex-direction: row;
    width: 100vw;
    margin: 0 auto;
    max-width: 1100px;
  }

  .flex-item-left {
    text-align: center;
    padding: 10px;
    flex: 30%;
  }

  .flex-item-right {
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
    max-width: 150px;
  }
  
  

</style>
