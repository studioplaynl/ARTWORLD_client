<script>
  import { onMount } from 'svelte';
  import { hasSpecialCharacter } from '../../validations';
  import { dlog } from '../../helpers/debugLog';

  export let invalidTitle = true;
  export let value;
  export let isTitleChanged = false;
  export let id = 'title';

  onMount(async () => {
    const url = '/assets/woordenlijst.json';
    if (!value) {
      fetch(url)
        .then((res) => res.json())
        .then((out) => {
          const dier = out.dier[Math.floor(Math.random() * out.dier.length)];
          const kleur = out.kleur[Math.floor(Math.random() * out.kleur.length)];
          value = kleur + dier;
        })
        .catch((err) => dlog(err));
    }
  });

  $: invalidTitle = hasSpecialCharacter(value);

  async function ifValid() {
    // @linjoe Why check if title is invalid and then setting the title to changed? — @eelke
    if (invalidTitle) isTitleChanged = true;
    dlog(invalidTitle);
  }
</script>

<input type="text" bind:value="{value}" on:keyup="{ifValid}" id="{id}" />
{#if invalidTitle}
  <p style="color: red">No special characters</p>
{/if}
