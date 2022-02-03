<script>
    import {updateObject, deleteFile, deleteObjectAdmin} from "../../api.js"
    import {Profile} from "../../session"
    import {Modal, Dialog, Button} from "attractions"
    export let col;
    export let row;
    export let removeFromTrash;
    export let moveToTrash;
    export let isCurrentUser;
    let modalOpen = false;

const Trash = () => {
    console.log("update "+ status)
    let value = row.value
    value.status = "trash"
    let pub = false
    updateObject(row.collection, row.key, value,pub, row.user_id)
    moveToTrash(row.key)
}

const Delete = () => {
    modalOpen = false;
    if($Profile.meta.role == "admin"|| $Profile.meta.role == "moderator"){
        console.log("admin")
        deleteObjectAdmin(row.user_id,row.collection,row.key)
    } else {
        deleteFile(row.collection,row.key,row.user_id)

    }
    removeFromTrash(row.key)
    console.log("deleted")

}
</script>
<main>
    {#if isCurrentUser() || $Profile.meta.role == "admin"|| $Profile.meta.role == "moderator"}
        {#if row.value.status != "trash"}
        <Button on:click={Trash}><svg class="icon" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" /></svg></Button>
        {:else}
        <Button on:click={() => modalOpen = true}><svg class="icon" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" /></svg></Button>
        {/if}
    {/if}
    <Modal bind:open={modalOpen} let:closeCallback>
        <Dialog
        title="Are you sure you want to Delete?"
        closeCallback={() => modalOpen = false}
        danger
      >
        <div slot="title-icon">
        </div>
        <p>You have not saved your changes yet.</p>
        <p>If you exit without saving, changes will be lost.</p>
        <p>Are you sure you want to exit?</p>
        <Button on:click={Delete}>yes, delete</Button>
      </Dialog>
    </Modal>
</main>