<script>
    import Tap from "./gestures/tap.svelte"
    import Swipe from "./gestures/swipe.svelte"
    import {onMount, beforeUpdate} from "svelte"
    let current = 0
    let hide = []
    hide[0] = false
    let sequence = [
        {type: "swipe", direction: "left", element: "psw", delay: 2000},
        {type: "tap", doubleTap: true, element: "email", delay: 1000},
        {type: "tap", element: "itemsButton", delay: 5000},
    ]
    
    beforeUpdate(() => {
        if(hide[current]) {
            current++
            hide[current] = false
        }
    });

</script>

    {#each sequence as seq, i}
            {#if seq.type == "tap" }
                {#if !hide[i]}
                    <Tap num={i} element = {seq.element} doubleTap={seq.doubleTap} delay={seq.delay} bind:hide={hide[i]}/>
                {/if}
            {/if}
            {#if seq.type == "swipe" }
                {#if !hide[i]}
                    <Swipe num={i} element = {seq.element} direction = {seq.direction} delay={seq.delay} bind:hide={hide[i]} />
                {/if}
            {/if}
    {/each}
 

