<script>
    import {convertImage} from "../../api"
    import {onDestroy, onMount} from "svelte"
    let image
    let frame = 0
    let interval
    let url
    export let value
    export let row

    onMount(async ()=>{
        if(!!row) value = row.value.url 
        
        url = await convertImage(value,"150","1000","png")
        console.log("stopmotion", url)
    
        interval = setInterval(()=>{
           frame++
           if(frame == (image.clientWidth/150) ){
                frame = 0
                image.style.left = "0px"
           }
           else {
            image.style.left = `-${frame * 150}px`
           }
        },500)
    })
    
    onDestroy(()=>{
        clearInterval(interval)
    }
    
    )
    
    </script>
    
      
      <div class="stopmotion"><img bind:this="{image}" src="{url}"></div>
      
    
    
    
      <style>
        .stopmotion {
            height: 150px;
            width: 150px;
            overflow: hidden;
            position: relative;
        }
    
        .stopmotion > img {
            height: 150px;
            position: absolute;
            left: 0px;
        }
      </style>