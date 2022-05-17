import { date } from "svelte-i18n";
import { client } from "./nakama.svelte"
import { Session, Profile, Error, Succes, CurrentApp } from "./session.js"
import ManageSession from "./routes/game/ManageSession.js"; //push awards to ManageSession
import { get } from 'svelte/store'

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

export async function uploadImage(name, type, img, status, version, displayName) {

  var [jpegURL, jpegLocation] = await getUploadURL(type, name, "png", version)
  var value = { "url": jpegLocation, "version": version, "displayname": displayName };
  if (status == "zichtbaar" || status == 2) {
    pub = true
  } else {
    pub = false
  }

  await fetch(jpegURL, {
    method: "PUT",
    headers: {
      "Content-Type": "multipart/form-data"
    },
    body: img
  })

  await updateObject(type, name, value, pub)
  return value.url
}

export async function sessionCheck() {
  let payload = {}
  const rpcid = "SessionCheck";
  const response = await client.rpc(Sess, rpcid, payload);
  console.log(response)
}

export async function updateTitle(collection, key, name, userID) {
  if (!!!userID) userID = Sess.user_id
  let Object = await getObject(collection, key, userID)
  Object.value.displayname = name
  if(prof.meta.Role == "admin" ||prof.meta.Role == "moderator" ) await updateObject(collection, key, Object.value,Object.permission_read, userID)
  else await updateObject(collection, key, Object.value,Object.permission_read)
}

export async function listImages(type, user, limit) {
  const objects = await client.listStorageObjects(Sess, type, user, limit);
  console.log(objects)
  return objects.objects
}

export async function uploadHouse( data) {

  
  let type = "home"
  let name = prof.meta.Azc
  let object = await getObject(type, name)
  let value
  if (!!!object) { value = {}; }
  else { value = object.value }
  console.log("value",value)
  value.username = prof.username
  if(!!!value.version) value.version = 0
  else value.version = value.version + 1 
  pub = true

  var [jpegURL, jpegLocation] = await getUploadURL("home", "current", "png", value.version)
  
  await fetch(jpegURL, {
    method: "PUT",
    headers: {
      "Content-Type": "multipart/form-data"
    },
    body: data
  })

  value.url = jpegLocation
  // get object
  console.log("value",value)
  await updateObject(type, name, JSON.stringify(value), pub)

}

export async function getUploadURL(type, name, filetype, version) {
  name = version + "_" + name + '.' + filetype
  const payload = { "type": type, "filename": name };
  console.log("payload")
  console.log(payload)
  const rpcid = "upload_file";
  console.log("Sess")
  console.log(Sess)
  const fileurl = await client.rpc(Sess, rpcid, payload);
  console.log(fileurl)
  url = fileurl.payload.url
  var locatio = fileurl.payload.location
  return [url, locatio]
}

export async function updateObject(type, name, value, pub, userID) {
  // if user is admin/moderator and userID
  if (!!!userID) {
    userID = Sess.user_id
  }
  if (pub) {
    pub = 2
  }
  else {
    pub = 1
  }
  if (typeof value == "string") {
    value = JSON.parse(value)
  }
  let object = {
    "collection": type,
    "key": name,
    "value": value,
    "permission_read": pub,
    //"version": "*"
  }
  console.log(prof.meta.Role)
  if(prof.meta.Role == "admin" || prof.meta.Role == "moderator"){
    console.log("working!")
    await updateObjectAdmin(userID, type, name, value, pub)
  } else {
    // else 
    const object_ids = await client.writeStorageObjects(Sess, [
      object
    ]);
    console.info("Stored objects: %o", object_ids);
    Succes.update(s => s = true)
  }
}


export async function listObjects(type, userID, limit, page) {
  if (!!!limit) limit = 100;
  const objects = await client.listStorageObjects(Sess, type, userID, limit, page);
  // console.log(objects)
  return objects.objects
}



export async function getObject(collection, key, userID) {
  if (!!!userID) userID = Sess.user_id
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
  const payload = { type, id };
  const rpcid = "list_all_storage_object";
  const objects = await client.rpc(Sess, rpcid, payload);
  // objects.payload.forEach(object => {
  //   object.value = JSON.parse(object.value)
  // });
  return objects.payload
}

export async function getAccount(id, avatar) {
  if (!!!id) {
    const account = await client.getAccount(Sess);
    let user = account.user;
    user.url = await convertImage(user.avatar_url, "128", "1000")
    user.meta = JSON.parse(user.metadata)
    console.log(user)
    Profile.set(user)
    return user
  } else {
    const users = await client.getUsers(Sess, [id]);
    console.log(users)
    let user = users.users[0]
    user.url = await convertImage(user.avatar_url, "128", "1000")
    //console.log(user)
    return user
  }
}


export async function getFullAccount(id) {
  let payload = {};
  if (!!id) {
    payload = { id: id };
  }

  let user
  const rpcid = "get_full_account";
  user = await client.rpc(Sess, rpcid, payload)
  console.log(user)

  return user.payload
}

