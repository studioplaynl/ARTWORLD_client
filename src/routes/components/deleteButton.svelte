<script>
  import { Modal, Dialog, Button } from 'attractions';
  import { ArtworksStore } from '../../storage';
  import { Profile } from '../../session';
  import { OBJECT_STATE_IN_TRASH } from '../../constants';

  export let col;
  export let row;
  const role = $Profile.meta.Role; // ;
  export let isCurrentUser;
  export let removeFromTrash;
  export let moveToTrash;

  let modalOpen = false;

  const Trash = () => {
    if (role === 'admin' || role === 'moderator') {
      moveToTrash(row);
    } else {
      ArtworksStore.updateState(row, OBJECT_STATE_IN_TRASH);
    }
  };

  const Delete = () => {
    modalOpen = false;
    if (role === 'admin' || role === 'moderator') {
      removeFromTrash(row);
    } else {
      ArtworksStore.delete(row, role);
    }
  };
</script>

<main>
  {#if isCurrentUser() || role === 'admin' || role === 'moderator'}
    {#if row.value.status !== OBJECT_STATE_IN_TRASH}
      <button class="clear-button-styles" on:click="{Trash}">
        <img
          class="trash"
          src="/assets/SHB/svg/AW-icon-trash.svg"
          alt="Put item in trash can"
        />
      </button>
    {:else}
      <button
        class="clear-button-styles"
        on:click="{() => {
          modalOpen = true;
        }}"
      >
        <img
          class="trash"
          src="/assets/SHB/svg/AW-icon-trash.svg"
          alt="Permanently delete item"
        />
      </button>
    {/if}
  {/if}
  <Modal bind:open="{modalOpen}">
    <!-- let:closeCallback> -->
    <Dialog
      title="Are you sure you want to Delete?"
      closeCallback="{() => {
        modalOpen = false;
      }}"
      danger
    >
      <div slot="title-icon"></div>
      <p>You have not saved your changes yet.</p>
      <p>If you exit without saving, changes will be lost.</p>
      <p>Are you sure you want to exit?</p>
      <Button on:click="{Delete}">yes, delete</Button>
    </Dialog>
  </Modal>
</main>

<style>
  .trash {
    width: 40px;
    cursor: pointer;
  }
</style>
