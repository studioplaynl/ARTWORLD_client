<script>
// @ts-nocheck

  import { onMount } from 'svelte';
  import ErrorIcon from 'svelte-icons/md/MdErrorOutline.svelte';
  import SuccessIcon from 'svelte-icons/md/MdDone.svelte';

  // notification icons
  import NotificationIcon from 'svelte-icons/md/MdEMail.svelte';
  import UserAddIcon from 'svelte-icons/md/MdPersonAdd.svelte';
  import GroupAddIcon from 'svelte-icons/md/MdGroupAdd.svelte';
  import PersonIcon from 'svelte-icons/md/MdPerson.svelte';
  import { Error, Session, Success, Notification } from '../../session';
  import { dlog, dwarn } from '../../helpers/debugLog';

  import {
    NOTIFICATION_MESSAGE_RECEIVED_WHILE_OFFLINE_OR_NOT_IN_CHANNEL,
    NOTIFICATION_FRIENDSHIP_REQUEST_RECEIVED,
    NOTIFICATION_MY_FRIENDSHIP_REQUEST_ACCEPTED,
    NOTIFICATION_MY_GROUP_REQUEST_ACCEPTED,
    NOTIFICATION_GROUP_REQUEST_RECEIVED,
    NOTIFICATION_FRIEND_JOINED_GAME,
    NOTIFICATION_SOCKET_CLOSED,
    NOTIFICATION_ARTWORK_LIKE_RECEIVED,
    NOTIFICATION_ARTWORK_RECEIVED,
    NOTIFICATION_INVITE_RECEIVED,
  } from '../../constants';

  let error;
  let success;
  let notification;
  let notificationCode = 0;
  let showMessage = false;

  Error.subscribe((val) => {
    if (val) {
      dwarn('ERROR: ', val);
      setError(val);
    }
  });

  Notification.subscribe((val) => {
    if (val) {
      dlog('NOTIFICATION: ', val);
      setNotification(val);
    }
  });

  Success.subscribe((val) => {
    if (val) {
      dlog('SUCCESS: ', val);
      setSuccess(val);
    }
  });

  function setError(err) {
    error = err;
    setTimeout(() => {
      if (!showMessage) error = null;
    }, 4000);
  }

  function setNotification(notif) {
    // dlog('notif', notif);
    if (notif !== undefined) {
      notification = notif;
      notificationCode = notif.code;
      setTimeout(() => {
        if (!showMessage) notification = null;
      }, 4000);
    }
  }

  function setSuccess(val) {
    if (val) {
      success = true;
      setTimeout(() => {
        success = false;
        $Success = false;
      }, 1500);
    }
  }

  onMount(() => {
    window.onunhandledrejection = (e) => {
      // dlog(
      //   'unhandled rejection!',
      //   e,
      //   typeof e.reason,
      //   e.reason,
      //   e.reason?.state,
      //   e.reason?.status,
      // );
      if (typeof e.reason === 'object') {
        setError(e.reason.message || e.reason.statusText);
        if (
          parseInt(e.reason.state, 10) === 401 ||
          parseInt(e.reason.status, 10) === 401
        ) {
          /** Setting Session to null automatically redirects you to login route */
          dlog('401! Should now automatically redirect to login route..?');
          Session.set(null);
        }
      } else {
        setError(e.reason);
      }
    };
    window.onerror = (msg) => {
      dlog('On Error: ', msg);
      setError(msg);
    };
  });

  const message = () => {
    if (!showMessage) {
      showMessage = true;
    } else {
      showMessage = false;
      error = '';
    }
  };


  function handleKeyDown(event) {
    // handle keydown event here
  }
</script>

{#if success}
  <div class="snackbar">
    <div class="icon green"><SuccessIcon /></div>
  </div>
{/if}

{#if !!error}
  <button class="snackbar" on:click="{message}" >
    <div class="icon"><ErrorIcon /></div>
    {#if showMessage}
      <div id="errorMessage">
        {error}
      </div>
    {/if}
  </button>
{/if}

{#if !!notification}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <button class="snackbar" on:click="{message}" on:keydown="{handleKeyDown}">

    <div class="icon notification">
      {#if notificationCode === NOTIFICATION_MESSAGE_RECEIVED_WHILE_OFFLINE_OR_NOT_IN_CHANNEL}
        <!-- Message received from user X while offline or not in channel. -->

        <NotificationIcon />
      {:else if notificationCode === NOTIFICATION_FRIENDSHIP_REQUEST_RECEIVED}
        <!-- User X wants to add you as a friend. -->
        <UserAddIcon />
      {:else if notificationCode === NOTIFICATION_MY_FRIENDSHIP_REQUEST_ACCEPTED}
        <!-- User X accepted your friend invite. -->
        <PersonIcon />
      {:else if notificationCode === NOTIFICATION_MY_GROUP_REQUEST_ACCEPTED}
        <!-- You’ve been accepted to X group. -->
        <GroupAddIcon />
      {:else if notificationCode === NOTIFICATION_GROUP_REQUEST_RECEIVED}
        <!-- User X wants to join your group. -->
        <GroupAddIcon />
      {:else if notificationCode === NOTIFICATION_FRIEND_JOINED_GAME}
        <!-- Your friend X has just joined the game. -->
        <PersonIcon />
      {:else if notificationCode === NOTIFICATION_SOCKET_CLOSED}
        <!-- Final notifications to sockets closed via the single_socket configuration. -->
      {:else if notificationCode === NOTIFICATION_ARTWORK_LIKE_RECEIVED}
        <img
          class="icon"
          src="assets/SHB/svg/AW-icon-heart-full-red.svg"
          alt="Someone liked your artwork"
        />
        <!-- somebody liked your artpiece -->
      {:else if notificationCode === NOTIFICATION_ARTWORK_RECEIVED}
        <img
          class="icon"
          src="assets/SHB/svg/AW-icon-post.svg"
          alt="Someone sent you an artwork"
        />
        <!-- somebody sent you an artpiece -->
      {:else if notificationCode === NOTIFICATION_INVITE_RECEIVED}
        <!-- invite to play together -->
      {/if}
    </div>
    {#if showMessage}
      <div id="notificationMessage">
        {#if !!notification.code === 1}
          {notification.content.username}
          <br />
          {notification.content.key}
        {/if}
      </div>
    {/if}
  </button>
{/if}

<style>
  .snackbar {
    /* visibility: hidden; Hidden by default. Visible on click */
    /* min-width: 250px; Set a default minimum width */
    margin-left: -125px; /* Divide value of min-width by 2 */
    background-color: #333; /* Black background color */
    color: #fff; /* White text color */
    text-align: center; /* Centered text */
    border-radius: 2px; /* Rounded borders */
    padding: 16px; /* Padding */
    position: fixed; /* Sit on top of the screen */
    z-index: 150; /* Add a z-index if needed */
    /* left: 50%; Center the snackbar
    top: 60px; 30px from the bottom */
    -webkit-transition: 0.5s all ease-in-out;
    -moz-transition: 0.5s all ease-in-out;
    -o-transition: 0.5s all ease-in-out;
    transition: 0.5s all ease-in-out;
  }

  @media screen and (max-width: 600px) {
    .snackbar {
      right: 30px;
      top: 80px;
    }
  }
  @media screen and (min-width: 600px) {
    .snackbar {
      right: 30px;
      bottom: 80px;
    }
  }

  .icon {
    color: red;
    width: 32px;
    height: 32px;
    float: left;
  }

  .icon.green {
    color: green;
  }

  .icon.notification {
    color: #7300eb;
  }
</style>
