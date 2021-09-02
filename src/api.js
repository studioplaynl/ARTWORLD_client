import { client } from "./nakama.svelte"
import { Session } from "./session.js"
let Sess;
let url;

Session.subscribe(value => {
  Sess = value;
});

export async function uploadImage(name, type, json, img) {
  console.log(Sess)
  console.log("name: " + name)
  console.log(img)

  var [jpegURL, jpegLocation] = await getUploadURL(type, name, "jpeg")
  var [jsonURL, jsonLocation] = await getUploadURL(type, name, "json")
  var value = { "jpeg": jpegLocation, "json": jsonLocation };
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

export async function recieveImage(data) {

}

export async function listImages(type, user, limit) {

  const objects = await client.listStorageObjects(Sess, type, user, limit);
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