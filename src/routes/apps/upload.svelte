<script>
    import {getUploadURL, ListAllUsers, updateObjectAdmin} from "../../api.js"
    import SaveAnimation from "../components/saveAnimation.svelte"
    let filesVar, type,name, filetype,value, pub, users = [], id;
    let  saving= false;
    async function getUsers() {
        users = await ListAllUsers()
        console.log(users)
    }
    getUsers()


    async function upload(){
        saving = true
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
            await updateObjectAdmin(id, type, name, value, pub)
            saving = false
        } else {
            alert("sorry can't upload file, use other file format")
            saving = false
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
<div class="Form">
    <div class="container">
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
    </div>
</div>

<SaveAnimation saving={saving}/>


<style>
.Form {
	max-width: 400px;
	margin: 0 auto;
}

/* Add padding to containers */
.container {
  padding: 16px;
}

/* Full-width input fields */
input[type=text], input[type=password] {
  width: 100%;
  padding: 15px;
  margin: 5px 0 22px 0;
  display: inline-block;
  border: none;
  background: #f1f1f1;
}

input[type=text]:focus, input[type=password]:focus {
  background-color: #ddd;
  outline: none;
}

select {
	width: 100%;
    padding: 15px;
    margin: 5px 0 22px 0;
    display: inline-block;
    border: none;
    background: #f1f1f1;
}

/* Overwrite default styles of hr */
hr {
  border: 1px solid #f1f1f1;
  margin-bottom: 25px;
}

/* Set a style for the submit/register button */
button {
  background-color: #04AA6D;
  color: white;
  padding: 16px 20px;
  margin: 8px 0;
  border: none;
  cursor: pointer;
  width: 100%;
  opacity: 0.9;
}

button:hover {
  opacity:1;
}
</style>