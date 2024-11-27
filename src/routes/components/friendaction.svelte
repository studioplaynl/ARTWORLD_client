<script>
  import { addFriend, removeFriend } from '../../helpers/nakamaHelpers';
  import {
    FRIENDSTATE_FRIENDS,
    FRIENDSTATE_INVITATION_SENT,
    FRIENDSTATE_INVITATION_RECEIVED,
  } from '../../constants';

  export let friend;
  export let load;

  async function accept() {
    await addFriend(friend.user.id);
    load();
  }
  
  async function cancel() {
    await removeFriend(friend.user.id);
    load();
  }

  $: canAccept = friend.state === FRIENDSTATE_INVITATION_RECEIVED;

  $: canCancel =
    friend.state === FRIENDSTATE_FRIENDS ||
    friend.state === FRIENDSTATE_INVITATION_SENT ||
    friend.state === FRIENDSTATE_INVITATION_RECEIVED;
</script>

<main>
  {#if canAccept}
    <button class="accept" on:click={accept}>
      <img
        class="icon"
        src="/assets/SHB/svg/AW-icon-check.svg"
        alt="Accept friendship request"
      />
    </button>
  {/if}
  {#if canCancel}
    <button class="cancel" on:click={cancel}>
      <img
        class="icon"
        src="/assets/SHB/svg/AW-icon-trash.svg"
        alt="Cancel friendship request"
      />
    </button>
  {/if}
</main>

<style>
  .icon {
    width: 30px;
    float: right;
  }

  button {
    padding: 0;
    margin: 0;
    width: auto;
    height: auto;
    border: 0;
    background: transparent;
    cursor: pointer;
    border-radius: 0;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
  }
  button:focus,
  button:active {
    outline: none;
    background-color: transparent;
  }
</style>
