<script>
// @ts-nocheck

/**
 * @file App.svelte
 * @author Lindsey, Eelke, Maarten
 *
 *  What is this file for?
 *  ======================
 *  App.svelte is the main file of the app. It contains the router and the game.
 *  It also contains the AdminMenu and the notifications.
 *  It also contains the admin pages.
 *
 */
import * as Phaser from 'phaser';

  import Router, { push } from 'svelte-spa-router';
  import { onMount, tick } from 'svelte';
  import { wrap } from 'svelte-spa-router/wrap';
  // import Phaser from 'phaser';
  import { CurrentApp, Session, Profile, Error } from './session';
  import {
    sessionCheck,
    checkLoginExpired,
    logout,
    restoreSession,
  } from './helpers/nakamaHelpers';
  import { dlog } from './helpers/debugLog';

  /** Admin pages */
  import Admin from './routes/admin/Admin.svelte';
  import AdminMenu from './routes/components/AdminMenu.svelte';
  import RegisterPage from './routes/auth/Register.svelte';
  import PrintQrCodesSheet from './routes/auth/PrintQrCodesSheet.svelte';
  import UsersPage from './routes/Users.svelte';
  import LoginPage from './routes/auth/Login.svelte';
  import ProfilePage from './routes/admin/ProfileWrapper.svelte';
  import DebugPage from './routes/admin/DebugPage.svelte';
  import FriendsPage from './routes/Friends.svelte';
  import UpdatePage from './routes/auth/Update.svelte';
  import UploadPage from './routes/admin/Upload.svelte';
  import ModeratePage from './routes/admin/Moderate.svelte';

  /** Game components */
  import Itemsbar from './routes/components/ItemsBar.svelte';
  import SelectedOnlinePlayerBar from './routes/components/SelectedOnlinePlayerBar.svelte';
  import AppLoader from './routes/components/AppLoader.svelte';
  import TopBar from './routes/components/TopBar.svelte';
  import AchievementAnimation from './routes/components/AchievementAnimation.svelte';
  import TutLoader from './routes/tutorials/TutLoader.svelte';
  import Notifications from './routes/components/Notifications.svelte';
  import EditHome from './routes/components/EditHome.svelte';

  import gameConfig from './routes/game/gameConfig';
  import { PlayerPos, PlayerLocation } from './routes/game/playerState';
  import { DEFAULT_APP } from './constants';

  let game;
  let mounted = false;
  let title;


  //* disables right mouse click; better game experience for the kids */
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    e.target.click();
  });

  onMount(async () => {
    document.getElementById('loader').classList.add('hide');

    // Attempt to restore a saved session
    await restoreSession();

    if (checkLoginExpired() === true) {
      dlog('login expired! go to login page');
      logout();

      Error.set('Please relogin');
    } else {
      mounted = true;
    }
  });

  $: isLoggedIn = $Session !== null && $Profile && $Profile?.username;
  $: isAdmin = $Profile?.meta?.Role === 'admin';
  $: isModerator =
    $Profile?.meta?.Role === 'moderator' || $Profile?.meta?.Role === 'admin';

  $: {
    if (!isLoggedIn) {
      dlog('NOT LOGGED IN');
      // we set Location to null to start fresh
      PlayerLocation.set({ scene: null });
      push('/login');
    } else if (typeof game === 'undefined' && mounted) {
      sessionCheck();

      startGame();
    }
  }

  $: {
    let t = '';

    if ($PlayerPos.x !== null && $PlayerPos.y !== null) {
      t = `${$PlayerPos.x} x ${$PlayerPos.y}`;
    }

    if ($PlayerLocation.house) {
      t = `${$PlayerLocation.house} - ${t}`;
    } else if ($PlayerLocation.scene) {
      t = `${$PlayerLocation.scene} - ${t}`;
    }

    if ($CurrentApp && $CurrentApp !== DEFAULT_APP) {
      t = `${$CurrentApp} — Artworld`;
    }

    if (t === '') t = 'ArtWorld';

    title = t;
  }

  //delete HomeElement also in Phaser
  function handleDeleteHomeElementPhaser(event) {
    if (game && game.events) {
      //delete HomeElement also in Phaser
      game.events.emit('homeElemetDeleted', event.detail);
    }
  }

  // Wait one tick to allow target div to become visible
  async function startGame() {
    await tick();
    game = new Phaser.Game(gameConfig);
  }

  const routes = {
    '/register': wrap({
      component: RegisterPage,
      conditions: [() => isAdmin],
    }),
    '/printSheet': wrap({
      component: PrintQrCodesSheet,
      conditions: [() => isAdmin],
    }),
    '/update/:user?': wrap({
      component: UpdatePage,
      conditions: [() => isLoggedIn],
    }),
    '/users': wrap({
      component: UsersPage,
      conditions: [() => isLoggedIn],
    }),
    '/friends': wrap({
      component: FriendsPage,
      conditions: [() => isLoggedIn],
    }),
    '/login/:user?/:password?': LoginPage,
    '/profile/:user?': wrap({
      component: ProfilePage,
      conditions: [() => isLoggedIn],
    }),
    '/debug': wrap({
      component: DebugPage,
      conditions: [() => isAdmin],
    }),
    '/upload/:user?/:name?': wrap({
      component: UploadPage,
      conditions: [() => isModerator],
    }),
    '/admin': wrap({
      component: Admin,
      conditions: [() => isAdmin],
    }),
    '/moderator': wrap({
      component: ModeratePage,
      conditions: [() => isModerator],
    }),
  };
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

{#if isLoggedIn}
  <main>
    <div id="phaserId"></div>
  </main>
  <Itemsbar />
  <SelectedOnlinePlayerBar />
  <EditHome on:deleteHomeElementPhaser={handleDeleteHomeElementPhaser}/>
  <AppLoader />
  <TopBar />
  <AchievementAnimation />
  <TutLoader />
{/if}

<!-- Routes go on top of Game -->
<AdminMenu />

<Router routes="{routes}" />

<!-- Notifcations go on to of everything -->
<Notifications />

<style>
  main {
    position: relative;
  }
</style>
