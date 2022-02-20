<script>
  import {listImages, getAccount, convertImage, getObject, listAllObjects} from '../api.js';
  import { Session, Profile } from "../session.js";
  import { client } from "../nakama.svelte";
  import { _ } from 'svelte-i18n'
  import SvelteTable from "svelte-table";
  import StatusComp from "./components/statusbox.svelte"
  import DeleteComp from "./components/deleteButton.svelte"
  import NameEdit from "./components/nameEdit.svelte"

  import {Card} from "attractions"

  export let params = {}
  let useraccount
  let drawingIcon = '<img class="icon" src="assets/SHB/svg/AW-icon-square-drawing.svg" />'
  let stopMotionIcon = '<img class="icon" src="assets/SHB/svg/AW-icon-square-animation.svg" />'
  let AudioIcon = '<img class="icon" src="assets/SHB/svg/AW-icon-square-music.svg.svg" />'
  let videoIcon = '<img class="icon" src="assets/SHB/svg/AW-icon-play.svg" />'
  console.log($Session);
  let user = "",
    role = "",
    avatar_url = "",
    house_url = "",
    azc = "",
    id = null,
    art = [],
    drawings = [],
    stopMotion = [], 
    video = [],
    audio = [],
    trash = [],
    picture = [],
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
          if(v.collection == "audio"){
            return AudioIcon
          }
          if(v.collection == "video"){
            return videoIcon
          }
        },
        sortable: true,
      },
      {
        key: "voorbeeld",
        title: "voorbeeld",
        value: v => `<img src="${v.value.previewUrl}">`
      },
      {
        key: "title",
        title: "Title",
        renderComponent: {component: NameEdit, props: {isCurrentUser}}
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
      if($Profile.meta.role == "admin" ||$Profile.meta.role == "moderator" ){
        drawings = await listAllObjects("drawing",params.user)
        video = await listAllObjects("video",params.user)
        audio = await listAllObjects("audio",params.user)
        stopMotion = await listAllObjects("stopmotion",params.user)
        picture = await listAllObjects("picture",params.user)
      } else {
        drawings = await listImages("drawing",params.user, 100)
        video = await listImages("video",params.user, 100)
        audio = await listImages("audio",params.user, 100)
        stopMotion = await listImages("stopmotion",params.user, 100)
        picture = await listImages("picture",params.user, 100)
      }

      console.log(drawings)
      useraccount = await getAccount(id)
      console.log(useraccount)
      user = useraccount.username
      role = useraccount.metadata.role
      azc = useraccount.metadata.azc
      avatar_url = useraccount.url
      try {
        house_url = await getObject("home", azc, params.user)
      } catch(err) {
        console.log(err); // TypeError: failed to fetch
      }
      console.log(house_url)
      if(typeof house_url == "object"){
        house_url = await convertImage(house_url.value.url,"64")
      }else {
        house_url = ""
      }
    } else {
      CurrentUser = true;
      drawings = await listImages("drawing",$Session.user_id, 100)
      stopMotion = await listImages("stopmotion",$Session.user_id, 100)
      video = await listImages("video",$Session.user_id, 100)
      audio = await listImages("audio",$Session.user_id, 100)
      picture = await listImages("picture",$Session.user_id, 100)
      useraccount = await getAccount()
      console.log(useraccount)
      user = useraccount.username
      role = JSON.parse(useraccount.metadata).role
      azc = JSON.parse(useraccount.metadata).azc
      avatar_url = useraccount.url
      try {
        house_url = await getObject("home", azc, $Session.user_id)
      } catch(err) {
        console.log(err); // TypeError: failed to fetch
      }
      console.log(house_url)
      if(typeof house_url == "object"){
        house_url = await convertImage(house_url.value.url,"64")
      } else {
        house_url = ""
      }
    }
  
    art = [].concat(drawings)
    art = art.concat(stopMotion)
    art = art.concat(video)
    art = art.concat(audio)
    art = art.concat(picture)
    art.forEach(async (item, index) => {
      if(item.value.status === "trash"){
        trash.push(item)
        delete art[index]
      }
      if(item.value.json) item.url = item.value.json.split(".")[0]
      if(item.value.url) item.url = item.value.url.split(".")[0]
      item.value.previewUrl = await convertImage(item.value.url, "64")
      console.log(item.value.previewUrl)
      art = art;
    })

    trash = trash;
  
  }
  let promise = getUser();

</script>

<main>
  <div class="container">
    <div class="top">
        <div id="avatarDiv">
          {#if !!avatar_url}
          <a href="/#/avatar"><img id="avatar" src={avatar_url} /></a>
          {:else}
            <a href="/#/avatar/">Create avatar</a>
          {/if}
        </div>
        
      <br />
      <div class="userInfo">
        <h1> {user}</h1>
        {#if  !!useraccount && useraccount.online}
          <h3>Currently in game</h3>
        {/if}
        
        <h3>{$_('register.role')}: {$_('role.' + role)}</h3>
        <h3>{$_('register.location')}: {azc}</h3>
        <!-- <a href="/#/update">edit</a> -->
      </div>

      <div id="avatarDiv">
        {#if !!house_url}
        <a href="/#/house"><img id="house" src={house_url} /></a>
        {:else}
          <a href="/#/house/">Create house</a>
        {/if}
      </div>
    </div>
    <div class="bottom">
      <h1>kunstwerken</h1>
      <SvelteTable columns="{columns}" rows="{art}" classNameTable="profileTable"></SvelteTable>
      {#if CurrentUser}
      <h1>Prullenmand</h1>
      <SvelteTable columns="{columns}" rows="{trash}" classNameTable="profileTable"></SvelteTable>
      {/if}
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

  #avatar, #house {
    max-height: 75px;
    position: absolute;
    clip: rect(0px,60px,64px,0px);
  }
  
  #avatarDiv {
    width: 75px;
    height: 75px;
    position: static;
  }


  .bottom {
    margin: 0 auto;
    display: block;
    width: fit-content;
  }

  .top {
    margin: 0 auto;
    display: flex;
    width: max-content;
    align-items: center;
    min-width: 500px;
    justify-content: space-evenly;
    text-align: center;
  }

  .userInfo{
    display: block;
  }
 
  

</style>
