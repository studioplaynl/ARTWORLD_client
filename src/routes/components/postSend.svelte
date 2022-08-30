<script>
  import Select from 'svelte-select';
  import { ListFriends, sendMailToUser } from '../../api';
  import MdSend from 'svelte-icons/md/MdSend.svelte';

  export let row;
  let toggleMode = true;

  let friends = [];

  async function toggle() {
    friends = await ListFriends();
    console.log(friends);
    friends.friends.forEach((friend) => {
      console.log(friend.user);
      items = [...items, friend.user];
    });
    console.log(await ListFriends());
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
    <button on:click="{toggle}">
      <img
        class="icon"
        src="assets/SHB/svg/AW-icon-post.svg"
        alt="send picture"
      />
    </button>
  {:else}
    <Select
      items="{items}"
      bind:value
      optionIdentifier="{optionIdentifier}"
      labelIdentifier="{labelIdentifier}"
    />
    <button on:click="{send}" class="sendButton"><MdSend /></button>
  {/if}
</div>

<style>
  button.sendButton {
    width: 45px;
    border-radius: 5px;
  }
</style>
