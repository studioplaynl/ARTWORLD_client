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
  console.log($Session);
  let user = "",
    role = "",
    avatar_url = "",
    azc = "",
    id = null,
    art = [],
    drawings = [], 
    trash = [];

    const columns = [
      {
        key: "Soort",
        title: "Soort",
        value: v => {
          if(v.collection == "drawing") {
            return drawingIcon
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
        renderComponent: { component: StatusComp, props: {moveToArt}}
      },
      {
        key: "Delete",drawings: DeleteComp,
        renderComponent: {component: DeleteComp, props: {removeFromTrash,moveToTrash}}
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

  async function getUser() {
    if(!!params.user){
      id = params.user
      drawings = await listImages("drawing",params.user, 10)
      let useraccount = await getAccount(id)
      console.log(useraccount)
      user = useraccount.username
      role = useraccount.metadata.role
      azc = useraccount.metadata.azc
      avatar_url = useraccount.url
    } else {
      drawings = await listImages("drawing",$Session.user_id, 10)
      let useraccount = await getAccount(id)
      console.log(useraccount)
      user = useraccount.username
      role = JSON.parse(useraccount.metadata).role
      azc = JSON.parse(useraccount.metadata).azc
      avatar_url = useraccount.url
    }

    art = [].concat(drawings)
    console.log(art)

    art.forEach((item, index) => {
      if(item.value.status === "trash"){
        trash.push(item)
        delete art[index]
      }
    })
    trash = trash;

    console.log(art)
  
  }
  let promise = getUser();

  
</script>

<main>
  <div class="flex-container">
    <div class="flex-item-left">
      <Card class="card">
      <img id="avatar" src={avatar_url} /><br />
      <a href="/#/uploadAvatar/">Create</a>
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
