<script>
  import { link } from 'svelte-spa-router';
  import SceneSwitcher from '../game/class/SceneSwitcher';
  import ManageSession from '../game/ManageSession';
  import {
    playerPosX,
    playerPosY,
    playerLocationScene,
    playerLocationHouse,
  } from '../game/playerState';
  // import { History } from '../../session';
  // import { dlog } from '../game/helpers/DebugLog';

  const home = 'Artworld';

  async function goHome() {
    SceneSwitcher.switchScene(home, home);
  }

  // async function goBack() {
  // dlog($History);
  // if ($History.length > 1) {
  //   SceneSwitcher.activateBackButton(ManageSession.currentScene);
  // }
  // }

  async function zoomIn() {
    if (ManageSession.currentZoom >= 4) return;
    ManageSession.currentZoom += 0.1;
  }

  function zoomReset() {
    ManageSession.currentZoom = 1;
  }

  function zoomOut() {
    if (ManageSession.currentZoom <= 0.2) return;
    ManageSession.currentZoom -= 0.1;
  }
</script>

<div class="topbar">
  <a href="/?location=Artworld&house=" use:link>
    <img
      class="TopIcon"
      id="logo"
      src="assets/SHB/svg/AW-icon-logo-A.svg"
      alt="Homepage"
    />
  </a>
  <!-- <button on:click="{goBack}">
    <img
      class="TopIcon"
      class:showBack="{$History.length > 1}"
      id="back"
      src="/assets/SHB/svg/AW-icon-previous.svg"
      alt="Go back"
    />
  </button> -->
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

  <div class="debug">
    {$playerPosX} x {$playerPosY} - {$playerLocationScene} - {$playerLocationHouse}
  </div>
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
    margin: 15px 15px 15px 30px;
  }

  .TopIcon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: white;
  }

  #logo {
    box-shadow: 5px 5px 0px #7300ed;
  }

  #back {
    visibility: hidden;
  }

  .showBack {
    visibility: visible !important;
  }

  .debug {
  }
</style>
