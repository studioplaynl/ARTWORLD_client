<script>
import HistoryTracker from "./game/class/HistoryTracker"
import ManageSession from "./game/ManageSession"
import {achievements} from "../session"
import {saveAchievement} from "../api"
let playTime = Math.floor(Number(ManageSession.userProfile.meta.TotalPlayTime)/10000000)
let freeaw = false

function freeAward() {
    freeaw = true
    saveAchievement("TestAward")
}

</script>
<div class="awards">
    <!-- first time logged in -->
    {#if ManageSession.achievements.achievements[0].firstLogin}
    <img class="icon" src="assets/SHB/svg/AW-icon-award.svg">
    {/if}
    {#if ManageSession.achievements.achievements[0].onboardMove}
    <img class="icon" src="assets/SHB/svg/AW-icon-award.svg">
    {/if}
    {#if freeaw}
    <img class="icon" src="assets/SHB/svg/AW-icon-award.svg">
    {/if}
</div>
<button on:click="{freeAward}">test award</button>


<style>
.awards > img {
  display: block;
  margin: 5px auto;
}
</style>