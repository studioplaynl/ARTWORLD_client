<script>
  export let file;
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  function save() {
    dispatch('save', file.id);
  }
</script>

<h1>{file.id} - {file.type}</h1>

<button on:click="{save}">Save this file</button>

<img src="{file.path}" alt="" />
