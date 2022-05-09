<script>
  import { onMount } from "svelte";
  import { checkLogin } from "./../../session";
  import { fly } from 'svelte/transition';
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
    role = $Profile.meta.Role;
  }
  let DropdownMenu = () => {
    document.getElementById("DropdownMenu").classList.toggle("show");
  };

  //   onMount(async () => {
  //     checkLogin($Session)
  // });
  let transition = { y: 200, duration: 500 }
  if(window.screen.width >= 600){
    transition = { x: 200, duration: 500 }
  }
</script>
<!-- 
<div class="logo">
  <div class="glyph">
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#fff"></circle><path d="M37.48291,70H30.49365L46.19678,26.36328h7.60644L69.50635,70H62.51807L58.53369,58.45215H41.48779Zm5.92285-17.08789h13.21L50.18115,34.29h-.34082Z" fill="#7300eb"></path></svg>    </div>
  <div class="glyph">
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#fff"></circle><path d="M35.44807,70V26.36328H51.00178a18.08594,18.08594,0,0,1,8.417,1.74707,11.70617,11.70617,0,0,1,5.01758,4.82617A14.66267,14.66267,0,0,1,66.10822,40.043a14.1015,14.1015,0,0,1-1.99218,7.5957,11.50493,11.50493,0,0,1-6.01856,4.69824L67.77033,70h-7.5L51.40705,53.4873h-9.375V70Zm6.584-22.18066h8.35254q4.81494,0,6.95606-2.04493a7.5505,7.5505,0,0,0,2.1416-5.73144,7.9542,7.9542,0,0,0-2.15235-5.87012q-2.15186-2.1621-7.03125-2.16308h-8.2666Z" fill="#7300eb"></path></svg>    </div>
  <div class="glyph">
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#fff"></circle><path d="M33.11491,32.03127v-5.668H66.88639v5.668H53.27115V70H46.70866V32.03127Z" fill="#7300eb"></path></svg>    </div>
  <div class="glyph">
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#fff"></circle><path d="M33.99863,70,21.89609,26.3633h6.9248l8.502,33.793h.40429l8.84278-33.793h6.86035L62.273,60.17775h.4043L71.15781,26.3633H78.1041L65.98007,70h-6.626L50.1705,37.31545h-.34082L40.64609,70Z" fill="#7300eb"></path></svg>    </div>
  <div class="glyph">
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#fff"></circle><path d="M69.65729,48.18166a26.17281,26.17281,0,0,1-2.55761,11.99609,18.6825,18.6825,0,0,1-6.999,7.72364A19.06179,19.06179,0,0,1,50.01179,70.5967a19.09781,19.09781,0,0,1-10.10938-2.69531,18.69123,18.69123,0,0,1-7-7.72364,26.18541,26.18541,0,0,1-2.55664-11.99609A26.16817,26.16817,0,0,1,32.90241,36.1758a18.71221,18.71221,0,0,1,7-7.71387,19.10673,19.10673,0,0,1,10.10938-2.69531,19.07071,19.07071,0,0,1,10.08886,2.69531,18.70345,18.70345,0,0,1,6.999,7.71387A26.15559,26.15559,0,0,1,69.65729,48.18166Zm-6.5205,0a21.05766,21.05766,0,0,0-1.71485-8.98047,12.7708,12.7708,0,0,0-4.6875-5.54,12.92424,12.92424,0,0,0-13.44433,0,12.76433,12.76433,0,0,0-4.6875,5.54,21.05711,21.05711,0,0,0-1.71582,8.98047,21.07484,21.07484,0,0,0,1.71582,8.9707,12.75373,12.75373,0,0,0,4.6875,5.54981,12.92424,12.92424,0,0,0,13.44433,0,12.76018,12.76018,0,0,0,4.6875-5.54981A21.07536,21.07536,0,0,0,63.13679,48.18166Z" fill="#7300eb"></path></svg>    </div>
  <div class="glyph">
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#fff"></circle><path d="M35.44807,70V26.36328H51.00178a18.08594,18.08594,0,0,1,8.417,1.74707,11.70617,11.70617,0,0,1,5.01758,4.82617A14.66267,14.66267,0,0,1,66.10822,40.043a14.1015,14.1015,0,0,1-1.99218,7.5957,11.50493,11.50493,0,0,1-6.01856,4.69824L67.77033,70h-7.5L51.40705,53.4873h-9.375V70Zm6.584-22.18066h8.35254q4.81494,0,6.95606-2.04493a7.5505,7.5505,0,0,0,2.1416-5.73144,7.9542,7.9542,0,0,0-2.15235-5.87012q-2.15186-2.1621-7.03125-2.16308h-8.2666Z" fill="#7300eb"></path></svg>    </div>
  <div class="glyph">
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#fff"></circle><path d="M37.8667,70V26.3633h6.584V64.33205H64.22317V70Z" fill="#7300eb"></path></svg>    </div>
  <div class="glyph">
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#fff"></circle><path d="M49.27416,70H35.14721V26.3633H49.72143A21.97976,21.97976,0,0,1,60.7478,28.97365a17.43692,17.43692,0,0,1,7.05175,7.47852,25.59978,25.59978,0,0,1,2.46094,11.666,25.76025,25.76025,0,0,1-2.4707,11.71875,17.41851,17.41851,0,0,1-7.16992,7.53125A22.8821,22.8821,0,0,1,49.27416,70Zm-7.543-5.75293h7.18066q7.456,0,11.16406-4.18652,3.70752-4.18653,3.708-11.94239,0-7.71386-3.6543-11.85742-3.65478-4.144-10.81347-4.14453h-7.585Z" fill="#7300eb"></path></svg>    </div>
</div> -->


