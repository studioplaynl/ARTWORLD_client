<script>
  import { Button } from 'attractions';
  // import { onMount } from 'svelte';
  import { location } from 'svelte-spa-router';
  import { dlog } from '../../helpers/debugLog';

  import { updateObjectAdmin } from '../../helpers/nakamaHelpers';
  import {
    // PERMISSION_READ_PUBLIC,
    OBJECT_STATE_IN_TRASH,
    OBJECT_STATE_REGULAR,
  } from '../../constants';
  import { Profile } from '../../session';
  // import { ArtworksStore } from '../../storage';

  const role = $Profile.meta.Role; // ;
  export let row;
  // eslint-disable-next-line svelte/valid-compile
  export let col = null;
  // eslint-disable-next-line svelte/valid-compile
  export let rowIndex = null;
  export let isCurrentUser;
  export let moveToArt = null;
  export let store;
  const currentUser = isCurrentUser(); // Bool? Of user object?

  const change = async () => {
    row.permission_read = !row.permission_read;
    if (role === 'admin' || role === 'moderator') {
      dlog('admin');

      const {
        // eslint-disable-next-line camelcase
        collection,
        key,
        value,
        // eslint-disable-next-line camelcase
        user_id,
      } = row;

      // Update on server
      dlog(collection, key, value, row.permission_read, user_id);
      await updateObjectAdmin(user_id, collection, key, value, row.permission_read);

      // ArtworksStore.updatePublicRead(row, publicRead);
    } else {
      store.updatePublicRead(row, row.permission_read);
    }
  };

  function restore() {
    if (
      (role === 'admin' || role === 'moderator') &&
      $location === '/moderator'
    ) {
      dlog('admin');
      moveToArt(row);
    } else {
      store.updateState(row, OBJECT_STATE_REGULAR);
    }
  }
</script>

<main>
  <!-- currentUser => is dit mijn profiel of van iemand anders -->
    {#if currentUser || role === 'admin' || role === 'moderator'}
      {#if row.value.status !== OBJECT_STATE_IN_TRASH}
        <img src="{row.permission_read ? '/assets/SHB/svg/AW-icon-visible.svg'
          : '/assets/SHB/svg/AW-icon-invisible.svg'}"
        alt="Toggle visibility" on:click="{change}" />
      {:else}
        <Button on:click="{restore}">      <img
      alt="undo trash, restore artwork"
      class="icon"
      src="/assets/svg/icon/undo_trashcan.svg"
      />
    </Button>
      {/if}
    {/if}

</main>

<style>
  img{
    height: 60px;
  }
</style>
