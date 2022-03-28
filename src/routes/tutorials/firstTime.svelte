<script>
    import Tap from "./gestures/tap.svelte"
    import Swipe from "./gestures/swipe.svelte"
    import { onMount} from "svelte"
    let current = 0
    let hide = []
    hide[0] = false


    let sequence = [
        {type: "swipe", direction: "left", element: "phaserId", delay: 500},
        {type: "swipe", direction: "right", element: "phaserId", delay: 500},
        {type: "swipe", direction: "top", element: "phaserId", delay: 500},
        {type: "swipe", direction: "down", element: "phaserId", delay: 500},
        {type: "tap", doubleTap: false, element: "phaserId", delay: 1000},
        {type: "tap", element: "phaserId", delay: 5000},
    ]
    
    onMount(() => {
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
                    <Tap num={i} element = {seq.element} doubleTap={seq.doubleTap} delay={seq.delay} bind:hide={hide[i]}/>
                {/if}
            {/if}
            {#if seq.type == "swipe" }
                {#if !hide[i]}
                    <Swipe num={i} element = {seq.element} direction = {seq.direction} delay={seq.delay} bind:hide={hide[i]} />
                {/if}
            {/if}
    {/each}
 

