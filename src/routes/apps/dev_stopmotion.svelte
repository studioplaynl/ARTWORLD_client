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
  let playPreviewInterval = null;

  let enableOnionSkinning = false;

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

  $: enableEditor = playPreviewInterval === null;

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

  function toggleOnionSkinning() {
    enableOnionSkinning = !enableOnionSkinning;
  }

  function togglePlayPreview() {
    if (playPreviewInterval) {
      clearInterval(playPreviewInterval);
      playPreviewInterval = null;
    } else {
      playPreviewInterval = setInterval(() => {
        if (currentFrame === frames) currentFrame = 1;
        else {
          currentFrame = Math.min(frames, currentFrame + 1);
        }
      }, 200);
    }
  }
</script>

<DevDrawing
  bind:file
  bind:data
  bind:changes
  bind:currentFrame
  bind:frames
  bind:enableEditor
  enableOnionSkinning="{enableOnionSkinning && enableEditor}"
  on:save
>
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
    {#if frames < STOPMOTION_MAX_FRAMES && playPreviewInterval === null}
      <div
        class="stopmotion__frame"
        id="stopmotion-frame-new"
        on:click="{addFrame}"
      >
        <div class="stopmotion__frame__index">+</div>
      </div>
    {/if}
  </div>
</DevDrawing>
<!-- drawingPadding="{{
    left: 16,
    right: 64,
    bottom: 16,
    top: 16,
  }}" -->

<div class="stopmotion__controls">
  <div
    id="playPause"
    class="stopmotion__button button--play-pause"
    on:click="{() => {
      togglePlayPreview();
    }}"
  >
    {#if playPreviewInterval}
      <img src="assets/SHB/svg/AW-icon-pause.svg" alt="Pause" />
    {:else}
      <img src="assets/SHB/svg/AW-icon-play.svg" alt="Play" />
    {/if}
  </div>

  <div
    on:click="{toggleOnionSkinning}"
    class="stopmotion__button button--toggle-onion-skinning status"
    class:status--on="{enableOnionSkinning}"
  >
    <img src="assets/SHB/svg/AW-icon-onion.svg" alt="Hide background" />
  </div>
</div>

<style>
  .stopmotion__frames {
    display: flex;
    flex-direction: column;
    /* max-height: 80vh; */
    /* TODO REPLACE MAX_HEIGHT logic */
    /* overflow-y: auto;
    overscroll-behavior-y: contain;
    scroll-snap-type: y proximity; */
    overflow: hidden;
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    height: 100%;
    justify-content: center;
    align-items: center;
    width: 64px;
  }
  .stopmotion__frame {
    display: block;
    width: 48px;
    min-height: 48px;
    margin: 4px;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    border: 2px solid #7300eb;
    cursor: pointer;
  }

  .stopmotion__frame.selected {
    transform: scale(1.05);
    border-width: 4px;
    margin-left: 2px;
    transform-origin: center;
  }

  .stopmotion__frame__background {
    position: absolute;
    top: 0;
    left: 0;
    width: 48px;
    height: 48px;
    background-repeat: no-repeat;
    background-position: left top;
    background-size: cover;
  }

  @media only screen and (max-width: 600px) {
    .stopmotion__frames {
      max-height: unset;
      top: unset;
      flex-direction: row;
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      justify-content: center;
      align-items: center;
      height: 48px;
      bottom: 0;
      position: relative;
    }

    .stopmotion__frame {
      width: 32px;
      min-height: 32px;
    }

    .stopmotion__frame__background {
      width: 32px;
      height: 32px !important;
    }
  }

  .stopmotion__frame__index {
    font-size: 28px;
    color: #7300eb;
    text-align: center;
    display: inline-block;
  }
  .stopmotion__controls {
    position: fixed;
    right: 16px;
    top: 16px;
    display: flex;
    flex-direction: row;
  }

  .stopmotion__button {
    z-index: 13;
    box-shadow: 5px 5px 0px #7300ed;
    cursor: pointer;
    padding: 0;
    margin: 0;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    margin-left: 16px;
  }

  .status.status--on {
    box-shadow: 5px 5px 0px #7300ed;
  }

  .status {
    box-shadow: 5px 5px 0px rgba(115, 0, 237, 0.4);
  }

  .status > img {
    opacity: 0.4;
  }

  .status.status--on img {
    opacity: 1;
  }

  .stopmotion__button img {
    width: 40px;
  }
</style>
