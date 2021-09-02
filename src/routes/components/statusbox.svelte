<script>
    import {updateObject} from "../../api.js"
    import { Switch } from "attractions"
    export let col;
    export let row;

console.info("col: ",col)
console.info("row: ",row)
let status = row.value.status || false;


const change = () => {
    console.log("update "+ status)
    //let value = JSON.parse(row.value)
    let value = row.value
    value.status = status
    //value = JSON.stringify(value)
    updateObject(row.collection, row.key, value)
}
</script>

<main>
    <Switch bind:value={status} on:change={change}>
      </Switch>
</main>
