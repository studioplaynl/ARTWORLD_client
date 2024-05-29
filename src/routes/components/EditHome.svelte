<script>
  // import { fly } from 'svelte/transition';
  import { ShowHomeEditBar, HomeEditBarExpanded } from '../../session';
  import { clickOutside } from '../../helpers/clickOutside';
  import { fade } from 'svelte/transition';

  let currentView;

  function closeEditHome() {
    ShowHomeEditBar.set(true);
    HomeEditBarExpanded.set(false);
  }

  function editHomeMenuToggle() {
    console.log('toggleExpand');
    HomeEditBarExpanded.update((value) => !value);
  }

  function handleKeyDown(event) {
    // handle keydown event here
    if (event.key === 'Enter' || event.key === ' ') {
      toggleExpand();
    }
  }

  function openPage() {
    // open page here
  }

  // toggle opens the itemsbar panel to reveal more functionality, the app is passed as a prop
  function toggleView(view) {
    currentView = currentView === view ? null : view;
  }
</script>

{#if $ShowHomeEditBar && !$HomeEditBarExpanded}
  <div id="itemsButton">
    <button on:click="{editHomeMenuToggle}" class="avatar">
      <img src="./assets/SHB/svg/AW-icon-pen.svg" alt="edit home elements" />
    </button>
  </div>
{/if}

<!-- open and close the itemsbar -->
{#if $ShowHomeEditBar && $HomeEditBarExpanded}
  <div
    class="itemsbar"
    id="currentUser"
    use:clickOutside
    on:click_outside="{closeEditHome}"
    transition:fade="{{ duration: 40 }}"
  >

    <!-- the left part of the items bar, either folds out or opens an app -->
    <div class="left-column-itemsbar">

      <!-- open and close the itemsbar -->
      <button on:click={editHomeMenuToggle} class="avatar">
        <img src="./assets/SHB/svg/AW-icon-pen.svg" alt="edit home elements" />
      </button>

      <button on:click={() => toggleView('awards')}>
        <img
          class="icon"
          src="assets/SHB/svg/AW-icon-achievement.svg"
          alt="Toggle Awards"
        />
      </button>

      <button on:click={() => toggleView('mail')}>
        <img
          class="icon"
          src="assets/SHB/svg/AW-icon-post.svg"
          alt="Toggle mailbox"
        />
      </button>

      <button on:click={() => toggleView('friends')}>
        <img
          class="icon"
          src="assets/SHB/svg/AW-icon-friend.svg"
          alt="Toggle Friends"
        />
      </button>

      <button
       on:click={() => toggleView('appsGroup')}>
      <img
          class="icon"
          src="/assets/svg/apps/appsgroup-icon-round2.svg"
          alt="open app containter"
        />
      </button>

      <button on:click={() => toggleView('liked')}>
        <img
          class="icon"
          src="assets/SHB/svg/AW-icon-plus.svg"
          alt="Toggle liked"
        />
      </button>

    </div>
    <div class="right-column-itemsbar">
      {#if currentView === 'liked'}
        <div>
          <!-- <LikedPage /> -->
        </div>
      {:else if currentView === 'mail'}
        <!-- <MailPage /> -->
      {:else if currentView === 'profilePage'}
        <!-- <ProfilePage /> -->
      {:else if currentView === 'friends'}
        <!-- <FriendsPage /> -->
      {:else if currentView === 'awards'}
        <!-- <Awards /> -->
      {:else if currentView === 'appsGroup'}
        <!-- <AppsGroup /> -->
      {/if}
    </div>
  </div>
{/if}

<style>
  * {
    user-select: none;
  }

  .itemsbar,
  #itemsButton {
    background-color: white;
    text-align: center;
    border-radius: 40px;
    box-shadow: 5px 5px 0px #7300ed;
    padding: 14px 14px 14px 18px;
    position: fixed;
    z-index: 10;
    transition: 0.01s all ease-in-out;
    max-height: 80vh;
    display: flex;
  }

  #itemsButton {
    border-radius: 50%;
  }

  #currentUser,
  #itemsButton {
    right: 16px;
    bottom: 16px;
  }

  button {
    border: 0;
    background: transparent;
    cursor: pointer;
    border-radius: 0;
    appearance: none;
    padding: 0;
    margin: 0;
    box-sizing: border-box;
  }

  button:active {
    /* background-color: white; */
    background-color: #7300ed;
    border-radius: 50%;
    /* border: 2px solid #7300ed; */
    /* box-sizing: border-box; */
    /* box-shadow: 5px 5px 0px #7300ed; */
  }

  .icon {
    max-width: 40px;
    height: 40px;
    float: left;
    margin-top: 5px;
  }

  #itemsButton button,
  .avatar
   {
    height: 40px;
    width: 40px;
    overflow: hidden;
  }

  #itemsButton img {
    height: 40px;
    width: auto;
  }

  .left-column-itemsbar {
    display: flex;
    flex-wrap: nowrap;
    float: left;
    margin-right: 5px;
    justify-content: flex-start;
    flex-direction: column-reverse;
  }

  .right-column-itemsbar {
    float: left;
    overflow-x: hidden;
    overflow-y: auto;
    margin: 20px 0px;
  }

  .avatar > img {
    height: 100%;
  }
</style>
