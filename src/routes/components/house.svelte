<script>
    import { Profile, CurrentApp } from "../../session";
    import { convertImage, getObject } from "../../api";
    import { onDestroy, onMount } from "svelte";
    import HistoryTracker from "../game/class/HistoryTracker";
    import ManageSession from "../game/ManageSession";

    let image;
    let frame = 0;
    let interval;
    let url;
    let show = false;
    let showHistory = false;
    let version;
    let house_url;
  
  
    async function nextVersion() {
      if($Profile.meta.LastAvatarVersion <= version) return
      version++;
      console.log("version", version);
      console.log("$Profile.meta.LastAvatarVersion",$Profile.meta.LastAvatarVersion)
      url = await setAvatar(`avatar/${$Profile.id}/${version}_current.png`)
      img.src = url;
      img.onerror = () => {
          version -= 2
          nextVersion()
          console.log("img not availible, gone bacck")
        };
    }
  
    async function backVersion() {
        if(version <= 1) return console.log("first image reached")
      version--;
      console.log("version", version);
      url = await convertImage(`avatar/${$Profile.id}/${version}_current.png`,'150','1000')
      setAvatar(`avatar/${$Profile.id}/${version}_current.png`)
    }
  
    function loadUrl(){
      url = $Profile.url
      console.log(url);
      version = Number($Profile.avatar_url.split("/")[2].split("_")[0]);
    }
  

  async function goHome() {
        HistoryTracker.switchScene(
          ManageSession.currentScene,
          "DefaultUserHome",
          ManageSession.userProfile.id
        );
  }

  onMount(async ()=>{
    try {
        house_url = await getObject("home", $Profile.meta.Azc, $Profile.user_id);
      } catch (err) {
        console.log(err); // TypeError: failed to fetch
      }
      if (typeof house_url == "object") {
        house_url = await convertImage(house_url.value.url, "150", "150");
      } else {
        house_url = "";
      }
  })

  </script>
  
  {#if showHistory}
    <div class="backAvatar">
      <img src="/assets/SHB/svg/AW-icon-previous.svg" on:click={backVersion} />
    </div>
  {/if}
  <div
    class="avatar"
    on:click={() => {
      // show = !show;
      // showHistory = false;
      $CurrentApp = "house";
    }}
  >
    <img id="house" src={house_url} />
  </div>
  {#if showHistory}
    <div class="nextAvatar">
      <img src="/assets/SHB/svg/AW-icon-next.svg" on:click={nextVersion} />
    </div>
  {/if}
  {#if show}
    <div class="action">
      <img
        src="/assets/SHB/svg/AW-icon-pen.svg"
        on:click={() => {
          $CurrentApp = "house";
        }}
      />
      <img
        src="assets/SHB/svg/AW-icon-enter-space.svg"
        on:click={() => {
          goHome()
        }}
      />

      <img
        src="/assets/SHB/svg/AW-icon-history.svg"
        on:click={() => {
          showHistory = true;
          show = false;
        }}
      />
    </div>
  {/if}
  
  <style>
    .avatar {
      height: 150px;
      width: 150px;
      overflow: hidden;
      position: relative;
    }
  
    .avatar > img {
      height: 150px;
      position: absolute;
      left: 0px;
    }
  
    .action > img {
      width: 70px;
      cursor: pointer;
    }
  </style>
  