export async function setFullAccount(id, username, password, email, metadata) {
  let payload = { id, username, password, email, metadata };
  console.log("metadata")
  console.log(metadata)
  let user
  const rpcid = "set_full_account";
  user = await client.rpc(Sess, rpcid, payload)
  //console.log(user)
  Succes.update(s => s = true)
  return user.payload
}


//getAvatar only works reliably via the getAccount call
export async function getAvatar(avatar_url) {
  return getFile(avatar_url)
}

export async function getFile(file_url) {
  const payload = { "url": file_url };
  let url
  const rpcid = "download_file";
  await client.rpc(Sess, rpcid, payload)
    .then((fileurl) => {
      url = fileurl.payload.url
      //console.log("url")
      //console.log(url)
      return url
    })
    .catch(() => {
      console.log('fail')
      return ''
    })
  return url
}

export async function uploadAvatar(data, json) {
  setLoader(true);
  let avatarVersion = Number(prof.avatar_url.split("/")[2].split("_")[0]) + 1
  if(!!!avatarVersion) avatarVersion = 0
  var [jpegURL, jpegLocation] = await getUploadURL("avatar", "current", "png", avatarVersion)
  console.log(jpegURL)

  await fetch(jpegURL, {
    method: "PUT",
    headers: {
      "Content-Type": "multipart/form-data"
    },
    body: data
  })

  //get meta

  // update avatar version

  await client.updateAccount(Sess, {
    avatar_url: jpegLocation,
  });
  CurrentApp.set("")
  let Image = await convertImage(jpegLocation, "128", "1000", "png")
  //Profile.update((n) => { n.url = Image; return n });
  getAccount()
  Succes.update(s => s = true)
  setLoader(false);
  return jpegLocation
}


export async function deleteFile(type, file, user) {
  const payload = { "type": type, "name": file, "user": user };
  console.log(payload)
  const rpcid = "delete_file";
  const fileurl = await client.rpc(Sess, rpcid, payload)
    .catch((e) => { throw e })
    Succes.update(s => s = true)
}

export async function addFriend(id, usernames) {
  if (typeof id == "string") {
    if (!!id) {
      id = [id]
    } else {
      id = undefined
    }
  }
  if (typeof usernames == "string") {
    if (!!username) {
      usernames = [usernames]
    } else {
      usernames = undefined
    }
  }
  await client.addFriends(Sess, id, usernames)
    .then(status => {
      Succes.update(s => s = true)
    })
    .catch(err => {
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

export async function ListAllArt(page, ammount) {
  const payload = { page, ammount };
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
  Succes.update(s => s = true)
  return true
}


export async function updateObjectAdmin(id, type, name, value, pub) {
  let result
  if (typeof value == "object") {
    value = JSON.stringify(value)
  }
  let payload = { id, type, name, value, pub };
  console.log(payload)

  const rpcid = "create_object_admin";
  result = await client.rpc(Sess, rpcid, payload)
  console.log(result)
  if (result.payload.status == "succes") {
    Succes.update(s => s = true)
  } // succes
  else {
    throw result.payload.status // error
  }
  return result.payload
}


export async function deleteObjectAdmin(id, type, name) {
  let payload = { id, type, name };


  const rpcid = "delete_object_admin";
  user = await client.rpc(Sess, rpcid, payload)
  console.log(user)
  if (user.payload.status != "succes") throw user.payload.status
  else Succes.update(s => s = true)
  return user.payload
}

//..................... image converter ................................
// usage:

// path = "drawing/5264dc23-a339-40db-bb84-e0849ded4e68/blauwslang.jpeg"
// size = "64"
// format = "png"


export async function convertImage(path, height, width, format) {
  if (typeof size == "number") size = String(size)
  let payload = { path, height, width, format };
  const rpcid = "convert_image";
  let user = await client.rpc(Sess, rpcid, payload)
  if (!!!user.payload.url) Error.update(er => er = "could'nt convert image")
  return user.payload.url
}

export async function validate(string, type, input) {
  //Regex for Valid Characters i.e. Alphabets, Numbers and Space.
  var regex = new RegExp(/[^A-Za-z -@0-9]/g)
  if (type == "special") regex = /^[^\W|_]+$/g
  if (type == "phone") regex = '';
  if (type == "email") regex = new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)

  if (type == "password") {
    regex = /^[^]{8,15}$/g
    password = string
    console.log("pass" + password)
  }

  console.log(regex)
  console.log(string)
  let valid = regex.test(string)
  console.log(valid)

  if (type == "repeatpassword") {
    repeatpassword = string
    console.log(password)
    console.log(repeatpassword)
    if (repeatpassword == password) valid = true
    else valid = false
  }
  console.log(input)
  if (!!input) {
    if (valid) {
      input.path[0].style.border = "0px"
    } else {
      input.path[0].style.border = "1px solid red"

    }
  }
  return valid
}

export function setLoader(state) {
  if (state) {
    document.getElementById("loader").classList.remove('hide');
  } else {
    document.getElementById("loader").classList.add('hide');
  }
}

export function saveAchievement(name) {
//  ManageSession.achievements.achievements[0][name] = true
  console.log("achievement:" + name)
  const type = "achievements"
  const key = type + "_" + ManageSession.userProfile.id
  const pub = 2
  const value = ManageSession[type]
  updateObject(type, key, value, pub)
}







