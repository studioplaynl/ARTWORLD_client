<script>
<<<<<<< HEAD
import itemsBar from "./itemsbar.js"

//export let itemsbar = {}
=======
import {convertImage} from "../../api"

export let click =  false
>>>>>>> b50cf4d31acbba0f9b41cbbadb8e88e589305d11

	
let ManageSession;
let current	
let images = []


<<<<<<< HEAD
function getLiked(){
    console.log(itemsBar.liked)
    console.log(itemsBar.addressbook)
    console.log(itemsBar.home)
=======
async function getLiked(){
    if(current == "liked" ) {current = false; return};
    ManageSession = (await import('../game/ManageSession.js')).default;
    images = []
    ManageSession.liked.liked.forEach(async (liked) => {
        images.push(await convertImage(liked.url,"128"))
        images = images
        console.log(images)
        current = "liked"
    });
    console.log(images)

    current = "liked"
>>>>>>> b50cf4d31acbba0f9b41cbbadb8e88e589305d11
}

async function goHome(){
    // let HistoryTracker = (await import("../game/class/HistoryTracker.js")).default;

    // HistoryTracker.switchScene(scene, "DefaultUserHome", ManageSession.userProfile.id)
    window.history.pushState('', 'home', '/?location=home_' + ManageSession.userProfile.id);


}

async function getAdressbook(){
    if(current == "addressbook" ) {current = false; return};
    ManageSession = (await import('../game/ManageSession.js')).default;

    console.log(ManageSession.addressbook)
    current = "addressbook"
}

</script>

<div id="itemsButton" class:show={!click}>
    <a on:click={()=>{click = true}}><img class="icon" src="assets/SHB/svg/AW-icon-more.svg"></a>
</div>
<div id="itemsbar" class:show={click}>
    <div id="left">
        <a on:click={goHome}><img class="icon" src="assets/SHB/svg/AW-icon-home.svg"></a>
        <a on:click={getAdressbook}><img class="icon" src="assets/SHB/svg/AW-icon-addressbook.svg"></a>
        <a on:click={getLiked}><img class="icon" src="assets/SHB/svg/AW-icon-heart-full-red.svg"></a>
    </div>
    <div id="right">
        {#if current == "liked"}
            <div>
                {#each images as image}
                    <img src="{image}">
                {/each}
            </div>
        {/if}
        {#if current == "addressbook"}
            <div>

            </div>
        {/if}
    </div>  
</div>
{#if click}
    <div on:click={()=>{click = false; current = false; }} id="backdrop"/>
{/if}  


<style>
    #itemsbar, #itemsButton {
        background-color: white;
        text-align: center;
        border-radius: 50px;
        border: 2px solid #7300ED;
        padding: 8px;
        position: fixed;
        z-index: 10;
        -webkit-transition: 0.5s all ease-in-out;
        -moz-transition: 0.5s all ease-in-out;
        -o-transition: 0.5s all ease-in-out;
        transition: 0.5s all ease-in-out;
        opacity: 0;
        pointer-events: none;
        max-height: 90vh;
        display: flex;
        align-items: flex-end;
    }

    @media screen and (max-width: 600px) {
        #itemsbar, #itemsButton {
        left: 30px;
        bottom: 30px;
        }
    }
    @media screen and (min-width: 600px) {
        #itemsbar, #itemsButton {
        left: 30px;
        bottom: 30px;
        }
    }


    /* Show the snackbar when clicking on a button (class added with JavaScript) */
    #itemsbar.show, #itemsButton.show {
    visibility: visible; /* Show the snackbar */
    /* Add animation: Take 0.5 seconds to fade in and out the snackbar.
    However, delay the fade out process for 2.5 seconds */
    /* -webkit-animation: fadein 0.5s, fadeout 0.5s 2.5s; */
    /* animation: fadein 0.5s, fadeout 0.5s 2.5s; */
    opacity: 1.00;
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
    }

    #left {
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        float: left;
    }

    #right {
        float: left;
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
        align-items: flex-end;
        padding: 15px;
    }
</style>
