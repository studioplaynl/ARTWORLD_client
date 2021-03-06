import ManageSession from "../ManageSession"
import CoordinatesTranslator from "./CoordinatesTranslator"
import { listObjects, convertImage, getFullAccount, updateObject, getAccount } from "../../../api.js"
import itemsBar from "../../components/itemsbar.js"
import { Profile } from "../../../session"

class Player {
  constructor() {
    this.avatarSize = 64
  }

  subscribeToProfile() {
    Profile.subscribe((value) => {
      if (ManageSession.debug) console.log("Profile refreshed avatar")

      if (ManageSession.debug) console.log(value)
      this.subscribedToProfile = true
      this.loadPlayerAvatar(ManageSession.currentScene, undefined, undefined, value)
    })
  }

  loadPlayerAvatar(scene, placePlayerX, placePlayerY, userprofile) {
    if (!!!userprofile) userprofile = ManageSession.userProfile
    if (ManageSession.debug) console.log("loadPlayerAvatar", userprofile)

    //check for createPlayer flag
    if (!ManageSession.createPlayer) return
    //ManageSession.createPlayer = false
    //if (ManageSession.debug) console.log("ManageSession.createPlayer = false;")
    scene.createdPlayer = false

    // is playerAvaterKey already in loadedAvatars?
    //no -> load the avatar and add to loadedAvatars
    //yes -> dont load the avatar

    //* attatch to existing context and physics
    scene.add.existing(this)
    scene.physics.add.existing(this)

    // put the player in the last server known position
    // retreive position from ManageSession (there it is stored on boot)

    //* data model userAccount:
    // avatar_url: "avatar/stock/avatarRood.png"
    // url: "https://artworldstudioplay.s3.eu-central-1.amazonaws.com/avatar/stock/avatarRood.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAR7FDNFNP252ENA7M%2F20220220%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20220220T131419Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=f4a9c03bec8f53e0d8ea141494fe1dac7f124781b8c5d9f77794c8521454e621"
    // username: "user11"
    // metadata:
    //        azc: "Amsterdam"
    //        location: "5264dc23-a339-40db-bb84-e0849ded4e68"
    //        posX: -2483
    //        posY: 0
    //        role: "speler"
    //        user_id: ""

    scene.playerAvatarKey = userprofile.id + "_" + userprofile.update_time

    //check if account info is loaded
    if (userprofile.id == null) {
      console.log("(userprofile.id == null)")
      this.reloadDefaultAvatar
    }

    console.log("scene.playerAvatarKey avatar", scene.playerAvatarKey)
    let lastPosX
    let lastPosY
    if (typeof placePlayerY != "undefined") { // if there is an argument to place the player on a specific position in the scene
      lastPosX = placePlayerX
      console.log("placePlayerX", placePlayerX)
    } else {
      lastPosX = ManageSession.playerPosX //playerPos is in artworldCoordinates, will be converted later
      // console.log("lastPosX", lastPosX)
    }
    if (typeof placePlayerY != "undefined") {
      lastPosY = placePlayerY // if there is an argument to place the player on a specific position in the scene
      console.log("placePlayerY", placePlayerY)
    } else {
      lastPosY = ManageSession.playerPosY //playerPos is in artworldCoordinates, will be converted later
      // console.log("lastPosY", lastPosY)
    }
    //console.log("lastPosX, lastPosY, locationID", lastPosX, lastPosY, ManageSession.locationID)

    // positioning player

    // check if last position (artworldCoordinates) is outside the worldBounds for some reason
    // otherwise place it within worldBounds
    // a random number between -150 and 150
    if (lastPosX > scene.worldSize.x / 2 || lastPosX < - scene.worldSize.x / 2) lastPosX = Math.floor((Math.random() * 300) - 150)
    if (lastPosY > scene.worldSize.y / 2 || lastPosY < - scene.worldSize.y / 2) lastPosY = Math.floor((Math.random() * 300) - 150)
    console.log("lastPosX, lastPosY", lastPosX, lastPosY)
    console.log()

    //place player in Phaser2D coordinates
    scene.player.x = CoordinatesTranslator.artworldToPhaser2DX(scene.worldSize.x, lastPosX)
    scene.player.y = CoordinatesTranslator.artworldToPhaser2DY(scene.worldSize.y, lastPosY)

    //console.log("scene.player.x, scene.player.y", scene.player.x, scene.player.y)
    //set url param's to player pos and scene key, url params are in artworldCoords lastPosX lastPosY is artworldCoords
    ManageSession.setUrl(scene.location, lastPosX, lastPosY)

    //store the current position of player in ManageSession.lastMoveCommand
    //set this.scene in ManageSession.currentScene
    ManageSession.currentScene = scene
    ManageSession.lastMoveCommand.posX = scene.player.x
    ManageSession.lastMoveCommand.posY = scene.player.y
    ManageSession.lastMoveCommand.action = "stop"
    ManageSession.lastMoveCommand.location = ManageSession.location
    console.log("ManageSession.lastMoveCommand", ManageSession.lastMoveCommand)


    //if for some reason the url of the player avatar is empty, load the default avatar
    if (userprofile.url === "") {
      console.log("avatar url is empty, set to default 'avatar1' ")
      this.reloadDefaultAvatar
    }

    //if the texture doesnot exists (if it is new) load it and attach it to the player
    if (!scene.textures.exists(scene.playerAvatarKey)) {
      if (ManageSession.debug) console.log("didn't exist yet: scene.textures.exists(scene.playerAvatarKey)")
      const fileNameCheck = scene.playerAvatarKey

      //convert the avatar url to a converted png url

      scene.load.spritesheet(fileNameCheck, userprofile.url, { frameWidth: this.avatarSize * 2, frameHeight: this.avatarSize * 2 })
        .on(`filecomplete-spritesheet-${fileNameCheck}`, (fileNameCheck) => {
          if (ManageSession.debug) console.log("filecomplete-spritesheet scene.playerAvatarKey", scene.playerAvatarKey);
          if (this.subscribedToProfile != true) {
            this.subscribeToProfile()
          }
          this.attachAvatarToPlayer(scene, fileNameCheck)
        }, scene)
      scene.load.start() // start loading the image in memory

    } else {
      //else reload the old (already in memory avatar)
      if (ManageSession.debug) console.log("existed already: scene.textures.exists(scene.playerAvatarKey)")
      this.attachAvatarToPlayer(scene)
      if (ManageSession.debug) console.log("scene.location", scene.location)

    }

  }

