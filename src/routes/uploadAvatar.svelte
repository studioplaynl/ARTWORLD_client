<script>
   	import {client} from "../nakama.svelte"
    import {Session} from "../session.js"

    let avatar_url =""
   async function getAccount() {
        const account = await client.getAccount($Session);
        url = account.user.avatar_url
        //console.log(avatar_url)
        getAvatar(url).then((url) => avatar_url = url)
        console.log(avatar_url)
    }

    let promise = getAccount();
    
    let url = ""
    
    async function sendAvatar(data) {

        var data = new FormData();
        var imagedata = document.querySelector('input[type="file"]').files[0];
        data.append("file", imagedata);

        const payload = {"type": "avatar", "filename": imagedata.name};
        const rpcid = "upload_file";
        const fileurl = await client.rpc($Session, rpcid, payload);
        url = fileurl.payload.url
        console.log(url)

        //create form data      
        
        //data.append("userId", $Session.user_id);
        console.log($Session.user_id)
        const entries = [...data.entries()];
        console.log(entries);

        await fetch(url, {
            method: "PUT",
            headers: {
              "Content-Type": "multipart/form-data"
            },
            body: imagedata
          })

        await client.updateAccount($Session, {
            avatar_url: fileurl.payload.location,
        });
    }

    async function getAvatar(avatar_url) {
      const payload = {"url": avatar_url};
        const rpcid = "download_file";
        const fileurl = await client.rpc($Session, rpcid, payload);
        url = fileurl.payload.url
        console.log(url)
        return url
    }

    


    
</script>

<main>
        <form on:submit|preventDefault={sendAvatar}>
 <!--   <form action="http://localhost:4000/uploadAvatar" method="post" enctype="multipart/form-data">-->
        <input id='avatar' type="file" name="avatar" />
        <input type="text" class="form-control" value="" name="avatar">
        <input type="submit" value="Upload my avatar!" class="btn btn-default"> 
      </form>

      <h1>Here is your current avatar:</h1>
      <img src="{avatar_url}" >
</main>

<style>
	* {box-sizing: border-box}

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

/* Overwrite default styles of hr */
hr {
  border: 1px solid #f1f1f1;
  margin-bottom: 25px;
}

/* Set a style for the submit/register button */
.registerbtn {
  background-color: #04AA6D;
  color: white;
  padding: 16px 20px;
  margin: 8px 0;
  border: none;
  cursor: pointer;
  width: 100%;
  opacity: 0.9;
}

.registerbtn:hover {
  opacity:1;
}

/* Add a blue text color to links */
a {
  color: dodgerblue;
}

/* Set a grey background color and center the text of the "sign in" section */
.signin {
  background-color: #f1f1f1;
  text-align: center;
}
</style>