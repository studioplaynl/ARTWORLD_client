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
  addMessages("NL", nl);
  addMessages("EN", en);
  addMessages("RU", ru);
  addMessages("AR", ar);

  init({
    fallbackLocale: "NL",
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
        <li><a href="/#/drawing">{$_("nav.drawing")}</a></li>
        <li><a href="/#/stopmotion">{$_("nav.stopmotion")}</a></li>
        <li><a href="/#/mariosound">{$_("nav.mariosound")}</a>
      </ul>
      <select bind:value={$locale} on:click>
        {#each $locales as locale}
          <option value={locale}>{locale}</option>
        {/each}
      </select>
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
            <li><a href="/#/moderator">{$_("role.moderator")}</a></li>
            <li><a href="/#/upload">{$_("nav.upload")}</a></li>
          </ul>
        {/if}
        {#if !!$Profile && $Profile.meta.role == "moderator"}
        <ul
          class="menu"
          on:click={() => {
            MenuToggle = false;
          }}
        >
          <li><a href="/#/moderator">{$_("role.moderator")}</a></li>
          <li><a href="/#/upload">{$_("role.upload")}</a></li>
        </ul>
      {/if}
        {#if $Session == null}
          <button href="/#/login">{$_("nav.login")}</button>
        {:else}
          <a href="/#/profile">{$Session.username}</a>
          <button on:click={logout} href="/">{$_("nav.logout")}</button>
        {/if}
      </div>
      
    </div>
  {/if}
</nav>

<style>
  .icon {
    cursor: pointer;
    padding: 10px;
    float: right;
    margin: 10px 10px;
    border-radius: 50%;
    background-color: white;
  }

  .icon .hamburger {
    width: 30px;
    height: 5px;
    background-color: #7300eb;
    margin-top: 5px;
    box-shadow: 0px 0px 10px white;
  }

  ul {
    list-style: none;
    width: 100%;
    padding: 0;
  }
  a {
    color: #7300eb;
    text-decoration: none;
    font-size: 25px;
    font-family: "Oswald", sans-serif;
  }

  ul li a {
    text-align: center;
  }

  select {
    background-color: #7300EB;
    color: white;
    width: 100%;
  }

  nav {
    position: fixed;
    float: right;
    top: 0;
    right: 0px;
    z-index: 5;
  }

  .nav {
    background-color: white;
    box-shadow: -5px 0px #7300eb;
    padding: 25px;
    height: 100vh;
  }

  .userInfo {
    margin-top: 20px;
  }
  
</style>
