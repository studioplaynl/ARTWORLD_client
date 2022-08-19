<script>
  import { onMount } from 'svelte';
  import Tap from './gestures/tap.svelte';
  import Swipe from './gestures/swipe.svelte';
  import { Tutorial } from '../../session';
  import { Achievements } from '../../storage';

  let current = 0;
  const hide = [];
  let sequence = [];
  hide[0] = false;
  let hasShown = false;

  Tutorial.subscribe((value) => {
    if (value) {
      sequence = value;
    }
  });

  Achievements.subscribe((value) => {
    if (value.length > 0 && !hasShown) {
      setTimeout(() => {
        if (!Achievements.find('firstLogin')) {
          Achievements.create('firstLogin', '{}');
        }
      }, 1500);

      setTimeout(() => {
        if (!Achievements.find('onboardMove')) {
          $Tutorial = [
            {
              type: 'swipe',
              direction: 'right',
              element: 'phaserId',
              posX: window.innerWidth / 2,
              posY: window.innerHeight / 2 - 100,
              delay: 500,
            },
            {
              type: 'tap',
              doubleTap: true,
              element: 'phaserId',
              posX: window.innerWidth / 2 - 150,
              posY: window.innerHeight / 2 - 200,
              delay: 1000,
            },
            { type: 'achievement', name: 'onboardMove' },
          ];
        }
      }, 4000);

      hasShown = true;
    }
  });

  onMount(() => {
    document.body.addEventListener('click', () => {
      if (hide[current] && hide.length > current) {
        current++;
        hide[current] = false;
        if (sequence[current].type === 'achievement') {
          Achievements.create(sequence[current].name, '{}');
        }
      }
    });
  });
</script>

{#each sequence as seq, i}
  {#if seq.type === 'tap'}
    {#if !hide[i]}
      <Tap
        num="{i}"
        element="{seq.element}"
        doubleTap="{seq.doubleTap}"
        posY="{seq.posY}"
        posX="{seq.posX}"
        delay="{seq.delay}"
        bind:hide="{hide[i]}"
      />
    {/if}
  {/if}
  {#if seq.type === 'swipe'}
    {#if !hide[i]}
      <Swipe
        num="{i}"
        element="{seq.element}"
        direction="{seq.direction}"
        posY="{seq.posY}"
        posX="{seq.posX}"
        delay="{seq.delay}"
        bind:hide="{hide[i]}"
      />
    {/if}
  {/if}
{/each}
