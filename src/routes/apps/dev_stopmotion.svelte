<script>
  export let file;
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  function save() {
    dispatch('save', { file });
  }

  function saveError() {
    dispatch('save', { file, error: 'This one wont save' });
  }
</script>

<h1>New stopmotion app!</h1>
{file}
<button on:click="{save}">Save this file</button>
<button on:click="{saveError}">Fail saving this file</button>

<img src="{file}" alt="" />
