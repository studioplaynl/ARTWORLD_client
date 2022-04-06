<script>
    import {updateTitle, validate} from "../../api.js"
    import {push} from "svelte-spa-router"
    import {Profile} from "../../session"
    export let row;
    export let isCurrentUser;
     let invalidTitle = true;

    let edit = false;
    let title = row.value.displayname
    async function  update(){
        if(!invalidTitle) return
        row.value.displayname = title
        await updateTitle(row.collection,row.key, title, row.user_id)
        edit = false
    }

    async function ifValid(){
    invalidTitle =  await validate(title,"special")    
}

</script>
<main>
    {#if !edit}
        <a on:click="{push(`/${row.collection}/${row.user_id}/${row.key}`)}">{row.value.displayname}</a>
        {#if isCurrentUser() || $Profile.meta.role == "admin"|| $Profile.meta.role == "moderator"}
        <a on:click="{()=>{edit = true}}"><svg class="editIcon" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" /></svg></a>
        {/if}
        {:else}
        <input bind:value="{title}" on:keyup="{ifValid}"><a on:click="{update}"><svg class="icon" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></svg></a>
        {#if !invalidTitle}
            <p style="color: red">No special characters</p>
        {/if}
    {/if}


    
</main>

<style>
.icon{
    width:30px;
    float:right;
}

.editIcon{
    width: 20px;
    cursor: pointer;
}

</style>