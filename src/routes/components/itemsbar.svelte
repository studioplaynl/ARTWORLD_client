<script>
import {convertImage, getObject} from "../../api"

export let playerClicked =  false
export let onlinePlayerClicked = false;
	
let ManageSession;
let current	
let images = []
let house_url, avatar_url, user_name, adress_book


async function Click(){
    ManageSession = (await import('../game/ManageSession.js')).default;
    avatar_url = ManageSession.userProfile.url
    click = true;
}

async function getLiked(){
    if(current == "liked" ) {current = false; return};

    if(currentUser){
        images = []
        console.log(ManageSession.liked.liked)
        ManageSession.liked.liked.forEach(async (liked) => {
        images.push({ img: await convertImage(liked.url,"128"), url: liked.url.split('.')[0]})
        images = images
    });
   
    } else {

    }

    current = "liked"
}

async function Profile(){
    if(current == "home" ) {current = false; return};
    if(currentUser){
        user_name = ManageSession.userProfile.username
        house_url = await getObject("home", ManageSession.userProfile.meta.azc, ManageSession.userProfile.id)
        house_url = await convertImage(house_url.value.url,"64")
    }

    current = "home"
}


async function goHome(){
    if(currentUser){
    let HistoryTracker = (await import("../game/class/HistoryTracker.js")).default;
    HistoryTracker.switchScene(ManageSession.currentScene, "DefaultUserHome", ManageSession.userProfile.id)
    } else {

    }
}


async function getAdressbook(){
    if(current == "addressbook" ) {current = false; return};
    adress_book = ManageSession.addressbook.addressbook
    console.log(ManageSession.addressbook.addressbook)
    current = "addressbook"
}

</script>

<div id="itemsButton" class:show={!click}>
    <a on:click={Click} ><img class="icon" src="assets/SHB/svg/AW-icon-more.svg"></a>
</div>

<!-- current user -->
<div id="itemsbar" class:show={click}>
    <div id="left">
        <a on:click={Profile} class="avatar"><img src="{avatar_url}"></a>

        {#if currentUser}
        <a on:click={getAdressbook}><img class="icon" src="assets/SHB/svg/AW-icon-addressbook.svg"></a>

        <a href="/#/drawing"><img class="icon" src="assets/SHB/svg/AW-icon-square-drawing.svg"></a>
        <a href="/#/stopmotion"><img class="icon" src="assets/SHB/svg/AW-icon-square-animation.svg"></a>
        {/if}
        <a on:click={getLiked}><img class="icon" src="assets/SHB/svg/AW-icon-heart-full-red.svg"></a>
    </div>
    <div id="right">
        {#if current == "liked"}
            <div>
                {#each images as image}
                    <a href="/#/{image.url}"><img src="{image.img}"></a>
                {/each}
            </div>
        {/if}
        {#if current == "addressbook"}
            <div>
                {#each adress_book as adress}
                    <a href="/#/profile/{adress.user_id}">{adress.user_name}</a>
                {/each}
            </div>
        {/if}
        {#if current == "home"}
            <div>
                <a href="/#/avatar" class="avatar"><img src="{ManageSession.userProfile.url}"></a>
                <p>{user_name}</p>
                {#if !!house_url}
                    <a href="/#/house"><img id="house" src={house_url} /></a>
                {:else}
                    <a href="/#/house/">Create house</a>
                {/if}
                <a on:click={goHome} href="#"><img class="icon" src="assets/SHB/svg/AW-icon-home.svg"></a>
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
        margin-top: 5px;
    }

    #itemsButton > a > .icon {
        margin-top: 0px;
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
        overflow-y: auto;
        overscroll-behavior-y: contain;
        scroll-snap-type: y proximity;
        max-height: 80vh;
        margin: 15px;
    }
    .avatar {
        height: 50px;
        width: 50px;
        overflow: hidden;
    }

    .avatar > img {
        height: 50px;
    }
</style>
