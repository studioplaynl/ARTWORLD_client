<script>
  import { onMount } from 'svelte';
  import { ListFriends, sendMailToUser } from '../../helpers/nakamaHelpers';
  import { dlog } from '../../helpers/debugLog';

  export let row;
  export const col = null;
  export const isCurrentUser = null;
  let hasSent = false;

  let friends = [];

  onMount(async () => {
    friends = await ListFriends();
    dlog(friends);
    friends.friends.forEach((friend) => {
      items = [...items, friend.user];
    });
  });

  // const optionIdentifier = 'id';
  // const labelIdentifier = 'username';

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
    hasSent = true;
  }
</script>

<div class="actionContainer">
    <div class="friendList">
        {#each items as friend (friend.id)}
        <div
            on:click={() => {
              value = friend;
              hasSent = false; // reset hasSent when another friend is clicked
            }}
            class="friend {friend === value ? 'selected' : ''}">
            {friend.username}
        </div>
        {/each}
    </div>
    <div class="sendButtonContainer">
        <button on:click="{send}" class="sendButton">
            <img src="/assets/SHB/svg/AW-icon-next.svg" alt="Send art mail to friend" class="sendIcon" />
        </button>
        {#if hasSent} <!-- conditionally render the check icon -->
            <img src="/assets/SHB/svg/AW-icon-check.svg" alt="Mail Sent" class="checkIcon" />
        {/if}
    </div>
</div>




<style>
  .actionContainer {
      display: flex;
      /* This will vertically center-align the button and the friendList if they have different heights */
      align-items: center;
      /* This creates a gap between the friendList and the button. Remove or adjust if not necessary */
      gap: 1rem;
  }

  .sendButton {
      width: 4rem;
      border-radius: 1px;
      padding: 8px; /* adjust as needed */
      background-color: white; /* or any other color you prefer */
      border: none; /* to remove default button borders */
      cursor: pointer; /* to show that it's clickable */
  }

  .sendButtonContainer {
    position: relative;
    display: inline-block;
     /* To ensure the div doesn't take the full width */
  }

  .checkIcon {
      position: absolute;
      top: 0.2rem;
      right: 0;
      width: 2rem;
      height: 2rem;
  }

  .sendIcon {
      width: 100%;
      height: auto;
  }

  .friendList {
    width: 8rem;
    height: 6rem;  /* Adjust height to fit 3 items approximately */
    overflow-y: auto;
  }
  .friend {
    padding: 5px;
    cursor: pointer;
    border-bottom: 1px solid #ccc;  /* Just to visually separate items */
  }
  .friend:hover {
    background-color: #f0f0f0;
  }
  /* Style for the selected friend */
  .friend.selected {
      background-color: #ccffd5; /* Light green color */
  }
</style>
