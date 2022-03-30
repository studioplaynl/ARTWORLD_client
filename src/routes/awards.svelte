<script>
import HistoryTracker from "./game/class/HistoryTracker"
import ManageSession from "./game/ManageSession"
import {achievements} from "../session"
let playTime = Math.floor(Number(ManageSession.userProfile.meta.TotalPlayTime)/10000000)
let freeaw = false

function freeAward() {
    freeaw = true
}

$achievements = "free"

</script>
<div class="awards">
    {#if ManageSession.achievements.achievements[0].onboardMove}
    <img class="icon" src="assets/SHB/svg/AW-icon-award.svg">
    {/if}
    {#if freeaw}
    <img class="icon" src="assets/SHB/svg/AW-icon-award.svg">
    {/if}
</div>
<button on:click="{freeAward}">test award</button>


<style>

</style>