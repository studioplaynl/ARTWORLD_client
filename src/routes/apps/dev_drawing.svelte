<script>
  export let file;
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  function save() {
    dispatch('save', file);
  }
</script>

<h1>New drawing App!</h1>
{file}
<button on:click="{save}">Save this file</button>

<img src="{file}" alt="" />
