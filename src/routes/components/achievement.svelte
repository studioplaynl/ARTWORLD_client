<script>
    import {achievements} from "../../session"
    import anime from 'animejs';
    let award

    let keyframes = [
        {
            translateY: -240, 
        },
        {rotateY: 360},
        {translateY: 0},
    ]


     achievements.subscribe(value =>{ 
        anime({
            targets: '#award',
            scale: 1.2,
            keyframes,

            display: "inline",
            loop: false,
            duration: 1000,
            delay: 1000,
            easing: "easeInSine",
        });
 })

 setTimeout(()=>{
    console.log("award")

    console.log(award)
    award.style.left = window.innerWidth/2
    award.style.top = window.innerHeight/2
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
<!-- <div id="awardBox">
    <img src="assets/SHB/svg/AW-icon-award.svg" id="award" bind:this="{award}">
</div> -->

<style>

#awardBox{
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  position: fixed;
  width: 100vw;
}

img {
  width:100px;
  position: fixed;
  /* display: none; */
  z-index: 15;
}
</style>