<script>
  import { updateTitle } from '../../helpers/nakamaHelpers';
  import {
    hasSpecialCharacter,
    removeSpecialCharacters,
  } from '../../validations';
  import { Profile } from '../../session';
  import { clickOutside } from '../../helpers/clickOutside';

  export const col = null;
  export let row;
  export let isCurrentUser;

  let edit = false;
  const minLength = 3;
  const maxLength = 24;

  let title = row.value.displayname || '';
  async function update() {
    if (titleIsInvalid || titleIsTooShort || titleIsTooLong) return;
    row.value.displayname = title;
    await updateTitle(row.collection, row.key, title, row.user_id);
    edit = false;
  }

  $: titleIsTooShort = title.length < minLength;
  $: titleIsTooLong = title.length > maxLength;
  $: titleIsInvalid = hasSpecialCharacter(title);

  // Prevent special characters in title
  $: if (hasSpecialCharacter(title)) title = removeSpecialCharacters(title);

  // Prevent titles from overflowing..
  $: if (title.length > maxLength) title = title.slice(0, maxLength);

  function clickOutsideForm() {
    update();
    // edit = false;
  }
</script>

<div class="name-edit">
  {#if isCurrentUser() || $Profile.meta.Role === 'admin' || $Profile.meta.Role === 'moderator'}
    {#if !edit}
      <button
        class="clear-button-styles"
        on:click="{() => {
          title = row.value.displayname;
          edit = true;
        }}"
      >
        {row.value.displayname}
      </button>
    {:else}
      <form
        on:submit|preventDefault="{update}"
        use:clickOutside
        on:click_outside="{clickOutsideForm}"
      >
        <input bind:value="{title}" />
        <button type="submit" class="clear-button-styles" on:click="{update}">
          <svg class="icon" viewBox="0 0 24 24">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
          </svg>
        </button>
      </form>
      {#if titleIsTooShort}
        <div class="warning">At least {minLength} characters</div>
      {:else if titleIsTooLong}
        <div class="warning">Too long (over {maxLength} characters)</div>
      {:else if titleIsInvalid}
        <div class="warning">No special characters</div>
      {/if}
    {/if}
  {/if}
</div>

<style>
  .name-edit {
    position: relative;
  }

  .icon {
    width: 30px;
    float: right;
  }

  form {
    display: flex;
  }
  form input {
    flex: 3;
    margin: 0;
  }
  form button {
    flex: 1;
  }

  .warning {
    position: absolute;
    bottom: -50%;
    text-align: left;
    width: 100%;
    color: red;
  }

  button,
  input {
    color: #7300eb;
  }
</style>
