<script>
  import Router from "svelte-spa-router";
  import {wrap} from 'svelte-spa-router/wrap'
  import home from "./routes/game/index.svelte";
  import registerPage from "./routes/auth/register.svelte";
  import login from "./routes/auth/login.svelte";
  import profile from "./routes/profile.svelte";
  import upload from "./routes/upload.svelte";
  import match from "./routes/match.svelte";
  import drawing from "./routes/apps/drawing.svelte"
  import { Session, Profile, logout } from "./session.js";
  import UploadAvatar from "./routes/uploadAvatar.svelte";
  import { onMount } from 'svelte';
  import { checkLogin } from './session';
  import { locale, locales, getLocaleFromNavigator, init, addMessages, _ } from 'svelte-i18n'

  import en from './langauge/en.json';
  import nl from './langauge/nl.json';

  addMessages('nl', nl);
  addMessages('en', en);

  init({
  fallbackLocale: 'nl',
  //initialLocale: getLocaleFromNavigator(),
  });



  let role;
  if ($Profile == null) {
    role = null;
  } else {
    role = $Profile.meta.role;
  }
  let DropdownMenu = () => {
    document.getElementById("DropdownMenu").classList.toggle("show");
  };

  onMount(async () => {
    checkLogin($Session)
});

let isLogedIn = (detail) => {
				if($Session != null) return true;
				else {
					window.location.href = "/#/login"
					return false;
				}
			}


</script>

<nav>
  <div class="nav">
    <div class="left">
      <a href="/#/">{$_('nav.game')}</a>
      <a href="/#/upload">{$_('nav.upload')}</a>
      <a href="/#/match">{$_('nav.match')}</a>
      <a href="/#/drawing">{$_('nav.drawing')}</a>
    </div>
    <div class="right">
      {#if !!$Profile && $Profile.meta.role == "admin"}
        <div on:click={DropdownMenu} class="dropdown">
          <a>{$_('role.admin')}</a>
          <div id="DropdownMenu" class="dropdown-content">
            <a href="/#/register">{$_('nav.admin.createUser')}</a>
            <a href="/#/group">{$_('nav.admin.createGroup')}</a>
          </div>
        </div>
      {/if}

      {#if $Session == null}
        <a href="/#/login">{$_('nav.login')}</a>
      {:else}
		<a href="/#/profile">{$Session.username}</a>
        <a on:click={logout} href="/">{$_('nav.logout')}</a>
      {/if}
	  <select bind:value={$locale}>
		{#each $locales as locale}
		  <option value={locale}>{locale}</option>
		{/each}
	  </select>
    </div>
  </div>
</nav>

<Router
  routes={{
    "/": wrap({
        component: home,
        conditions: [
            (detail) => {
				if($Session != null) return true;
				else {
					window.location.href = "/#/login"
					return false;
				}
			}
        ]
    }),
    "/register": wrap({
        component: registerPage,
        conditions: [
            (detail) => {
				return isLogedIn(detail)
			}
        ]
    }),
    "/login": login,
    "/profile": wrap({
        component: profile,
        conditions: [
            (detail) => {
				return isLogedIn(detail)
			}
        ]
    }),
    "/upload": wrap({
        component: upload,
        conditions: [
            (detail) => {
				return isLogedIn(detail)
			}
        ]
    }),
    "/match": wrap({
        component: match,
        conditions: [
            (detail) => {
				return isLogedIn(detail)
			}
        ]
    }),
    "/uploadAvatar": wrap({
        component: UploadAvatar,
        conditions: [
            (detail) => {
				return isLogedIn(detail)
			}
        ]
    }),
    "/drawing": wrap({
        component: drawing,
        conditions: [
            (detail) => {
				return isLogedIn(detail)
			}
        ]
    }),
  }}
/>


<style>
  .dropdown {
    position: relative;
    display: inline-block;
  }

  .dropdown-content {
    display: none;
    position: absolute;
    background-color: #f1f1f1;
    min-width: 160px;
    overflow: auto;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    z-index: 1;
  }

  .dropdown-content a {
    color: black;
    padding: 12px 16px;
    text-decoration: none;
    display: block;
  }

  .dropdown-content a:hover {
    background-color: #ddd;
  }
</style>
