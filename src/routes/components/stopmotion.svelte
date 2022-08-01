<script>
  import { onDestroy, beforeUpdate, createEventDispatcher } from 'svelte';

  let image;
  let frame = 0;
  let url;
  let interval;
  export let row;

  beforeUpdate(async () => {
    clearInterval(interval);
    if (row.user) {
      url = row.user.url;
    } else if (row.value) {
      url = row.value.previewUrl;
    } else if (row.img) {
      url = row.img;
    }
    interval = setInterval(() => {
      frame++;
      if (frame >= image.clientWidth / 150) {
        frame = 0;
        image.style.left = '0px';
      } else {
        image.style.left = `-${frame * 150}px`;
      }
    }, 500);
  });

  onDestroy(() => {
    clearInterval(interval);
  });

  const dispatch = createEventDispatcher();

  function submitClicked() {
    // alert('Now submitting clicked');
    // if (row.value) push(`/${row.collection}/${row.user_id}/${row.key}`);
    dispatch('clicked', row);
  }
</script>

<div class="stopmotion" on:click="{submitClicked}">
  <img bind:this="{image}" src="{url}" alt="Stop motion" />
</div>

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
