<script>
  import { location } from 'svelte-spa-router';
  import { dlog } from '../../helpers/debugLog';

  import { updateObjectAdmin } from '../../helpers/nakamaHelpers';
  import {
    OBJECT_STATE_IN_TRASH,
    OBJECT_STATE_REGULAR,
  } from '../../constants';
  import { Profile } from '../../session';

  const role = $Profile.meta.Role; // ;
  export let row;
  export const col = null;
  export const rowIndex = null;
  export let isCurrentUser;
  export let moveToArt = null;
  export let store;
  const currentUser = isCurrentUser(); // Bool? Of user object?

  const change = async () => {
    row.permission_read = !row.permission_read;
    if (role === 'admin' || role === 'moderator') {
      dlog('admin');

      const {
        collection,
        key,
        value,
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
      store.restoreFromTrash(row, OBJECT_STATE_REGULAR);
    }
  }
</script>

<main>
  <!-- currentUser => is dit mijn profiel of van iemand anders -->
    {#if currentUser || role === 'admin' || role === 'moderator'}
      {#if row.value.status !== OBJECT_STATE_IN_TRASH}
        <button on:click="{change}" on:keydown="{(event) => {if (event.key === 'Enter') change();}}">
          <img src="{row.permission_read ? '/assets/SHB/svg/AW-icon-visible.svg' : '/assets/SHB/svg/AW-icon-invisible.svg'}"
            alt="Toggle visibility" />
        </button>
      {:else}
        <button on:click="{restore}">      <img
      alt="undo trash, restore artwork"
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
