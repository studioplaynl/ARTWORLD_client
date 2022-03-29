<script>
    import Tap from "./gestures/tap.svelte"
    import Swipe from "./gestures/swipe.svelte"
    import { onMount} from "svelte"
    import {tutorial, CurrentApp, achievements} from "../../session"
    import ManageSession from "../game/ManageSession"
    import {updateObject} from "../../api"
    let current = 0
    let hide = []
    let sequence = []
    hide[0] = false

    tutorial.subscribe((value) => {
    if (!!value) {
        sequence = value 
    }
})


function Saveachievement(){
    const type = "achievements"
    const name = type + "_" + ManageSession.userProfile.id
    const pub = 2
    const value = ManageSession[type]
    updateObject(type, name, value, pub)
    $achievements = ManageSession.achievements.achievements
}
    
    onMount(() => {
        document.body.addEventListener('click', ()=>{
            if(hide[current] && hide.length > current) {
            current++
            hide[current] = false
            if(sequence[current].type == "achievement" ) {
                ManageSession.achievements.achievements[0][sequence[current].name] = true
                Saveachievement()
            }
        }
        });


        
        CurrentApp.subscribe((value) => {
    if (value == "game") {
        console.log("game")
        setTimeout(()=>{
            if(!!!ManageSession.achievements.achievements[0].onboardMove){
                    $tutorial = [
                        {type: "swipe", direction: "right", element: "phaserId", posX: window.innerWidth/2 , posY: window.innerHeight/2-100, delay: 500},
                        {type: "tap", doubleTap: true, element: "phaserId", posX: window.innerWidth/2-150 , posY: window.innerHeight/2-200, delay: 1000},
                        {type: "achievement", name: "onboardMove"}
                    ]
                }
            },2000)
    }
})

    });

 

</script>

    {#each sequence as seq, i}
            {#if seq.type == "tap" }
                {#if !hide[i]}
                    <Tap num={i} element = {seq.element} doubleTap={seq.doubleTap} posY={seq.posY} posX={seq.posX} delay={seq.delay} bind:hide={hide[i]}/>
                {/if}
            {/if}
            {#if seq.type == "swipe" }
                {#if !hide[i]}
                    <Swipe num={i} element = {seq.element} direction = {seq.direction} posY={seq.posY} posX={seq.posX} delay={seq.delay} bind:hide={hide[i]} />
                {/if}
            {/if}
    {/each}
 

