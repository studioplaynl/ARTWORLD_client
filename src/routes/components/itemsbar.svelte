<script>
import {convertImage, getObject, updateObject} from "../../api"
import itemsBar from "./itemsbar.js"
import ProfilePage from "../profile.svelte"


let ManageSession;
let current	
let images = []
let house_url, avatar_url, user_name, adress_book, homeOpen =false;

const unsubscribe = itemsBar.subscribe(async value => {
	ManageSession = (await import('../game/ManageSession.js')).default;
    if(value.playerClicked){
        avatar_url = ManageSession.userProfile.url
    }
    if(value.onlinePlayerClicked){
        console.log(ManageSession.selectedOnlinePlayer)
        avatar_url = ManageSession.selectedOnlinePlayer.url
    }
});

async function Click(){
    $itemsBar.playerClicked = true;
    $itemsBar.onlinePlayerClicked = false;
}

async function getLiked(){
    if(current == "liked" ) {current = false; return};

    if($itemsBar.playerClicked){
        images = []
        console.log(ManageSession.liked.liked)
        ManageSession.liked.liked.forEach(async (liked) => {
        images.push({ img: await convertImage(liked.url,"128"), url: liked.url.split('.')[0]})
        images = images
    });
   
    } else {
        let liked = await getObject("liked", "liked_"+ManageSession.selectedOnlinePlayer.id , ManageSession.selectedOnlinePlayer.id)
        console.log(liked.value.liked)
        images = []
        liked.value.liked.forEach(async (liked) => {
        images.push({ img: await convertImage(liked.url,"128"), url: liked.url.split('.')[0]})
        images = images
        })
    }

    current = "liked"
}

async function Profile(){
    if(current == "home" ) {current = false; return};
    if($itemsBar.playerClicked){
        user_name = ManageSession.userProfile.username
        house_url = await getObject("home", ManageSession.userProfile.meta.azc, ManageSession.userProfile.id)
        house_url = await convertImage(house_url.value.url,"50")
    } else{
        user_name = ManageSession.selectedOnlinePlayer.username 
        house_url = await getObject("home", ManageSession.selectedOnlinePlayer.metadata.azc, ManageSession.selectedOnlinePlayer.id)
        house_url = await convertImage(house_url.value.url,"50")
    }

    current = "home"
}


async function goHome(id){
    let HistoryTracker = (await import("../game/class/HistoryTracker.js")).default;

    if(typeof id == "string"){
        HistoryTracker.switchScene(ManageSession.currentScene, "DefaultUserHome", id)
    }else {
        if($itemsBar.playerClicked){
            HistoryTracker.switchScene(ManageSession.currentScene, "DefaultUserHome", ManageSession.userProfile.id)
        } else {
            HistoryTracker.switchScene(ManageSession.currentScene, "DefaultUserHome", ManageSession.selectedOnlinePlayer.id)
        }
    }
}

async function saveHome() {
     // saving the home of a player
     const entry = { user_id: ManageSession.selectedOnlinePlayer.id, user_name: ManageSession.selectedOnlinePlayer.username }

    // checking if the player in the addressbook 
    const isExist = ManageSession.addressbook.addressbook.some(element => element.user_id == entry.user_id)

    if (!isExist) { // if doesn't exist, add to the addressbook
    ManageSession.addressbook.addressbook.push(entry)
    const type = "addressbook"
    const name = type + "_" + ManageSession.userProfile.id
    const pub = 2
    const value = ManageSession.addressbook
    console.log("value ManageSession.addressbook", value)
    updateObject(type, name, value, pub)

    } else {
     console.log("this user id is already in addressbook list")
    }
}


async function getAdressbook(){
    if(current == "addressbook" ) {current = false; return};
    adress_book = ManageSession.addressbook.addressbook
    console.log(ManageSession.addressbook.addressbook)
    current = "addressbook"
}

</script>

<div id="itemsButton" class:show={!$itemsBar.playerClicked}>
    <a on:click={Click} ><img class="icon" src="assets/SHB/svg/AW-icon-more.svg"></a>
</div>

