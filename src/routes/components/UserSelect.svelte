<script>
  import Select from 'svelte-select';
  import { onMount } from 'svelte';
  import { ListAllUsers } from '../../helpers/nakamaHelpers';
  // import { dlog } from '../../helpers/debugLog';

  let items = [];
  export let user;
  let loading = true;
  let friends = [];

  const optionIdentifier = 'user_id';
  const labelIdentifier = 'name';

  onMount(async () => {
    items = await ListAllUsers();
    // dlog(items);
      items = [...items];
    loading = false;
  });

  function handleSelect(event) {
    user = event.detail;
  }

  function handleClear() {
    user = '';
  }
</script>

{#if loading}
  <p>Loading...</p>
{:else}
<Select
  items="{items}" 
  itemId="{optionIdentifier}"
  label="{labelIdentifier}"
  on:select="{handleSelect}"
  on:clear="{handleClear}"
/>
{/if}
<style>
</style>