  async attachAvatarToPlayer(scene) {
    if (ManageSession.debug) console.log(" attachAvatarToPlayer(scene)")

    const avatar = scene.textures.get(scene.playerAvatarKey)
    const avatarWidth = avatar.frames.__BASE.width
    if (ManageSession.debug) console.log("avatarWidth: ", avatarWidth)

    const avatarHeight = avatar.frames.__BASE.height
    if (ManageSession.debug) console.log("avatarHeight: ", avatarHeight)

    const avatarFrames = Math.round(avatarWidth / avatarHeight)
    //console.log("avatarFrames: " + avatarFrames)

    //make an animation if the image is wider than tall

    // if (avatarFrames < 1) {
      //. animation for the player avatar ......................
      if (ManageSession.debug) console.log("avatarFrames > 1")

      scene.playerMovingKey = "moving" + "_" + scene.playerAvatarKey
      scene.playerStopKey = "stop" + "_" + scene.playerAvatarKey

      //check if the animation already exists
      if (!scene.anims.exists(scene.playerMovingKey)) {
        scene.anims.create({
          key: scene.playerMovingKey,
          frames: scene.anims.generateFrameNumbers(scene.playerAvatarKey, {
            start: 0,
            end: avatarFrames - 1,
          }),
          frameRate: (avatarFrames + 2) * 2,
          repeat: -1,
          yoyo: true,
        })

        scene.anims.create({
          key: scene.playerStopKey,
          frames: scene.anims.generateFrameNumbers(scene.playerAvatarKey, {
            start: 0,
            end: 0,
          }),
        })
      }
//    }

    //. end animation for the player avatar ......................

    scene.player.setTexture(scene.playerAvatarKey)
    scene.playerShadow.setTexture(scene.playerAvatarKey)

    if (ManageSession.debug) console.log("scene.player.setTexture(scene.playerAvatarKey) done ")
    //scale the player to this.avatarSize
    const width = this.avatarSize
    scene.player.displayWidth = width
    scene.player.scaleY = scene.player.scaleX

    scene.playerShadow.displayWidth = width
    scene.playerShadow.scaleY = scene.playerShadow.scaleX

    //* set the collision body
    //* setCircle(radius [, offsetX] [, offsetY])
    // scene.player.body.setCircle(width, width, width / 2)
    scene.player.body.setCircle(width / 1.1, width / 5, width / 5)

    //if (ManageSession.debug)  console.log("player avatar has loaded ")
    scene.player.location = scene.location
    scene.createdPlayer = true

    //send the current player position over the network
    ManageSession.sendMoveMessage(scene, scene.player.x, scene.player.y, "stop")
  } // end attachAvatarToPlayer

