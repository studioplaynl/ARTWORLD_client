import ManageSession from "../ManageSession"
import CoordinatesTranslator from "./CoordinatesTranslator"
import { listObjects, listImages, convertImage, getFullAccount, updateObject, getAccount } from "../../../api.js"
import HistoryTracker from "./HistoryTracker"
import ArtworkList from "./ArtworkList"
import R_UI from "./R_UI"

class Player {
  constructor() { }

  loadPlayerAvatar(scene) {
    //check if account info is loaded
    if (ManageSession.userProfile.id != null) {
      //check for createPlayer flag
      if (ManageSession.createPlayer) {
        ManageSession.createPlayer = false
        //console.log("ManageSession.createPlayer = false;")

        //set the location of the player to this location

        scene.createdPlayer = false

        //console.log("loadAndCreatePlayerAvatar")
        //put the player in the server last known position

        scene.player.x = CoordinatesTranslator.artworldToPhaser2DX(scene.worldSize.x, ManageSession.userProfile.meta.posX)
        scene.player.y = CoordinatesTranslator.artworldToPhaser2DY(scene.worldSize.y, ManageSession.userProfile.meta.posY)

        // is playerAvaterKey already in loadedAvatars?
        //no -> load the avatar and add to loadedAvatars
        //yes -> dont load the avatar

        scene.playerAvatarKey =
          ManageSession.userProfile.id +
          "_" +
          ManageSession.userProfile.create_time
        //console.log(scene.playerAvatarKey);

        // console.log("this.textures.exists(this.playerAvatarKey): ")
        // console.log(this.textures.exists(this.playerAvatarKey))

        // console.log(this.cache.game.textures.list[this.playerAvatarKey])

        console.log(scene.textures.exists(scene.playerAvatarKey))

        //* attatch to existing context and physics
        scene.add.existing(this)
        scene.physics.add.existing(this)

        //if the texture doesnot exists load it and attach it to the player
        if (!scene.textures.exists(scene.playerAvatarKey)) {
          //check if url is not empty for some reason, returns so that previous image is kept
          if (ManageSession.userProfile.url === "") {
            console.log("avatar url is empty")
            ManageSession.createPlayer = false
            console.log("ManageSession.createPlayer = ", ManageSession.createPlayer)
            scene.createdPlayer = true
            console.log("scene.createdPlayer = ", scene.createdPlayer)
            return
          } else {
            // console.log(" loading: ManageSession.userProfile.url: ")
            // console.log(ManageSession.userProfile.url)
            console.log("ManageSession.userProfile.url: ", ManageSession.userProfile.url)
            const fileNameCheck = scene.playerAvatarKey
            scene.load.spritesheet(scene.playerAvatarKey, ManageSession.userProfile.url, { frameWidth: 128, frameHeight: 128 })
              .on(`filecomplete-spritesheet-${fileNameCheck}`, (fileNameCheck) => { console.log(`file ${fileNameCheck} finished loading`); this.attachAvatarToPlayer(scene, fileNameCheck) }, scene)
            scene.load.start() // start loading the image in memory
          }
        } else {
          this.attachAvatarToPlayer(scene)
        }
      } //if(ManageSession.playerCreated)
    }
  }

