<script>
  import { Switch, Button } from 'attractions';
  import { updateObjectAdmin } from '../../api';
  import {onMount} from 'svelte'
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


  const currentUser = isCurrentUser(); // Bool? Of user object?

  const change = async (e) => {    
    if (role === 'admin' || role === 'moderator') {
      console.log('admin');

      const { collection, key, value, user_id } = row;
  
      // Update on server
      console.log(collection, key, value, e.detail.value, user_id)
      await updateObjectAdmin(user_id, collection, key, value, e.detail.value);

      // ArtworksStore.updatePublicRead(row, publicRead);
    } else {
      ArtworksStore.updatePublicRead(row, e.detail.value);
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
    <p>{row.permission_read}</p>
    {#if row.value.status !== OBJECT_STATE_IN_TRASH}
      <Switch bind:value="{row.permission_read}" on:change="{change}" />
    {:else}
      <Button on:click="{restore}">Restore</Button>
    {/if}
  {/if}
</main>
