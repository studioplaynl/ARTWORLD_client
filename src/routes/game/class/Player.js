import ManageSession from "../ManageSession"
import CoordinatesTranslator from "./CoordinatesTranslator"
import { listObjects, listImages, convertImage, getFullAccount, updateObject, getAccount } from "../../../api.js"
import HistoryTracker from "./HistoryTracker"
import ArtworkList from "./ArtworkList"
import {playerClicked, onlinePlayerClicked } from "../../components/itemsbar.svelte"

class Player {
  constructor() { }

  loadPlayerAvatar(scene) {
    //check if account info is loaded
    if (ManageSession.userProfile.id != null) {
      //check for createPlayer flag
      if (ManageSession.createPlayer) {
        ManageSession.createPlayer = false
        //console.log("ManageSession.createPlayer = false;")
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

          scene.playerAvatarKey = ManageSession.userProfile.id + "_" + ManageSession.userProfile.create_time

          let lastPosX = ManageSession.playerPosX
          let lastPosY = ManageSession.playerPosY
          //console.log("lastPosX, lastPosY, locationID", lastPosX, lastPosY, ManageSession.locationID)

          // positioning player
 
            // check if last position (artworldCoordinates) is outside the worldBounds for some reason
            // otherwise place it within worldBounds
            // a random number between -150 and 150
            if (lastPosX > scene.worldSize.x / 2 || lastPosX < - scene.worldSize.x / 2) lastPosX = Math.floor((Math.random() * 300) - 150)
            if (lastPosY > scene.worldSize.y / 2 || lastPosY < - scene.worldSize.y / 2) lastPosY = Math.floor((Math.random() * 300) - 150)
            console.log("lastPosX, lastPosY", lastPosX, lastPosY)

            scene.player.x = CoordinatesTranslator.artworldToPhaser2DX(scene.worldSize.x, lastPosX)
            scene.player.y = CoordinatesTranslator.artworldToPhaser2DY(scene.worldSize.y, lastPosY)
         
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
              // load the avatar
              //console.log("ManageSession.userProfile.url: ", ManageSession.userProfile.url)

              // //get the avatar_url
              // Promise.all([convertImage(ManageSession.userProfile.avatar_url, "64", "png")]).then(rec => {
              //   console.log(rec[0])
              //   const convertedAvatarUrl = rec[0]
              // })

              const fileNameCheck = scene.playerAvatarKey
              scene.load.spritesheet(fileNameCheck, ManageSession.userProfile.url, { frameWidth: 64, frameHeight: 64 })
                .on(`filecomplete-spritesheet-${fileNameCheck}`, (fileNameCheck) => { console.log("scene.playerAvatarKey", scene.playerAvatarKey); this.attachAvatarToPlayer(scene, fileNameCheck) }, scene)
              scene.load.start() // start loading the image in memory
             
            }
          } else {
            this.attachAvatarToPlayer(scene)
            console.log("scene.location", scene.location)
          }
        
      } //if(ManageSession.playerCreated)
    }
  }

  async attachAvatarToPlayer(scene) {
    //console.log("scene.playerAvatarKey ", scene.playerAvatarKey)
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

    scene.player.setTexture(scene.playerAvatarKey)
    scene.playerShadow.setTexture(scene.playerAvatarKey)

    //scale the player to 64px
    const width = 64
    scene.player.displayWidth = width
    scene.player.scaleY = scene.player.scaleX

    scene.playerShadow.displayWidth = width
    scene.playerShadow.scaleY = scene.playerShadow.scaleX

    //* set the collision body
    //* setCircle(radius [, offsetX] [, offsetY])
    // scene.player.body.setCircle(width, width, width / 2)
    scene.player.body.setCircle(width / 1.1, width / 5, width / 5)

    // console.log("player avatar has loaded ")
    scene.player.location = scene.location
    scene.createdPlayer = true

    //send the current player position over the network
    ManageSession.sendMoveMessage(scene, scene.player.x, scene.player.y, "stop")
  } // end attachAvatarToPlayer

  createPlayerItemsBar(scene) {

    // making the avatar interactive
    scene.player.setInteractive({ useHandCursor: true })

    //also detect movementTouch when clicking on player: to detect swipt starting from player
    scene.player.on('pointerdown', () => ManageSession.playerMove = true)

    // creating a hit area for a better user experience
    scene.player.input.hitArea.setTo(-10, -10, scene.player.width + 50, scene.player.height + 50)

    // for toggling the pop-up buttons
    scene.isPlayerItemsBarDisplayed = false

    // creating a container that holds all pop-up buttons, the coords are the same as the avatar's
    scene.playerItemsBar = scene.add.container(scene.player.x, scene.player.y).setDepth(220)

    scene.player.on("pointerup", async () => {
      // checking if the buttons are hidden, show - if hidden, hide - if displayed
      if (scene.isPlayerItemsBarDisplayed == false) {
        //pass on data to itemsbar.svelte
        playerClicked = true
        scene.playerItemsBar.setVisible(true)

        // creating a home button
        scene.playerHomeButton = scene.add.image(0, -70, "home").setInteractive({ useHandCursor: true })
        // entering the home of the avatar
        scene.playerHomeButton.on("pointerup", () => {
          HistoryTracker.switchScene(scene, "DefaultUserHome", ManageSession.userProfile.id)
        })

        // creating a liked button
        scene.playerLikedButton = scene.add.image(65, 0, "heart").setInteractive({ useHandCursor: true })

        scene.playerLikedButton.on("pointerdown", async () => {
          // this flag is used for the cases when an artwork is liked/unliked and the panel gets updated immediately
          scene.playerLikedButtonClickedFlag = true
          // display spinner while images are being downloaded
          scene.playerLikedPanelSpinner = scene.rexSpinner.add.pie({
            x: scene.player.x + 150,
            y: scene.player.y,
            width: 100,
            height: 100,
            duration: 850,
            color: 0x000000
          }).setDepth(199).start()

          // check if there are any liked artworks
          if (ManageSession.liked.liked.length > 0) {
            // downloading the images and displaying them in liked panel
            await ArtworkList.convertRexUIArray(scene)
          } else {
            scene.playerLikedPanelKeys = { artworks: [{ "name": "artFrame_128" }] } // placeholder when there is none liked artwork
            // creating a liked panel with the placeholder
            ArtworkList.createLikedPanel(scene, scene.playerLikedPanelSpinner, "playerLikedPanel", scene.player, scene.playerLikedPanelKeys)
          }
        })

        // creating an addressbook button
        scene.playerAddressbookButton = scene.add.image(0, 70, "addressbook").setInteractive({ useHandCursor: true })

        scene.playerAddressbookButton.on("pointerup", () => {
          this.createAddressbook(scene)
        })

        // adding all buttons to the container
        scene.playerItemsBar.add([
          scene.playerHomeButton,
          scene.playerLikedButton,
          scene.playerAddressbookButton
        ])

        scene.isPlayerItemsBarDisplayed = true;

      } else {
        scene.playerItemsBar.setVisible(false)
        if (scene.playerLikedPanel) scene.playerLikedPanel.destroy()
        scene.isPlayerItemsBarDisplayed = false
        if (scene.playerAddressbookContainer) this.destroyAddressbook(scene)
        if (scene.playerLikedButtonClickedFlag) scene.playerLikedButtonClickedFlag = false
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

    // adding a graphics - "the screen"
    scene.playerAddressbookMask = scene.add.graphics()
      .fillStyle(0xffffff, 1)
      .fillRoundedRect(playerAddressbookPositionX, playerAddressbookPositionY, playerAddressbookWidth, playerAddressbookHeight, 8)
      // .lineStyle(1, 0xffffff, 1)
      // .strokeRoundedRect(playerAddressbookPositionX, playerAddressbookPositionY, playerAddressbookWidth, playerAddressbookHeight, 8)
      .setDepth(220)

    // creating a container that holds all items (addresses)
    scene.playerAddressbookContainer = scene.add.container(playerAddressbookPositionX + 10, playerAddressbookPositionY + 10).setDepth(220)

    const smileyFaces = ["friend", "friend2", "friend3"]

    const height = 50 // distance between rows

    ManageSession.addressbook.addressbook.forEach((element, index) => {

      const y = index * height // position of image and delete button

      const randomIndex = Math.floor(Math.random() * smileyFaces.length) // to get a random image as a friend's image

      // creating an image of a friend in addressbook
      const playerAddressbookImage = scene.add.image(0, y, smileyFaces[randomIndex])
        .setOrigin(0)
        .setInteractive({ useHandCursor: true })
        .on("pointerup", () => {
          // entering a home of a friend
          HistoryTracker.switchScene(scene, "DefaultUserHome", element.user_id)
        })

      // creating a delete button
      const playerAddressbookDeleteButton = scene.add
        .image(55, y, "delete")
        .setOrigin(0, 0.25)
        .setInteractive({ useHandCursor: true })
        .on("pointerup", () => {

          // deleting the selected address and updating the local addressbook
          const filteredArray = ManageSession.addressbook.addressbook.filter(el => el.user_id != element.user_id)
          ManageSession.addressbook = { addressbook: filteredArray }

          // updating server
          const type = "addressbook"
          const name = type + "_" + ManageSession.userProfile.id
          const pub = 2
          const value = ManageSession.addressbook
          updateObject(type, name, value, pub)

          // recreate the addressbook after deletion
          this.createAddressbook(scene)
        })

      // adding the image and delete button to playerAddressbookContainer
      scene.playerAddressbookContainer.add([playerAddressbookImage, playerAddressbookDeleteButton])
    })

    // setting a mask
    scene.playerAddressbookContainer.setMask(scene.playerAddressbookMask.createGeometryMask())

    // creating a scrollable zone
    scene.playerAddressbookZone = scene.add.zone(playerAddressbookPositionX, playerAddressbookPositionY, playerAddressbookWidth, playerAddressbookHeight)
      .setOrigin(0)
      .setInteractive()
      .setDepth(220)
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
    scene.onlinePlayerItemsBar = scene.add.container(0, 0).setDepth(301)
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
      // scene.onlinePlayerHomeButtonCircle = scene.add
      //   .circle(0, -70, 25, 0xffffff)
      //   .setOrigin(0.5, 0.5)
      //   .setStrokeStyle(3, 0x0000);
      scene.onlinePlayerHomeButton = scene.add.image(0, -70, "home").setInteractive({ useHandCursor: true })

      scene.onlinePlayerHomeButton.on("pointerdown", () => {
        // creating an enter home button for online player
        // scene.onlinePlayerHomeEnterButton = scene.add
        //   .circle(-30, -120, 25, 0xffffff)
        //   .setOrigin(0.5, 0.5)
        //   .setStrokeStyle(2, 0x0000)

        scene.onlinePlayerHomeEnterButton = scene.add.image(-40, -130, "enter_home").setInteractive({ useHandCursor: true })
          .on("pointerdown", () => {
            // entering the home of the online player
            HistoryTracker.switchScene(scene, "DefaultUserHome", ManageSession.selectedOnlinePlayer.id)
          })


        // creating a save home button for online player
        // scene.onlinePlayerHomeSave = scene.add
        //   .circle(30, -120, 25, 0xffffff)
        //   .setOrigin(0.5, 0.5)
        //   .setStrokeStyle(2, 0x0000)

        scene.onlinePlayerHomeSaveButton = scene.add.image(40, -130, "save_home").setInteractive({ useHandCursor: true })
          .on("pointerup", () => {
            // saving the home of a player
            const entry = { user_id: ManageSession.selectedOnlinePlayer.id, user_name: ManageSession.selectedOnlinePlayer.username }


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

              // informing the player that the item has been added to the addressbook by showing it
              this.createAddressbook(scene)

              // and hiding it after 2 seconds
              scene.time.addEvent({
                delay: 2000, callback: () => {
                  this.destroyAddressbook(scene)
                }, callbackScope: scene, loop: false
              })
            } else {
              console.log("this user id is already in addressbook list")
            }
          })

        // adding home button's children: enter and save buttons to onlinePlayerItemsBar
        scene.onlinePlayerItemsBar.add([scene.onlinePlayerHomeEnterButton, scene.onlinePlayerHomeSaveButton])
      })

      // adding home button to onlinePlayerItemsBar
      scene.onlinePlayerItemsBar.add(scene.onlinePlayerHomeButton)

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
            // check if there are any liked artworks
            if (ManageSession.likedOnlinePlayer.liked.length > 0) {
              // display spinner while images are being downloaded
              scene.onlinePlayerLikedPanelSpinner = scene.rexSpinner.add.pie({
                x: ManageSession.selectedOnlinePlayer.x + 150,
                y: ManageSession.selectedOnlinePlayer.y,
                width: 100,
                height: 100,
                duration: 850,
                color: 0x000000
              }).setDepth(199).start()
              // downloading the images and displaying them
              scene.onlinePlayerLikedPanelKeys = await ArtworkList.convertRexUIArrayOnlinePlayer(scene)
            } else {
              console.log("No liked artworks")
            }
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
    if (scene.onlinePlayerLikedPanel) scene.onlinePlayerLikedPanel.setVisible(false)
  }

  parseNewOnlinePlayerArray(scene) {
    if (ManageSession.createOnlinePlayerArray.length > 0) {

      //get more account info for each onlineplayer
      ManageSession.createOnlinePlayerArray.forEach(onlinePlayer => {
        Promise.all([getAccount(onlinePlayer.user_id)]).then(rec => {
          const newOnlinePlayer = rec[0]
          //console.log(newOnlinePlayer)
          this.createOnlinePlayer(scene, newOnlinePlayer)
          //console.log("parseNewOnlinePlayerArray scene", scene)
        })

        //new onlineplayer is removed from the newOnlinePlayer array, once we call more data on it
        ManageSession.createOnlinePlayerArray = ManageSession.createOnlinePlayerArray.filter(obj => obj.user_id != onlinePlayer.user_id)
      })
    }
  }

  createOnlinePlayer(scene, onlinePlayer) {
    // check if onlinePlayer exists already 
    //console.log(onlinePlayer)
    const exists = ManageSession.allConnectedUsers.some(element => element.user_id == onlinePlayer.user_id)
    // if player exists
    if (!exists) {

      //create new onlinePlayer with default avatar
      const onlinePlayerCopy = onlinePlayer
      //console.log("createOnlinePlayer scene", scene)
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
        .setDepth(200)
      onlinePlayer.setInteractive({ useHandCursor: true })
      // hit area of onlinePlayer
      onlinePlayer.input.hitArea.setTo(-10, -10, onlinePlayer.width + 50, onlinePlayer.height + 50)
      onlinePlayer.on('pointerup', () => {
        // pass on values to itemsbar.svelte
        ManageSession.selectedOnlinePlayer = onlinePlayer
        onlinePlayerClicked = true
        this.displayOnlinePlayerItemsBar(scene, onlinePlayer)
        //put a timer of 20 sec to automatically close the onlinePlayerItemsBar
        scene.time.addEvent({
          delay: 20000, callback: () => {
            this.hideOnlinePlayerItemsBar(scene)
          }, callbackScope: scene, loop: false
        })

        //console.log("online player width", onlinePlayer)
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
      console.log("onlinePlayer", onlinePlayer)

      //we push the new online player to the allConnectedUsers array
      ManageSession.allConnectedUsers.push(onlinePlayer)

      //we load the onlineplayer avatar, make a key for it
      const avatarKey = onlinePlayer.user_id + "_" + onlinePlayer.update_time
      //console.log("avatarKey", avatarKey)

      //if the texture already exists attach it again to the player
      // const preExisting = false
      if (!scene.textures.exists(avatarKey)) {
        //console.log("scene.textures.exists(avatarKey)", scene.textures.exists(avatarKey))
        //add it to loading queue
        scene.load.spritesheet(avatarKey, onlinePlayer.url, {
          frameWidth: 64,
          frameHeight: 64,
        }).on(`filecomplete-spritesheet-${avatarKey}`, (avatarKey) => { this.attachAvatarToOnlinePlayer(scene, onlinePlayer, avatarKey) }, scene)
        //when file is finished loading the attachToAvatar function is called
        scene.load.start() // start loading the image in memory
      } else {
        //console.log("scene.textures.exists(avatarKey)", scene.textures.exists(avatarKey))
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
    //console.log("player, tempAvatarName", onlinePlayer, tempAvatarName)

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