  reloadDefaultAvatar(scene) {
    scene = ManageSession.currentScene
    scene.playerAvatarKey = "avatar1"
    this.attachAvatarToPlayer(scene, "avatar1")
  }

  parseNewOnlinePlayerArray(scene) {
    if (ManageSession.createOnlinePlayerArray.length > 0) {

      //get more account info for each onlineplayer
      ManageSession.createOnlinePlayerArray.forEach(onlinePlayer => {
        Promise.all([getAccount(onlinePlayer.user_id)]).then(rec => {
          const newOnlinePlayer = rec[0]
          //if (ManageSession.debug) console.log(newOnlinePlayer)
          this.createOnlinePlayer(scene, newOnlinePlayer)
          //if (ManageSession.debug) console.log("parseNewOnlinePlayerArray scene", scene)
        })

        //new onlineplayer is removed from the newOnlinePlayer array, once we call more data on it
        ManageSession.createOnlinePlayerArray = ManageSession.createOnlinePlayerArray.filter(obj => obj.user_id != onlinePlayer.user_id)
      })
    }
  }

  createOnlinePlayer(scene, onlinePlayer) {
    // check if onlinePlayer exists already 
    //if (ManageSession.debug) console.log(onlinePlayer)
    const exists = ManageSession.allConnectedUsers.some(element => element.user_id == onlinePlayer.user_id)
    // if player exists
    if (!exists) {

      //create new onlinePlayer with default avatar
      const onlinePlayerCopy = onlinePlayer
      //if (ManageSession.debug) console.log("createOnlinePlayer scene", scene)
      onlinePlayer = scene.add
        .sprite(
          CoordinatesTranslator.artworldToPhaser2DX(
            scene.worldSize.x,
            onlinePlayerCopy.metadata.posX
          ),
          CoordinatesTranslator.artworldToPhaser2DY(
            scene.worldSize.y,
            onlinePlayerCopy.metadata.posY
          ),
          scene.playerAvatarPlaceholder //! change to ManageSession.playerAvatarPlaceholder
        )
        //element = scene.add.sprite(CoordinatesTranslator.artworldToPhaser2D({scene: scene, x: element.posX}), CoordinatesTranslator.artworldToPhaser2D({scene: scene, y: element.posY}), scene.playerAvatarPlaceholder)
        .setDepth(200)
      onlinePlayer.setInteractive({ useHandCursor: true })
      // hit area of onlinePlayer
      onlinePlayer.input.hitArea.setTo(-10, -10, onlinePlayer.width + 50, onlinePlayer.height + 50)
      onlinePlayer.on('pointerup', () => {
        // pass on values to itemsbar.svelte
        ManageSession.selectedOnlinePlayer = onlinePlayer
        itemsBar.set({ playerClicked: false, onlinePlayerClicked: true })
      })

      onlinePlayer.setData("movingKey", "moving")
      onlinePlayer.setData("stopKey", "stop")

      //create default animation for moving
      scene.anims.create({
        key: onlinePlayer.getData("movingKey"),
        frames: scene.anims.generateFrameNumbers(
          scene.playerAvatarPlaceholder,
          { start: 0, end: 8 }
        ),
        frameRate: 20,
        repeat: -1,
      })

      //create default animation for stop
      scene.anims.create({
        key: onlinePlayer.getData("stopKey"),
        frames: scene.anims.generateFrameNumbers(
          scene.playerAvatarPlaceholder,
          { start: 4, end: 4 }
        ),
      })

      //add all data from elementCopy to element; like prev Position, Location, UserID
      Object.assign(onlinePlayer, onlinePlayerCopy)
      //we copy the id over as user_id to kep data consistent across our internal logic
      onlinePlayer["user_id"] = onlinePlayerCopy.id
      if (ManageSession.debug) console.log("onlinePlayer", onlinePlayer)

      //we push the new online player to the allConnectedUsers array
      ManageSession.allConnectedUsers.push(onlinePlayer)

      //we load the onlineplayer avatar, make a key for it
      const avatarKey = onlinePlayer.user_id + "_" + onlinePlayer.update_time
      //if (ManageSession.debug) console.log("avatarKey", avatarKey)

      //if the texture already exists attach it again to the player
      // const preExisting = false
      if (!scene.textures.exists(avatarKey)) {
        //if (ManageSession.debug) console.log("scene.textures.exists(avatarKey)", scene.textures.exists(avatarKey))
        //add it to loading queue
        scene.load.spritesheet(avatarKey, onlinePlayer.url, {
          frameWidth: this.avatarSize * 2,
          frameHeight: this.avatarSize * 2,
        }).on(`filecomplete-spritesheet-${avatarKey}`, (avatarKey) => { this.attachAvatarToOnlinePlayer(scene, onlinePlayer, avatarKey) }, scene)
        //when file is finished loading the attachToAvatar function is called
        scene.load.start() // start loading the image in memory
      } else {
        //if (ManageSession.debug) console.log("scene.textures.exists(avatarKey)", scene.textures.exists(avatarKey))
        //attach the avatar to the onlinePlayer when it is already in memory
        this.attachAvatarToOnlinePlayer(scene, onlinePlayer, avatarKey)
      }
      // else {
      //   preExisting = true
      //   this.attachAvatarToOnlinePlayer(scene, onlinePlayer, tempAvatarName, preExisting)
      // }
    }
  }

