### Data structure    
{id: "user_id", art_url: "art_url"}

We are storing the object as:   
```collectionName.value.collectionName = [ {}, {} ]```    


```
collection: "liked"
create_time: "2022-01-26T12:02:11Z"
key: "liked_5264dc23-a339-40db-bb84-e0849ded4e68"
permission_read: 2
permission_write: 1
update_time: "2022-02-03T14:11:23Z"
user_id: "5264dc23-a339-40db-bb84-e0849ded4e68"
value:
    liked: (Array (2))
[
          0:
          {
           user_id: "e0849c23-a339-40db-bb84-e0849ded4e68",
           collection: "drawing",
           key: "1642771303290_limoenWalrus",
           version: 1,
           url: "drawing/5264dc23-a339-40db-bb84-e0849ded4e68/1_1642771303290_limoenWalrus.png",
           previewURl: "https://d3hkghsa3z4n1z.cloudfront.net/fit-in/64x64/stopmotion/5264dc23-a339-40db-bb84-e0849ded4e68/1_1642771303290_limoenWalrus.png?signature=c8c1aba753e01a6f06fd321a5a01a46fc18a483bb618ca1e2478283028a077f8",
           },
     
          1:
          {
           user_id: "e0849c23-a339-40db-bb84-e0849ded4e68",
           collection: "drawing",
           key: "1642771303290_limoenWalrus",
           version: 1,
           url: "drawing/5264dc23-a339-40db-bb84-e0849ded4e68/1_1642771303290_limoenWalrus.png",
           previewURl: "https://d3hkghsa3z4n1z.cloudfront.net/fit-in/64x64/stopmotion/5264dc23-a339-40db-bb84-e0849ded4e68/1_1642771303290_limoenWalrus.png?signature=c8c1aba753e01a6f06fd321a5a01a46fc18a483bb618ca1e2478283028a077f8",
           }
]
```

### The functionality can be found in the class ArtworkList.js

We do the first check in the NetworkBoot scene. We then have the latest liked array, each time a like is added of deleted we update the local and the server array, so the array is already in the updates state when clicking the liked button 

1.a check if it exists on the server    
1.b If the Liked object does not exists, create the object    
1.c if the object exists, parse it to local array (ManageSession.allLiked)    

We get a server Object with

    this.getServerObject("liked", ManageSession.userProfile.id, 10)

which calls

```
async getServerObject(collection, userID, maxItems) {
    Promise.all([listObjects(collection, userID, maxItems)])
      .then(response => {
        console.log("collection", collection)
        console.log("response", response)

        //check if the object exists
        if (response[0].length > 0) {
          //the object exists: addressbook

          // check if the right object exists: addressbook_user_id
          let filteredResponse = response[0].filter(element => {
            console.log(collection + "_" + ManageSession.userProfile.id, typeof collection)
            console.log("element", element)
            return element.key == collection + "_" + ManageSession.userProfile.id
          }
          )
          console.log("filteredResponse", filteredResponse)

          if (filteredResponse.length > 0) {
            //the right collection object exists, but check if there is data in de object, in the expected format

            if (typeof filteredResponse[0].value[collection] != "undefined") {
              //the object is in the right format (object.value.object), we assign our local copy
              ManageSession[collection] = filteredResponse[0].value
              console.log("ManageSession." + collection, ManageSession[collection])
            } else {
              //when the right addressbook does not exist: make an empty one
              //addressbook_userid.value exists but .addressbook  
              this.createEmptyServerObject(collection)
            }

          } else {
            //when the right addressbook does not exist: make an empty one
            this.createEmptyServerObject(collection)

          }
          console.log("ManageSession." + collection, ManageSession[collection])

        } else {
          //the addressbook does not exist: make an empty one
          this.createEmptyServerObject(collection)
        }
      })
  }
```

This is a promise, so we use Promise.all() to resolve a async/ await function inline.
Promise.all is easier to use then Promise, because it gives the result in one line

    

If the Liked Object does not exists, we make an empty object with an empty array, in the correct form:

```
async createEmptyServerObject(collection) {
    //general method of creating an array inside an object with the argument of the method
    console.log("createEmptyServerObject")
    console.log(collection)

    ManageSession[collection] = { [collection]:[] }

    const type = collection
    const name = type + "_" + ManageSession.userProfile.id
    const pub = 2
    const value = ManageSession[collection]
    console.log(" ManageSession. empty", ManageSession[collection])
    updateObject(type, name, value, pub)
  }
```
### Data structure of liked

