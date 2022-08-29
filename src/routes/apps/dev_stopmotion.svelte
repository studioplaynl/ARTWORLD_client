<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import DevDrawing from './dev_drawing.svelte';
  import { STOPMOTION_MAX_FRAMES } from '../../constants';

  const dispatch = createEventDispatcher();

  export let file;
  export let data;
  export let changes;

  let currentFrame = 1;
  let frames = 1;
  let play = false;
  let showBackground = true;

  // function save() {
  //   dispatch('save', { file });
  // }

  // function saveError() {
  //   dispatch('save', { file, error: 'This one wont save' });
  // }

  /** Duration of a single frame (in ms) */
  // const frameDuration = 200;

  // Set CSS animation steps based on nr of frames

  // $: animationStyle = frames > 1
  //   ? ` animate-stopmotion-${frames}
  //       ${frames * frameDuration}ms
  //       steps(${frames})
  //       infinite`
  //   : '';

  // get width of file, devide by set resolution(2048) to get amount of frames

  onMount(() => {});

  // set file to most left corner

  // switch frame function

  function switchFrame(frameNumber) {
    currentFrame = frameNumber;
  }

  function addFrame() {
    if (frames < STOPMOTION_MAX_FRAMES) {
      frames++;
      currentFrame = frames;
    }
  }

  function removeLastFrame() {
    if (frames > 1) frames--;
  }

  function deleteFrame(frameNumber) {
    console.log(
      'delete frame ',
      frameNumber,
      'not sure if this can be implemented though',
    );
  }

  function toggleBackground() {
    showBackground = !showBackground;
  }

  function setPlay(state) {}
</script>

<DevDrawing
  bind:file
  bind:data
  bind:changes
  bind:currentFrame
  bind:frames
  on:save
/>

<div class="stopmotion-container">
  <div class="stopmotion__frames">
    <!-- eslint-disable-next-line no-unused-vars -->
    {#each Array(frames + 1) as _, index (index)}
      {#if index}
        <div
          class="stopmotion__frame"
          class:selected="{currentFrame === index}"
          id="stopmotion-frame-{index}"
          on:click="{() => {
            switchFrame(index);
          }}"
        >
          <div
            class="stopmotion__frame__background"
            style="
              background-image: url({data});
              left: {-100 * (index - 1)}%;
              width: {frames * 100}%;
              "
          ></div>
          <div class="stopmotion__frame__index">{index}</div>
          <!-- {#if currentFrame === index && frames.length > 1}
          <img
            class="icon"
            on:click="{() => {
              deleteFrame(index);
            }}"
            alt="Delete frame"
            src="assets/SHB/svg/AW-icon-trash.svg"
          />
        {/if} -->
        </div>
      {/if}
    {/each}
    {#if frames < STOPMOTION_MAX_FRAMES}
      <div
        class="stopmotion__frame"
        id="stopmotion-frame-new"
        on:click="{addFrame}"
      >
        <div class="stopmotion__frame__index">+</div>
      </div>
    {/if}
  </div>
  <div class="stopmotion__frame-buttons">
    {#if play}
      <button
        id="playPause"
        on:click="{() => {
          play = false;
          setPlay(false);
        }}"
      >
        <img class="icon" src="assets/SHB/svg/AW-icon-pause.svg" alt="Pause" />
      </button>
    {:else}
      <button
        id="playPause"
        on:click="{() => {
          play = true;
          setPlay(true);
        }}"
      >
        <img class="icon" src="assets/SHB/svg/AW-icon-play.svg" alt="Play" />
      </button>
    {/if}
    <button on:click="{toggleBackground}">
      <img
        class="icon"
        class:unselected="{!showBackground}"
        src="assets/SHB/svg/AW-icon-onion.svg"
        alt="Hide background"
      />
    </button>
  </div>
</div>

<style>
  .stopmotion-container {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    flex-direction: column;
    position: fixed;
    bottom: 0;
    right: 0;
  }

  .stopmotion__frames {
    display: flex;
    flex-direction: column;
    max-height: 300px;
    /* width: 130px; */
    overflow-y: auto;
    overscroll-behavior-y: contain;
    scroll-snap-type: y proximity;
  }
  .stopmotion__frame {
    display: block;
    width: 60px;
    min-height: 60px;
    margin: 5px;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    border: 2px solid #7300eb;
  }

  .stopmotion__frame.selected {
    transform: scale(1.05);
    border-width: 4px;
    margin-left: 3px;
    transform-origin: center;
  }

  .stopmotion__frame__background {
    position: absolute;
    top: 0;
    left: 0;
    width: 60px;
    height: 60px;
    background-repeat: no-repeat;
    background-position: left top;
    background-size: cover;
  }

  .stopmotion__frame__index {
    font-size: 30px;
    color: #7300eb;
    text-align: center;
    display: inline-block;
  }

  .stopmotion__frames > div > div:hover {
    cursor: pointer;
  }

  .stopmotion__frames > div > div > div {
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .stopmotion__frame-buttons {
    display: flex;
    flex-direction: column;
  }

  .stopmotion__frame-buttons > a > img {
    display: block;
  }

  /** From Svelte-docs: If you want to make @keyframes that are accessible globally,
  * you need to prepend your keyframe names with -global-.
  * The -global- part will be removed when compiled, and the keyframe then
  * be referenced using just my-animation-name elsewhere in your code. */
  @keyframes -global-animate-stopmotion-2 {
    0% {
      left: 0;
    }
    100% {
      left: -100%;
    }
  }
  @keyframes -global-animate-stopmotion-3 {
    0% {
      left: 0;
    }
    100% {
      left: -200%;
    }
  }
  @keyframes -global-animate-stopmotion-4 {
    0% {
      left: 0;
    }
    100% {
      left: -300%;
    }
  }

  @keyframes -global-animate-stopmotion-5 {
    0% {
      left: 0;
    }
    100% {
      left: -400%;
    }
  }
  @keyframes -global-animate-stopmotion-6 {
    0% {
      left: 0;
    }
    100% {
      left: -500%;
    }
  }
  @keyframes -global-animate-stopmotion-7 {
    0% {
      left: 0;
    }
    100% {
      left: -600%;
    }
  }
  @keyframes -global-animate-stopmotion-8 {
    0% {
      left: 0;
    }
    100% {
      left: -700%;
    }
  }
  @keyframes -global-animate-stopmotion-9 {
    0% {
      left: 0;
    }
    100% {
      left: -800%;
    }
  }
  @keyframes -global-animate-stopmotion-10 {
    0% {
      left: 0;
    }
    100% {
      left: -900%;
    }
  }
</style>
