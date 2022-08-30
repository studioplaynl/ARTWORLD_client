<script>
  import Router from 'svelte-spa-router';
  import { onMount } from 'svelte';
  import { wrap } from 'svelte-spa-router/wrap';
  import home from './routes/game/index.svelte';
  import registerPage from './routes/auth/register.svelte';

  import Users from './routes/users.svelte';
  import login from './routes/auth/login.svelte';
  import profile from './routes/profile.svelte';
  import DebugPage from './routes/admin/debugPage.svelte';
  // import drawing from "./routes/apps/drawing.svelte";
  import { Session, Profile } from './session';
  import Notifications from './routes/components/notifications.svelte';
  import Menu from './routes/components/menu.svelte';
  import Friends from './routes/friends.svelte';
  import Admin from './routes/admin/admin.svelte';
  import updatePage from './routes/auth/update.svelte';
  import mandala from './routes/apps/mandala.svelte';
  import upload from './routes/admin/upload.svelte';
  import MarioSequencer from './routes/apps/marioSequencer.svelte';
  import player from './routes/apps/player.svelte';
  import Moderate from './routes/admin/moderate.svelte';

  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    e.target.click();
  });

  onMount(() => {
    document.getElementById('loader').classList.add('hide');
  });

  const isLogedIn = (detail) => {
    if ($Session != null) return true;

    window.location.href = '/#/login';
    return false;
  };
  const isAdmin = (detail) => {
    console.log($Profile);
    if ($Profile.meta.Role === 'admin') return true;

    window.location.href = '/#/';
    return false;
  };
  const isModerator = (detail) => {
    console.log($Profile.meta.Role);
    if ($Profile.meta.Role === 'moderator' || $Profile.meta.Role === 'admin') {
      return true;
    }

    window.location.href = '/#/';
    return false;
  };
</script>

<Menu />

<Router
  routes="{{
    '/register': wrap({
      component: registerPage,
      conditions: [(detail) => isAdmin(detail)],
    }),
    '/update/:user?': wrap({
      component: updatePage,
      conditions: [(detail) => isLogedIn(detail)],
    }),
    '/users': wrap({
      component: Users,
      conditions: [(detail) => isLogedIn(detail)],
    }),
    '/friends': wrap({
      component: Friends,
      conditions: [(detail) => isLogedIn(detail)],
    }),
    '/login/:user?/:password?': login,
    '/profile/:user?': wrap({
      component: profile,
      conditions: [(detail) => isLogedIn(detail)],
    }),
    '/debug': wrap({
      component: DebugPage,
      conditions: [(detail) => isAdmin(detail)],
    }),
    // "/drawing/:user?/:name?/:version?": wrap({
    //     component: drawing,
    //     conditions: [
    //         (detail) => {
    //             return isLogedIn(detail);
    //         },
    //     ],
    // }),
    // "/stopmotion/:user?/:name?/:version?": wrap({
    //     component: drawing,
    //     conditions: [
    //         (detail) => {
    //             return isLogedIn(detail);
    //         },
    //     ],
    // }),
    '/mandala/:user?/:name?/:version?': wrap({
      component: mandala,
      conditions: [(detail) => isLogedIn(detail)],
    }),
    '/mariosound/:user?/:name?': wrap({
      component: MarioSequencer,
      conditions: [(detail) => isLogedIn(detail)],
    }),
    // "/avatar/:user?/:name?/:version?": wrap({
    //     component: drawing,
    //     conditions: [
    //         (detail) => {
    //             return isLogedIn(detail);
    //         },
    //     ],
    // }),
    '/audio/:user?/:name?/:version?': wrap({
      component: player,
      conditions: [(detail) => isLogedIn(detail)],
    }),
    '/video/:user?/:name?/:version?': wrap({
      component: player,
      conditions: [(detail) => isLogedIn(detail)],
    }),
    '/picture/:user?/:name?/:version?': wrap({
      component: player,
      conditions: [(detail) => isLogedIn(detail)],
    }),
    // "/house/:user?/:name?/:version?": wrap({
    //     component: drawing,
    //     conditions: [
    //         (detail) => {
    //             return isLogedIn(detail);
    //         },
    //     ],
    // }),
    '/upload/:user?/:name?': wrap({
      component: upload,
      conditions: [(detail) => isModerator(detail)],
    }),
    '/admin': wrap({
      component: Admin,
      conditions: [(detail) => isAdmin(detail)],
    }),
    '/moderator': wrap({
      component: Moderate,
      conditions: [(detail) => isModerator(detail)],
    }),
    '/:app?/:user?/:name?/:version?': wrap({
      component: home,
      conditions: [(detail) => isLogedIn(detail)],
    }),
  }}"
/>
<Notifications />