If the Liked Object has content, then the Object in inside a one element array. Like so:

    collection: "liked"
    create_time: "2022-01-12T12:31:53Z"
    key: "all_liked_5264dc23-a339-40db-bb84-e0849ded4e68"
    permission_read: 2
    permission_write: 1
    update_time: "2022-01-13T15:45:02Z"
    user_id: "5264dc23-a339-40db-bb84-e0849ded4e68"
    value: 
        liked: [ 
              {
               user_id: "e0849c23-a339-40db-bb84-e0849ded4e68",
               collection: "drawing",
               key: "1642771303290_limoenWalrus",
               version: 1,
               url: "drawing/5264dc23-a339-40db-bb84-e0849ded4e68/1_1642771303290_limoenWalrus.png",
               previewURl: "https://d3hkghsa3z4n1z.cloudfront.net/fit-in/64x64/stopmotion/5264dc23-a339-40db-bb84-e0849ded4e68/1_1642771303290_limoenWalrus.png?signature=c8c1aba753e01a6f06fd321a5a01a46fc18a483bb618ca1e2478283028a077f8",
               
               },
               ]
    version: "d1be852d6a66654ec9faa878fcb41b7d"


url and previewURl is of the latest version, if we want to latest-latest version we would have to query for url and convert that url.

### Data of Artwork List

Called with `listImages("drawing", this.location, 100)`

```
{
            "collection": "stopmotion",
            "key": "1642771303290_limoenWalrus",
            "permission_read": 2,
            "permission_write": 1,
            "value":
                "url": "stopmotion/5264dc23-a339-40db-bb84-e0849ded4e68/1_1642771303290_limoenWalrus.png",
                "json": "stopmotion/5264dc23-a339-40db-bb84-e0849ded4e68/1_1642771303290_limoenWalrus.json",
                "version": 1,
                "previewUrl": "https://d3hkghsa3z4n1z.cloudfront.net/fit-in/64x64/stopmotion/5264dc23-a339-40db-bb84-e0849ded4e68/1_1642771303290_limoenWalrus.png?signature=c8c1aba753e01a6f06fd321a5a01a46fc18a483bb618ca1e2478283028a077f8",
                "displayname": "limoenWalrus1"
            "version": "47ef7fee1aeebeeae6bb183aa0728267",
            "user_id": "5264dc23-a339-40db-bb84-e0849ded4e68",
            "create_time": "2022-01-21T13:21:44Z",
            "update_time": "2022-01-21T13:23:01Z",
            "url": "stopmotion/5264dc23-a339-40db-bb84-e0849ded4e68/1_1642771303290_limoenWalrus"
        }
```

***
### Final Code

```
 async getServerObject(collection, userID, maxItems) {
    Promise.all([listObjects(collection, userID, maxItems)])
      .then(response => {
        console.log("collection", collection)
        console.log("response", response)

        //check if the object exists
        if (response[0].length > 0) {
          //the object exists: addressbook

          // check if the right object exists: addressbook_user_id
          let filteredResponse = response[0].filter(element => {
            console.log(collection + "_" + ManageSession.userProfile.id, typeof collection)
            console.log("element", element)
            return element.key == collection + "_" + ManageSession.userProfile.id
          }
          )
          console.log("filteredResponse", filteredResponse)

          if (filteredResponse.length > 0) {
            //the right collection object exists, but check if there is data in de object, in the expected format

            if (typeof filteredResponse[0].value[collection] != "undefined") {
              //the object is in the right format (object.value.object), we assign our local copy
              ManageSession[collection] = filteredResponse[0].value
              console.log("ManageSession." + collection, ManageSession[collection])
            } else {
              //when the right addressbook does not exist: make an empty one
              //addressbook_userid.value exists but .addressbook  
              this.createEmptyServerObject(collection)
            }

          } else {
            //when the right addressbook does not exist: make an empty one
            this.createEmptyServerObject(collection)

          }
          console.log("ManageSession." + collection, ManageSession[collection])

        } else {
          //the addressbook does not exist: make an empty one
          this.createEmptyServerObject(collection)
        }
      })
  }

  async createEmptyServerObject(collection) {
    //general method of creating an array inside an object with the argument of the method
    console.log("createEmptyServerObject")
    console.log(collection)

    ManageSession[collection] = { [collection]:[] }

    const type = collection
    const name = type + "_" + ManageSession.userProfile.id
    const pub = 2
    const value = ManageSession[collection]
    console.log(" ManageSession. empty", ManageSession[collection])
    updateObject(type, name, value, pub)
  }
```