  attachAvatarToPlayer(scene) {
    console.log("scene.playerAvatarKey ", scene.playerAvatarKey)

    // console.log(avatar)
    const avatar = scene.textures.get(scene.playerAvatarKey)
    const avatarWidth = avatar.frames.__BASE.width
    //console.log("avatarWidth: " avatarWidth)

    const avatarHeight = avatar.frames.__BASE.height
    //console.log("avatarHeight: " + avatarHeight)

    const avatarFrames = Math.round(avatarWidth / avatarHeight)
    //console.log("avatarFrames: " + avatarFrames)

    //make an animation if the image is wider than tall

    if (avatarFrames > 1) {
      //. animation for the player avatar ......................

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
    }
    //. end animation for the player avatar ......................

    // texture loaded so use instead of the placeholder
    //console.log("scene.playerAvatarKey");
    //console.log(scene.playerAvatarKey);

    // scene.player.texture = scene.playerAvatarKey
    scene.player.setTexture(scene.playerAvatarKey)
    scene.playerShadow.setTexture(scene.playerAvatarKey)

    //scale the player to 64px
    const width = 64
    scene.player.displayWidth = width
    scene.player.scaleY = scene.player.scaleX

    scene.playerShadow.displayWidth = width
    scene.playerShadow.scaleY = scene.playerShadow.scaleX

    // console.log("scene.playerShadow");
    // console.log(scene.playerShadow);

    //* set the collision body
    //* setCircle(radius [, offsetX] [, offsetY])
    // scene.player.body.setCircle(width, width, width / 2)
    scene.player.body.setCircle(width / 1.1, width / 5, width / 5)

    // place the player in the last known position
    // this.player.x = this.player.posX
    // this.player.y = this.player.posY

    //*place the player in the last known position
    // console.log("scene.player.x", scene.player.x)
    // console.log("ManageSession.userProfile", ManageSession.userProfile)
    // console.log("ManageSession.userProfile.meta.posX", ManageSession.userProfile.meta.posX)
    // console.log("scene.player", scene.player)

    // scene.player.x = CoordinatesTranslator.artworldToPhaser2DX(scene.worldSize.x, ManageSession.userProfile.meta.posX)
    // scene.player.y = CoordinatesTranslator.artworldToPhaser2DY(scene.worldSize.y, ManageSession.userProfile.meta.posY)

    // console.log("player avatar has loaded ")
    scene.player.location = scene.location
    scene.createdPlayer = true

    //send the current player position over the network
    ManageSession.sendMoveMessage(scene, scene.player.x, scene.player.y)
  } //attachAvatarToPlayer

  createPlayerItemsBar(scene) {

    // making the avatar interactive
    scene.player.setInteractive({ useHandCursor: true })

    // creating a hit area for a better user experience
    scene.player.input.hitArea.setTo(-10, -10, scene.player.width + 50, scene.player.height + 50)

    // for toggling the pop-up buttons
    scene.isPlayerItemsBarDisplayed = false

    // creating a container that holds all pop-up buttons, the coords are the same as the avatar's
    scene.playerItemsBar = scene.add.container(scene.player.x, scene.player.y)

    scene.player.on("pointerup", async () => {
      // checking if the buttons are hidden, show - if hidden, hide - if displayed
      if (scene.isPlayerItemsBarDisplayed == false) {
        scene.playerItemsBar.setVisible(true);

        scene.playerHomeButtonCircle = scene.add
          .circle(0, -70, 25, 0xffffff)
          .setOrigin(0.5, 0.5)
          .setInteractive({ useHandCursor: true })
          .setStrokeStyle(3, 0x0000);
        scene.playerHomeButton = scene.add.image(0, -70, "home");

        scene.playerLikedButtonCircle = scene.add
          .circle(65, 0, 25, 0xffffff)
          .setOrigin(0.5, 0.5)
          .setInteractive({ useHandCursor: true })
          .setStrokeStyle(3, 0x0000);
        scene.playerLikedButton = scene.add.image(65, 0, "heart");

        scene.playerLikedButtonCircle.on("pointerdown", async () => {
          // display spinner while images are being downloaded
          scene.playerLikedPanelSpinner = scene.rexSpinner.add.pie({
            x: scene.player.x + 150,
            y: scene.player.y,
            width: 100,
            height: 100,
            duration: 850,
            color: 0x000000
          }).start()

          //the liked array is in the latest state, but we have to get the binairy data (the images)
          scene.playerLikedPanelKeys = await ArtworkList.convertRexUIArray(scene)
        })

        scene.playerAddressbookButtonCircle = scene.add
          .circle(0, 70, 25, 0xffffff)
          .setOrigin(0.5, 0.5)
          .setInteractive({ useHandCursor: true })
          .setStrokeStyle(3, 0x0000)
        scene.playerAddressbookButton = scene.add.image(0, 70, "addressbook")

        scene.playerAddressbookButtonCircle.on("pointerup", () => {
          this.createAddressbook(scene)
        })

        // adding all buttons to the container
        scene.playerItemsBar.add([
          scene.playerHomeButtonCircle,
          scene.playerHomeButton,
          scene.playerLikedButtonCircle,
          scene.playerLikedButton,
          scene.playerAddressbookButtonCircle,
          scene.playerAddressbookButton
        ])

        scene.isPlayerItemsBarDisplayed = true;

        // entering the home of the avatar
        scene.playerHomeButtonCircle.on("pointerup", () => {
          HistoryTracker.switchScene(scene, "DefaultUserHome", ManageSession.userProfile.id)
        });
      } else {
        scene.playerItemsBar.setVisible(false)
        if (scene.playerLikedPanel) {
          scene.playerLikedPanel.setVisible(false)
        }
        scene.isPlayerItemsBarDisplayed = false
        if (scene.playerAddressbookContainer) {
          this.destroyAddressbook(scene)
        }
      }
    })
  }

