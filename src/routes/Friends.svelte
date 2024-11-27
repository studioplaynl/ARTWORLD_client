<script>
  import { PlayerPos, PlayerLocation, PlayerUpdate } from './game/playerState';
  import FriendAction from './components/FriendAction.svelte';
  import ArtworkLoader from './components/ArtworkLoader.svelte';
  import {
    ListFriends,
    // addFriend,
    setLoader,
    convertImage,
    getAccount,
    getObject,
  } from '../helpers/nakamaHelpers';

  import { dlog } from '../helpers/debugLog';
  import {
    FRIENDSTATE_FRIENDS,
    FRIENDSTATE_INVITATION_SENT,
    FRIENDSTATE_INVITATION_RECEIVED,
    STOPMOTION_MAX_FRAMES,
    DEFAULT_PREVIEW_HEIGHT,
  } from '../constants';

  let friends = [];
  let friendRequests = [];
  let friendRequestsPending = [];
  // const ID = '';
  // let Username;

  async function load() {
    setLoader(true);

    await ListFriends().then((list) => {
      friends = [];
      friendRequests = [];
      friendRequestsPending = [];
      dlog('My friends:', list.friends);

      list.friends.forEach(async (_friend) => {
        // eslint-disable-next-line prefer-const
        let friend = _friend;

        friend.user.url = await convertImage(
          friend.user.avatar_url,
          DEFAULT_PREVIEW_HEIGHT,
          DEFAULT_PREVIEW_HEIGHT * STOPMOTION_MAX_FRAMES,
        );

        if (friend.state === FRIENDSTATE_INVITATION_RECEIVED) {
          friendRequests = [...friendRequests, friend];
        } else if (friend.state === FRIENDSTATE_INVITATION_SENT) {
          friendRequestsPending = [...friendRequestsPending, friend];
        } else if (friend.state === FRIENDSTATE_FRIENDS) {
          friends = [...friends, friend];
        }
      });
      dlog(friendRequests);
      setLoader(false);
    });
  }

  load();

  async function goTo(friend) {
    // get user account
    const friendAccount = await getAccount(friend.user.id);
    // in the friendAccount.meta:
    // metadata.Azc
    const friendHomeLocation = friendAccount.metadata.Azc;
    // get home object of friend to get pos of that home
    const friendHome = await getObject('home', friendHomeLocation, friend.user.id);

    PlayerLocation.set({
      scene: friendHomeLocation,
    });

    // check if there is posX and posY from the home object
    if (typeof friendHome.value.posX !== 'undefined' && typeof friendHome.value.posY !== 'undefined') {
      // place user next to nameplate of home
      const playerPosX = friendHome.value.posX - 80;
      const playerPosY = friendHome.value.posY - 100;

      PlayerUpdate.set({ forceHistoryReplace: false });
      PlayerPos.set({
        x: playerPosX,
        y: playerPosY,
      });
    } else {
      // if there was no posX and y from home object
      PlayerUpdate.set({ forceHistoryReplace: false });
      PlayerPos.set({
        x: -80,
        y: -100,
      });
    }
  }
</script>

<div class="friends-container">
  {#if friendRequests.length > 0}
    <div class="section">
      <img
        src="/assets/SHB/svg/AW-icon-friend-request.svg"
        class="headerIcon"
        alt="Friend requests"
      />
      
      {#each friendRequests as friend}
        <button 
          type="button"
          class="friend-row"
          on:click={() => goTo(friend)}
          on:keydown={(e) => e.key === 'Enter' && goTo(friend)}
        >
          <div class="status">
            {#if friend.user.online}
              <div class="online" role="status" aria-label="Online"/>
            {:else}
              <div class="offline" role="status" aria-label="Offline"/>
            {/if}
          </div>
          
          <ArtworkLoader
            row={friend}
            artClickable={false}
          />
          
          <p class="username">{friend.user.display_name || friend.user.username}</p>
          
          <FriendAction {friend} {load} />
        </button>
      {/each}
    </div>
  {/if}

  <div class="section">
    <img
      src="/assets/SHB/svg/AW-icon-friend.svg"
      class="headerIcon"
      alt="All friends"
    />
    
    {#each friends as friend}
      <button 
        type="button"
        class="friend-row"
        on:click={() => goTo(friend)}
        on:keydown={(e) => e.key === 'Enter' && goTo(friend)}
      >
        <div class="status">
          {#if friend.user.online}
            <div class="online" role="status" aria-label="Online"/>
          {:else}
            <div class="offline" role="status" aria-label="Offline"/>
          {/if}
        </div>
        
        <ArtworkLoader
          row={friend}
          artClickable={false}
        />
        
        <p class="username">{friend.user.display_name || friend.user.username}</p>
        
        <FriendAction {friend} {load} />
      </button>
    {/each}
  </div>
</div>

<style>
  .friends-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .friend-row {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    gap: 1rem;
    border: 2px solid lightgrey;
    border-radius: 10px;
    cursor: pointer;
    width: 100%;
    background: none;
    text-align: left;
  }

  .friend-row:hover {
    background-color: #f5f5f5;
  }

  .status {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .online {
    background-color: #4CAF50;
  }

  .offline {
    background-color: #9e9e9e;
  }

  .username {
    color: #7300ed;
    font-size: 1em;
    margin: 0;
  }

  .headerIcon {
    width: 50px;
    max-width: 50px;
    margin: 0 auto;
  }

  /* Add these button-specific resets */
  button {
    font: inherit;
    color: inherit;
  }

  button:focus {
    outline: 2px solid #7300ed;
    outline-offset: -2px;
  }
</style>
