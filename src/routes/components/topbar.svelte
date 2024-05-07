<script>
  import { pop } from 'svelte-spa-router';
  import {
    PlayerHistory,
    PlayerZoom,
    PlayerLocation,
    PlayerPos,
    PlayerUpdate,
  } from '../game/playerState';
  import { DEFAULT_SCENE } from '../../constants';
  // import { dlog } from '../game/helpers/debugLog';

  /** We send the player to the middle of artworld so there is a fixed orientation point
  //  We set the Position after the Location
  //  when we set the position we force the urlparser to do a replace on the history and url,
  //  with PlayerUpdate.set({ forceHistoryReplace: false });
  */
  async function goHome() {
    PlayerLocation.set({
      scene: DEFAULT_SCENE,
    });
    PlayerUpdate.set({ forceHistoryReplace: false });
    PlayerPos.set({
      x: 0,
      y: 0,
    });
  }

  /**  pop() sets off a reaction where the url is parsed, and the player is taken back
   *   PlayerHistory.pop() is to reflect the state there
   */
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
    width: 2rem;
    height: 2rem;
    max-width: 40px;
    max-height: 40px;
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
