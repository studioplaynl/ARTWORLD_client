<script>
  import { Switch, Button } from 'attractions';
  import { updateObjectAdmin } from '../../api';
  import {
    PERMISSION_READ_PUBLIC,
    OBJECT_STATE_IN_TRASH,
    OBJECT_STATE_REGULAR,
  } from '../../constants';
  import { Profile } from '../../session';
  import { ArtworksStore } from '../../storage';

  const role = $Profile.meta.Role; // ;
  export let row;
  export let isCurrentUser;
  export let moveToArt;

  let publicRead = row.permission_read === PERMISSION_READ_PUBLIC;

  const currentUser = isCurrentUser(); // Bool? Of user object?

  const change = async () => {
    if (role === 'admin' || role === 'moderator') {
      console.log('admin');

      const { collection, key, value, user_id } = row;

      // Update on server
      console.log(collection, key, value, publicRead, user_id)
      await updateObjectAdmin(user_id, collection, key, value, publicRead);

      // ArtworksStore.updatePublicRead(row, publicRead);
    } else {
      ArtworksStore.updatePublicRead(row, publicRead);
    }
  };

  function restore() {
    if (role === 'admin' || role === 'moderator') {
      console.log('admin');
      moveToArt(row);
    } else {
      ArtworksStore.updateState(row, OBJECT_STATE_REGULAR);
    }
  }
</script>

<main>
  <!-- currentUser => is dit mijn profiel of van iemand anders -->
  {#if currentUser || role === 'admin' || role === 'moderator'}
    {#if row.value.status !== OBJECT_STATE_IN_TRASH}
      <Switch bind:value="{publicRead}" on:change="{change}" />
    {:else}
      <Button on:click="{restore}">Restore</Button>
    {/if}
  {/if}
</main>
