<script>
    import {onMount} from "svelte";
    import { location } from "svelte-spa-router";

    import {getObject, getFile} from "../../api"
    export let params = {};
    let file_url
    let appType = $location.split("/")[1];
    console.log(params)

    onMount(async ()=> {
        file_url = await getObject(appType, params.name, params.user)
        console.log(file_url)
        file_url = await getFile(file_url.value.url)
    })


</script>

<main>
    <center>
    {#if (typeof file_url == "string")}
        {#if appType == "audio"}
            <audio controls autoplay>
                <source src="{file_url}" type="audio/mpeg">
            Your browser does not support the audio element.
            </audio>
        {:else if appType == "video" }
        <video controls autoplay>
            <source src="{file_url}" type="video/mp4">
          Your browser does not support the video tag.
          </video>
        {:else if appType == "picture" }
          <img src="{file_url}">
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