  createAddressbook(scene) {
    // if the addressbook exists from the previous opening, destroy it, in order not to have multiple addressbook holder
    if (scene.playerAddressbookMask) {
      this.destroyAddressbook(scene)
    }

    const playerAddressbookWidth = 120
    const playerAddressbookHeight = 200

    const playerAddressbookPositionX = scene.player.x - playerAddressbookWidth / 2
    const playerAddressbookPositionY = scene.player.y + 110

    scene.playerAddressbookMask = scene.add.graphics()
      .fillStyle(0xffffff, 1)
      .fillRoundedRect(playerAddressbookPositionX, playerAddressbookPositionY, playerAddressbookWidth, playerAddressbookHeight, 8)
      .lineStyle(3, 0x000000, 1)
      .strokeRoundedRect(playerAddressbookPositionX, playerAddressbookPositionY, playerAddressbookWidth, playerAddressbookHeight, 8)

    scene.playerAddressbookContainer = scene.add.container(playerAddressbookPositionX + 10, playerAddressbookPositionY + 10)

    const smileyFaces = ["friend", "friend2", "friend3"]

    const height = 50

    ManageSession.addressbook.addressbook.forEach((element, index) => {
      console.log("element, index", element, index)

      const y = index * height

      const randomNumber = Math.floor(Math.random() * smileyFaces.length)

      const playerAddressbookImage = scene.add.image(0, y, smileyFaces[randomNumber])
        .setOrigin(0)
        .setInteractive({ useHandCursor: true })
        .on("pointerup", () => {
          HistoryTracker.switchScene(scene, "DefaultUserHome", element.user_id)
        })

      const playerAddressbookDeleteButtonCircle = scene.add
        .circle(70, y, 15, 0xffffff)
        .setOrigin(0)
        .setInteractive({ useHandCursor: true })
        .setStrokeStyle(2, 0x0000)
        .on("pointerup", () => {

          // deleting the selected address and updating the local addressbook
          const filteredArray = ManageSession.addressbook.addressbook.filter(el => el.user_id != element.user_id)
          ManageSession.addressbook = { addressbook: filteredArray }

          // update server
          const type = "addressbook"
          const name = type + "_" + ManageSession.userProfile.id
          const pub = 2
          const value = ManageSession.addressbook

          updateObject(type, name, value, pub)

          // recreate the addressbook
          this.createAddressbook(scene)
        })

      scene.playerAddressbookContainer.add([playerAddressbookImage, playerAddressbookDeleteButtonCircle])
    })

    scene.playerAddressbookContainer.setMask(scene.playerAddressbookMask.createGeometryMask())

    scene.playerAddressbookZone = scene.add.zone(playerAddressbookPositionX, playerAddressbookPositionY, playerAddressbookWidth, playerAddressbookHeight)
      .setOrigin(0)
      .setInteractive()
      .on("pointermove", (pointer) => {
        if (pointer.isDown) {
          // make it scrollable only when there more than 4 items in the addressbook
          if (ManageSession.addressbook.addressbook.length > 4) {
            scene.playerAddressbookContainer.y += (pointer.velocity.y / 10);
            scene.playerAddressbookContainer.y = Phaser.Math.Clamp(scene.playerAddressbookContainer.y, playerAddressbookPositionY - (ManageSession.addressbook.addressbook.length * height) + playerAddressbookHeight, playerAddressbookPositionY); // value, bottom border, top border
          }
        }
      })
    scene.input.topOnly = false // in order to get the right clicking surface 
  }

