<script>
  import { Profile, CurrentApp } from "../../session";
  import { convertImage } from "../../api";
  import { onDestroy, onMount } from "svelte";
  let image;
  let frame = 0;
  let interval;
  let url;
  let show = false;
  let showHistory = false;
  let version;

  async function nextVersion() {
    version++;
    console.log("version", version);
    // get url
    // check if url is valid
    // if valid place
    // if not valid dont update to new 
    url = await convertImage(`avatar/${$Profile.id}/${version}_current.png`,"150","1000")
    console.log(url)

  }

  async function backVersion() {
      if(version <= 1) return
    version--;
    console.log("version", version);
    url = await convertImage(`avatar/${$Profile.id}/${version}_current.png`,'150','1000')
    console.log(url)

  }

  onMount(async () => {
    url = $Profile.url
    console.log(url);
    version = Number($Profile.avatar_url.split("/")[2].split("_")[0]);
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
