<script>
  import Stopmotion from './stopmotion.svelte';
  import Drawing from './drawing.svelte';

  export let row = null;
  // eslint-disable-next-line svelte/valid-compile
  export let col = null;
  export let clickable = false;

  let artworkUrl;

  $: {
    if (row) {
      if (row.user) {
        // Avatar of user
        artworkUrl = row.user.url;
      } else if (row.value && row.value.previewUrl) {
        // Preview url of stop-motion / drawing
        artworkUrl = row.value.previewUrl;
      } else if (row.img) {
        // When?
        artworkUrl = row.img;
      }
    }
  }
</script>

{#if artworkUrl}
  {#if row.collection && row.collection === 'drawing'}
    <Drawing artwork="{artworkUrl}" clickable="{clickable}" on:clicked />
  {:else if row.collection && row.collection === 'stopmotion'}
    <Stopmotion artwork="{artworkUrl}" clickable="{clickable}" on:clicked />
  {:else}
    <!-- Friends avatars don't belong to a collection, but _can_ be stop-motion..  -->
    <Stopmotion artwork="{artworkUrl}" clickable="{clickable}" on:clicked />
  {/if}
{/if}
