<script>
  export let saving;
</script>

{#if saving}
  <div class="savecontainer">
    <p class="saving">
      Saving
      <span>.</span>
      <span>.</span>
      <span>.</span>
    </p>
  </div>
{/if}

<style>
  @keyframes blink {
    /**
     * At the start of the animation the dot
     * has an opacity of .2
     */
    0% {
      opacity: 0.2;
    }
    /**
     * At 20% the dot is fully visible and
     * then fades out slowly
     */
    20% {
      opacity: 1;
    }
    /**
     * Until it reaches an opacity of .2 and
     * the animation can start again
     */
    100% {
      opacity: 0.2;
    }
  }

  .saving {
    top: 50vh;
    left: 50vw;
    position: fixed;
    transform: translate(-50%, -50%);
  }

  .saving span {
    /**
     * Use the blink animation, which is defined above
     */
    animation-name: blink;
    /**
     * The animation should take 1.4 seconds
     */
    animation-duration: 1.4s;
    /**
     * It will repeat itself forever
     */
    animation-iteration-count: infinite;
    /**
     * This makes sure that the starting style (opacity: .2)
     * of the animation is applied before the animation starts.
     * Otherwise we would see a short flash or would have
     * to set the default styling of the dots to the same
     * as the animation. Same applies for the ending styles.
     */
    animation-fill-mode: both;
  }

  .saving span:nth-child(2) {
    /**
     * Starts the animation of the third dot
     * with a delay of .2s, otherwise all dots
     * would animate at the same time
     */
    animation-delay: 0.2s;
  }

  .saving span:nth-child(3) {
    /**
     * Starts the animation of the third dot
     * with a delay of .4s, otherwise all dots
     * would animate at the same time
     */
    animation-delay: 0.4s;
  }

  .savecontainer {
    z-index: 5;
    position: fixed;
    left: 0;
    top: 0;
    font-size: 60px;
    background: rgba(50, 50, 50, 0.5);
    width: 100vw;
    height: 100vh;
  }
</style>
