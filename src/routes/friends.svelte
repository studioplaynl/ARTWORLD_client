<script>
  import SvelteTable from 'svelte-table';
  import MdSearch from 'svelte-icons/md/MdSearch.svelte';
  import { PlayerPos, PlayerLocation, PlayerUpdate } from './game/playerState';
  import FriendAction from './components/friendaction.svelte';
  import ArtworkLoader from './components/artworkLoader.svelte';
  import {
    ListFriends,
    addFriend,
    setLoader,
    convertImage,
  } from '../helpers/nakamaHelpers';

  import { dlog } from '../helpers/debugLog';
  import {
    FRIENDSTATE_FRIENDS,
    FRIENDSTATE_INVITATION_SENT,
    FRIENDSTATE_INVITATION_RECEIVED,
    STOPMOTION_MAX_FRAMES,
    DEFAULT_PREVIEW_HEIGHT,
    DEFAULT_HOME,
    SCENE_INFO,
    AVATAR_BASE_SIZE,
  } from '../constants';

  let friends = [];
  let friendRequests = [];
  let friendRequestsPending = [];
  const ID = '';
  let Username;

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

  function goTo(event) {
    const { row } = event.detail;
    if (event.detail.key === 'action') return;

    /** We send the player to the left side of the user's home so that the artworks can be seen
    //  We set the Position after the Location
    //  when we set the position we force the urlparser to do a replace on the history and url,
    //  with PlayerUpdate.set({ forceHistoryReplace: false });
    */

    PlayerLocation.set({
      scene: DEFAULT_HOME,
      house: row.user.id,
    });

    const targetScene = SCENE_INFO.find((i) => i.scene === DEFAULT_HOME);
    const PosX = -(targetScene.sizeX / 2) + (AVATAR_BASE_SIZE * 2);

    PlayerUpdate.set({ forceHistoryReplace: false });
    PlayerPos.set({
      x: PosX,
      y: 0,
    });
  }

  const columns = [
    {
      key: 'status',
      title: '',
      value: (v) => {
        if (v.user.online) {
          return '<div class="online"/>';
        }
        return '<div class="offline"/>';
      },
    },
    {
      key: 'avatar',
      title: '',
      renderComponent: {
        component: ArtworkLoader,
        props: {},
      },
    },
    {
      key: 'Username',
      title: 'Username',
      // value: (v) => `<p>${v.user.username}<p>`,
      value: (v) => `<p class="link">${v.user.username}<p>`,
      sortable: true,
    },
    {
      key: 'action',
      title: '',
      renderComponent: {
        component: FriendAction,
        props: {
          load,
        },
      },
    },
  ];
</script>

<img
  src="/assets/SHB/svg/AW-icon-add-friend.svg"
  class="headerIcon"
  alt="Add friend"
/>
<br />
<!-- <input bind:value={ID} placeholder="user ID"> -->
<div class="search">
  <input bind:value="{Username}" />
  <button
    on:click="{() => {
      addFriend(ID, Username).then(() => {
        load();
      });
    }}"
  >
    <MdSearch />
  </button>
</div>

{#if friendRequests.length > 0}
  <img
    src="/assets/SHB/svg/AW-icon-friend-request.svg"
    class="headerIcon"
    alt="Friend requests"
  />
  <SvelteTable
    columns="{columns}"
    rows="{friendRequests}"
    classNameTable="profileTable"
  />
{/if}

<img
  src="/assets/SHB/svg/AW-icon-friend.svg"
  class="headerIcon"
  alt="All friend"
/>
<SvelteTable
  columns="{columns}"
  rows="{friends}"
  on:clickCell="{goTo}"
  classNameTable="profileTable"
/>

<!-- <h1>Pending friend requests</h1>
  <SvelteTable columns="{columns}" rows="{friendRequestsPending}" classNameTable="profileTable"></SvelteTable> -->
<style>
  .search > button {
    width: 25px;
    padding: 3px 3px;
    margin: 0px 0;
    border-radius: 7px;
  }
</style>
