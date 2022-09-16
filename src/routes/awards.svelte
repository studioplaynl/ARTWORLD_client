<script>

  import { onMount } from 'svelte';
  import { Achievements } from '../storage';

  onMount(async () => {
    Achievements.get();
  });

  /* How to add / delete / update achievements:
   * Achievements.create('test achievement', '{}');
   * Achievements.delete('test achievement');
   * Achievements.update({
   *       name: 'test achievement',
   *       value: { test: 'updated' },
   *       pub: true,
   * });
   */

  function test(){
    Achievements.create('testachievement', {});
  }
</script>

<div class="awards">
  {#each $Achievements as X}
    <img class="icon" src="assets/SHB/svg/AW-icon-award.svg" alt="{X.key}" />
    <p>{X.key}</p>
  {/each}

  <button on:click="{test}">test</button>
</div>

<style>
  .awards > img {
    display: block;
    margin: 5px auto;
  }
</style>
