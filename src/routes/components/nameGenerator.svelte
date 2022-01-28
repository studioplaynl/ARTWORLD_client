<script>
import { onMount } from 'svelte';
import {location, replace} from 'svelte-spa-router'
import {validate} from "../../api"
export let invalidTitle
export let value
onMount(async () => {
    let url = '/assets/woordenlijst.json';
    if(!!!value){
        fetch(url)
        .then(res => res.json())
        .then(out => {
        let dier = out.dier[Math.floor(Math.random() * out.dier.length)]
        let kleur = out.kleur[Math.floor(Math.random() * out.kleur.length)]
        value = kleur+dier
        replace($location + "/"+ value)
        })
        .catch(err => console.log(err));
    }
});

async function ifValid(){
    invalidTitle =  await validate(value,"special")
    console.log(invalidTitle)
    
}
</script>


<input type="text" bind:value={value} on:keyup="{ifValid}" id="title" />
{#if !invalidTitle}
      <p style="color: red">No special characters</p>
{/if}