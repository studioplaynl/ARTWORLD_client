<script>
  import { onMount } from "svelte";
  import { checkLogin } from "./../../session";
  import {
    locale,
    locales,
    getLocaleFromNavigator,
    init,
    addMessages,
    _,
  } from "svelte-i18n";
  import profile from "./../profile.svelte";
  import { Session, Profile, logout } from "./../../session";
  let MenuToggle = false;
  import en from "./../../langauge/en/en.json";
  import nl from "./../../langauge/nl/nl.json";
  import ru from "./../../langauge/ru/ru.json";
  import ar from "./../../langauge/ar/ar.json";

  let error;
  addMessages("nl", nl);
  addMessages("en", en);
  addMessages("ru", ru);
  addMessages("ar", ar);

  init({
    fallbackLocale: "nl",
    //initialLocale: getLocaleFromNavigator(),
  });

  let role;
  if ($Profile == null) {
    role = null;
  } else {
    console.log($Profile);
    role = $Profile.meta.role;
  }
  let DropdownMenu = () => {
    document.getElementById("DropdownMenu").classList.toggle("show");
  };

  //   onMount(async () => {
  //     checkLogin($Session)
  // });
</script>

<nav>
  <div
    on:click={() => {
      MenuToggle = !MenuToggle;
    }}
    class="icon"
  >
    <div class="hamburger" />
    <div class="hamburger" />
    <div class="hamburger" />
  </div>
  {#if MenuToggle}
    <div class="nav">
      <ul
        class="menu"
        on:click={() => {
          MenuToggle = false;
        }}
      >
        <li><a href="/#/">{$_("nav.game")}</a></li>
        <li><a href="/#/friends">{$_("nav.friends")}</a></li>
        <li><a href="/#/match">{$_("nav.match")}</a></li>
        <li><a href="/#/drawing">{$_("nav.drawing")}</a></li>
        <li><a href="/#/stopmotion">{$_("nav.stopmotion")}</a></li>
      </ul>
      <div
        class="userInfo"
        on:click={() => {
          MenuToggle = false;
        }}
      >
        {#if !!$Profile && $Profile.meta.role == "admin"}
          <ul
            class="menu"
            on:click={() => {
              MenuToggle = false;
            }}
          >
            <li><a href="/#/admin">{$_("role.admin")}</a></li>
          </ul>
        {/if}
        {#if $Session == null}
          <a href="/#/login">{$_("nav.login")}</a>
        {:else}
          <a href="/#/profile">{$Session.username}</a>
          <a on:click={logout} href="/">{$_("nav.logout")}</a>
        {/if}
      </div>
      <select bind:value={$locale} on:click>
        {#each $locales as locale}
          <option value={locale}>{locale}</option>
        {/each}
      </select>
    </div>
  {/if}
</nav>

<style>
  .icon {
    cursor: pointer;
    padding: 10px;
    float: right;
    margin: 0px 20px;
  }
  .icon .hamburger {
    width: 50px;
    height: 5px;
    background-color: black;
    margin-top: 5px;
    box-shadow: 0px 0px 10px white;
  }

  ul {
    list-style: none;
    width: 100%;
    padding: 0;
  }
  ul a {
    color: #999;
    text-decoration: none;
  }
  ul li a {
    font-family: "Oswald", sans-serif;
    text-align: center;
    transition: all 0.3s ease;
    font-size: 25px;
  }

  nav {
    position: fixed;
    float: right;
    top: 0;
    right: 0px;
    z-index: 5;
  }

  .nav {
    background-color: lightgray;
    padding: 25px;
  }
</style>
