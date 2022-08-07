<script>
  import {
    convertImage,
    getObject,
    addFriend,
    listAllObjects,
  } from "../../api";
  import itemsBar from "./itemsbar.js";
  import ProfilePage from "../profile.svelte";
  import FriendsPage from "../friends.svelte";
  import LikedPage from "../liked.svelte";
  import { Profile, Session } from "../../session";
  import { CurrentApp, logout } from "../../session";
  import Awards from "../awards.svelte";
  import { location } from "svelte-spa-router";
  import { Liked, Addressbook } from "../../storage.js";
  import { get } from "svelte/store";
  import MdPersonOutline from "svelte-icons/md/MdPersonOutline.svelte";
  import MdPersonAdd from "svelte-icons/md/MdPersonAdd.svelte";

  let ManageSession;
  let current;
  let HistoryTracker;
  let images = [];
  let user_house_url,
    house_url,
    user_avatar_url,
    avatar_url,
    user_name,
    user_id,
    adress_book,
    homeOpen = false;

  let likedArtworks = [];
  let lastLengthArtworks = 0;
  let alreadySubscribedToLiked = false;

  let addressbookList = [];
  let lastLengthAddressbook = 0;
  let alreadySubscribedToAddressbook = false;
  let addressbookImages = [];

  //check if player is clicked
  const unsubscribe = itemsBar.subscribe(async (value) => {
    console.log(value);
    HistoryTracker = (await import("../game/class/HistoryTracker.js")).default;
    ManageSession = (await import("../game/ManageSession.js")).default;
    console.log($location);
    if (!!!$Profile) return;
    if ($location == "/login") return;
    console.log($Profile);
    user_avatar_url = $Profile.url;
    if (user_house_url == undefined) {
      user_house_url = await getObject("home", $Profile.meta.Azc, $Profile.id);
      user_house_url = await convertImage(user_house_url.value.url, "50", "50");
    }
    //console.log(ManageSession)

    if (value.onlinePlayerClicked === true) {
      console.log(
        "ManageSession.selectedOnlinePlayer",
        ManageSession.selectedOnlinePlayer
      );
      avatar_url = ManageSession.selectedOnlinePlayer.url;
      console.log("avatar_url", avatar_url);
      user_name = ManageSession.selectedOnlinePlayer.username;
      console.log("user_name", user_name);
      console.log(
        "ManageSession.selectedOnlinePlayer.metadata.Azc",
        ManageSession.selectedOnlinePlayer.metadata.Azc
      );
      console.log(
        "ManageSession.selectedOnlinePlayer.id",
        ManageSession.selectedOnlinePlayer.id
      );
      user_id = ManageSession.selectedOnlinePlayer.id;
      house_url = await getObject(
        "home",
        ManageSession.selectedOnlinePlayer.metadata.Azc,
        ManageSession.selectedOnlinePlayer.id
      );
      // getObject provides an object in the format of:
      // collection: "home"
      // create_time: "2021-12-13T14:37:50Z"
      // key: "Amsterdam"
      // permission_read: 2
      // permission_write: 1
      // update_time: "2022-04-25T13:59:04Z"
      // user_id: "f42eb28f-9f4d-476c-9788-2240bac4cf48"
      // value:
      // // posX: 143.16
      // // posY: -178.99
      // // url: "home/f42eb28f-9f4d-476c-9788-2240bac4cf48/5_current.png"
      // // username: "user33"
      // // version: 5
      console.log("house_url", house_url);
      house_url = await convertImage(house_url.value.url, "50", "50");
      console.log("house_url", house_url);
    }
  });

  function subscribeToAddressbook() {
    Addressbook.subscribe((value) => {
      alreadySubscribedToAddressbook = true;
      if (lastLengthAddressbook != value.length) {
        lastLengthAddressbook = value.length;
        addressbookImages = [];
        addressbookList = value;
        if (addressbookList.length > 0) {
          let tempArray = [];
          addressbookList.forEach(async (element) => {
            tempArray.push(
              await getObject(
                "home",
                element.value.metadata.Azc,
                element.value.user_id
              )
            );
            if (addressbookList.length == tempArray.length) {
              tempArray.forEach(async (element) => {
                addressbookImages.push({
                  name: element.value.username,
                  id: element.user_id,
                  url: await convertImage(element.value.url, "50", "50"),
                });
                addressbookImages = addressbookImages;
              });
            }
          });
        }
      }
    });
  }

  async function Click() {
    $itemsBar.playerClicked = true; //update liked array by subscription

    $itemsBar.onlinePlayerClicked = false;
  }

  async function getLiked() {
    //toggle the open state of the panel "liked"
    if (current == "liked") {
      current = false;
      return;
    }

    current = "liked";
  }

  async function getFriends() {
    if (current == "friends") {
      current = false;
      return;
    }
    current = "friends";
  }

  async function getAdressbook() {
    // toggle the open state of the panel "addressbook"
    if (current == "addressbook") {
      current = false;
      return;
    }

    if (alreadySubscribedToAddressbook != true) {
      subscribeToAddressbook();
    }

    current = "addressbook";
  }

  async function getHomeOptions() {
    if (current == "home") {
      current = false;
      return;
    }
    current = "home";
  }

  async function goProfile() {
    if (current == "home") {
      current = false;
      return;
    }
    current = "home";
  }

  async function goHome(id) {
    if (typeof id == "string") {
      HistoryTracker.switchScene(
        ManageSession.currentScene,
        "DefaultUserHome",
        id
      );
    } else {
      if ($itemsBar.playerClicked) {
        HistoryTracker.switchScene(
          ManageSession.currentScene,
          "DefaultUserHome",
          ManageSession.userProfile.id
        );
      } else {
        HistoryTracker.switchScene(
          ManageSession.currentScene,
          "DefaultUserHome",
          ManageSession.selectedOnlinePlayer.id
        );
      }
    }
  }

  async function goScene(name) {
    if (typeof name == "string") {
      HistoryTracker.switchScene(ManageSession.currentScene, name, name);
    }
  }

  async function award() {
    console.log(ManageSession.userProfile.meta);
    if (current == "awards") {
      current = false;
      return;
    }
    current = "awards";
  }

  async function saveHome() {
    if (ManageSession.selectedOnlinePlayer) {
      const userId = ManageSession.selectedOnlinePlayer.user_id;
      const userName = ManageSession.selectedOnlinePlayer.username;
      const avatarImage = ManageSession.selectedOnlinePlayer.avatar_url;
      const metadata = ManageSession.selectedOnlinePlayer.metadata;

      const value = {
        user_id: userId,
        username: userName,
        avatar_url: avatarImage,
        metadata,
      };
      Addressbook.create(userId, value);
    }
  }

  async function goApp(App) {
    // HistoryTracker.pauseSceneStartApp(ManageSession.currentScene, App)
    $CurrentApp = App;
  }