<nav>
  {#if MenuToggle}
  <div class="menucontainer" transition:fly="{ transition }" >
    <div class="nav">
      <ul
        class="menu"
        on:click={() => {
          MenuToggle = false;
        }}
      >
        <!-- <li><a href="/#/">{$_("nav.game")}</a></li>
        <li><a href="/#/friends">{$_("nav.friends")}</a></li>
        <li><a href="/#/drawing">{$_("nav.drawing")}</a></li>
        <li><a href="/#/stopmotion">{$_("nav.stopmotion")}</a></li>
        <li><a href="#" on:click="{()=> { location.href = "/#/mariosound" ;location.reload(); }}">{$_("nav.mariosound")}</a> -->
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
        {#if !!$Profile && $Profile.meta.Role == "admin"}
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
        {#if !!$Profile && $Profile.meta.Role == "moderator"}
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
    <div
    on:click={() => {
      MenuToggle = false;
    }}
    class="closeicon"
  >
  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" fill="none">
    <path d="M6.22566 4.81096C5.83514 4.42044 5.20197 4.42044 4.81145 4.81096C4.42092 5.20148 4.42092 5.83465 4.81145 6.22517L10.5862 11.9999L4.81151 17.7746C4.42098 18.1651 4.42098 18.7983 4.81151 19.1888C5.20203 19.5793 5.8352 19.5793 6.22572 19.1888L12.0004 13.4141L17.7751 19.1888C18.1656 19.5793 18.7988 19.5793 19.1893 19.1888C19.5798 18.7983 19.5798 18.1651 19.1893 17.7746L13.4146 11.9999L19.1893 6.22517C19.5799 5.83465 19.5799 5.20148 19.1893 4.81096C18.7988 4.42044 18.1657 4.42044 17.7751 4.81096L12.0004 10.5857L6.22566 4.81096Z" fill="#7300eb"/>
    </svg>
  </div>
  </div>
  {:else}
  {#if !!$Profile && ($Profile.meta.Role == "admin" || $Profile.meta.Role == "moderator")}    
      <div
        on:click={() => {
          MenuToggle = true;
        }}
        class="icon"
      >
        <div class="hamburger" />
        <div class="hamburger" />
        <div class="hamburger" />
      </div>
    {/if}
  {/if}
</nav>

<style>
  .closeicon {
    cursor: pointer;
    padding: 10px 15px;
    float: right;
    margin: 10px -1px 0 0;
    border-radius: 45% 0 0 45%;
    background-color: white;
    box-shadow: -4px 4px #7300eb;
    color: 7300eb;
  }

  .icon {
    cursor: pointer;
    padding: 10px;
    margin: 10px;
    border-radius: 45%;
    background-color: white;
    float: right;
    pointer-events: all;
  }

  .icon .hamburger {
    width: 30px;
    height: 4px;
    background-color: #7300eb;
    margin: 4px 0;
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
  @media screen and (min-width: 600px) {
    nav {
      position: fixed;
      top: 0;
      right: 0px;
      z-index: 5;
    }

    .nav {
      background-color: white;
      box-shadow: -5px 0px #7300eb;
      padding: 25px;
      height: 100vh;
      float: right;
    }
  }
  @media screen and (max-width: 600px) {
    nav {
      position: fixed;
      bottom: 0;
      z-index: 5;
      width: 100vw;
      pointer-events: none;
    }

    .nav {
      background-color: white;
      box-shadow: 0px -4px #7300eb;
      padding: 25px;
    }

    .closeicon{
      cursor: pointer;
      padding: 10px 15px;
      margin: 10px -1px 0 0;
      border-radius: 45% 45% 0 0;
      background-color: white;
      box-shadow: -4px -2px #7300eb;
      position: absolute;
      top: -55px;
      right: 0;
    }

  }
  .menucontainer{
    pointer-events: all;
  }

  .userInfo {
    margin-top: 20px;
  }







</style>
