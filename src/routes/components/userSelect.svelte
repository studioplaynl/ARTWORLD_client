<script>
  import Select from 'svelte-select';
  import { onMount } from 'svelte';
  import { ListAllUsers } from '../../helpers/nakamaHelpers';
  import { dlog } from '../../helpers/debugLog';

  let items;
  export let user;

  const optionIdentifier = 'user_id';
  const labelIdentifier = 'name';

  onMount(async () => {
    items = await ListAllUsers();
    dlog(items);
  });

  function handleSelect(event) {
    user = event.detail;
  }

  function handleClear() {
    user = '';
  }
</script>

<Select
  items="{items}"
  optionIdentifier="{optionIdentifier}"
  labelIdentifier="{labelIdentifier}"
  on:select="{handleSelect}"
  on:clear="{handleClear}"
/>

<style>
</style>
