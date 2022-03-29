<script>
    import anime from 'animejs';
    import {onMount} from "svelte"
    export let posX = 0
    export let posY = 0
    let left = 0
    let top = 0 
    export let element
    export let hide = true
    export let direction = "top" 
    export let delay = 0 
    export let num

    let mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
 
    if(!!direction){
            if(direction == "left") {left = -200; top = 0}
            if(direction == "right") {left = 200; top = 0}
            if(direction == "top") {left = 0; top = -200}
            if(direction == "down") {left = 0; top = 200}
    }




    let keyframes = [
        {scale: 1.0},
        {scale: 1.0, translateX: left, translateY: top},
        {scale: 1.2},
    ]

    let cirleKeyframes = [
    {scale: 10},
    {scale: 10, translateX: left/10, translateY: top/10},
    {opacity:0}
    ]

    


    function animate(){
        anime({
            targets: '#cursor, #hand',
            scale: 1.2,
            keyframes,
            loop: true,
            duration: 1500,
            delay: 1000,
            easing: "easeInSine",
        });

        anime({
            targets: '#circle',
            scale: 1.2,
            keyframes: cirleKeyframes,
            loop: true,
            duration: 1500,
            delay: 1000,
            easing: "easeInSine",
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
        setTimeout(()=>{ 
            let el = document.getElementById(element)
            if(!!el){
                posX =  Number(el.offsetLeft) + Number(el.clientWidth) / 2;
                posY =  Number(el.offsetTop) + Number(el.clientHeight) / 2;
                el.addEventListener('click', event => { 
                    hide = true 
                });
            }
            if(!hide) animate()
        }, delay)
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