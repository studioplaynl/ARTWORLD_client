<script>
    import anime from 'animejs';
    import {onMount} from "svelte"
    export let posX = 100
    export let posY = 100
    let doubleTap = false
    
    let mobile =  false// /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
 
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

    onMount(()=>{

        anime({
        targets: '#cursor',
        scale: 1.2,
        keyframes,
        loop: true,
        duration: 500,
        delay: 1000,
        });

        anime({
        targets: '#circle',
        scale: 1.2,
        keyframes: cirleKeyframes,
        loop: true,
        duration: 500,
        delay: 1000,
        easing: "easeOutQuart",
        });

        anime({
            targets: '#box',
            translateX: posX,
            translateY: posY,
            loop: false,
            duration: 500,
            delay: 500,
            easing: "easeInOutBack",
        });
    })
</script>

<div id="box">
        {#if mobile}
        <img id="cursor" src="assets/svg/pointinghand.svg">
        {:else}
        <img id="cursor" src="assets/svg/cursor.svg">
        {/if}
        <div id="circle" />
</div>

<style>
    img {
  width:100px;
  position: absolute;
  left: -30px;
  top:-20px;
  z-index: 1;
}

#circle{
  background-color: rgba(100,100,100,0.4);
  position: absolute;
  left: -1px;
  top: -1px;
  width:2px;
  height: 2px;
  border-radius: 50%;
/*   border: 2px solid rgba(100,100,100,0.4); */
}

#box{
  position: relative;
  left:0;
  top: 0;
}
</style>