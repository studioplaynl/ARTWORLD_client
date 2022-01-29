<script>
    import {updateObject} from "../../api.js"
    import {Profile} from "../../session"
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
    //value = JSON.stringify(value)
    updateObject(row.collection, row.key, value,status, row.user_id)
}

const restore = () => {
    console.log(row.value)
    row.value.status = ""
    let value = row.value
    let pub = false
    //if($Profile.meta.role == "admin" || $Profile.meta.role == "moderator")
    updateObject(row.collection, row.key, value,pub, row.userID)
    moveToArt(row.key)
}
</script>

<main>
    {#if currentUser || $Profile.meta.role == "admin" || $Profile.meta.role == "moderator"}
        {#if row.value.status != "trash"}
        <Switch bind:value={status} on:change={change}>
        </Switch>
        {:else}
        <Button on:click={restore}> Restore </Button>
        {/if}
    {/if}
</main>
