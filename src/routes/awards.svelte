<script>
import {onMount} from "svelte"
import ManageSession from "./game/ManageSession"
import {Achievements} from "../storage"
// import { each } from "svelte/internal"
let playTime = Math.floor(Number(ManageSession.userProfile.meta.TotalPlayTime)/10000000)
let freeaw = false
// })

onMount(async()=>{
    Achievements.get()
})

// function freeAward() {
//     freeaw = true

//     Achievements.create("test achievement","{}")

// }

// function remove(){
//     Achievements.delete("test achievement")
// }

// function update(){

//     Achievements.update({name: "test achievement", value: {"test": "updated"}, pub: true})
// }

</script>
<div class="awards">
    <!-- first time logged in -->
    {#each $Achievements as  X}
        <img class="icon" src="assets/SHB/svg/AW-icon-award.svg">
        <p>{X.key}</p>
    {/each}


    <!-- {#if ManageSession.achievements.achievements[0].firstLogin}
    <img class="icon" src="assets/SHB/svg/AW-icon-award.svg">
    {/if}
    {#if ManageSession.achievements.achievements[0].onboardMove}
    <img class="icon" src="assets/SHB/svg/AW-icon-award.svg">
    {/if}
    {#if freeaw}
    <img class="icon" src="assets/SHB/svg/AW-icon-award.svg">
    {/if} -->
</div>
<!-- <button on:click="{freeAward}">test award</button>
<button on:click="{remove}">remove test award</button>
<button on:click="{update}">update test award</button> -->
<style>
.awards > img {
  display: block;
  margin: 5px auto;
}
</style>