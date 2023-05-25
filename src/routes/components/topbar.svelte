<script>
  import { push, pop } from 'svelte-spa-router';
  import { PlayerHistory, PlayerZoom } from '../game/playerState';
  import { DEFAULT_SCENE } from '../../constants';
  // import { dlog } from '../game/helpers/DebugLog';

  async function goHome() {
    // Nice way to always reset to 0x0?
    // replace(`/${appName}?${get(querystring)}`);
    // PlayerHistory.replace(`/${appName}?${get(querystring)}`);
    const value = `/game?location=${DEFAULT_SCENE}&x=0&y=0`;
    push(value);
    PlayerHistory.push(value);
  }

  async function goBack() {
    if ($PlayerHistory.length > 1) {
      PlayerHistory.pop();
      pop();
    }
  }

  async function goNextUser6House() {
    const value = '/game?location=GreenSquare&x=-53.75&y=995';
    push(value);
  }

  async function inToUser6House() {
    const value = '/game?location=DefaultUserHome&house=fcbcc269-a109-4a4b-a570-5ccafc5308d8&x=-2622&y=0';
    push(value);
  }

  async function goNextUser16House() {
    const value = '/game?location=GreenSquare&x=211.25&y=996.25';
    push(value);
  }

  async function inToUser16House() {
    const value = '/game?location=DefaultUserHome&house=b3b8992b-60dd-4920-b156-3ea04d572b4e&x=-2622&y=0';
    push(value);
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

  <!-- <button on:click="{zoomOut}" id="zoomOut">
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
  </button> -->

  <button on:click="{goNextUser6House}" id="user6_next" class="TopIcon">
    nextTo6
  </button>
  <button on:click="{inToUser6House}" id="user6_in" class="TopIcon">
    In_6
  </button>

  <button on:click="{goNextUser16House}" id="user16_next" class="TopIcon">
    nextTo16
  </button>
  <button on:click="{inToUser16House}" id="user16_in" class="TopIcon">
   In_16
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

  #user6_next{
    position: absolute;
    top: 80px;
    left: 15px;
    box-shadow: 2px 2px #000000;
    border: 1px solid black;
    color: black;
    width: auto;
    padding: 4px;
    border-radius: 0;
  }

  #user6_in{
    position: absolute;
    top: 80px;
    left: 105px;
    box-shadow: 2px 2px #000000;
    border: 1px solid black;
    color: black;
    width: auto;
    padding: 4px;
    border-radius: 0;
  }

  #user16_next{
    position: absolute;
    top: 130px;
    left: 15px;
    box-shadow: 2px 2px #000000;
    border: 1px solid black;
    color: black;
    width: auto;
    padding: 4px;
    border-radius: 0;
  }

  #user16_in{
    position: absolute;
    top: 130px;
    left: 115px;
    box-shadow: 2px 2px #000000;
    border: 1px solid black;
    color: black;
    width: auto;
    padding: 4px;
    border-radius: 0;
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
