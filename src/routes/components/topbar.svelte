<script>
    import HistoryTracker from "../game/class/HistoryTracker";
    import ManageSession from "../game/ManageSession";
    import {history} from "../../session";

    let home = "Artworld";

    // history.subscribe((value) => {
    //     const backButtonId = document.getElementById("back");
    //     if (value.length > 1) {
    //         backButtonId.style.visibility = "visible";
    //     }
    // });


    async function goHome() {
        HistoryTracker.switchScene(ManageSession.currentScene, home, home);
    }

    async function goBack() {
        console.log(ManageSession.locationHistory);
        if (ManageSession.locationHistory.length > 1) {
            HistoryTracker.activateBackButton(ManageSession.currentScene);
        }
    }

    async function zoomIn() {
        if (ManageSession.currentZoom >= 4) return;
        ManageSession.currentZoom += 0.1;
    }

    function zoomReset() {
        ManageSession.currentZoom = 1;
    }

    function zoomOut() {
        if (ManageSession.currentZoom <= 0.2) return;
        ManageSession.currentZoom -= 0.1;
    }
</script>

<div class="topbar">
    <a on:click={goHome}
        ><img
            class="TopIcon"
            id="logo"
            src="assets/SHB/svg/AW-icon-logo-A.svg"
        /></a
    >
    <a on:click={goBack}

        ><img
            class="TopIcon"
            class:showBack="{$history.length > 1}"
            id="back"
            src="/assets/SHB/svg/AW-icon-previous.svg"
        /></a
    >
    <a on:click={zoomOut} id="zoomOut"
        ><img class="TopIcon" src="/assets/SHB/svg/AW-icon-minus.svg" /></a
    >
    <a on:click={zoomReset} id="zoomReset"
        ><img class="TopIcon" src="assets/SHB/svg/AW-icon-reset.svg" /></a
    >
    <a on:click={zoomIn} id="zoomIn"
        ><img class="TopIcon" src="./assets/SHB/svg/AW-icon-plus.svg" /></a
    >
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

    #back {
        visibility: hidden;
    }

    .showBack{
        visibility: visible !important;
    }
</style>
