<script>
    import {updateObject} from "../../api.js"
    import {Modal, Dialog, Button} from "attractions"
    export let col;
    export let row;
    let modalOpen = false;

const Trash = () => {
    console.log("update "+ status)
    //let value = JSON.parse(row.value)
    let value = row.value
    value.status = 'trash'
    //value = JSON.stringify(value)
    updateObject(row.collection, row.key, value)
}

const Delete = () => {
    modalOpen = false;
    console.log("deleted")

}
</script>
<main>
    {#if row.value.status != "trash"}
    <Button on:click={Trash}><svg class="icon" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" /></svg></Button>
    {:else}
    <Button on:click={() => modalOpen = true}><svg class="icon" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" /></svg></Button>
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
