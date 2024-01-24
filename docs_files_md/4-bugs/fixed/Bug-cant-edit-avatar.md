---
title: "Log: Bug - can't edit AVATAR"
date: "2022-12-27"
---

When loading an old avatar, and drawing over it. The Avatar does not get saved.

* * *

Open OLD AVATAR

Draw over the OLD AVATAR

Save (close)

We don't see the EDITED AVATAR in the Profile Page, we don't see it in the game

We do see the EDITED AVATAR when we edit again, we do see it on AWS, and the OLD AVATAR is overwritten.

_When Saving and Edit should be: save under a new name_

(2) In AWS I still see a 0\_ in front of the name, why is this? Versioning is abolished...

* * *

(1) So the EDIT gets saved on server, but not on local STORE?

When making a new avatar:

Avatar saveData Upload currentFile.key, currentFile.type, currentFile.status, currentFile.displayName,: 2022-12-23T10\_09\_00\_CyaanFregata avatar true CyaanFregata **appLoader.svelte:141**

Avatar saveData Upload result: avatar/fcbcc269-a109-4a4b-a570-5ccafc5308d8/0\_2022-12-23T10\_09\_00\_CyaanFregata.png **appLoader.svelte:143**

A NEW AVATAR is overwriting the previous AVATAR!!

Not showing in the list

EASY fix: make a new AVATAR when you edit the AVATAR

```
  async function newFile() {
    const saveToCollection = $CurrentApp;
    const displayName = await getRandomName();
    currentFile = {
      userId: $Profile.id,
      loaded: false,
      new: true,
      displayName,
      key: `${getDateMillis()}_${displayName}`,
      type: saveToCollection,
      status: true,
    };
```

currentFile:

```

loaded: true
new: false
```

setting 'new' to true, so it load it as a new file

Getting an error:

```
nakama-js.esm.mjs:618          PUT http://193.187.129.81:7350/v2/account? 400 (Bad Request)

setAvatarPromise error 

Response {type: 'cors', url: 'http://193.187.129.81:7350/v2/account?', redirected: false, status: 400, ok: false, …}
body
: 
(...)
bodyUsed
: 
false
headers
: 
Headers {}
ok
: 
false
redirected
: 
false
status
: 
400
statusText
: 
"Bad Request"
type
: 
"cors"
url
: 
"http://193.187.129.81:7350/v2/account?"
```

Het werkt, alleen je moet 2x klikken op de close button, hij maakt dan wel 2x een avatar

* * *

The problem is that the upload URL is not generated the first time

Let's look how a successful save happens

Apploader.svelte

saveData()

uploadPromise())

blobData

UploadImage(currentFile .key, type, blobData, status, 0 (version), displayName

1. **displayName**: "PaarsInktvis"

3. **key**: "2022-12-30T13\_10\_38\_PaarsInktvis"

5. **loaded**: false

7. **new**: true

9. **status**: true

11. **type**: "stopmotion"

13. **uploadUrl**: "stopmotion/fcbcc269-a109-4a4b-a570-5ccafc5308d8/0\_2022-12-30T13\_10\_38\_PaarsInktvis.png"

15. **userId**: "fcbcc269-a109-4a4b-a570-5ccafc5308d8"

\-> url

**jpegURL**, stopmotion/fcbcc269-a109-4a4b-a570-5ccafc5308d8/0\_2022-12-30T13\_10\_38\_PaarsInktvis.png

**jpegLocation** https://artworld01.s3.eu-central-1.amazonaws.com/stopmotion/fcbcc269-a109-4a4b-a570-5ccafc5308d8/0\_2022-12-30T13\_10\_38\_PaarsInktvis.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA3VY3XUKP6SYAM4OK%2F20221230%2Feu-central-1%2Fs3%2Faws4\_request&X-Amz-Date=20221230T131048Z&X-Amz-Expires=900&X-Amz-SignedHeaders=host&X-Amz-Signature=80511b2db9dab86b9717b26d225c9fc256c95e38c6702fc3c2ec4c422898af96 stopmotion/fcbcc269-a109-4a4b-a570-5ccafc5308d8/0\_2022-12-30T13\_10\_38\_PaarsInktvis.png

\-->resolve(url)

* * *

When saving an AVATAR (edited) we begin with:

1. **displayName**: "ZilverKikker"

3. **frames**: 1

5. **key**: "2022-12-30T13\_33\_40\_ZilverKikker"

7. **loaded**: true

9. **new**: true

11. **status**: true

13. **type**: "avatar"

15. **uploadUrl**: "avatar/fcbcc269-a109-4a4b-a570-5ccafc5308d8/0\_2022-12-30T13\_33\_40\_ZilverKikker.png"

17. **url**: "https://artworld01.s3.eu-central-1.amazonaws.com/avatar/fcbcc269-a109-4a4b-a570-5ccafc5308d8/0\_2022-12-30T12\_57\_56\_ZilverKikker.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA3VY3XUKP6SYAM4OK%2F20221230%2Feu-central-1%2Fs3%2Faws4\_request&X-Amz-Date=20221230T133314Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=a8d50b2362c6980bcd953542664dd315690f0ddbe3a25ef45452ab7191873ee3"

19. **userId**: "fcbcc269-a109-4a4b-a570-5ccafc5308d8"

flagging an edited file as new

1. **displayName**: "ZilverKikker"

3. **frames**: 1

5. **key**: "2022-12-30T13\_33\_40\_ZilverKikker"

7. **loaded**: true

9. **new**: true

11. **status**: true

13. **type**: "avatar"

15. **uploadUrl**: "avatar/fcbcc269-a109-4a4b-a570-5ccafc5308d8/0\_2022-12-30T13\_33\_40\_ZilverKikker.png"

17. **url**: "https://artworld01.s3.eu-central-1.amazonaws.com/avatar/fcbcc269-a109-4a4b-a570-5ccafc5308d8/0\_2022-12-30T12\_57\_56\_ZilverKikker.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA3VY3XUKP6SYAM4OK%2F20221230%2Feu-central-1%2Fs3%2Faws4\_request&X-Amz-Date=20221230T133314Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=a8d50b2362c6980bcd953542664dd315690f0ddbe3a25ef45452ab7191873ee3"

19. **userId**: "fcbcc269-a109-4a4b-a570-5ccafc5308d8"

(so no change yet!)
