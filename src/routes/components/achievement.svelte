<script>
    import {achievements} from "../../session"
    import anime from 'animejs';
    let award

    let keyframes = [
        {opacity: 1,
            translateY: -150, 
        },
        { opacity: 1, rotateY: 360},
        {opacity: 0 ,translateY: 0},
    ]


    achievements.subscribe(value =>{ 
        anime({
            targets: '#award',
            keyframes,
            loop: false,
            duration: 1500,
            delay: 200,
            easing: "easeInSine",
        });
    })
</script>
<div id="awardBox">
    <img src="assets/SHB/svg/AW-icon-award.svg" id="award" bind:this="{award}">
</div>

<style>

#awardBox{
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  position: fixed;
  width: 100vw;
  pointer-events: none;
}

img {
  width:50px;
  position: fixed;
  z-index: 15;
  opacity: 0;
  pointer-events: none;
}
</style>