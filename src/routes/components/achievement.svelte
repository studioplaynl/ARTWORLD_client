<script>
  import anime from 'animejs';
  import { Achievements } from '../../storage';

  let award;
  let lastLength = 0;

  const keyframes = [
    {
      opacity: 1,
      translateY: -150,
    },
    { opacity: 1, rotateY: 360 },
    { opacity: 0, translateY: 0 },
  ];

  Achievements.subscribe((value) => {
    // dlog("lastLength:", lastLength)
    if (lastLength !== 0 && lastLength < value.length) {
      anime({
        targets: '#award',
        keyframes,
        loop: false,
        duration: 1500,
        delay: 200,
        easing: 'easeInSine',
      });
    }
    lastLength = value.length;
  });
</script>

<div id="awardBox">
  <img
    alt="Award"
    src="assets/SHB/svg/AW-icon-award.svg"
    id="award"
    bind:this="{award}"
  />
</div>

<style>
  #awardBox {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    position: fixed;
    width: 100vw;
    pointer-events: none;
  }

  img {
    width: 50px;
    position: fixed;
    z-index: 15;
    opacity: 0;
    pointer-events: none;
  }
</style>
