<script>
import DrawingApp from "../apps/drawing.svelte"
import {CurrentApp} from "../../session"
import { fly } from 'svelte/transition';
import HistoryTracker from "../game/class/HistoryTracker"
import ManageSession from "../game/ManageSession"
let appOpen = false
let firstTry = true

const unsubscribe = CurrentApp.subscribe(async value => {
    if(firstTry) return firstTry = false;
    if(!!$CurrentApp) await HistoryTracker.pauseSceneStartApp(ManageSession.currentScene, value)
    else await HistoryTracker.startSceneCloseApp(ManageSession.currentScene, appOpen)
    appOpen = value
});


async function closeApp(){
    $CurrentApp = false
}

function reloadApp(){
    let app = $CurrentApp
    $CurrentApp = false
    $CurrentApp = app
}
</script>
{#if !!appOpen}
    <div id="close" on:click="{closeApp}">X</div>

    <div class="app"
        transition:fly="{{ y: window.innerHeight, duration: 500 }}"
            
    >
    {#if appOpen == "drawing" || appOpen == "stopmotion"|| appOpen == "house"|| appOpen == "avatar"}
        <DrawingApp bind:appType={appOpen}/>
    {/if}
    </div>
{/if}

<style>

 .app{
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    min-width: 100vw;
    z-index: 12;
    background-color: white;
    }

  #close{
    position: fixed;
    right: 10px;
    top: 10px;
    z-index: 13;
    border: 2px solid #7300ed;
    cursor: pointer;
    padding: 10px;
    margin: 10px;
    border-radius: 51%;
    background-color: white;
    font-weight: bold;
    width: 20px;
    height: 20px;
    text-align: center;
  }

  
  

</style>
 