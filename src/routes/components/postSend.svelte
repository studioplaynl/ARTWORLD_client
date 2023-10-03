<script>
  import Select from 'svelte-select';
  import MdSend from 'svelte-icons/md/MdSend.svelte';
  import { ListFriends, sendMailToUser } from '../../helpers/nakamaHelpers';
  import { dlog } from '../../helpers/debugLog';

  export let row;
  export const col = null;
  export const isCurrentUser = null;

  let toggleMode = true;

  let friends = [];

  async function toggle() {
    friends = await ListFriends();
    dlog(friends);
    friends.friends.forEach((friend) => {
      items = [...items, friend.user];
    });
    toggleMode = false;
  }

  const optionIdentifier = 'id';
  const labelIdentifier = 'username';

  let items = [];

  let value;

  async function send() {
    const data = {
      user_id: row.user_id,
      key: row.key,
      username: row.username,
      previewUrl: row.value.previewUrl,
      url: row.value.url,
    };
    sendMailToUser(value.id, data);
    toggleMode = true;
  }
</script>

<div>
  {#if toggleMode}
    <button on:click="{toggle}" class="sendButton">
      <!-- svelte-ignore a11y-img-redundant-alt -->
      <img
        alt="send picture"
        class="icon"
        src="assets/SHB/svg/AW-icon-post.svg"
      />
    </button>
  {:else}
    <div class="selectBox">
      <Select
        items="{items}"
        bind:value="{value}"
        itemId="{optionIdentifier}"
        label="{labelIdentifier}"
      />
    </div>
    <button on:click="{send}" class="sendButton"><MdSend /></button>
  {/if}
</div>

<style>
  button.sendButton {
    width: 4rem;
    border-radius: 1px;
  }
  .selectBox {
    width: 15rem;
  }

</style>