  attachAvatarToOnlinePlayer(scene, onlinePlayer, tempAvatarName) {
    //if (ManageSession.debug) console.log("player, tempAvatarName", onlinePlayer, tempAvatarName)

    onlinePlayer.active = true
    onlinePlayer.visible = true

    const avatar = scene.textures.get(tempAvatarName)
    const avatarWidth = avatar.frames.__BASE.width
    const avatarHeight = avatar.frames.__BASE.height

    const avatarFrames = Math.round(avatarWidth / avatarHeight)
    if (ManageSession.debug) console.log(avatarFrames)

    if (avatarFrames > 1) {
      // set names for the moving and stop animations

      onlinePlayer.setData("movingKey", "moving" + "_" + tempAvatarName)
      onlinePlayer.setData("stopKey", "stop" + "_" + tempAvatarName)
      if (ManageSession.debug) console.log('onlinePlayer.getData("movingKey")')
      if (ManageSession.debug) console.log(onlinePlayer.getData("movingKey"))

      //create animation for moving
      if (!scene.anims.exists(onlinePlayer.getData("movingKey"))) {
        scene.anims.create({
          key: onlinePlayer.getData("movingKey"),
          frames: scene.anims.generateFrameNumbers(tempAvatarName, {
            start: 0,
            end: avatarFrames - 1,
          }),
          frameRate: (avatarFrames + 2) * 2,
          repeat: -1,
          yoyo: true,
        })

        //create animation for stop
        scene.anims.create({
          key: onlinePlayer.getData("stopKey"),
          frames: scene.anims.generateFrameNumbers(tempAvatarName, {
            start: 0,
            end: 0,
          }),
        })
      }
    }//if (avatarFrames > 1) {

    onlinePlayer.setTexture(tempAvatarName)

    //scale the player to 64px
    const width = 64
    onlinePlayer.displayWidth = width
    onlinePlayer.scaleY = onlinePlayer.scaleX
  }

  async getAccountDetails(id) {
    await getFullAccount(id).then((rec) => {
      return rec
    })
  }
}

export default new Player()