</script>

{#if $location != "/login"}
  <div id="itemsButton" class:show={!$itemsBar.playerClicked}>
    <a on:click={Click} class="avatar"><img src={$Profile.url} /></a>
  </div>
{/if}
<!-- current user -->
<div class="itemsbar" id="currentUser" class:show={$itemsBar.playerClicked}>
  <div id="left">
    <!-- svelte-ignore a11y-missing-attribute -->
    <a on:click={goProfile} class="avatar"><img src={$Profile.url} /></a>
    <a
      on:click={() => {
        goHome();
      }}
      class="avatar"><img src={user_house_url} /></a
    >
    <a on:click={award}
      ><img class="icon" src="assets/SHB/svg/AW-icon-achievement.svg" /></a
    >
    <a on:click={getAdressbook}
      ><img class="icon" src="assets/SHB/svg/AW-icon-addressbook-vert.svg" /></a
    >

    <a on:click={getFriends}
      ><img class="icon" src="assets/SHB/svg/AW-icon-friend.svg" />
    </a>
    <a
    on:click={() => {
      window.location.href = "/#/mariosound";
      
    }}><img class="icon" src="assets/SHB/svg/AW-icon-sound.svg" /></a
  >
    <a
      on:click={() => {
        goApp("drawing");
      }}><img class="icon" src="assets/SHB/svg/AW-icon-drawing.svg" /></a
    >
    <a
      on:click={() => {
        goApp("stopmotion");
      }}><img class="icon" src="assets/SHB/svg/AW-icon-animation.svg" /></a
    >

    <a on:click={getLiked}
      ><img class="icon" src="assets/SHB/svg/AW-icon-heart-full-red.svg" /></a
    >

    <!-- <a
      on:click={() => {
        goApp("drawingchallenge");
        console.log("Drawing Challenge is clicked");
      }}
      class="avatar"
    >
      <h3>DC</h3></a
    > -->

    <span>-</span>
    <a on:click={logout}
      ><img class="icon" src="assets/SHB/svg/AW-icon-exit.svg" /></a
    >
  </div>
  <div id="right">
    {#if current == "liked"}
      <div>
        <LikedPage />
      </div>
    {/if}
    {#if current == "addressbook"}
      <!-- <div style="display: flex; flex-direction: row"> -->
      {#each addressbookImages as address}
        <!-- svelte-ignore a11y-missing-attribute -->
        <div style="display: flex; flex-direction: row">
          <div>
            <a
              style="margin-bottom: 20px"
              on:click={() => {
                goHome(address.id);
              }}
            >
              <img class="addressbook-image" src={address.url} />{address.name}
            </a>
          </div>

          <!-- svelte-ignore a11y-missing-attribute -->
          <a
            on:click={() => {
              Addressbook.delete(address.id);
            }}><img class="icon" src="assets/SHB/svg/AW-icon-trash.svg" /></a
          >
        </div>
      {/each}
    {/if}
    {#if current == "home"}
      <ProfilePage />
    {/if}
    {#if current == "friends"}
      <FriendsPage />
    {/if}
    {#if current == "awards"}
      <Awards />
    {/if}
  </div>
</div>

<!-- online user -->
<div
  class="itemsbar"
  id="onlineUser"
  class:show={$itemsBar.onlinePlayerClicked}
>
  <div id="right">
    {#if current == "liked"}
      <div>
        <LikedPage />
      </div>
    {/if}

    {#if current == "home"}
      <br /><br /><br />
      <a on:click={saveHome}
        ><img class="icon" src="assets/SHB/svg/AW-icon-save.svg" /></a
      >
      <a on:click={goHome}
        ><img class="icon" src="assets/SHB/svg/AW-icon-enter-space.svg" /></a
      >
      <!-- <ProfilePage userID="{ManageSession.selectedOnlinePlayer.id}" /> -->
    {/if}
  </div>
  <div id="left">
    <p>{user_name}</p>
    <a on:click={() => {}} class="avatar"><img src={avatar_url} /></a>
    <a on:click={getHomeOptions}><img id="house" src={house_url} /></a>
    <a
      on:click={() => {
        addFriend(user_id);
      }}
    >
      <img class="icon" src="assets/SHB/svg/AW-icon-add-friend.svg" />
    </a>
    <a on:click={getLiked}
      ><img class="icon" src="assets/SHB/svg/AW-icon-heart-full-red.svg" /></a
    >
  </div>
</div>

{#if $itemsBar.playerClicked || $itemsBar.onlinePlayerClicked}
  <div
    on:click={() => {
      $itemsBar.playerClicked = false;
      $itemsBar.onlinePlayerClicked = false;
      current = false;
    }}
    id="backdrop"
  />
{/if}

<style>
  * {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  .itemsbar,
  #itemsButton {
    background-color: white;
    text-align: center;
    border-radius: 50px;
    /* border: 2px solid #7300ed; */
    box-shadow: 5px 5px 0px #7300ed;
    padding: 14px 14px 14px 18px;
    position: fixed;
    z-index: 10;
    -webkit-transition: 0.01s all ease-in-out;
    -moz-transition: 0.01s all ease-in-out;
    -o-transition: 0.01s all ease-in-out;
    transition: 0.01s all ease-in-out;
    opacity: 0;
    pointer-events: none;
    max-height: 90vh;
    display: flex;
  }

  @media screen and (max-width: 600px) {
    #currentUser,
    #itemsButton {
      left: 3px;
      bottom: 8px;
    }

    #onlineUser {
      right: 3px;
      bottom: 8px;
    }
  }

  @media screen and (min-width: 600px) {
    #currentUser,
    #itemsButton {
      left: 9px;
      bottom: 9px;
    }
    #onlineUser {
      right: 9px;
      bottom: 9px;
    }
  }

  /* Show the snackbar when clicking on a button (class added with JavaScript) */
  .itemsbar.show,
  #itemsButton.show {
    visibility: visible; /* Show the snackbar */
    /* Add animation: Take 0.5 seconds to fade in and out the snackbar.
    However, delay the fade out process for 2.5 seconds */
    /* -webkit-animation: fadein 0.5s, fadeout 0.5s 2.5s; */
    /* animation: fadein 0.5s, fadeout 0.5s 2.5s; */
    opacity: 1;
    pointer-events: all;
  }

  /* Animations to fade the snackbar in and out */
  /* @-webkit-keyframes fadein {
    from {top: 0; opacity: 0;}
    to {top: 60px; opacity: 1;}
    } */

  .icon {
    max-width: 50px;
    height: 50px;
    float: left;
    margin-top: 5px;
  }

  #itemsButton > a > .icon {
    margin-top: 0px;
  }

  #left {
    display: flex;
    flex-wrap: nowrap;
    float: left;
    margin-right: 5px;
    justify-content: flex-start;
    flex-direction: column-reverse;
  }

  #right {
    float: left;
    overflow-x: hidden;
    overflow-y: auto;
    margin: 20px 0px;
  }

  .homeBox {
    display: flex;
  }

  div#backdrop {
    position: fixed;
    width: 100vw;
    height: 100vh;
    z-index: 9;
    top: 0;
    left: 0;
  }

  div#right > div {
    display: flex;
    flex-direction: column;
    padding: 15px;
    overflow-y: auto;
    overscroll-behavior-y: contain;
    scroll-snap-type: y proximity;
    max-height: 80vh;
    margin: 0px;
    align-items: flex-start;
  }
  .avatar {
    height: 50px;
    width: 50px;
    overflow: hidden;
  }

  .avatar > img {
    height: 50px;
  }

  .addressbook-image {
    display: block;
    height: 50px;
    width: 50px;
  }
</style>