  hideAddressbook(scene) {
    // addressbook is hidden whenever there is a movement detected
    if (scene.isPlayerMoving && scene.playerAddressbookContainer) {
      this.destroyAddressbook(scene)
    }
  }

  destroyAddressbook(scene) {
    scene.playerAddressbookMask.destroy()
    scene.playerAddressbookContainer.destroy()
    scene.playerAddressbookZone.destroy()
  }

  createOnlinePlayerItemsBar(scene) {
    // for toggling the pop-up buttons
    scene.isOnlinePlayerItemsBarDisplayed = false

    // creating a container that holds all pop-up buttons, the coords are the same as the avatar's
    scene.onlinePlayerItemsBar = scene.add.container(0, 0)
  }

  async displayOnlinePlayerItemsBar(scene, player) {
    // storing online player in ManageSession in order to have an access to the current selected online player's properties
    ManageSession.selectedOnlinePlayer = player

    // giving the position for the container that holds all the pop-up buttons
    scene.onlinePlayerItemsBar.x = ManageSession.selectedOnlinePlayer.x
    scene.onlinePlayerItemsBar.y = ManageSession.selectedOnlinePlayer.y

    // for toggling the pop-up buttons
    scene.isOnlinePlayerItemsBarDisplayed == false ? true : false
    if (scene.isOnlinePlayerItemsBarDisplayed == false) {

      // creating a home button for online player
      scene.onlinePlayerHomeButtonCircle = scene.add
        .circle(0, -70, 25, 0xffffff)
        .setOrigin(0.5, 0.5)
        .setInteractive({ useHandCursor: true })
        .setStrokeStyle(3, 0x0000);
      scene.onlinePlayerHomeButton = scene.add.image(0, -70, "home")

      scene.onlinePlayerHomeButtonCircle.on("pointerdown", () => {
        // creating an enter home button for online player
        scene.onlinePlayerHomeEnterButtonCircle = scene.add
          .circle(-30, -120, 25, 0xffffff)
          .setOrigin(0.5, 0.5)
          .setInteractive({ useHandCursor: true })
          .setStrokeStyle(2, 0x0000)
          .on("pointerdown", () => {
            // entering the home of the online player
            HistoryTracker.switchScene(scene, "DefaultUserHome", ManageSession.selectedOnlinePlayer.id)
          })
        scene.onlinePlayerHomeEnterButton = scene.add.image(-30, -120, "enter_home")

        // creating a save home button for online player
        scene.onlinePlayerHomeSaveCircle = scene.add
          .circle(30, -120, 25, 0xffffff)
          .setOrigin(0.5, 0.5)
          .setInteractive({ useHandCursor: true })
          .setStrokeStyle(2, 0x0000)
          .on("pointerup", () => {
            // saving the home of a player
            const entry = { user_id: ManageSession.selectedOnlinePlayer.id }

            // checking if the player in the addressbook 
            const isExist = ManageSession.addressbook.addressbook.some(element => element.user_id == entry.user_id)

            if (!isExist) { // if doesn't exist, add to the addressbook
              ManageSession.addressbook.addressbook.push(entry)
              const type = "addressbook"
              const name = type + "_" + ManageSession.userProfile.id
              const pub = 2
              const value = ManageSession.addressbook
              console.log("value ManageSession.addressbook", value)
              updateObject(type, name, value, pub)

              // we want to inform the player that the item has been added to the addressbook
              this.createAddressbook(scene)

              // hiding the addressbook after 2 seconds
              scene.time.addEvent({
                delay: 2000, callback: () => {
                  this.destroyAddressbook(scene)
                }, callbackScope: scene, loop: false
              })
            } else {
              console.log("this user id is already in addressbook list")
            }
          })

        scene.onlinePlayerHomeSaveButton = scene.add.image(30, -120, "save_home")

        // adding home button's children: enter and save buttons to onlinePlayerItemsBar
        scene.onlinePlayerItemsBar.add([scene.onlinePlayerHomeEnterButtonCircle, scene.onlinePlayerHomeEnterButton, scene.onlinePlayerHomeSaveCircle, scene.onlinePlayerHomeSaveButton])
      })

      // adding home button to onlinePlayerItemsBar
      scene.onlinePlayerItemsBar.add([scene.onlinePlayerHomeButtonCircle, scene.onlinePlayerHomeButton])

      // making a server call to get liked images while creating a liked button
      Promise.all([listObjects("liked", player.id, 10)]).then((response) => {
        if (response[0].length > 0) { // checking if a liked object was created before

          ManageSession.likedOnlinePlayer = response[0][0].value

          scene.onlinePlayerItemsBar.setVisible(true) //? not sure about this line

          // creating a liked button for online player
          scene.onlinePlayerLikedButtonCircle = scene.add
            .circle(65, 0, 25, 0xffffff)
            .setOrigin(0.5, 0.5)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(3, 0x0000);
          scene.onlinePlayerLikedButton = scene.add.image(65, 0, "heart");

          scene.onlinePlayerLikedButtonCircle.on("pointerdown", async () => {
            // display spinner while images are being downloaded
            scene.onlinePlayerLikedPanelSpinner = scene.rexSpinner.add.pie({
              x: ManageSession.selectedOnlinePlayer.x + 150,
              y: ManageSession.selectedOnlinePlayer.y,
              width: 100,
              height: 100,
              duration: 850,
              color: 0x000000
            }).start()

            // downloading the images and displaying them
            scene.onlinePlayerLikedPanelKeys = await ArtworkList.convertRexUIArrayOnlinePlayer(scene) //!convert method to onlinePlayer
          })

          // adding the liked button to onlinePlayerItemsBar
          scene.onlinePlayerItemsBar.add([scene.onlinePlayerLikedButtonCircle, scene.onlinePlayerLikedButton])

          // for toggling onlinePlayerItemsBar
          scene.isOnlinePlayerItemsBarDisplayed = true
        } else { // if a liked object wasn't created before, then it should be created
          ManageSession.likedOnlinePlayer = {}
          const type = "liked"
          const name = type + "_" + player.user_id
          const pub = 2
          const value = ManageSession.likedOnlinePlayer
          updateObject(type, name, value, pub)
        }
      })
    } else {
      this.hideOnlinePlayerItemsBar(scene)
    }
  }

