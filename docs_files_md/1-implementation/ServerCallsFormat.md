## uploadImage(name, type, json, img, status,version, displayName)

this function:

- gets upload URL for json and png
- uploads blobs to aws
- send an object to nakama containing:

```
{
  "url": "drawing/5264dc23-a339-40db-bb84-e0849ded4e68/4_blauwSpotlijster.png",
  "json": "drawing/5264dc23-a339-40db-bb84-e0849ded4e68/4_blauwSpotlijster.json",
  "version": 4,
  "displayname": "blauwSpotlijster"
}
```

no response on succes

## getUploadURL(type, name, filetype,version)

this function creates a signed upload url for file upload to AWS

### usage example

```
var version = 1
var [jsonURL, jsonLocation] = await getUploadURL("home", "current", "json", version)
// creates route on aws "/home/user_id/1_current.json"
```

## updateTitle(collection, key, name, userID)

this function:

- picks up object
- updates object.value.displayname
- pushes object back to server

### example

```
updateTitle("drawing", "12345345_geelkoe", "nieuwe naam", "`1231hh3123dasda")
```

## updateObject(type, name, value, pub, userID)

userID is optional, only necessary for admin and moderator functions.

### Example (addressbook):

```
const type = "addressbook"
const name = type + "_" + ManageSession.userProfile.id
const value = '{"user_id": "b9ae6807-1ce1-4b71-a8a3-f5958be4d340", "posX": "500", "posY": "110"}'
const pub = 2

updateObject(type, name, value, pub)
```

## getAccount(id, avatar)

```
0:[
{
avatar_url: "avatar/f42eb28f-9f4d-476c-9788-2240bac4cf48/current.png",
create_time: "2021-10-11T11:32:02Z",
display_name: undefined,
edge_count: 0,
facebook_id: undefined,
gamecenter_id: undefined,
google_id: undefined,
id: "f42eb28f-9f4d-476c-9788-2240bac4cf48",
lang_tag: "en",
location: undefined,
metadata:{
          azc: "Amsterdam",
          location: "ArtworldAmsterdam",
          posX: -122.62672,
          posY: 22.468008,
          role: "speler",
          user_id: "",
}
online: true,
steam_id: undefined,
timezone: undefined,
update_time: "2022-02-08T13:02:37Z",
url: "https://artworldstudioplay.s3.eu-central-1.amazonaws.com/avatar/f42eb28f-9f4d-476c-9788-2240bac4cf48/current.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAR7FDNFNP252ENA7M%2F20220208%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20220208T130243Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=fbf4c90016829b9ad0376fd0b7c96b563a0dfd16d46f0d6289287a444fa8604c",
username: "user33",
},
]

```

The url is the actual avatar url, the url is called via getAccount, getUrl, but with a couple of await functions it takes a bit for the url to load via the getAccount function.

## getAvatar(avatar_url)

## uploadAvatar(data)

## deleteFile(type,file,user)

## adding data (eg locations) to the backend

`function updateObject(type, name, value, pub)`

Example:  
type: "home" (collection)  
name = "hansjes huisje" (key)  
value = object with keys (value)  
pub: permission_read (pub)

updateObject("location", name, value, true)

## listObjects(type, userID, limit, page)

type = "location"

userID = per user, null to get all users

limit = how many you want to get(standard 100)

page = index of limit(if limit = 100, index 0 = 1 - 100, index 1 = 101 -200, index 2 = 202 - 300 etc...)

### examples

_getting a users home object_

    listObjects('home','5264dc23-a339-40db-bb84-e0849ded4e68')

returns the object:

```
[
  {
    "collection": "home",
    "key": "Amsterdam",
    "permission_read": 2,
    "permission_write": 1,
    "value": {
      "url": "home/5264dc23-a339-40db-bb84-e0849ded4e68/current.png",
      "posX": 228.16,
      "posY": 57.66,
      "userName": "user11"
    },
    "version": "d1be852d6a66654ec9faa878fcb41b7d",
    "user_id": "5264dc23-a339-40db-bb84-e0849ded4e68",
    "create_time": "2022-01-12T12:31:53Z",
    "update_time": "2022-01-13T15:45:02Z"
  }
]
```

## convert images

`convertImage(path,size, format)`

output:

`"https://d3hkghsa3z4n1z.cloudfront.net/fit-in/64x64/filters:trim()/avatar/4ced8bff-d79c-4842-b2bd-39e9d9aa597e/current.png?signature=cbda2578e5612c70c009ebc6e0424e9025078aa94517543b310bf01eedefb167"
`

size and format at not both required to work, either one or both will also function
for example:

`convertImage(path,, format)`

This is a replacement for getAvatar()

if needed more filters can be added in the future, see:
https://docs.aws.amazon.com/solutions/latest/serverless-image-handler/thumbor-filters.html

## listAllObjects(type, id, limit, cursor)

`type` is eg drawing, location, etc ...  
`id` is userID(or `undefined`, but not `null` or `""`)  
`limit` is the max number of objects you want to receive (either by page or in total)  
`cursor` is on the first call ```undefined```` (just empty), when supplied, it defines the next page of limit-number of objects. The cursor is the last objects update time, so: objects[limit - 1].update_time

Results come back within .objects array:

```
[
{
collection: "drawing"
downloaded: true
key: "2023-01-02T21_50_42_GeelAvoceta"
permission_read: 1
read: 1
update_time: "2023-01-20T16:55:15.02286+01:00"
user_id: "f011a5dc-901a-42c0-9589-587b389d1e3e"
username: "user11"
value:
      displayname: "bloem"
      url: "drawing/f011a5dc-901a-42c0-9589-587b389d1e3e/0_2023-01-02T21_50_42_GeelAvoceta.png"
      version: "0"
},
.....
]

```

`update_time: "2023-01-20T16:55:15.02286+01:00"` of the last object is used as the cursor to get the next page of objects.

## validate(string,type,input)

### types

email - validates email adresses

password - validates length is betweenm 5 and 10 characters

repeat password - checks if password and repeat password are identical

special - checks if the value contains no special characters

### examples:

can be used in 2 ways, inline, automatically sets border to red if fail

```
<input
	type="text"
	placeholder="Enter Username"
	name="username"
	id="username"
	bind:value={username}
	on:keyup={async input => {await validate(username,"special",input)}}
	required
/>
```

or can used within a function as following:

```
if(await validate(email,"email")){
// run action if valid
} else {
// run if invalid
)
```

# setLoader(state)

`setLoader(true)` sets loading screen on

`setLoader(false)` sets loading screen off

# getAllHouses(location,user_id)

Gives you all the houses objects within the location, optionally add a user_id
example result:

```

[
  {
    "read": 2,
    "artworks": {
      "stopmotion": 1,
      "drawing": 3
    },
    "username": "user6",
    "key": "Amsterdam",
    "collection": "home",
    "update_time": "2022-08-08T15:17:06.817697+02:00",
    "permission_read": 2,
    "value": {
      "username": "user6",
      "url": "home/fcbcc269-a109-4a4b-a570-5ccafc5308d8/5_current.png",
      "posX": -904.9999877562127,
      "posY": 72.49999139457941,
      "version": 5
    },
    "user_id": "fcbcc269-a109-4a4b-a570-5ccafc5308d8"
  },

```
