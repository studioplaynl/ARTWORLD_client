<script>
  import { Switch, Button } from 'attractions';
  import {
    PERMISSION_READ_PUBLIC,
    OBJECT_STATE_IN_TRASH,
  } from '../../constants';
  import { updateObject } from '../../api';
  import { Profile } from '../../session';

  export let row;
  export let moveToArt;
  export let isCurrentUser;

  let publicRead = row.permission_read === PERMISSION_READ_PUBLIC;

  const currentUser = isCurrentUser(); // Bool? Of user object?

  const change = async () => {
    const { value } = row;
    await updateObject(row.collection, row.key, value, publicRead, row.user_id);
  };

  const restore = async () => {
    row.value.status = '';
    const { value } = row;
    const pub = false;
    await updateObject(row.collection, row.key, value, pub, row.user_id);
    moveToArt(row.key);
  };
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
