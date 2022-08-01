<script>
  import { Modal, Dialog, Button } from 'attractions';
  import { updateObject, deleteFile, deleteObjectAdmin } from '../../api';
  import { Profile } from '../../session';
  import { OBJECT_STATE_IN_TRASH } from '../../constants';
  import { dlog } from '../game/helpers/DebugLog';

  export let row;
  export let removeFromTrash;
  export let moveToTrash;
  export let isCurrentUser;

  let modalOpen = false;

  const Trash = () => {
    const { value } = row;
    value.status = OBJECT_STATE_IN_TRASH;
    const pub = false;
    updateObject(row.collection, row.key, value, pub, row.user_id);
    moveToTrash(row.key);
  };

  const Delete = () => {
    modalOpen = false;
    if ($Profile.meta.Role === 'admin' || $Profile.meta.Role === 'moderator') {
      dlog('admin');
      deleteObjectAdmin(row.user_id, row.collection, row.key);
    } else {
      deleteFile(row.collection, row.key, row.user_id);
    }
    removeFromTrash(row.key);
    dlog('deleted');
  };
</script>

<main>
  {#if isCurrentUser() || $Profile.meta.Role === 'admin' || $Profile.meta.Role === 'moderator'}
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
