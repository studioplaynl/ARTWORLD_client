<script>
  /**
 * @file ArtworkLoader.svelte
 * @author Lindsey, Maarten
 *
 *  What is this file for?
 *  ======================
 *  ArtworkLoader.svelte is used in the itemsBar to load artworks
 *  it opens the artwork in the drawing app, but now there is no on:clicked handler
 *
 *  Opening is handled in the parent component with the on:clickCell="{goTo}" method
 *  (handling the clicked event from Previewer component)
 *  these components names should be changed because they are confusion and nondescriptive
 *
 *  It is used in the frieds, liked, profile page
 */

  import ArtPreviewer from './ArtPreviewer.svelte';

  export let row = null;
  export const col = null;
  export let artClickable = false;

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
    <ArtPreviewer artwork="{artworkUrl}" artClickable="{artClickable}" row="{row}"/>
{/if}
