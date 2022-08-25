<script>
  import { push, pop, link } from 'svelte-spa-router';
  import ManageSession from '../game/ManageSession';
  import { playerHistory } from '../game/playerState';
  import { DEFAULT_SCENE } from '../../constants';

  async function goHome() {
    // Nice way to always reset to 0x0?

    push(`/?location=${DEFAULT_SCENE}&x=0&y=0`);
    // const goTo = playerHistory.getAt(DEFAULT_SCENE);
    // if (goTo) push(goTo);
    // else {
    //  push(`/?location=${DEFAULT_SCENE}&x=0&y=0`);
    // }
  }

  async function goBack() {
    if ($playerHistory.length > 1) {
      playerHistory.pop();
      pop();
    }
  }

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
      class:showBack="{$playerHistory.length > 1}"
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

  <a
    href="/dev_drawing?userId=fcbcc269-a109-4a4b-a570-5ccafc5308d8&&key=1654865563806_olijfgroensprinkhaan"
    use:link>DRAWING</a
  >
  <a href="/dev_drawing?" use:link>DRAWING NEW</a>
  <a href="/dev_stopmotion" use:link>STOP MOTION</a>
  <a href="/dev_avatar" use:link>AVATAR</a>
  <!-- avatar ook key test1 en test -->
  <!-- er komt hier nog een key bij! -->
  <a
    href="/dev_house?userId=fcbcc269-a109-4a4b-a570-5ccafc5308d8&key=test2"
    use:link>HOUSE 1</a
  >
  <a
    href="/dev_house?userId=fcbcc269-a109-4a4b-a570-5ccafc5308d8&key=test2"
    use:link>HOUSE 2</a
  >
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
