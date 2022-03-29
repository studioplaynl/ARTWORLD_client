<script>

let home = "ArtworldAmsterdam"

async function goHome(){
    let HistoryTracker = (await import("../game/class/HistoryTracker.js")).default;
	let ManageSession = (await import('../game/ManageSession.js')).default;
    HistoryTracker.switchScene(ManageSession.currentScene, home, home)

}

function zoomIn() {

}


function zoomReset() {
    
}


function zoomOut() {
    
}


</script>


<div class="topbar">
    <a on:click="{goHome}"><img class="TopIcon" id="logo" src="assets/SHB/svg/AW-icon-logo-A.svg"></a>
    <a on:click="{goHome}"><img class="TopIcon" id="back" src="/assets/SHB/svg/AW-icon-previous.svg"></a>
    <a on:click="{zoomOut}"  id="zoomOut"><img class="TopIcon" src="/assets/SHB/svg/AW-icon-minus.svg"></a>
    <a on:click="{zoomReset}" id="zoomReset"><img class="TopIcon" src="assets/ui/undo-circular-arrow-svgrepo-com.svg"></a>
    <a on:click="{zoomIn}" id="zoomIn"><img class="TopIcon" src="./assets/SHB/svg/AW-icon-plus.svg"></a>

</div>


<style>
    .topbar {
        position: fixed;
        left: 0;
        top: 0;
        margin: 15px;
    }

    .TopIcon {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background-color: white;
    }
    #logo {
        box-shadow: 5px 5px 0px #7300ed;
 
    }

</style>