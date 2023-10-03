<script>
  /**
 * @file artworkLoader.svelte
 * @author Lindsey, Maarten
 *
 *  What is this file for?
 *  ======================
 *  artworkLoader.svelte is used in the itemsBar to load artworks
 *  it opens the artwork in the drawing app, but now there is no on:clicked handler
 *
 *  Opening is handled in the parent component with the on:clickCell="{goTo}" method
 *  (handling the clicked event from Stopmotion and Drawing components)
 *  these components names should be changed because they are confusion and nondescriptive
 *
 *  It is used in the frieds, liked, profile page
 */
  import Stopmotion from './stopmotion.svelte';
  // import Drawing from './drawing.svelte';
  // eslint-disable-next-line no-unused-vars
  import { dlog } from '../../helpers/debugLog';

  export let row = null;
  export const col = null;
  export let clickable = false;

  let artworkUrl;

  // eslint-disable-next-line no-unused-vars
  function handleArtworkClicked(artworkData) {
    // Handle the artwork data
    dlog('Artwork clicked:', artworkData);

    // Perform any desired actions with the artwork data
  }

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
    <Stopmotion artwork="{artworkUrl}" clickable="{clickable}" row="{row}"/>
  {:else if row.collection && row.collection === 'stopmotion'}
    <Stopmotion artwork="{artworkUrl}" clickable="{clickable}" row="{row}"/>
  {:else}
    <!-- Friends avatars don't belong to a collection, but _can_ be stop-motion..  -->
    <Stopmotion artwork="{artworkUrl}" clickable="{clickable}" row="{row}"/>
  {/if}
{/if}
