<script>
    import DrawingApp from "../apps/drawing.svelte";
    import { CurrentApp } from "../../session";
    import { fly } from "svelte/transition";
    import HistoryTracker from "../game/class/HistoryTracker";
    import ManageSession from "../game/ManageSession";
    import { location, push } from "svelte-spa-router";
    import { onMount } from "svelte";
    import { getAccount } from "../../api.js";
    import DrawingChallenge from "../apps/drawingChallenge.svelte";

    let appOpen = false;
    let firstTry = true;

    export let params;

    const unsubscribe = CurrentApp.subscribe(async (value) => {
        if (firstTry) {
            firstTry = false;
            let local = $location.split("/")[1];
            if (local != "login") appOpen = $location.split("/")[1];
            return value;
        }
        if (value == "game") return;
        if (!!$CurrentApp)
            await HistoryTracker.pauseSceneStartApp(
                ManageSession.currentScene,
                value
            );
        else
            await HistoryTracker.startSceneCloseApp(
                ManageSession.currentScene,
                appOpen
            );
        appOpen = value;
        if (!!value) push("/" + value);
    });

    const unsubscribe2 = location.subscribe(async () => {
        appOpen = $location.split("/")[1];
        console.log(appOpen);
    });

    async function closeApp() {
        console.log("closeApp");

        if (appOpen == "avatar") {
            console.log("closeApp avatar, appOpen:", appOpen);
            console.log("avatar user id:", ManageSession.userProfile.id);
            getAccount(ManageSession.userProfile.id);
        }

        $CurrentApp = "";
        appOpen = "";
        push("/");
    }

    function reloadApp() {
        let app = $CurrentApp;
        $CurrentApp = false;
        $CurrentApp = app;
    }

    onMount(() => {
        $CurrentApp = $location.split("/")[1];
    });
</script>

{#if !!appOpen}
    <div id="close" on:click={closeApp}>
        <img src="assets/SHB/svg/AW-icon-cross.svg" />
    </div>

    <div class="app" transition:fly={{ y: window.innerHeight, duration: 500 }}>
        {#if appOpen == "drawing" || appOpen == "stopmotion" || appOpen == "house" || appOpen == "avatar" || appOpen == "drawingchallenge"}
            <DrawingApp bind:appType={appOpen} />
        {/if}

        <!-- {#if appOpen == "drawingchallenge"}
            <DrawingChallenge bind:appType={appOpen} />
        {/if} -->
    </div>
{/if}

<style>
    .app {
        position: fixed;
        left: 0;
        top: 0;
        height: 100vh;
        min-width: 100vw;
        z-index: 12;
        background-color: white;
    }

    #close {
        position: fixed;
        left: 20px;
        top: 20px;
        z-index: 13;
        /* border: 2px solid #7300ed; */
        box-shadow: 5px 5px 0px #7300ed;
        cursor: pointer;
        padding: 0;
        margin: 0;
        border-radius: 50%;
        width: 40px;
        height: 40px;
    }
    #close > img {
        width: 40px;
    }

    @media only screen and (max-width: 700px) {
        #close {
            top: unset;
            bottom: 20px;
        }
    }
</style>
