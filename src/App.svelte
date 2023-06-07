<script>
  import Router, { push } from 'svelte-spa-router';
  import { onMount, tick } from 'svelte';
  import { wrap } from 'svelte-spa-router/wrap';
  import Phaser from 'phaser';
  import { CurrentApp, Session, Profile, Error } from './session';
  import {
    sessionCheck,
    checkLoginExpired,
    logout,
    restoreSession,
  } from './helpers/nakamaHelpers';
  import { dlog } from './helpers/debugLog';

  /** Admin pages */
  import Admin from './routes/admin/admin.svelte';
  import Menu from './routes/components/menu.svelte';
  import RegisterPage from './routes/auth/register.svelte';
  import PrintQrCodesSheet from './routes/auth/printQrCodesSheet.svelte';
  import UsersPage from './routes/users.svelte';
  import LoginPage from './routes/auth/login.svelte';
  import ProfilePage from './routes/admin/profileWrapper.svelte';
  import DebugPage from './routes/admin/debugPage.svelte';
  import FriendsPage from './routes/friends.svelte';
  import UpdatePage from './routes/auth/update.svelte';
  import UploadPage from './routes/admin/upload.svelte';
  import ModeratePage from './routes/admin/moderate.svelte';

  /** Game components */
  import Itemsbar from './routes/components/itemsbar.svelte';
  import SelectedOnlinePlayerBar from './routes/components/selectedOnlinePlayerBar.svelte';
  import AppLoader from './routes/components/appLoader.svelte';
  import TopBar from './routes/components/topbar.svelte';
  import AchievementAnimation from './routes/components/achievement.svelte';
  import TutLoader from './routes/tutorials/tutLoader.svelte';
  import Notifications from './routes/components/notifications.svelte';

  import gameConfig from './routes/game/gameConfig';
  import { PlayerPos, PlayerLocation } from './routes/game/playerState';
  import { DEFAULT_APP } from './routes/apps/apps';
  import { APP_VERSION_INFO } from './constants';

  let game;
  let mounted = false;
  let title;

  dlog('APP_VERSION_INFO: ', APP_VERSION_INFO);

  //* * disables right mouse click; better game experience for the kids */
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
      console.log('NOT LOGGED IN');
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
  <AppLoader />
  <TopBar />
  <AchievementAnimation />
  <TutLoader />
{/if}

<!-- Routes go on top of Game -->
<Menu />

<Router routes="{routes}" />

<!-- Notifcations go on to of everything -->
<Notifications />

<style>
  main {
    position: relative;
  }
</style>
