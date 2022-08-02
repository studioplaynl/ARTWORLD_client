<script>
  import { beforeUpdate } from 'svelte';
  import Stopmotion from './stopmotion.svelte';
  import Drawing from './drawing.svelte';

  export let row;
  export let clickable = false;

  let artworkUrl;

  beforeUpdate(async () => {
    if (row.user) {
      // Avatar of user
      artworkUrl = row.user.url;
    } else if (row.value) {
      // Preview url of stop-motion / drawing
      artworkUrl = row.value.previewUrl;
    } else if (row.img) {
      // When?
      artworkUrl = row.img;
    }
  });
</script>

{#if row.collection && row.collection === 'drawing'}
  <Drawing artwork="{artworkUrl}" clickable="{clickable}" on:clicked />
{:else if row.collection && row.collection === 'stopmotion'}
  <Stopmotion artwork="{artworkUrl}" clickable="{clickable}" on:clicked />
{:else}
  <!-- Friends avatars don't belong to a collection, but _can_ be stop-motion..  -->
  <Stopmotion artwork="{artworkUrl}" clickable="{clickable}" on:clicked />
{/if}
