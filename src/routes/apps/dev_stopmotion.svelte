<script>
  export let file;
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  function save() {
    dispatch('save', { file });
  }

  function saveError() {
    dispatch('save', { file, error: 'This one wont save' });
  }

  /** Duration of a single frame (in ms) */
  const frameDuration = 200;

  // Set CSS animation steps based on nr of frames

  $: animationStyle = file?.frames
    ? ` animate-stopmotion-${file.frames} 
        ${file.frames * frameDuration}ms
        steps(${file.frames}) 
        infinite`
    : '';
</script>

<h1>{file.id} - {file.type}</h1>

<button on:click="{save}">Save this file</button>
<button on:click="{saveError}">Fail saving this file</button>

<div class="stopmotion-container">
  <img src="{file.path}" alt="{file.id}" style:animation="{animationStyle}" />
</div>

<style>
  .stopmotion-container {
    max-width: 400px;
    max-height: 400px;

    height: 100vw;
    width: 100vw;

    position: relative;
    overflow: hidden;
  }

  .stopmotion-container img {
    height: 100%;
    width: auto;
    position: absolute;
    top: 0;
    left: 0;
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
