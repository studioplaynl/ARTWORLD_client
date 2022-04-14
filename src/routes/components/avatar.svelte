<script>
import {Profile, CurrentApp} from "../../session"
import {convertImage} from "../../api"
import {onDestroy, onMount} from "svelte"
let image
let frame = 0
let interval
let url

onMount(async ()=>{
    
    console.log(url)

    interval = setInterval(()=>{
       frame++
       if(frame == (image.clientWidth/150) ){
            frame = 0
            image.style.left = "0px"
       }
       else {
        image.style.left = `-${frame * 150}px`
       }
    },200)
})

onDestroy(()=>{
    clearInterval(interval)
}

)

</script>


  <div class="avatar" on:click="{()=>{$CurrentApp = "avatar"}}"><img bind:this="{image}" src="{$Profile.url}"></div>



  <style>
    .avatar {
        height: 150px;
        width: 150px;
        overflow: hidden;
        position: relative;
    }

    .avatar > img {
        height: 150px;
        position: absolute;
        left: 0px;
    }
  </style>