<!-- TODO:
  - max frames 15
  - grouping per frame
  - split loaded image in frames
  - delete a single frame
  -->
<script>
  import { onMount } from 'svelte';
  import { Swiper, SwiperSlide } from 'swiper/svelte';
  import Drawing from './drawing.svelte';
  import { STOPMOTION_MAX_FRAMES } from '../../constants';
  // eslint-disable-next-line import/no-unresolved
  import 'swiper/css';

  export let file;
  export let data;
  export let changes;

  let thumb;
  let currentFrame = 1;
  let drawing = null;
  let frames = null;
  let playPreviewInterval = null;

  let enableOnionSkinning = false;
  $: enableEditor = playPreviewInterval === null;

  let swiper;
  $: {
    if (swiper && currentFrame && frames) {
      setTimeout(() => {
        swiper.slideTo(currentFrame - 1);
      }, 100);
    }
  }

  onMount(() => {
    // Was there an image to load?
    // If so, load it and retrieve frame count from dimensions.
    if (file?.url) {
      const img = new Image();
      img.onload = (e) => {
        frames = Math.round(e.target.width / e.target.height);
      };
      img.src = file.url;
    } else {
      frames = 1;
    }
  });

  function switchFrame(frameNumber) {
    currentFrame = frameNumber;
  }

  function addFrame() {
    setTimeout(() => {
      if (frames < STOPMOTION_MAX_FRAMES) {
        frames++;
        currentFrame = frames;
      }
    }, 100);
  }

  const onSwiper = (e) => {
    [swiper] = e.detail;
    console.log('Setting swiper to ', e, swiper);
  };

  const onSlideChange = () => {
    console.log('slide change', swiper.activeIndex);

    // Don't change currentFrame when activating the [+] slide
    if (swiper.activeIndex === frames) {
      swiper.slideTo(frames - 1);
      // currentFrame = frames;
    } else {
      currentFrame = swiper.activeIndex + 1;
    }
  };

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

  function onClearCanvas() {
    currentFrame = 1;
    frames = 1;
  }

  function onFrameContentDeleted() {
    frames = Math.max(1, frames - 1);
    if (currentFrame > frames) currentFrame = frames;

    swiper.update();
  }
</script>

{#if frames !== null}
  <Drawing
    bind:this="{drawing}"
    bind:file
    bind:data
    bind:thumb
    bind:changes
    bind:currentFrame
    bind:frames
    bind:enableEditor
    enableOnionSkinning="{enableOnionSkinning && enableEditor}"
    on:save
    on:frameContentDeleted="{onFrameContentDeleted}"
    on:clearCanvas="{onClearCanvas}"
  >
    <svelte:fragment slot="stopmotion">
      <div class="stopmotion__frames">
        <Swiper
          class="stopmotion__swiper"
          spaceBetween="{0}"
          slidesPerView="auto"
          observer="{true}"
          centeredSlides="{true}"
          direction="horizontal"
          breakpoints="{{
            601: {
              direction: 'vertical',
            },
          }}"
          on:swiper="{onSwiper}"
          on:slideChange="{onSlideChange}"
        >
          <!-- activeIndex="{currentFrame}" -->
          <!-- on:slideChange="{() => console.log('on:slideChange', ...arguments)}" -->
          <!-- on:progress="{() => console.log('on:progress', ...arguments)}" -->
          <!-- centeredSlides="{true}" -->
          <!-- eslint-disable-next-line no-unused-vars -->
          {#each Array(frames + 1) as _, index (index)}
            {#if index}
              <SwiperSlide class="stopmotion__swiper__slide">
                <div
                  class="{`stopmotion__frame ${
                    currentFrame === index ? 'selected' : ''
                  }`}"
                  id="stopmotion-frame-{index}"
                  on:click="{() => {
                    switchFrame(index);
                  }}"
                >
                  <div
                    class="stopmotion__frame__background"
                    style="
              background-image: url({thumb});
              left: {-100 * (index - 1)}%;
              width: {frames * 100}%;
              "
                  ></div>
                  <div class="stopmotion__frame__index">
                    {index}
                  </div>
                </div>
                {#if currentFrame === index && frames > 1}
                  <button
                    class="clear-button-styles stopmotion__delete"
                    on:click="{() => drawing.deleteFrame(index)}"
                    >&times;</button
                  >
                {/if}
              </SwiperSlide>
            {/if}
          {/each}
          {#if frames < STOPMOTION_MAX_FRAMES && playPreviewInterval === null}
            <SwiperSlide class="stopmotion__swiper__slide">
              <div
                class="stopmotion__frame"
                id="stopmotion-frame-new"
                on:click="{addFrame}"
              >
                <div class="stopmotion__frame__index">+</div>
              </div>
            </SwiperSlide>
          {/if}
        </Swiper>
      </div>
    </svelte:fragment>
  </Drawing>

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
{/if}

<style>
  :global(.swiper.stopmotion__swiper) {
    width: auto;
    height: 100%;
  }
  :global(.swiper-slide.stopmotion__swiper__slide) {
    width: auto;
    height: auto;
  }
  .stopmotion__frames {
    /* display: flex; */
    /* flex-direction: column; */
    /* max-height: 80vh; */
    /* TODO REPLACE MAX_HEIGHT logic */
    /* overflow-y: auto;
    overscroll-behavior-y: contain;
    scroll-snap-type: y proximity; */
    /* overflow: hidden; */
    /* position: absolute; */
    /* right: 0; */
    /* top: 50%; */
    /* transform: translateY(-50%); */
    height: 100%;
    justify-content: center;
    align-items: center;
    /* width: 64px; */
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
    background-color: white;
    background-repeat: no-repeat;
    background-position: left top;
    background-size: cover;
  }

  @media only screen and (max-width: 600px) {
    :global(.swiper.stopmotion__swiper) {
      height: auto;
      width: 100%;
    }

    .stopmotion__frames {
      max-height: unset;
      top: unset;
      /* flex-direction: row; */
      left: 50%;
      transform: translateX(-50%);
      width: 100vw;
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
    font-size: 16px;
    color: #7300eb;
    text-align: center;
    display: inline-block;
    z-index: 1;
  }
  .stopmotion__delete {
    display: block;
    position: absolute;
    z-index: 1;
    top: -3px;
    right: -0;
    border-radius: 50%;
    background-color: gray;
    color: white;
    width: 20px;
    height: 20px;
    line-height: 1;
    font-size: 16px;
    z-index: 5;
    padding-left: 1px;
    padding-bottom: 3px;
  }

  .stopmotion__delete:hover {
    background: red;
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
