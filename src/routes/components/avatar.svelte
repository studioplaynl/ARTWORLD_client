<script>
  import { Profile, CurrentApp } from "../../session";
  import { convertImage, setAvatar } from "../../api";
  import { onDestroy, onMount } from "svelte";

  let image;
  let frame = 0;
  let interval;
  let url;
  let show = false;
  let showHistory = false;
  let version;
  const img = new Image();


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

  Profile.subscribe(loadUrl)



  onMount(async () => {
    loadUrl()
    interval = setInterval(() => {
      frame++;
      if (frame >= image.clientWidth / 150) {
        frame = 0;
        image.style.left = "0px";
      } else {
        image.style.left = `-${frame * 150}px`;
      }
    }, 200);
  });

  onDestroy(() => {
    clearInterval(interval);
  });
</script>

{#if showHistory}
  <div class="backAvatar">
    <img src="/assets/SHB/svg/AW-icon-previous.svg" on:click={backVersion} />
  </div>
{/if}
<div
  class="avatar"
  on:click={() => {
    show = !show;
    showHistory = false;
    // $CurrentApp = "avatar";

  }}
>
  <img bind:this={image} src={url} />
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
        $CurrentApp = "avatar";
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
