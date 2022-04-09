<script>
    import anime from 'animejs';
    import {onMount} from "svelte"
    export let posX = 0
    export let posY = 0
    export let element
    export let hide = true
    export let doubleTap = false
    export let delay = 0
    export let num

    let mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
 
    let keyframes = [
        {scale: 0.9},
        {scale: 1.0},
    ]

    let cirleKeyframes = [
    {scale: 20},
    {scale: 0}
    ]
    
    if(doubleTap){
    keyframes = [
        {scale: 0.9},
        {scale: 1.0},
        {scale: 0.9},
        {scale: 1.0},
    ]

    cirleKeyframes = [
    {scale: 20},
    {scale: 0},
    {scale: 20}
    ]
    
    }

    function animate(){
        anime({
        targets: '#cursor' + num ,
        scale: 1.2,
        keyframes,
        loop: true,
        duration: 500,
        delay: 1000,
        });

        anime({
        targets: '#circle' + num,
        scale: 1.2,
        keyframes: cirleKeyframes,
        loop: true,
        duration: 500,
        delay: 1000,
        easing: "easeOutQuart",
        });

        anime({
            targets: '#box' + num,
            translateX: posX,
            translateY: posY,
            loop: false,
            duration: 500,
            delay: 500,
            easing: "easeInOutBack",
        });
    }


    onMount(()=>{
        setTimeout(async ()=>{ 
            let el = document.getElementById(element)
            if(!!el){
                let pos = el.getBoundingClientRect();
                if(posX == 0) posX =  Number(pos.left) + Number(el.offsetWidth) / 2;
                if(posY == 0) posY =  Number(pos.top) + Number(el.offsetHeight) / 2;
                el.addEventListener('click', event => { 
                    hide = true 
                });
            }
            animate()
        }, delay)
    })

</script>


<div id="box{num}" class="box">
        {#if mobile}
        <img id="cursor{num}" class="cursor" src="assets/svg/pointinghand.svg">
        {:else}
        <img id="cursor{num}" class="cursor"  src="assets/svg/cursor.svg">
        {/if}
        <div id="circle{num}" class="circle"  />
</div>


<style>
    img {
  width:100px;
  position: absolute;
  left: -30px;
  top:-20px;
  z-index: 1;
  pointer-events: none;}

.circle{
  background-color: rgba(100,100,100,0.4);
  position: absolute;
  left: -1px;
  top: -1px;
  width:2px;
  height: 2px;
  border-radius: 50%;
  pointer-events: none;
}

.box{
  position: absolute;
  left:0;
  top: 0;
  z-index: 150;
  pointer-events: none;
}
</style>