  hideOnlinePlayerItemsBar(scene) {
    scene.isOnlinePlayerItemsBarDisplayed = false
    scene.onlinePlayerItemsBar.setVisible(false)
    scene.onlinePlayerLikedPanel.setVisible(false)
  }

  parseNewOnlinePlayerArray(scene) {
    if (ManageSession.createOnlinePlayerArray.length > 0) {

      ManageSession.createOnlinePlayerArray.forEach(onlinePlayer => {
        Promise.all([getAccount(onlinePlayer.user_id)]).then(rec => {
          const newOnlinePlayer = rec[0]
          this.createOnlinePlayer(scene, newOnlinePlayer)
        })

        //new onlineplayer is removed from the newOnlinePlayer array, once we call more data on it
        ManageSession.createOnlinePlayerArray = ManageSession.createOnlinePlayerArray.filter(obj => obj.user_id != onlinePlayer.user_id)
      })
    }
  }

  createOnlinePlayer(scene, onlinePlayer) {
    //create new onlinePlayer with default avatar
    const onlinePlayerCopy = onlinePlayer

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
        scene.playerAvatarPlaceholder
      )
      //element = scene.add.sprite(CoordinatesTranslator.artworldToPhaser2D({scene: scene, x: element.posX}), CoordinatesTranslator.artworldToPhaser2D({scene: scene, y: element.posY}), scene.playerAvatarPlaceholder)
      .setDepth(90)
    onlinePlayer.setInteractive({ useHandCursor: true })
    // hit area 
    onlinePlayer.input.hitArea.setTo(-10, -10, onlinePlayer.width + 50, onlinePlayer.height + 50)
    onlinePlayer.on('pointerup', () => {
      this.displayOnlinePlayerItemsBar(scene, onlinePlayer)
      //put a timer of 20 sec to automatically close the onlinePlayerItemsBar
      scene.time.addEvent({
        delay: 20000, callback: () => {
          this.hideOnlinePlayerItemsBar(scene)
        }, callbackScope: scene, loop: false
      })

      console.log("online player width", onlinePlayer)
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
    console.log("onlinePlayer", onlinePlayer)

    //we push the new online player to the allConnectedUsers array
    ManageSession.allConnectedUsers.push(onlinePlayer)

    //we load the onlineplayer avatar, make a key for it
    const avatarKey = onlinePlayer.id + "_" + onlinePlayer.update_time
    console.log("avatarKey", avatarKey)

    //if the texture already exists attach it again to the player
    // const preExisting = false
    if (!scene.textures.exists(avatarKey)) {
      console.log("scene.textures.exists(avatarKey)", scene.textures.exists(avatarKey))
      //add it to loading queue
      scene.load.spritesheet(avatarKey, onlinePlayer.url, {
        frameWidth: 128,
        frameHeight: 128,
      }).on(`filecomplete-spritesheet-${avatarKey}`, (avatarKey) => { console.log(`onlinePlayer file ${avatarKey} finished loading`); this.attachAvatarToOnlinePlayer(scene, onlinePlayer, avatarKey) }, scene)
      //when file is finished loading the attachToAvatar function is called
      scene.load.start() // start loading the image in memory
    } else {
      console.log("scene.textures.exists(avatarKey)", scene.textures.exists(avatarKey))
      //attach the avatar to the onlinePlayer when it is already in memory
      this.attachAvatarToOnlinePlayer(scene, onlinePlayer, avatarKey)
    }
    // else {
    //   preExisting = true
    //   this.attachAvatarToOnlinePlayer(scene, onlinePlayer, tempAvatarName, preExisting)
    // }
  }

  attachAvatarToOnlinePlayer(scene, onlinePlayer, tempAvatarName) {
    console.log("player, tempAvatarName", onlinePlayer, tempAvatarName)

    onlinePlayer.active = true
    onlinePlayer.visible = true

    const avatar = scene.textures.get(tempAvatarName)
    const avatarWidth = avatar.frames.__BASE.width
    const avatarHeight = avatar.frames.__BASE.height

    const avatarFrames = Math.round(avatarWidth / avatarHeight)
    console.log(avatarFrames)

    if (avatarFrames > 1) {
      // set names for the moving and stop animations

      onlinePlayer.setData("movingKey", "moving" + "_" + tempAvatarName)
      onlinePlayer.setData("stopKey", "stop" + "_" + tempAvatarName)
      console.log('onlinePlayer.getData("movingKey")')
      console.log(onlinePlayer.getData("movingKey"))

      console.log('onlinePlayer.getData("movingKey")')
      console.log(onlinePlayer.getData("movingKey"))

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

  deleteOnlinePlayer(scene, onlinePlayer) {
    ManageSession.allConnectedUsers = ManageSession.allConnectedUsers.filter(obj => obj.user_id != onlinePlayer.user_id)
  }

  async getAccountDetails(id) {
    await getFullAccount(id).then((rec) => {
      return rec
    })
  }
}

export default new Player()
