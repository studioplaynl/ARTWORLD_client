<script>
    import { dlog } from '../../helpers/debugLog';
    import { Liked } from '../../storage';
    import { returnPartsOfArtUrl } from '../game/helpers/UrlHelpers';

    export let liked = true;
    export let row = null;
    export const col = null;
    let showConfirm = false;

  function toggleLike() {
    // dlog('liked: ', liked);
    if (liked) {
      showConfirm = true; // if it was liked, show confirmation on click
    } else {
      liked = !liked; // if it was unliked, simply toggle
    }
  }

  function confirmUnlike() {
    liked = false;
    showConfirm = false;
    const likedArtUrl = row.url;
    const parts = returnPartsOfArtUrl(likedArtUrl);

    const { artKey } = parts;
    dlog('unlike event', artKey);
    Liked.delete(artKey);
  }

  function cancel() {
    showConfirm = false;
  }
</script>

<!-- Actual Like/Unlike Button -->
<div class="button-grid">
  {#if !showConfirm}
    <button class="full-grid clean-button" on:click={toggleLike}>
      <img class="clean-button" src="assets/SHB/svg/AW-icon-heart-full-red.svg" alt="Liked" />
    </button>
  {:else}
    <img class="full-grid clean-button" src="assets/SHB/svg/AW-icon-heart.svg" alt="Liked" />
    <button on:click={confirmUnlike} class="small-button">
      <img class="small-button" src="/assets/SHB/svg/AW-icon-check.svg" alt="Confirm" />
    </button>
    <button on:click={cancel} class="small-button">
      <img class="small-button" src="/assets/SHB/svg/AW-icon-cross.svg" alt="Cancel" />
    </button>
  {/if}
</div>


<style>
.clean-button{
    background-color: white;
    height: 50px;
    width: auto;
}

.small-button{
    background-color: white;
    height: 40px;
    width: auto;
}

.button-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    align-items: center;       /* Vertical alignment */
    justify-items: flex-start;     /* Horizontal alignment */
}

.full-grid {
    grid-column: 1 / span 2;
    grid-row: 1 / span 2;
}
</style>


