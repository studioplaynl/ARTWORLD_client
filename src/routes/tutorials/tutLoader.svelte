<script>
    /**
 * @file tutLoader.svelte
 * @author Lindsey, Maarten
 *
 *  What is this file for?
 *  ======================
 *  tutLoader.svelte shows a tutorial if certain Achievements are not yet unlocked
 *
 */
  import { onMount } from 'svelte';
  import Tap from './gestures/tap.svelte';
  import Swipe from './gestures/swipe.svelte';

  import { Tutorial, CurrentApp } from '../../session';
  import { Achievements } from '../../storage';
  import { dlog } from '../../helpers/debugLog';

  let current = 0;
  const hide = [];
  let sequence = [];
  hide[0] = false;

  Tutorial.subscribe((value) => {
    if (value) {
      sequence = value;
      // dlog('sequence', sequence);
    }
  });


  onMount(async () => {
    try {
      await new Promise((resolve, reject) => {
        const result = Achievements.get();

        // Check if the result is an array
        if (!Array.isArray(result)) {
          resolve(result);
        } else {
          reject(new Error('Achievements.get() did not return a valid array'));
        }
      });

      // This block of code will only run if the promise resolves.
      document.body.addEventListener('click', () => {
        if (hide[current] && hide.length > current) {
          current++;
          hide[current] = false;
          if (sequence[current]?.type === 'achievement') {
            Achievements.create(sequence[current].name, {});
          }
        }
      });

      if ($CurrentApp === 'game') {
        setTimeout(() => {
          if (!Achievements.find('firstLogin')) {
            Achievements.create('firstLogin', {});
          }
        }, 1500);

        setTimeout(() => {
          dlog('current loaded', $Achievements);
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
      }
    } catch (error) {
      dlog('Error:', error);
    }
  });
</script>

{#each sequence as seq, i}
  {#if !hide[i]}
    {#if seq.type === 'tap'}
      <Tap
        num="{i}"
        element="{seq.element}"
        doubleTap="{seq.doubleTap}"
        posY="{seq.posY}"
        posX="{seq.posX}"
        delay="{seq.delay}"
        bind:hide="{hide[i]}"
      />
    {:else if seq.type === 'swipe'}
      <Swipe
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
