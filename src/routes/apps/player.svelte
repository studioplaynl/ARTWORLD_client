<script>
  import { onMount } from 'svelte';
  import { location } from 'svelte-spa-router';
  import { getObject, getFile } from '../../helpers/api';
  import { dlog } from '../game/helpers/DebugLog';

  export let params;
  let fileUrl;
  const appType = $location.split('/')[1];

  dlog(params);

  onMount(async () => {
    fileUrl = await getObject(appType, params.name, params.user);
    dlog(fileUrl);
    fileUrl = await getFile(fileUrl.value.url);
  });
</script>

<!-- svelte-ignore a11y-media-has-caption -->
<main>
  <center>
    {#if typeof fileUrl === 'string'}
      {#if appType === 'audio'}
        <audio controls autoplay>
          <source src="{fileUrl}" type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      {:else if appType === 'video'}
        <video controls autoplay>
          <source src="{fileUrl}" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      {:else if appType === 'picture'}
        <img src="{fileUrl}" alt="" />
      {/if}
    {/if}
  </center>
</main>

<style>
  video {
    width: 100vw;
    height: 100vh;
  }
</style>
