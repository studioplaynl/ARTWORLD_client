<script>
    import anime from 'animejs';
    import {onMount} from "svelte"
    let posX = 0
    let posY = 0
    export let element
    export let done = false 
    export let doubleTap = true

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
    }


    onMount(()=>{
        let el = document.getElementById(element)
        posX =  Number(el.offsetLeft) + Number(el.clientWidth) / 2;
        posY =  Number(el.offsetTop) + Number(el.clientHeight) / 2;
        el.addEventListener('click', event => { done = true });
        animate()
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
  position: absolute;
  left:0;
  top: 0;
  z-index: 150;
  pointer-events: none;
}
</style>