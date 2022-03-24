<script>
    import Tap from "./gestures/tap.svelte"

    let hide = true
    
    setTimeout(()=>{
        hide= false
    },7000)
 
    let done = false


</script>

{#if !hide && !done}
<Tap element = "itemsButton" bind:done={done}/>
{/if}