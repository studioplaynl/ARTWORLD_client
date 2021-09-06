<script>
    import {updateObject} from "../../api.js"
    import { Switch, Button } from "attractions"
    export let col;
    export let row;
    export let moveToArt;

let status = row.value.status || false;
console.log(row.value.status)

const change = () => {
    console.log("update "+ status)
    //let value = JSON.parse(row.value)
    let value = row.value
    value.status = status
    //value = JSON.stringify(value)
    updateObject(row.collection, row.key, value)
}

const restore = () => {
    let value = row.value
    value.status = false
    updateObject(row.collection, row.key, value)
    moveToArt(row.key)
}
</script>

<main>
    {#if row.value.status != "trash"}
      <Switch bind:value={status} on:change={change}>
      </Switch>
    {:else}
      <Button on:click={restore}> Restore </Button>
    {/if}
</main>
