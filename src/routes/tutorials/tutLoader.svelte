<script>
    import Tap from "./gestures/tap.svelte"
    import Swipe from "./gestures/swipe.svelte"
    import { onMount} from "svelte"
    import {tutorial} from "../../session"
    import ManageSession from "../game/ManageSession"
    let current = 0
    let hide = []
    let sequence = []
    hide[0] = false

    tutorial.subscribe((value) => {
    if (!!value) {
        sequence = value 
    }
})



    $tutorial = [
        {type: "swipe", direction: "right", element: "phaserId", delay: 500},
        {type: "swipe", direction: "down", element: "phaserId", delay: 500},
        {type: "tap", doubleTap: true, element: "phaserId", posX: 250 , posY: 250, delay: 1000},
    ]
    
    onMount(() => {
        console.log(ManageSession)
        
        document.body.addEventListener('click', ()=>{
            if(hide[current] && hide.length > current) {
            current++
            hide[current] = false
        }
        console.log(hide)
        });
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
 

