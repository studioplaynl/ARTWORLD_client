<script>

let home = "ArtworldAmsterdam"

async function goHome(){
    let HistoryTracker = (await import("../game/class/HistoryTracker.js")).default;
	let ManageSession = (await import('../game/ManageSession.js')).default;
    HistoryTracker.switchScene(ManageSession.currentScene, home, home)

}

</script>


<div class="topbar">
    <a on:click="{goHome}"><img class="logo" src="assets/SHB/svg/AW-icon-logo-A.svg"></a>
</div>


<style>
    .topbar {
        position: fixed;
        left: 0;
        top: 0;
        margin: 15px;
    }

    .logo{
        width: 50px;
        height: 50px;
        box-shadow: 5px 5px 0px #7300ed;
        border-radius: 50%;
    }

</style>