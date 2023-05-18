<script>
  import { push } from 'svelte-spa-router';
  import SvelteTable from 'svelte-table';
  import MdSearch from 'svelte-icons/md/MdSearch.svelte';
  import { PlayerHistory } from './game/playerState';
  import SceneSwitcher from './game/class/SceneSwitcher';
  import FriendAction from './components/friendaction.svelte';
  import ArtworkLoader from './components/artworkLoader.svelte';
  import {
    ListFriends, addFriend, setLoader, convertImage,
  } from '../api';
  import { dlog } from './game/helpers/DebugLog';
  import {
    FRIENDSTATE_FRIENDS,
    FRIENDSTATE_INVITATION_SENT,
    FRIENDSTATE_INVITATION_RECEIVED,
    STOPMOTION_MAX_FRAMES,
    DEFAULT_PREVIEW_HEIGHT,
    DEFAULT_HOME,
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
    const value = `/game?location=${DEFAULT_HOME}&house=${row.user.id}`;
    push(value);
    PlayerHistory.push(value);
    SceneSwitcher.switchScene('DefaultUserHome', row.user.id);
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
      renderComponent: { component: ArtworkLoader, props: {} },
    },
    {
      key: 'Username',
      title: 'Username',
      value: (v) => `<p class="link">${v.user.username}<p>`,
      sortable: true,
    },
    {
      key: 'action',
      title: '',
      renderComponent: { component: FriendAction, props: { load } },
    },
  ];
</script>

<img
  src="/assets/SHB/svg/AW-icon-add-friend.svg"
  class="headerIcon"
  alt="Add friend"
/><br />
<!-- <input bind:value={ID} placeholder="user ID"> -->
<div class="search">
  <input bind:value="{Username}" />
  <button
    on:click="{() => {
      addFriend(ID, Username).then(() => {
        load();
      });
    }}"><MdSearch /></button
  >
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
