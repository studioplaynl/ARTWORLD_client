<script>
  import ModalDialog from './modalDialog.svelte';
  import { location } from 'svelte-spa-router';
  import { Profile } from '../../session';
  import { OBJECT_STATE_IN_TRASH } from '../../constants';
  // eslint-disable-next-line no-unused-vars
  import { dlog } from '../../helpers/debugLog';

  let open = false;

  export const col = null;
  export const rowIndex = null;
  export let row;
  const role = $Profile.meta.Role; // ;
  export let isCurrentUser;
  export let removeFromTrash = null;
  export let moveToTrash = null;
  export let store;

  let showModal = false;

  const Trash = () => {
    // dlog('location', $location);
    /* want to get deletebottom working in case of:
    * appsGroup.svelte
    * profile.svelte
    * moderator.svelte
    *
    * It is working in case of appsGroup.svelte (the first part: of putting the item in the trash)
    *
      SendToIsOpen: false
      collection: "drawing"
      key: "2023-02-28T12_41_52_GrijsWasbeer"
      permission_read: true
      read: 2
      update_time: "2023-09-08T19:11:33.934561+02:00"
      url: "drawing/f011a5dc-901a-42c0-9589-587b389d1e3e/0_2023-02-28T12_41_52_GrijsWasbeer"
      user_id: "f011a5dc-901a-42c0-9589-587b389d1e3e"
      username: "user11"
      value:
      {
          "url": "drawing/f011a5dc-901a-42c0-9589-587b389d1e3e/0_2023-02-28T12_41_52_GrijsWasbeer.png",
          "version": "0",
          "displayname": "GrijsWasbeer",
          "previewUrl": "https://d1p8yo0yov6nht.cloudfront.net/...."
      }



     * in profile.svelte the row is:
     $sortOn: ""
      collection: "flowerchallenge"
      create_time: "2023-09-16T13:55:10Z"
      key: "2023-09-16T13_55_10_GeelKameel"
      permission_read: true
      permission_write: 1
      update_time: "2023-09-16T13:55:10Z"
      url: "drawing/f011a5dc-901a-42c0-9589-587b389d1e3e/0_2023-09-15T16_07_11_GrijsWaterdraak"
      user_id: "f011a5dc-901a-42c0-9589-587b389d1e3e"
      value:
      {
      url: 'drawing/f011a5dc-901a-42c0-9589-587b389d1e3e/0_2023-09-15T16_07_11_GrijsWaterdraak.png',
      version: '0',
      displayname: 'GeelKameel',
      previewUrl: 'https://d1p8yo0yov6nht.cloudfront.net/fit-in/1800x…a'}
      version: "e7bf6aed7cde3ee1168454b2e3cf7786"
      }
    */
    if (
      (role === 'admin' || role === 'moderator') &&
      $location === '/moderator'
    ) {
      moveToTrash(row);
    } else {
      store.restoreFromTrash(row, OBJECT_STATE_IN_TRASH);
    }
  };

  function Delete() {
    showModal = false;
    if (
      (role === 'admin' || role === 'moderator') &&
      $location === '/moderator'
    ) {
      removeFromTrash(row);
    } else {
      store.delete(row, role);
    }
  }

  function handleKeydown(evt) {
    if (showModal && evt.type === 'keyup' && evt.key === 'Enter') {
      Delete();
    }
  }
</script>

<svelte:window on:keyup="{handleKeydown}" />

<main>
    {#if isCurrentUser() || role === 'admin' || role === 'moderator'}
      {#if row.value.status !== OBJECT_STATE_IN_TRASH}
        <button class="clear-button-styles" on:click="{Trash}">
          <img
            class="trash"
            src="/assets/SHB/svg/AW-icon-trashcan.svg"
            alt="Put item in trash can"
          />
        </button>
      {:else}
        <button
          class="clear-button-styles"
          on:click="{() => {
            showModal = true;
          }}"
        >
          <img
            class="trash"
            src="/assets/svg/icon/trashcan_red.svg"
            alt="Permanently delete item"
          />
        </button>
      {/if}
    {/if}

<ModalDialog bind:showModal>
	<h2 slot="header">
		⚠️ DELETE PERMANENTLY ⚠️
	</h2>

    <img slot="actionButton"
      class="actionButton"
      src="/assets/svg/icon/trashcan_red.svg"
      alt="Permanently delete item"
      on:click={() => {Delete(); showModal=false;}}
    />

</ModalDialog>
</main>

<style>
  .trash {
    width: 40px;
    cursor: pointer;
  }

.actionButton {
  background-color: white;
  width: 7rem;
  height: 7rem;
  border-radius: 50%;
}


    
</style>
