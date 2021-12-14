<script>
    import {getUploadURL, ListAllUsers, updateObjectAdmin} from "../../api.js"
    let filesVar, type,name, filetype,value, pub, users = [], id;
    
    async function getUsers() {
        users = await ListAllUsers()
        console.log(users)
    }
    getUsers()


    async function upload(){
        console.log(filesVar)
        filetype = filesVar[0].name.split(".")[1]
        if(checkFileType()){
            let url = await getUploadURL(type, name, filetype)

            console.log(url)
            await fetch(url[0], {
                method: "PUT",
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                body: filesVar[0]
            })
            value = JSON.stringify({"url": url[1]})
            pub = true;
            console.log(id)
            console.log(type)
            console.log(name)
            console.log(value)
            console.log(pub)
            updateObjectAdmin(id, type, name, value, pub)
        } else {
            alert("sorry can't upload file, use other file format")
        }
        
    }

    function checkFileType(){
        if(type == "audio"){
            if(filetype == "mp3" || filetype == "wav") return true
        }else if(type == "video"){
            if(filetype == "mpv" || filetype == "mov" || filetype == "mp4") return true 
        }else if(type == "drawing"){
            if(filetype == "png" ||filetype == "jpg" ||filetype == "jpeg" ||filetype == "gif") return true
        }
        return false
    }

</script>
<label>Username:</label>
<select bind:value="{id}">
    {#each users as user}
    <option value="{user.user_id}">{user.name}</option>
    {/each}
</select>
<label>Filetype:</label>
<select bind:value="{type}">
    <option value="drawing">Drawing</option>
    <option value="video">Video</option>
    <option value="audio">Audio</option>
</select>
<label>Name:</label>
<input type="text" bind:value="{name}">

<label>Fite to upload:</label>
<input type="file" bind:files={filesVar}>
<button on:click="{upload}">Upload</button>
<style>

</style>