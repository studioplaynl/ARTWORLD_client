### Graphical flow of the network:

### [Figma: network flow client](https://www.figma.com/file/v1VYHMOh1OW8Gy0bhY1g7K/artworld-network-architecture?node-id=0%3A1)

## 1. App.Svelte Is the Session empty?

session (https) -> token, expiration

## 2. yes, the Session is empty:

Login.svelte
session.js

```
let storedSession = localStorage.getItem("Session")

export const Session = writable(storedSession ? JSON.parse(storedSession) : null);

Session.subscribe((value) => {
    if (value) {
        manageSession.sessionStored = value; //! push the Session with url to manageSession
        localStorage.setItem('Session', JSON.stringify(value))
     }
    else localStorage.removeItem('Session'); // for logout
  })


let profileStore = localStorage.getItem("profile")
export const Profile = writable(profileStore ? JSON.parse(profileStore) : null);
Profile.subscribe((value) => {
        localStorage.setItem('profile', JSON.stringify(value));
        manageSession.userProfile = value //! push the profile with url to manageSession
        // console.log("Profile.subscribe((value)")
        // console.log(value)
    }
    else localStorage.removeItem('profile'); // for logout
```

```
client.authenticateEmail(email, password, create)
    .then((response)=> {  Session.set(session)
getAccount()}
```

### Session object:

```
Session$1
{
created_at: “1636024979”,

expires_at: “1636032179”,

token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI1MjY0ZGMyMy1hMzM5LTQwZGItYmI4NC1lMDg0OWRlZDRlNjgiLCJ1c24iOiJ1c2VyMTEiLCJleHAiOjE2MzYwMzIxNzl9.HVT1r90Ud5cHd-I5PcqxIuygHmTlDRWBhN-7FeHhQSA"

user_id: "5264dc23-a339-40db-bb84-e0849ded4e68",

username: "user11",

vars: undefined
}
```

### Profile Object **without URL**

```
$Profile
{
avatar_url: "avatar/5264dc23-a339-40db-bb84-e0849ded4e68/current.png"
create_time: "2021-10-16T17:28:59Z"
edge_count: 4
id: "5264dc23-a339-40db-bb84-e0849ded4e68"
lang_tag: "en"
meta: {azc: 'Amsterdam', posX: 528, posY: 800, role: 'speler', user_id: '', …}
metadata: "{\"azc\": \"Amsterdam\", \"posX\": 528, \"posY\": 800, \"role\": \"speler\", \"user_id\": \"\", \"location\": \"location1\"}"
update_time: "2021-11-03T16:00:14Z"
username: "user11"
}
```

### Profile Object **WITH URL**

```
$Profile
{
avatar_url: "avatar/5264dc23-a339-40db-bb84-e0849ded4e68/current.png"
create_time: "2021-10-16T17:28:59Z"
edge_count: 4
id: "5264dc23-a339-40db-bb84-e0849ded4e68"
lang_tag: "en"
meta: {azc: 'Amsterdam', posX: 528, posY: 800, role: 'speler', user_id: '', …}
metadata: "{\"azc\": \"Amsterdam\", \"posX\": 528, \"posY\": 800, \"role\": \"speler\", \"user_id\": \"\", \"location\": \"location1\"}"
update_time: "2021-11-03T16:00:14Z"
url: "https://artworldstudioplay.s3.eu-central-1.amazonaws.com/avatar/5264dc23-a339-40db-bb84-e0849ded4e68/current.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAR7FDNFNP252ENA7M%2F20211104%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20211104T120408Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=f85d6c618c85f2561803d2fcb86a5a2288d6b8bf7325d0c7effe8268df36d26c"
username: "user11"
}
```

## 3. No the Session is not empty -> MainMenu.js

```
   //* check if the user profile is loaded, to be able to send the player to the right location
    if (typeof (manageSession.userProfile.meta.location) != "undefined") {
      this.launchLocation = manageSession.userProfile.meta.location + "_Scene"
      console.log(this.launchLocation)

      this.checkSceneExistence()
    } else {
      getAccount("", true)
        .then(rec => {
          manageSession.freshSession = rec
          //! only set the menu button visible if the user data is downloaded!
          this.launchLocation = manageSession.freshSession.meta.location
+ "_Scene"
          this.checkSceneExistence()
        })
    }
  } //create

  checkSceneExistence() {
    //check if this.launchLocation exists in SCENES
    const locationExists = SCENES.includes(this.launchLocation)
    //if location does not exists; launch default location
    if (!locationExists) {
      //set to fail-back scene
      manageSession.location = "location1"
      manageSession.launchLocation = manageSession.location + "_Scene"
    } else {
      manageSession.location = manageSession.userProfile.meta.location
    }
    this.playBtn.setVisible(true)
  }
```

## 4A. networkBoot_Scene.js

```
manageSession.createPlayer = true

 await manageSession.createSocket()
      .then(rec => {
        console.log(manageSession.launchLocation)
        this.scene.launch(manageSession.launchLocation)
})
```

## 4B. manageSession.js

```
createSocket

socket.connect

getStreamUsers (“join”, this.location)

socket.onstreampresence
```

## 5. locationX_Scene.js

```
manageSession.createPlayer = true

loadAndCreatePlayerAvatar()
attachtAvatarToPlayer()

createOnlinePlayers()
attachtAvatarToOnlinePlayer(player, preExisting)
```

## 6. CHANGE LOCATIONS

**LocationA:**

```
manageSession.socket.rpc("leave", locationA)


 setTimeout(() => {
      manageSession.location = location
      manageSession.createPlayer = true
      manageSession.getStreamUsers("join", locationB)
      this.scene.start(locationScene)
    }, 1000)
```

**LocationB:**

```
manageSession.createPlayer = true

loadAndCreatePlayerAvatar()
attachtAvatarToPlayer()

createOnlinePlayers()
attachtAvatarToOnlinePlayer(player, preExisting)
```
