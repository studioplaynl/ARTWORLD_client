<script>
  import { fly } from 'svelte/transition';
  import { locale, locales, init, addMessages, _ } from 'svelte-i18n';
  import { logout } from '../../helpers/nakamaHelpers';
  import { Session, Profile } from '../../session';

  import en from '../../language/en/en.json';
  import nl from '../../language/nl/nl.json';
  import ru from '../../language/ru/ru.json';
  import ar from '../../language/ar/ar.json';

  let adminMenuToggle = false;

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
    role = $Profile.meta.Role;
  }

  let transition = { y: 200, duration: 500 };
  if (window.screen.width >= 600) {
    transition = { x: 200, duration: 500 };
  }
</script>

<nav>
  {#if adminMenuToggle}
    <div class="menucontainer" transition:fly="{transition}">
      <div class="nav">
        <select bind:value="{$locale}">
          {#each $locales as l}
            <option value="{l}">{l}</option>
          {/each}
        </select>
        <div class="userInfo">
          <ul class="menu">
            <li><a href="/#/">{$_('nav.game')}</a></li>
            {#if !!$Profile && 'meta' in $Profile && $Profile.meta.Role === 'admin'}
              <li><a href="/#/admin">{$_('role.admin')}</a></li>
              <li><a href="/#/moderator">{$_('role.moderator')}</a></li>
              <li><a href="/#/debug">Debug page</a></li>
              <li><a href="/#/upload">{$_('nav.upload')}</a></li>
            {:else if !!$Profile && 'meta' in $Profile && $Profile.meta.Role === 'moderator'}
              <li><a href="/#/moderator">{$_('role.moderator')}</a></li>
              <li><a href="/#/upload">{$_('role.upload')}</a></li>
            {/if}
          </ul>
          {#if $Session == null}
            <button onclick="location.href='/#/login'">{$_('nav.login')}</button>
          {:else}
            <a href="/#/profile">{$Session.username}</a>
            <button on:click="{logout}">{$_('nav.logout')}</button>
          {/if}
        </div>
      </div>
        <button
          on:click="{() => {
            adminMenuToggle = false;
          }}"
          class="close-button"
          aria-label="Close menu">
          <img src="/assets/SHB/svg/AW-icon-cross.svg" alt="close admin menu" class="icon" />
        </button>
    </div>
  {:else if !!$Profile && 'meta' in $Profile && ($Profile.meta.Role === 'admin' || $Profile.meta.Role === 'moderator')}
    <button
      on:click="{() => {
        adminMenuToggle = true;
      }}"
      class="open-button"
      aria-label="open admin menu">
          <img src="/assets/SHB/svg/AW-icon-menu.svg" alt="open admin menu" class="icon"/>
    </button>
  {/if}
</nav>

<style>
  .icon{
    margin: 0;
    padding: 0;
    width: 100%;
    height: auto;
  }

  button {
    /* border: 2px solid #7300eb; */
    /* background: transparent; */
    cursor: pointer;
    /* border-radius: 0; */
    appearance: none;
    /* padding: 0; */
    /* margin: 0; */
    box-sizing: border-box;
  }

  button:active {
    /* background-color: white; */
    background-color: #7300ed;
    border-radius: 50%;
    /* border: 2px solid #7300ed; */
    /* box-sizing: border-box; */
    /* box-shadow: 5px 5px 0px #7300ed; */
  }
  .open-button {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    margin-right: 10px;
    box-shadow: 4px 4px #7300eb;
  }

  .close-button {
    width: 40px;
    height: 40px;
    cursor: pointer;
    float: right;
    border-radius: 45% 0 0 45%;
    background-color: white;
    box-shadow: -4px 4px #7300eb;
    color: 7300eb;
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
      top: 0;
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
      top: 10px;
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
