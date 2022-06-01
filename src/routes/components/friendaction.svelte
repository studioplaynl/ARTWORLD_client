<script>
    import { addFriend, removeFriend } from "../../api.js";
    export let row;
    export let load;


    async function accept(){
        // console.log(row.user.id)
        addFriend(row.user.id)
        .then(() => load() )
        
    }
    async function cancel(){
        console.log("cancel clicked")
        removeFriend(row.user.id)
        .then(() => load() )
    }
</script>

<main>

    {#if row.state == 2}
   <div class="accept" on:click="{accept}">+</div>
   {/if}
   {#if row.state == 0 || row.state == 2 || row.state == 1}
   <div class="cancel" on:click="{cancel}">-</div>
   {/if}
</main>

<style>
    .icon {
        width: 30px;
        float: right;
    }

    .editIcon {
        width: 20px;
        cursor: pointer;
    }
</style>