<!-- current user -->
<div class="itemsbar" id="currentUser" class:show={$itemsBar.playerClicked}>
    <div id="left">
        <a on:click={Profile} class="avatar"><img src="{avatar_url}"></a>
        <a on:click={getAdressbook}><img class="icon" src="assets/SHB/svg/AW-icon-award.svg"></a>
        <a on:click={getAdressbook}><img class="icon" src="assets/SHB/svg/AW-icon-addressbook.svg"></a>

        <a href="/#/drawing"><img class="icon" src="assets/SHB/svg/AW-icon-square-drawing.svg"></a>
        <a href="/#/stopmotion"><img class="icon" src="assets/SHB/svg/AW-icon-square-animation.svg"></a>

        <a on:click={getLiked}><img class="icon" src="assets/SHB/svg/AW-icon-heart-full-red.svg"></a>
    </div>
    <div id="right">
        {#if current == "liked"}
            <div>
                {#each images as image}
                    <a href="/#/{image.url}">
                        <!-- <img src="{image.img}" onError={(e) => e.target.style.display='none' }> -->
                        <div id="image" style="background-image: url({image.img}); width:128px; height: 128px;"></div>
                    </a>
                {/each}
            </div>
        {/if}
        {#if current == "addressbook"}
            <div>
                <a on:click="{()=>{goHome()}}">{ManageSession.userProfile.username}</a>
                {#each adress_book as adress}
                    <a on:click="{()=>{goHome(adress.user_id)}}">{adress.user_name}</a>
                {/each}
            </div>
        {/if}
        {#if current == "home"}
            <ProfilePage/>
            <!-- <div>
                <p>{user_name}</p>
                <a href="/#/avatar" class="avatar"><img src="{ManageSession.userProfile.url}"></a>
                 <div class="homeBox">
                    {#if !!house_url}
                    <a on:click={()=>{homeOpen = !homeOpen}}><img id="house" src={house_url} /></a>
                    {/if}
                    {#if homeOpen}  
                        <a on:click={goHome}><img class="icon" src="assets/SHB/svg/AW-icon-enter-space.svg"></a>
                        <a href="/#/house/"><img class="icon" src="assets/SHB/svg/AW-icon-pen.svg"></a>
                    {/if}
                 </div>
            </div> -->
        {/if}
    </div>  
</div>

<!-- online user -->
<div class="itemsbar" id="onlineUser" class:show={$itemsBar.onlinePlayerClicked}>
    <div id="left">
        <a on:click={Profile} class="avatar"><img src="{avatar_url}"></a>

        <a on:click={getLiked}><img class="icon" src="assets/SHB/svg/AW-icon-heart-full-red.svg"></a>
    </div>
    <div id="right">
        {#if current == "liked"}
            <div>
                {#each images as image}
                    <a href="/#/{image.url}"><img src="{image.img}" onError={(e) => e.target.style.display='none' }/></a>
                {/each}
            </div>
        {/if}
        
        {#if current == "home"}
        <!-- <ProfilePage userID="{ManageSession.selectedOnlinePlayer.id}" /> -->
            <div>
                <p>{user_name}</p>
                <div class="homeBox">
                    {#if !!house_url}
                        <a on:click={()=>{homeOpen = !homeOpen}}><img id="house" src={house_url} /></a>
                    {/if}
                    {#if homeOpen}
                        <a on:click={goHome}><img class="icon" src="assets/SHB/svg/AW-icon-enter-space.svg"></a>    
                        <a on:click={saveHome}><img class="icon" src="assets/SHB/svg/AW-icon-save.svg"></a>
                    {/if}
                </div>
            </div>
        {/if}
    </div>  
</div>

{#if $itemsBar.playerClicked || $itemsBar.onlinePlayerClicked}
    <div on:click={()=>{$itemsBar.playerClicked = false; $itemsBar.onlinePlayerClicked = false; current = false; }} id="backdrop"/>
{/if}  


<style>
    .itemsbar, #itemsButton {
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
    }


    @media screen and (max-width: 600px) {
        #currentUser, #itemsButton {
            left: 3px;
            bottom: 3px;
        }

        #onlineUser{
            right: 3px;
            bottom: 3px;
        }
    }
    @media screen and (min-width: 600px) {
        #currentUser, #itemsButton {
        left: 30px;
        bottom: 30px;
        }
        #onlineUser{
            right: 30px;
            bottom: 30px;
        }
    }


    /* Show the snackbar when clicking on a button (class added with JavaScript) */
    .itemsbar.show, #itemsButton.show {
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
        margin-right: 5px;
        justify-content: flex-end;
    }

    #right {
        float: left;
    }

    .homeBox {
        display: flex;
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
        padding: 15px;
        overflow-y: auto;
        overscroll-behavior-y: contain;
        scroll-snap-type: y proximity;
        max-height: 80vh;
        margin: 15px;
        align-items: flex-start;
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
