<script>
    import {updateObject} from "../../api.js"
    import { Switch, Button } from "attractions"
    export let col;
    export let row;
    export let moveToArt;
    export let isCurrentUser;

let status = row.permission_read || false;
if(status == 2){status = true}
else{status = false}
console.log(row.permission_read)
let currentUser = isCurrentUser()
const change = () => {
    console.log("update "+ status)
    //let value = JSON.parse(row.value)
    let value = row.value
    let pub = status
    //value = JSON.stringify(value)
    updateObject(row.collection, row.key, value,pub)
}

const restore = () => {
    console.log(row.value)
    row.value.status = ""
    let value = row.value
    let pub = false
    updateObject(row.collection, row.key, value,pub)
    moveToArt(row.key)
}
</script>

<main>
    {#if currentUser}
        {#if row.value.status != "trash"}
        <Switch bind:value={status} on:change={change}>
        </Switch>
        {:else}
        <Button on:click={restore}> Restore </Button>
        {/if}
    {/if}
</main>
