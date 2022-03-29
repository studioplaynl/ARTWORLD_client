<script>
    import {achievements} from "../../session"
    import anime from 'animejs';
import { InterpolateLinear } from "three";

    let keyframes = [
        {
            translateY: -240, 
        },
        {rotateY: 360},
        {translateY: 0},
    ]
    let left= window.innerWidth/2, 
        top = window.innerHeight/2


     achievements.subscribe(value =>{ 
        anime({
            targets: '#award',
            scale: 1.2,
            keyframes,
            left: window.innerWidth/2, 
            top:window.innerHeight/2,
            display: "inline",
            loop: false,
            duration: 1000,
            delay: 1000,
            easing: "easeInSine",
        });
 })

 setTimeout(()=>{
     console.log("done")
    anime({
            targets: '#award',
            scale: 1.2,
            // display: "inline",
            keyframes,
            loop: false,
            duration: 1000,
            delay: 1000,
            easing: "easeInSine",
        }); 
 },5000)
</script>

<img src="assets/SHB/svg/AW-icon-award.svg" id="award" style="--left: {left} --top: {top}">

<style>

img {
  width:100px;
  position: fixed;
  /* display: none; */
  z-index: 15;
  left: var(--left);
  top: var(--top)
}
</style>