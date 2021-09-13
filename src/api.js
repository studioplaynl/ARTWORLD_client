import { client } from "./nakama.svelte"
import { Session } from "./session.js"
let Sess;
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
  var value = { "jpeg": jpegLocation, "json": jsonLocation, "status": status };
  console.log(value)

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
  await updateObject(type, name, value)

}

export async function recieveImage(data) {

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

export async function updateObject(type, name, value) {
  const object_ids = await client.writeStorageObjects(Sess, [
    {
      "collection": type,
      "key": name,
      "value": value,
      //"version": "*"
    }
  ]);
  console.info("Stored objects: %o", object_ids);


}

export async function getAccount(id) {
  if(!!!id){
    const account = await client.getAccount(Sess);
    let user = account.user;
    console.log(user)
    user.url = await getAvatar(user.avatar_url)
    return user
  }else {
    const users = await client.getUsers(Sess, [id]);
    console.log(users)
    let user = users.users[0]
    console.log(user)
    user.url = await getAvatar(user.avatar_url)
    return user
  }
}

//getAvatar only works reliable via the getAccount call
export async function getAvatar(avatar_url) {
  const payload = {"url": avatar_url};
    const rpcid = "download_file";
    const fileurl = await client.rpc(Sess, rpcid, payload);
    let url = fileurl.payload.url
    console.log(url)
    return url
}

export async function deleteFile(type,file,user) {
  const payload = {"type": type, "name": file, "user": user};
    const rpcid = "delete_file";
    const fileurl = await client.rpc(Sess, rpcid, payload);
    let url = fileurl.payload.url
    console.log(url)
    return url
}