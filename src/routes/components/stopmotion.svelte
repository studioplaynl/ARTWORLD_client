<script>
  import { convertImage } from "../../api";
  import { onDestroy, onMount } from "svelte";
  import { push } from "svelte-spa-router";
  let image;
  let frame = 0;
  let interval;
  let url;
  export let value;
  export let row;

//   async function convertURL() {
//       console.log("run converturl")
//     if (!!row) value = item.value.previewUrl;

//     url = await convertImage(row.value.url, "150", "1000", "png");
//     console.log("stopmotion", url);
//   }
//   convertURL();

  onMount(async () => {
    interval = setInterval(() => {
      frame++;
      if (frame == image.clientWidth / 150) {
        frame = 0;
        image.style.left = "0px";
      } else {
        image.style.left = `-${frame * 150}px`;
      }
    }, 500);
  });

  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<a on:click={push(`/${row.collection}/${row.user_id}/${row.key}`)}>
  <div class="stopmotion">
    <img bind:this={image} src={row.value.previewUrl} />
    <!-- <p class="hide" on:change="{convertURL}">{row.value.url}</p> -->
  </div>
</a>

<style>
  .stopmotion {
    height: 150px;
    width: 150px;
    overflow: hidden;
    position: relative;
  }

  .stopmotion > img {
    height: 150px;
    position: absolute;
    left: 0px;
  }
</style>
