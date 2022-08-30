<script>
  import { Switch, Button } from 'attractions';
  import {
    PERMISSION_READ_PUBLIC,
    OBJECT_STATE_IN_TRASH,
    OBJECT_STATE_REGULAR,
  } from '../../constants';
  import { Profile } from '../../session';
  import { ArtworksStore } from '../../storage';

  export let row;
  export let isCurrentUser;

  let publicRead = row.permission_read === PERMISSION_READ_PUBLIC;

  const currentUser = isCurrentUser(); // Bool? Of user object?

  const change = async () => {
    ArtworksStore.updatePublicRead(row, publicRead);
  };

  function restore() {
    ArtworksStore.updateState(row, OBJECT_STATE_REGULAR);
  }
</script>

<main>
  <!-- currentUser => is dit mijn profiel of van iemand anders -->
  {#if currentUser || $Profile.meta.Role === 'admin' || $Profile.meta.Role === 'moderator'}
    {#if row.value.status !== OBJECT_STATE_IN_TRASH}
      <Switch bind:value="{publicRead}" on:change="{change}" />
    {:else}
      <Button on:click="{restore}">Restore</Button>
    {/if}
  {/if}
</main>
