<script>
  import {listImages, getAccount, convertImage, listAllObjects} from '../api.js';
  import { Session, Profile } from "../session.js";
  import { _ } from 'svelte-i18n'
  import SvelteTable from "svelte-table";
  import StatusComp from "./components/statusbox.svelte"
  import DeleteComp from "./components/deleteButton.svelte"
  import NameEdit from "./components/nameEdit.svelte"
  let useraccount
  let drawingIcon = '<img class="icon" src="assets/SHB/svg/AW-icon-pen.svg" />'
  let stopMotionIcon = '<svg class="icon" viewBox="0 0 24 24"><path d="M13.05 9.79L10 7.5v9l3.05-2.29L16 12zm0 0L10 7.5v9l3.05-2.29L16 12zm0 0L10 7.5v9l3.05-2.29L16 12zM11 4.07V2.05c-2.01.2-3.84 1-5.32 2.21L7.1 5.69c1.11-.86 2.44-1.44 3.9-1.62zM5.69 7.1L4.26 5.68C3.05 7.16 2.25 8.99 2.05 11h2.02c.18-1.46.76-2.79 1.62-3.9zM4.07 13H2.05c.2 2.01 1 3.84 2.21 5.32l1.43-1.43c-.86-1.1-1.44-2.43-1.62-3.89zm1.61 6.74C7.16 20.95 9 21.75 11 21.95v-2.02c-1.46-.18-2.79-.76-3.9-1.62l-1.42 1.43zM22 12c0 5.16-3.92 9.42-8.95 9.95v-2.02C16.97 19.41 20 16.05 20 12s-3.03-7.41-6.95-7.93V2.05C18.08 2.58 22 6.84 22 12z" /></svg>'
  let AudioIcon = '<svg class="icon" viewBox="0 0 24 24"><path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" /></svg>'
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
        key: "Username",
        title: "Username",
        value: v => { 
          
          return `<a href="/#/profile/${v.user_id}">${v.username}</a>`
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
    return CurrentUser
  }

  async function getArt() {
    drawings = await listAllObjects("drawing")
    video = await listAllObjects("video")
    audio = await listAllObjects("audio")
    stopMotion = await listAllObjects("stopmotion")
    picture = await listAllObjects("picture")
    console.log(drawings)
    useraccount = await getAccount(id)
    console.log(useraccount)
    user = useraccount.username
    role = useraccount.metadata.role
    azc = useraccount.metadata.azc
    avatar_url = useraccount.url

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
  let promise = getArt();
</script>
<div class="box">
  <h1>kunstwerken</h1>
<SvelteTable columns="{columns}" rows="{art}" classNameTable="profileTable"></SvelteTable>
{#if CurrentUser || $Profile.meta.role == "moderator" || $Profile.meta.role == "admin"}
<h1>Prullenmand</h1>
<SvelteTable columns="{columns}" rows="{trash}" classNameTable="profileTable"></SvelteTable>
{/if}
</div>

<style>
  .box {
	  max-width: fit-content;
	  margin: 0 auto;
  }
</style>