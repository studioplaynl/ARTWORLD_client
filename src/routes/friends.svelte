<script>
  import SvelteTable from 'svelte-table';
  // import MdSearch from 'svelte-icons/md/MdSearch.svelte';
  import { PlayerPos, PlayerLocation, PlayerUpdate } from './game/playerState';
  import FriendAction from './components/friendaction.svelte';
  import ArtworkLoader from './components/artworkLoader.svelte';
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
    // DEFAULT_HOME,
    // SCENE_INFO,
    // AVATAR_BASE_SIZE,
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

  async function goTo(event) {
    const { row } = event.detail;
    if (event.detail.key === 'action') return;

    // We send the player to the left side of the user's home

    // get user account
    const friendAccount = await getAccount(row.user.id);
    // console.log('friendAccount: ', friendAccount);
    // in the friendAccount.meta:
    // metadata.Azc
    const friendHomeLocation = friendAccount.metadata.Azc;
    // get home object of friend to get pos of that home
    const friendHome = await getObject('home', friendHomeLocation, row.user.id);
    // console.log('friendHome: ', friendHome.value);
    // console.log('playerPosX: ', friendHome.value.posX);
    // console.log('playerPosY: ', friendHome.value.posY);

    PlayerLocation.set({
      scene: friendHomeLocation,
    });

    // check if there is posX and posY from the home object
    if (typeof friendHome.value.posX !== 'undefined' && typeof friendHome.value.posY !== 'undefined') {
      console.log('set player x and y');

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


    // PlayerLocation.set({
    //   scene: DEFAULT_HOME,
    //   house: row.user.id,
    // });

    // const targetScene = SCENE_INFO.find((i) => i.scene === DEFAULT_HOME);
    // const PosX = -(targetScene.sizeX / 2) + (AVATAR_BASE_SIZE * 2);

    // PlayerUpdate.set({ forceHistoryReplace: false });
    // PlayerPos.set({
    //   x: PosX,
    //   y: 0,
    // });
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
      value: (v) => `<p class="link">${v.user.display_name || v.user.username}<p>`,
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

<!-- searching for friends on the server stopped working
we also want to be able to search on display_name
which is not possible out of the box so we would have to write our own search -->
<!-- <img
  src="/assets/SHB/svg/AW-icon-add-friend.svg"
  class="headerIcon"
  alt="Add friend"
/>
<br />
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
</div> -->

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
  /* .search > button {
    width: 25px;
    padding: 3px 3px;
    margin: 0px 0;
    border-radius: 7px;
  } */
</style>
