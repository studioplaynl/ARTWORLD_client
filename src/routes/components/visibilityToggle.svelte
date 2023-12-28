<script>
  // import { onMount } from 'svelte';
  // import { location } from 'svelte-spa-router';
  // eslint-disable-next-line no-unused-vars
  import { dlog } from '../../helpers/debugLog';

  import {
    // PERMISSION_READ_PUBLIC,
    OBJECT_STATE_IN_TRASH,
    OBJECT_STATE_REGULAR,
  } from '../../constants';
  import { Profile } from '../../session';
  // import { ArtworksStore } from '../../storage';

  const role = $Profile.meta.Role; // ;
  export let row;
  export const col = null;
  export const rowIndex = null;
  export let isCurrentUser;
  // export let moveToArt = null;
  export let store;
  const currentUser = isCurrentUser(); // Bool? Of user object?

  const change = async () => {
    row.permission_read = !row.permission_read;
    store.updatePublicRead(row, row.permission_read);
  };

  function restore() {
    store.restoreFromTrash(row, OBJECT_STATE_REGULAR);
  }
</script>

<main>
  <!-- currentUser => is dit mijn profiel of van iemand anders -->
    {#if currentUser || role === 'admin' || role === 'moderator'}
      {#if row.value.status !== OBJECT_STATE_IN_TRASH}
      <!-- toggle visibily -->
        <img src="{row.permission_read ? '/assets/SHB/svg/AW-icon-visible.svg'
          : '/assets/SHB/svg/AW-icon-invisible.svg'}"
        alt="Toggle visibility" on:click="{change}" />
      {:else}
      <!-- take item out of trash -->
        <button on:click="{restore}">
          <img alt="undo trash, restore artwork"
          class="icon"
          src="/assets/svg/icon/undo_trashcan.svg"
          />
    </button>
      {/if}
    {/if}

</main>

<style>
  img{
    height: 60px;
  }
</style>
