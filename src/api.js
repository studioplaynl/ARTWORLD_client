import { client } from "./nakama.svelte"
import { Session,Profile, Error } from "./session.js"

let Sess, pub;
export let url;
export let user; 


Session.subscribe(value => {
  Sess = value;
});

export async function uploadImage(name, type, json, img, status) {
  console.log(Sess)
  console.log("name: " + name)
  console.log(img)

  var [jpegURL, jpegLocation] = await getUploadURL(type, name, "jpeg")
  var [jsonURL, jsonLocation] = await getUploadURL(type, name, "json")
  var value = { "jpeg": jpegLocation, "json": jsonLocation};
  if(status == "zichtbaar"){
    pub = true
  }else{
    pub = false
  }
 
  await fetch(jpegURL, {
    method: "PUT",
    headers: {
      "Content-Type": "multipart/form-data"
    },
    body: img
  })

  await fetch(jsonURL, {
    method: "PUT",
    headers: {
      "Content-Type": "multipart/form-data"
    },
    body: json
  })
  await updateObject(type, name, value,pub)
  Error.update(er => er = "Saved")
}

export async function listImages(type, user, limit) {
  const objects = await client.listStorageObjects(Sess, type, user, limit);
  console.log(objects)
  return objects.objects
}

export async function getUploadURL(type, name, filetype) {
  name = name + '.' + filetype
  const payload = { "type": type, "filename": name };
  const rpcid = "upload_file";
  const fileurl = await client.rpc(Sess, rpcid, payload);
  console.log(fileurl)
  url = fileurl.payload.url
  var locatio = fileurl.payload.location
  return [url, locatio]
}

export async function updateObject(type, name, value, pub) {
  if(pub) {
    pub = 2
  }
  else{ pub = 1;}
  const object_ids = await client.writeStorageObjects(Sess, [
    {
      "collection": type,
      "key": name,
      "value": value,
      "permission_read": pub,
      //"version": "*"
    }
  ]);
  console.info("Stored objects: %o", object_ids);
}


export async function listObjects(type, userID, limit) {
  if(!!!limit) limit = 100;
  const objects = await client.listStorageObjects(Sess, type, userID, limit);
  return objects
}

export async function getAccount(id, avatar) {
  if(!!!id){
    const account = await client.getAccount(Sess);
    let user = account.user;
    if(!!!avatar) user.url = await getAvatar(user.avatar_url) //!we need to get avatar.url even when there is an avatar
    user.meta = JSON.parse(user.metadata)
    console.log(user)
    Profile.set(user)
    return user
  }else {
    const users = await client.getUsers(Sess, [id]);
    console.log(users)
    let user = users.users[0]
    user.url = await getAvatar(user.avatar_url)
    console.log(user)
    return user
  }
}


export async function getFullAccount(id) {
  let payload = {};
  if(!!id){
    payload = {id: id};
  }

  let user  
  const rpcid = "get_full_account";
   user = await client.rpc(Sess, rpcid, payload)
   console.log(user)

  return user.payload
}

export async function setFullAccount(id, username, password, email, metadata) {
  let payload = {id, username, password, email, metadata};

  
  let user  
  const rpcid = "set_full_account";
   user = await client.rpc(Sess, rpcid, payload)
   console.log(user)
   Error.update(er => er = "Saved updates")
  return user.payload
}


//getAvatar only works reliably via the getAccount call
export async function getAvatar(avatar_url) {
  const payload = {"url": avatar_url};
  let url  
  const rpcid = "download_file";
  await client.rpc(Sess, rpcid, payload)
    .then((fileurl)=> {
      url = fileurl.payload.url
      console.log("url")
      console.log(url)
      return url
    })
    .catch(()=>{
      console.log('fail')
      return ''
    })
    return url
}

  export async function uploadAvatar(data,json) {
    var [jpegURL, jpegLocation] = await getUploadURL("avatar", "current", "png")
    var [jsonURL, jsonLocation] = await getUploadURL("avatar", "current", "json")
    console.log(jpegURL)

  await fetch(jpegURL, {
      method: "PUT",
      headers: {
        "Content-Type": "multipart/form-data"
      },
      body: data
    })

    await fetch(jsonURL, {
      method: "PUT",
      headers: {
        "Content-Type": "multipart/form-data"
      },
      body: json
    })

  await client.updateAccount(Sess, {
      avatar_url: jpegLocation,
  });
  Error.update(er => er = "Saved")

}


export async function deleteFile(type,file,user) {
  const payload = {"type": type, "name": file, "user": user};
    const rpcid = "delete_file";
    const fileurl = await client.rpc(Sess, rpcid, payload);
    let url = fileurl.payload.url
    console.log(url)
    return url
}

export async function addFriend(id,usernames) {
  if(typeof id == "string"){
    if(!!id){
      id = [id]
    } else {
      id = undefined
    }
  }
  if(typeof usernames == "string"){
    if(!!username){
      usernames = [usernames]
    } else {
      usernames = undefined
    }
  }
  await client.addFriends(Sess, id,usernames)
  .then(status => {
    Error.update(er => er = "friend added")
  })
  .catch(err =>{
    console.log(err)
    Error.update(er => er = err.status)
  })
}

export async function ListFriends() {
  const friends = await client.listFriends(Sess);
  return friends;
}


export async function ListAllUsers() {
  const payload = {};
  const rpcid = "get_all_users";
  const users = await client.rpc(Sess, rpcid, payload);
  return users.payload;
}


export async function deleteObject(collection, key) {

  await client.deleteStorageObjects(Sess, {
    "object_ids": [{
      "collection": collection,
      "key": key
    }]
  });
  console.info("Deleted objects.");
  
  return true
}


export async function updateObjectAdmin(id, type, name, value, pub) {
  let payload = {id,type, name, value, pub};


  const rpcid = "create_object_admin";
   user = await client.rpc(Sess, rpcid, payload)
   console.log(user)
   if(user.payload.status == "succes") Error.update(er => er = "create object")
   else Error.update(er => er = "create object failed")
  return user.payload
}


export async function deleteObjectAdmin(id, type, name) {
  let payload = {id,type, name};


  const rpcid = "delete_object_admin";
   user = await client.rpc(Sess, rpcid, payload)
   console.log(user)
   if(user.payload.status == "succes") Error.update(er => er = "deleted object")
   else Error.update(er => er = "delete object failed")
  return user.payload
}

//..................... image converter ................................
// usage:

// path = "drawing/5264dc23-a339-40db-bb84-e0849ded4e68/blauwslang.jpeg"
// size = "64"
// format = "png"


export async function convertImage(path,size, format) {
  let payload = {path,size, format};
  const rpcid = "convert_image";
   let user = await client.rpc(Sess, rpcid, payload)
   if(!!!user.payload.url) Error.update(er => er = "could'nt convert image")
  return user.payload.url
}