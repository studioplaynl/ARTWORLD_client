<script>
  import {listImages, getAccount, convertImage, getObject, listAllObjects} from '../api.js';
  import { Session, Profile, CurrentApp } from "../session.js";
  import { client } from "../nakama.svelte";
  import { _ } from 'svelte-i18n'
  import SvelteTable from "svelte-table";
  import StatusComp from "./components/statusbox.svelte"
  import DeleteComp from "./components/deleteButton.svelte"
  import NameEdit from "./components/nameEdit.svelte"
  import Avatar from "./components/avatar.svelte"
  import { onDestroy, onMount} from 'svelte';


  export let params = {}
  export let userID;

  let loader = true

  let useraccount
  let drawingIcon = '<img class="icon" src="assets/SHB/svg/AW-icon-square-drawing.svg" />'
  let stopMotionIcon = '<img class="icon" src="assets/SHB/svg/AW-icon-square-animation.svg" />'
  let AudioIcon = '<img class="icon" src="assets/SHB/svg/AW-icon-square-music.svg.svg" />'
  let videoIcon = '<img class="icon" src="assets/SHB/svg/AW-icon-play.svg" />'
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
    CurrentUser,
    avatar;

    const columns = [
      {
        key: "Soort",
        title: "",
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
        title: "",
        value: v => `<img src="${v.value.previewUrl}">`
      },
      {
        key: "title",
        title: "",
        renderComponent: {component: NameEdit, props: {isCurrentUser}}
      },
      // {
      //   key: "Datum",
      //   title: "",
      //   value: v => { 
      //     var d = new Date(v.update_time)
      //     return d.getHours() + ":" + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes() + " " + (d.getDate() < 10 ? '0' : '') + d.getDate() + "/" + (d.getMonth()+1)
      //   },
      //   sortable: true,
      // },
      {
        key: "Zichtbaar",
        title: "",
        class: 'iconWidth',
        renderComponent: { component: StatusComp, props: {moveToArt, isCurrentUser}}
      },
      {
        key: "Delete",
        title: "",  
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
        trash.push(art[i])
        delete(art[i])
        i = art.length
        trash = trash
        art = art
      }
    }
  }


  function moveToArt(key) {
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
    return CurrentUser
  }

  onMount(()=>{
    
  })


  async function getUser() {
    if(!!params.user || !!userID){
      id = params.user || userID
      CurrentUser = false;
      if($Profile.meta.Role == "admin" ||$Profile.meta.Role == "moderator" ){
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

      useraccount = await getAccount(id)
      user = useraccount.username
      role = useraccount.meta.Role
      azc = useraccount.meta.Azc
      console.log("azc", azc)
      avatar_url = useraccount.url
      if(!!avatar_url){
        animateScript()
      }
      
      try {
        house_url = await getObject("home", azc, params.user)
      } catch(err) {
        console.log(err); // TypeError: failed to fetch
      }
      if(typeof house_url == "object"){
        house_url = await convertImage(house_url.value.url,"64", "64")
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
      user = useraccount.username
      role = useraccount.meta.Role
      azc =  useraccount.meta.Azc
      avatar_url = useraccount.url
      if(!!avatar_url){
        animateScript()
      }
      try {
        house_url = await getObject("home", azc, $Session.user_id)
      } catch(err) {
        console.log(err); // TypeError: failed to fetch
      }
      if(typeof house_url == "object"){
        house_url = await convertImage(house_url.value.url,"64", "64")
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
      item.value.previewUrl = await convertImage(item.value.url, "128", "128")
      art = art;
    })

    trash = trash;
    loader = false
  }
  let promise = getUser();

////////// avatar
  var tID; //we will use this variable to clear the setInterval()

    function animateScript() {
      var    position = 256; //start position for the image slicer
      const  interval = 250; //100 ms of interval for the setInterval()
      tID = setInterval ( () => {
        if(avatar == undefined) return clearInterval(tID)
      avatar.style.backgroundPosition = 
      `-${position}px 0px`; 
      //we use the ES6 template literal to insert the variable "position"
      if (position < 1536)
      { position = position + 256;}
      //we increment the position by 256 each time
      else
      { position = 256; }
      //reset the position to 256px, once position exceeds 1536px
      }
      , interval ); //end of setInterval
    } //end of animateScript()

    async function goApp(App){
      $CurrentApp = App;
    }


	onDestroy(() => clearInterval(tID));
/////// end avatar
</script>

{#if !loader}
<main>
  <div class="container">
    
    <div class="top">
      <h1> {user}</h1><br>
        <!-- <div on:click="{()=>{goApp("avatar")}}"> -->
           <Avatar/>
        <!-- </div> -->
       
      <div id="avatarDiv">
        {#if !!house_url}
        <a on:click="{()=>{goApp("house")}}"><img id="house" src={house_url} /></a>
        {:else}
          <a on:click="{()=>{goApp("house")}}">Create house</a>
        {/if}
      </div>
    </div>
    <div class="bottom">

      <SvelteTable columns="{columns}" rows="{art}" classNameTable="profileTable"></SvelteTable>
      {#if CurrentUser}
      <img class="icon" src="assets/SHB/svg/AW-icon-trashcan.svg">
      <SvelteTable columns="{columns}" rows="{trash}" classNameTable="profileTable"></SvelteTable>
      {/if}
    </div>
  </div>
</main>
{:else}
<div class="lds-dual-ring"></div>
{/if}


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
    width: 64px;
    height: 64px;
  }
  
  #avatarDiv {
    width: 75px;
    height: 75px;
    /* position: static; */
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
    justify-content: space-evenly;
    text-align: center;
    flex-direction: column;
  }

  .userInfo{
    display: block;
  }
 
  /* loader */
  .lds-dual-ring {
    width: 70px;
    height: 70px;
    position: relative;
    top: 40%;
}
.lds-dual-ring:after {
  content: " ";
  display: block;
  width: 40px;
  height: 40px;
  margin: 8px;
  border-radius: 50%;
  border: 6px solid #7300ED;
  border-color: #7300ED transparent #7300ED transparent;
  animation: lds-dual-ring 1.2s linear infinite;
}
@keyframes lds-dual-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

</style>
