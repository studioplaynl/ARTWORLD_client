import { date } from "svelte-i18n";
import { client } from "./nakama.svelte"
import { Session,Profile, Error } from "./session.js"

let Sess, pub, prof;
export let url;
export let user; 
let password, repeatpassword;

Session.subscribe(value => {
  Sess = value;
});

Profile.subscribe(value => {
  prof = value;
});

export async function uploadImage(name, type, json, img, status, version, displayName) {
  console.log(Sess)
  console.log("type: " + type)
  console.log("name: " + name)
  console.log(img)
  console.log(displayName)

  var [jpegURL, jpegLocation] = await getUploadURL(type, name, "png",version)
  var [jsonURL, jsonLocation] = await getUploadURL(type, name, "json",version)
  console.log(jpegURL + jsonURL)
  var value = { "url": jpegLocation, "json": jsonLocation, "version": version, "displayname": displayName};
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
}

export async function updateTitle(collection, key, name, userID){
  if(!!!userID) userID = Sess.user_id
  let Object = await getObject(collection, key, userID)
  Object.value.displayname = name
  if(prof.meta.role == "admin" ||prof.meta.role == "moderator" ) await updateObject(collection, key, Object.value,Object.permission_read, userID)
  else await updateObject(collection, key, Object.value,Object.permission_read)
}

export async function listImages(type, user, limit) {
  const objects = await client.listStorageObjects(Sess, type, user, limit);
  console.log(objects)
  return objects.objects
}

export async function uploadHouse(json, data,version){

  var [jpegURL, jpegLocation] = await getUploadURL("home", "current", "png",version)
  var [jsonURL, jsonLocation] = await getUploadURL("home", "current", "json",version)
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



  let type = "home"
  let name = prof.meta.azc
  let object = await getObject(type, name)
  let value 
  if(!!!object){value = {};}
  else{value =  object.value}
  console.log(value)
  value.url = jpegLocation
  value.username = prof.username
  pub = true

  // get object
  await updateObject(type, name, JSON.stringify(value), pub)
}

export async function getUploadURL(type, name, filetype,version) {
  name = version + "_" + name + '.' + filetype
  const payload = { "type": type, "filename": name };
  const rpcid = "upload_file";
  const fileurl = await client.rpc(Sess, rpcid, payload);
  console.log(fileurl)
  url = fileurl.payload.url
  var locatio = fileurl.payload.location
  return [url, locatio]
}

export async function updateObject(type, name, value, pub,userID) {
  // if user is admin/moderator and userID
  
  if(pub) {
    pub = 2
  }
  else{ 
    pub = 1
  }
  if( typeof value == "string"){
    value = JSON.parse(value)
  }
  let object = {
    "collection": type,
    "key": name,
    "value": value,
    "permission_read": pub,
    //"version": "*"
  }
  console.log(prof.meta.role)
  if(prof.meta.role == "admin" || prof.meta.role == "moderator"){
    console.log("working!")
    updateObjectAdmin(userID, type, name, value, pub)
  } else {
  // else 
  const object_ids = await client.writeStorageObjects(Sess, [
    object
  ]);
  console.info("Stored objects: %o", object_ids);
  }
}


export async function listObjects(type, userID, limit) {
  if(!!!limit) limit = 100;
  const objects = await client.listStorageObjects(Sess, type, userID, limit);
  console.log(objects)
  return objects.objects
}



export async function getObject(collection, key, userID) {
  if(!!!userID) userID = Sess.user_id
  const objects = await client.readStorageObjects(Sess, {
    "object_ids": [{
      "collection": collection,
      "key": key,
      "user_id": userID
    }]
  });
    return objects.objects[0]
}




export async function listAllObjects(type, id) {
  const payload = { type , id};
  const rpcid = "list_all_storage_object";
  const objects = await client.rpc(Sess, rpcid, payload);

  return objects.payload
}

export async function getAccount(id, avatar) {
  if(!!!id){
    const account = await client.getAccount(Sess);
    let user = account.user;
    if(!!!avatar) user.url = await getAvatar(user.avatar_url) //!we need to get avatar.url even when there is an avatar
    user.meta = JSON.parse(user.metadata)
    //console.log(user)
    Profile.set(user)
    return user
  }else {
    const users = await client.getUsers(Sess, [id]);
    console.log(users)
    let user = users.users[0]
    user.url = await getAvatar(user.avatar_url)
    //console.log(user)
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
  console.log("metadata")
  console.log(metadata)
  let user  
  const rpcid = "set_full_account";
   user = await client.rpc(Sess, rpcid, payload)
   //console.log(user)
  return user.payload
}


//getAvatar only works reliably via the getAccount call
export async function getAvatar(avatar_url) {
  return getFile(avatar_url)
}

export async function getFile(file_url) {
  const payload = {"url": file_url};
  let url  
  const rpcid = "download_file";
  await client.rpc(Sess, rpcid, payload)
    .then((fileurl)=> {
      url = fileurl.payload.url
      //console.log("url")
      //console.log(url)
      return url
    })
    .catch(()=>{
      console.log('fail')
      return ''
    })
    return url
}

  export async function uploadAvatar(data,json) {
    prof.meta.avatarVersion = Number(prof.meta.avatarVersion || 0) + 1
    var [jpegURL, jpegLocation] = await getUploadURL("avatar", "current", "png",prof.meta.avatarVersion)
    var [jsonURL, jsonLocation] = await getUploadURL("avatar", "current", "json", prof.meta.avatarVersion)
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

    //get meta
    
    // update avatar version

  await client.updateAccount(Sess, {
      avatar_url: jpegLocation,
      meta: prof.meta
  });
}


export async function deleteFile(type,file,user) {
  const payload = {"type": type, "name": file, "user": user};
  console.log(payload)
    const rpcid = "delete_file";
    const fileurl = await client.rpc(Sess, rpcid, payload)
    .catch((e)=> {throw e})
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
    throw err
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

export async function ListAllArt(page,ammount) {
  const payload = {page,ammount};
  const rpcid = "get_all_art";
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
  let result
  if(typeof value == "object"){
    value = JSON.stringify(value)
  }
  let payload = {id,type, name, value, pub};
  console.log(payload)

  const rpcid = "create_object_admin";
   result = await client.rpc(Sess, rpcid, payload)
   console.log(result)
   if(result.payload.status == "succes"){

   } // succes
   else {
     throw result.payload.status // error
   }
  return result.payload
}


export async function deleteObjectAdmin(id, type, name) {
  let payload = {id,type, name};


  const rpcid = "delete_object_admin";
   user = await client.rpc(Sess, rpcid, payload)
   console.log(user)
   if(user.payload.status != "succes") throw user.payload.status
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

export async function validate(string,type,input) {
  //Regex for Valid Characters i.e. Alphabets, Numbers and Space.
  var regex = new RegExp(/[^A-Za-z -@0-9]/g)
  if(type == "special") regex =/^[^\W|_]+$/g
  if(type == "phone") regex = '';
  if(type == "email") regex = new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
 
  if(type == "password") {
    regex =/^[^]{8,15}$/g
    password = string 
    console.log("pass"+password)
  } 

  console.log(regex)
  console.log(string)
  let valid = regex.test(string)
  console.log(valid)
 
  if(type == "repeatpassword"){ 
    repeatpassword = string
    console.log(password)
    console.log(repeatpassword)
    if(repeatpassword == password) valid = true
    else valid = false
  }
  console.log(input)
  if(!!input){
    if(valid){
      input.path[0].style.border="0px"
    } else{
      input.path[0].style.border="1px solid red"

    }
  }
  return  valid
}