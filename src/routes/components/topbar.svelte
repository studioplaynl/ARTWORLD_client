<script>
  import { pop } from 'svelte-spa-router';
  import {
    PlayerHistory,
    PlayerZoom,
    PlayerLocation,
    PlayerPos,
  } from '../game/playerState';
  import { DEFAULT_SCENE } from '../../constants';
  // import { dlog } from '../game/helpers/debugLog';

  async function goHome() {
    // Nice way to always reset to 0x0?
    // replace(`/${appName}?${get(querystring)}`);
    // PlayerHistory.replace(`/${appName}?${get(querystring)}`);
    // const value = `/game?location=${DEFAULT_SCENE}&x=0&y=0`;
    // push(value);
    // PlayerHistory.push(value);

    PlayerPos.set({
      x: 0,
      y: 0,
    });

    PlayerLocation.set({
      scene: DEFAULT_SCENE,
    });
  }

  async function goBack() {
    if ($PlayerHistory.length > 1) {
      PlayerHistory.pop();
      pop();
    }
  }

  async function zoomIn() {
    PlayerZoom.in();
  }

  function zoomReset() {
    PlayerZoom.reset();
  }

  function zoomOut() {
    PlayerZoom.out();
  }
</script>

<div class="topbar">
  <button on:click="{goHome}">
    <img
      class="TopIcon"
      id="logo"
      src="assets/SHB/svg/AW-icon-logo-A.svg"
      alt="Homepage"
    />
  </button>

  <button on:click="{goBack}">
    <img
      class="TopIcon"
      id="back"
      class:showBack="{$PlayerHistory.length > 1}"
      src="/assets/SHB/svg/AW-icon-previous.svg"
      alt="Go back"
    />
  </button>

  <button on:click="{zoomOut}" id="zoomOut">
    <img
      class="TopIcon"
      src="/assets/SHB/svg/AW-icon-minus.svg"
      alt="Zoom out"
    />
  </button>
  <button on:click="{zoomReset}" id="zoomReset">
    <img
      class="TopIcon"
      src="assets/SHB/svg/AW-icon-zoom-reset.svg"
      alt="Reset zoom"
    />
  </button>
  <button on:click="{zoomIn}" id="zoomIn">
    <img
      class="TopIcon"
      src="./assets/SHB/svg/AW-icon-plus.svg"
      alt="Zoom in"
    />
  </button>

  <!-- <a
    href="/drawing?userId=fcbcc269-a109-4a4b-a570-5ccafc5308d8&&key=1654865563806_olijfgroensprinkhaan"
    use:link>DRAWING</a
  >
  <a href="/drawing?" use:link>(NEW)</a>
  <a href="/stopmotion" use:link>STOP MOTION</a>
  <a href="/stopmotion" use:link>(NEW)</a>
  <a href="/avatar" use:link>AVATAR</a>
   avatar ook key test1 en test -->
  <!-- er komt hier nog een key bij! -->
  <!-- <a
    href="/house?userId=fcbcc269-a109-4a4b-a570-5ccafc5308d8&key=test2"
    use:link>HOUSE 1</a
  >
  <a
    href="/house?userId=fcbcc269-a109-4a4b-a570-5ccafc5308d8&key=test2"
    use:link>HOUSE 2</a
  > -->
</div>

<style>
  button {
    border: 0;
    background: transparent;
    cursor: pointer;
    border-radius: 0;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    display: inline-block;
    width: auto;
    transform-origin: center;
    transform: scale(1);
  }
  button:active,
  button:not(:disabled):active {
    outline: none;
    background: transparent;
    transform: scale(1.05);
  }
  button:focus {
    outline: none;
  }

  * {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .topbar {
    position: fixed;
    left: 0;
    top: 0;
    margin: 16px;
  }

  .TopIcon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: white;
  }

  #logo {
    box-shadow: 5px 5px 0px #7300ed;

    /* fix ios logo cut-off */
    margin-right: 6px;
    margin-bottom: 2px;
  }

  #back {
    visibility: hidden;
  }

  .showBack {
    visibility: visible !important;
  }
  /* .debug {
  } */
</style>
