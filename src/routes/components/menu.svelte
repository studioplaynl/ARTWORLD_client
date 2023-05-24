<script>
  import { fly } from 'svelte/transition';
  import { locale, locales, init, addMessages, _ } from 'svelte-i18n';
  import { logout } from '../../helpers/nakamaHelpers';
  import { Session, Profile } from '../../session';

  import en from '../../language/en/en.json';
  import nl from '../../language/nl/nl.json';
  import ru from '../../language/ru/ru.json';
  import ar from '../../language/ar/ar.json';

  import { dlog } from '../../helpers/debugLog';

  let MenuToggle = false;

  addMessages('NL', nl);
  addMessages('EN', en);
  addMessages('RU', ru);
  addMessages('AR', ar);

  init({
    fallbackLocale: 'NL',
    // initialLocale: getLocaleFromNavigator(),
  });

  let role;
  if ($Profile == null) {
    role = null;
  } else if ('meta' in $Profile) {
    // eslint-disable-next-line no-unused-vars
    role = $Profile.meta.Role;
  }

  let transition = { y: 200, duration: 500 };
  if (window.screen.width >= 600) {
    transition = { x: 200, duration: 500 };
  }
</script>

<nav>
  {#if MenuToggle}
    <div class="menucontainer" transition:fly="{transition}">
      <div class="nav">
        <select bind:value="{$locale}" on:click>
          {#each $locales as l}
            <option value="{l}">{l}</option>
          {/each}
        </select>
        <div
          class="userInfo"
          on:click="{() => {
            MenuToggle = false;
          }}"
        >
          <ul
            class="menu"
            on:click="{() => {
              MenuToggle = false;
            }}"
          >
            <li><a href="/#/">{$_('nav.game')}</a></li>
            {#if !!$Profile && 'meta' in $Profile && $Profile.meta.Role == 'admin'}
              <li><a href="/#/admin">{$_('role.admin')}</a></li>
              <li><a href="/#/moderator">{$_('role.moderator')}</a></li>
              <li><a href="/#/debug">Debug page</a></li>
              <li><a href="/#/upload">{$_('nav.upload')}</a></li>
            {:else if !!$Profile && 'meta' in $Profile && $Profile.meta.Role == 'moderator'}
              <li><a href="/#/moderator">{$_('role.moderator')}</a></li>
              <li><a href="/#/upload">{$_('role.upload')}</a></li>
            {/if}
          </ul>
          {#if $Session == null}
            <button href="/#/login">{$_('nav.login')}</button>
          {:else}
            <a href="/#/profile">{$Session.username}</a>
            <button on:click="{logout}" href="/">{$_('nav.logout')}</button>
          {/if}
        </div>
      </div>
      <div
        on:click="{() => {
          MenuToggle = false;
        }}"
        class="closeicon"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24px"
          height="24px"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M6.22566 4.81096C5.83514 4.42044 5.20197 4.42044 4.81145 4.81096C4.42092 5.20148 4.42092 5.83465 4.81145 6.22517L10.5862 11.9999L4.81151 17.7746C4.42098 18.1651 4.42098 18.7983 4.81151 19.1888C5.20203 19.5793 5.8352 19.5793 6.22572 19.1888L12.0004 13.4141L17.7751 19.1888C18.1656 19.5793 18.7988 19.5793 19.1893 19.1888C19.5798 18.7983 19.5798 18.1651 19.1893 17.7746L13.4146 11.9999L19.1893 6.22517C19.5799 5.83465 19.5799 5.20148 19.1893 4.81096C18.7988 4.42044 18.1657 4.42044 17.7751 4.81096L12.0004 10.5857L6.22566 4.81096Z"
            fill="#7300eb"></path>
        </svg>
      </div>
    </div>
  {:else if !!$Profile && 'meta' in $Profile && ($Profile.meta.Role == 'admin' || $Profile.meta.Role == 'moderator')}
    <div
      on:click="{() => {
        MenuToggle = true;
      }}"
      class="icon"
    >
      <div class="hamburger"></div>
      <div class="hamburger"></div>
      <div class="hamburger"></div>
    </div>
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
    font-family: 'Oswald', sans-serif;
  }

  ul li a {
    text-align: center;
  }

  select {
    background-color: #7300eb;
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

    .closeicon {
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
  .menucontainer {
    pointer-events: all;
  }

  .userInfo {
    margin-top: 20px;
  }
</style>
