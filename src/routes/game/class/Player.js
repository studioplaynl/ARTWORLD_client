import ManageSession from "../ManageSession"
import CoordinatesTranslator from "./CoordinatesTranslator"
import { listObjects, listImages, convertImage, getFullAccount, updateObject, getAccount } from "../../../api.js"
import HistoryTracker from "./HistoryTracker"
import ArtworkList from "./ArtworkList"
import R_UI from "./R_UI"
import Preloader from "./Preloader"

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

        // scene.player.setCollideWorldBounds(true)
        // scene.player.onWorldBounds = true

        // console.log(scene.player.body.checkCollision, "scene.player.body.checkCollision")
        // console.log(scene.player.body, "scene.player.body")
        // scene.player.body.onWorldBounds = true
        // scene.player.body.checkCollision.up = true
        // scene.player.body.checkCollision.down = true
        // scene.player.body.checkCollision.left = true
        // scene.player.body.checkCollision.right = true

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

    // //create playerLikedPanel with placeholderArt, so it is contructed, and we hide it afterwards
    // scene.playerLikedPanelKeys = { artworks: [{ name: 'not_found' }, { name: 'not_found' }, { name: 'not_found' }] }
    // console.log(scene.playerLikedPanelKeys)

    // scene.playerLikedPanel = scene.rexUI.add
    //   .scrollablePanel({
    //     x: scene.player.x + 200,
    //     y: scene.player.y,
    //     width: 200,
    //     height: 200,

    //     scrollMode: 0,

    //     background: scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, 0xffffff),

    //     panel: {
    //       child: R_UI.createPanel(scene, scene.playerLikedPanelKeys),
    //     },

    //     slider: {
    //       track: scene.rexUI.add.roundRectangle(0, 0, 20, 10, 10, 0x000000),
    //       thumb: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 13, 0xff9900),
    //     },

    //     space: {
    //       left: 10, right: 10, top: 10, bottom: 10, panel: 10,
    //     },

    //     mouseWheelScroller: {
    //       focus: false,
    //       speed: 0.1
    //     },

    //     name: "playerLikedPanel"
    //   })
    //   .layout()

    // scene.input.topOnly = false;
    // const labels = [];
    // labels.push(
    //   ...scene.playerLikedPanel.getElement("#artworks.items", true)
    // )
    // //hide the itemsPanel
    // scene.playerLikedPanel.setVisible(false)

    // event when server is finished loading the artworks: create a new panel (updating the panel didn't work)
    scene.events.on("playerLikedPanelComplete", () => {
      // destroy the loading spinner
      scene.spinner.destroy()

      //destroy the old panel
      // scene.playerLikedPanel.destroy()

      //create a new panel
      scene.playerLikedPanel = scene.rexUI.add
        .scrollablePanel({
          x: scene.player.x + 200,
          y: scene.player.y,
          width: 200,
          height: 200,

          scrollMode: 0,

          background: scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, 0xffffff),

          panel: {
            child: R_UI.createPanel(scene, scene.playerLikedPanelKeys),
          },

          slider: {
            track: scene.rexUI.add.roundRectangle(0, 0, 20, 10, 10, 0x000000),
            thumb: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 13, 0xff9900),
          },

          space: {
            left: 10, right: 10, top: 10, bottom: 10, panel: 10,
          },

          mouseWheelScroller: {
            focus: false,
            speed: 0.1
          },

          name: "playerLikedPanel"
        })
        .layout()

      scene.input.topOnly = false;
      const labels = [];
      labels.push(
        ...scene.playerLikedPanel.getElement("#artworks.items", true)
      )

      scene.playerLikedPanel.setVisible(true)
    })

    scene.player.on("pointerup", async () => {
      console.log("player clicked")
      console.log("scene.isPlayerItemsBarDisplayed", scene.isPlayerItemsBarDisplayed)
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
          // we display placeholder panel, and replace it with refreshed panel once server is done loading
          // scene.playerLikedPanel.setVisible(true)

          // display spinner while images are being downloaded
          Preloader.runSpinner(scene, scene.player.x + 150, scene.player.y, 100, 100)

          //the liked array is in the latest state, but we have to get the binairy data (the images)
          scene.playerLikedPanelKeys = await ArtworkList.convertRexUIArray(scene)
        })

        scene.playerAddressbookButtonCircle = scene.add
          .circle(0, 70, 25, 0xffffff)
          .setOrigin(0.5, 0.5)
          .setInteractive({ useHandCursor: true })
          .setStrokeStyle(3, 0x0000)
        scene.playerAddressbookButton = scene.add.image(0, 70, "addressbook")

        scene.playerAddressbookButtonCircle.on("pointerdown", () => {

          console.log("clicked")
          console.log("clicked addressbook", ManageSession.addressbook.addressbook)

          if (ManageSession.addressbook.addressbook.length > 0 && ManageSession.addressbook.addressbook[0].user_id != "undefined") {
            const playerAddressbookWidth = 120
            const playerAddressbookHeight = 200

            const x = scene.player.x - playerAddressbookWidth / 2
            const y = scene.player.y + 110

            scene.playerAddressbookMask = scene.add.graphics()
              .fillStyle(0xffffff, 1)
              .fillRoundedRect(x, y, playerAddressbookWidth, playerAddressbookHeight, 8)
              .lineStyle(3, 0x000000, 1)
              .strokeRoundedRect(x, y, playerAddressbookWidth, playerAddressbookHeight, 8)

            scene.playerAddressbookContainer = scene.add.container(x + 10, y + 10)

            const smileyFaces = ["friend", "friend2", "friend3"]

            const height = 50

            ManageSession.addressbook.addressbook.forEach((element, index) => {

              const y = index * height

              const randomNumber = Math.floor(Math.random() * smileyFaces.length)

              const playerAddressbookImage = scene.add.image(0, y, smileyFaces[randomNumber])
                .setOrigin(0)
                .setInteractive({ useHandCursor: true })
                .on("pointerdown", () => {
                  HistoryTracker.switchScene(scene, "DefaultUserHome", element.user_id)
                })

              const playerAddressbookButtonCircle = scene.add
                .circle(70, y, 15, 0xffffff)
                .setOrigin(0)
                .setInteractive({ useHandCursor: true })
                .setStrokeStyle(2, 0x0000)
                .on("pointerdown", () => {

                  const filteredArray = ManageSession.addressbook.addressbook.filter(el => el.user_id != element.user_id)
                  ManageSession.addressbook = { addressbook: filteredArray }

                  console.log("after deleting", ManageSession.addressbook)

                  // update server
                  const type = "addressbook"
                  const name = type + "_" + ManageSession.userProfile.id
                  const pub = 2
                  const value = ManageSession.addressbook

                  updateObject(type, name, value, pub)

                  scene.events.emit("playerAddressbook")
                })

              scene.playerAddressbookContainer.add([playerAddressbookImage, playerAddressbookButtonCircle])
            })

            scene.playerAddressbookContainer.setMask(scene.playerAddressbookMask.createGeometryMask())

            scene.playerAddressbookZone = scene.add.zone(x, y, playerAddressbookWidth, playerAddressbookHeight)
              .setOrigin(0)
              .setInteractive()
              .on("pointermove", (pointer) => {
                if (pointer.isDown) {
                  // console.log("pointermove")
                  if (pointer.isDown) {
                    scene.playerAddressbookContainer.y += (pointer.velocity.y / 10);
                    scene.playerAddressbookContainer.y = Phaser.Math.Clamp(scene.playerAddressbookContainer.y, y - (ManageSession.addressbook.addressbook.length * height) + playerAddressbookHeight, y); // value, bottom border, top border
                  }
                }
              })
          }
        })

        scene.events.on("playerAddressbook", () => {
          console.log("events on")
          console.log("events addressbook", ManageSession.addressbook.addressbook)
          if (ManageSession.addressbook.addressbook.length > 0 && ManageSession.addressbook.addressbook[0].user_id != "undefined") {
            const playerAddressbookWidth = 120
            const playerAddressbookHeight = 200

            const x = scene.player.x - playerAddressbookWidth / 2
            const y = scene.player.y + 110

            scene.playerAddressbookMask = scene.add.graphics()
              .fillStyle(0xffffff, 1)
              .fillRoundedRect(x, y, playerAddressbookWidth, playerAddressbookHeight, 8)
              .lineStyle(3, 0x000000, 1)
              .strokeRoundedRect(x, y, playerAddressbookWidth, playerAddressbookHeight, 8)

            scene.playerAddressbookContainer = scene.add.container(x + 10, y + 10)

            const smileyFaces = ["friend", "friend2", "friend3"]

            const height = 50

            ManageSession.addressbook.addressbook.forEach((element, index) => {

              const y = index * height

              const randomNumber = Math.floor(Math.random() * smileyFaces.length)

              const playerAddressbookImage = scene.add.image(0, y, smileyFaces[randomNumber])
                .setOrigin(0)
                .setInteractive({ useHandCursor: true })
                .on("pointerdown", () => {
                  HistoryTracker.switchScene(scene, "DefaultUserHome", element.user_id)
                })

              const playerAddressbookButtonCircle = scene.add
                .circle(70, y, 15, 0xffffff)
                .setOrigin(0)
                .setInteractive({ useHandCursor: true })
                .setStrokeStyle(2, 0x0000)
                .on("pointerdown", () => {

                  const filteredArray = ManageSession.addressbook.addressbook.filter(el => el.user_id != element.user_id)
                  ManageSession.addressbook = { addressbook: filteredArray }

                  console.log("after deleting", ManageSession.addressbook)

                  // update server
                  const type = "addressbook"
                  const name = type + "_" + ManageSession.userProfile.id
                  const pub = 2
                  const value = ManageSession.addressbook

                  updateObject(type, name, value, pub)

                  scene.events.emit("playerAddressbook")
                })

              scene.playerAddressbookContainer.add([playerAddressbookImage, playerAddressbookButtonCircle])
            })

            scene.playerAddressbookContainer.setMask(scene.playerAddressbookMask.createGeometryMask())

            scene.playerAddressbookZone = scene.add.zone(x, y, playerAddressbookWidth, playerAddressbookHeight)
              .setOrigin(0)
              .setInteractive()
              .on("pointermove", (pointer) => {
                if (pointer.isDown) {
                  // console.log("pointermove")
                  if (pointer.isDown) {
                    scene.playerAddressbookContainer.y += (pointer.velocity.y / 10);
                    scene.playerAddressbookContainer.y = Phaser.Math.Clamp(scene.playerAddressbookContainer.y, y - (ManageSession.addressbook.addressbook.length * height) + playerAddressbookHeight, y); // value, bottom border, top border
                  }
                }
              })
          }
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
        scene.playerLikedPanel.setVisible(false)
        scene.isPlayerItemsBarDisplayed = false
        if (scene.playerAddressbookContainer) {
          scene.playerAddressbookMask.destroy()
          scene.playerAddressbookContainer.destroy()
          scene.playerAddressbookZone.destroy()
        }
      }
    })
  }

  createOnlinePlayerItemsBar(scene) {
    // making the avatar interactive
    //player.setInteractive({ useHandCursor: true });

    // for toggling the pop-up buttons
    scene.isOnlinePlayerItemsBarDisplayed = false

    // creating a container that holds all pop-up buttons, the coords are the same as the avatar's
    scene.onlinePlayerItemsBar = scene.add.container(0, 0)

  }

  async displayOnlinePlayerItemsBar(scene, player) {
    ManageSession.selectedOnlinePlayer = player

    // giving the position for the container that holds all the buttons
    scene.onlinePlayerItemsBar.x = ManageSession.selectedOnlinePlayer.x
    scene.onlinePlayerItemsBar.y = ManageSession.selectedOnlinePlayer.y

    scene.isOnlinePlayerItemsBarDisplayed == false ? true : false
    if (scene.isOnlinePlayerItemsBarDisplayed == false) {

      //create playerLikedPanel with placeholderArt, so it is constructed, and we hide it afterwards
      scene.onlinePlayerLikedPanelKeys = { artworks: [{ name: 'not_found' }, { name: 'not_found' }, { name: 'not_found' }] }
      console.log(scene.onlinePlayerLikedPanelKeys)

      scene.onlinePlayerLikedPanel = scene.rexUI.add
        .scrollablePanel({
          x: ManageSession.selectedOnlinePlayer.x + 200,
          y: ManageSession.selectedOnlinePlayer.y,
          width: 200,
          height: 200,

          scrollMode: 0,

          background: scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, 0xffffff),

          panel: {
            child: R_UI.createPanel(scene, scene.onlinePlayerLikedPanelKeys),
          },

          slider: {
            track: scene.rexUI.add.roundRectangle(0, 0, 20, 10, 10, 0x000000),
            thumb: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 13, 0xff9900),
          },

          space: {
            left: 10, right: 10, top: 10, bottom: 10, panel: 10,
          },

          name: "onlinePlayerLikedPanel"
        })
        .layout()

      scene.input.topOnly = false;
      const labels = [];
      labels.push(
        ...scene.onlinePlayerLikedPanel.getElement("#artworks.items", true)
      )
      //hide the itemsPanel
      scene.onlinePlayerLikedPanel.setVisible(false)

      // event when server is finished loading the artworks: create a new panel (updating the panel didn't work)
      scene.events.on("onlinePlayerLikedPanelComplete", () => {
        // destroy the loading spinner
        scene.spinner.destroy()

        // console.log(scene.onlinePlayerLikedPanel)
        // console.log(scene.onlinePlayerLikedPanelKeys) //!undefined

        // //destroy the old panel
        // scene.onlinePlayerLikedPanel.destroy()

        //create a new panel

        scene.onlinePlayerLikedPanel = scene.rexUI.add
          .scrollablePanel({
            //! get the clicked onlinePlayer
            x: scene.onlinePlayerItemsBar.x + 200,
            y: scene.onlinePlayerItemsBar.y,
            width: 200,
            height: 200,

            scrollMode: 0,

            background: scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, 0xffffff),

            panel: {
              child: R_UI.createPanel(scene, scene.onlinePlayerLikedPanelKeys),
            },

            slider: {
              track: scene.rexUI.add.roundRectangle(0, 0, 20, 10, 10, 0x000000),
              thumb: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 13, 0xff9900),
            },

            space: {
              left: 10, right: 10, top: 10, bottom: 10, panel: 10,
            },
            name: "onlinePlayerLikedPanel"
          })
          .layout()

        scene.input.topOnly = false;
        const labels = [];
        labels.push(
          ...scene.onlinePlayerLikedPanel.getElement("#artworks.items", true)
        )

        scene.onlinePlayerLikedPanel.setVisible(true)
      })

      Promise.all([listObjects("liked", player.id, 10)]).then((rec) => {
        // it checks if there was ever before a liked object created for the online player
        if (rec[0].length > 0) {

          ManageSession.likedOnlinePlayer = rec[0][0].value
          console.log("ManageSession.likedOnlinePlayer", ManageSession.likedOnlinePlayer)

          scene.onlinePlayerItemsBar.setVisible(true);

          scene.onlinePlayerLikedButtonCircle = scene.add
            .circle(65, 0, 25, 0xffffff)
            .setOrigin(0.5, 0.5)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(3, 0x0000);
          scene.onlinePlayerLikedButton = scene.add.image(65, 0, "heart");

          scene.onlinePlayerLikedButtonCircle.on("pointerdown", async () => {
            // we display placeholder panel, and replace it with refreshed panel once server is done loading
            // scene.onlinePlayerLikedPanel.setVisible(true)

            // display spinner while images are being downloaded
            Preloader.runSpinner(scene, ManageSession.selectedOnlinePlayer.x + 150, ManageSession.selectedOnlinePlayer.y, 100, 100)

            scene.onlinePlayerLikedPanelKeys = await ArtworkList.convertRexUIArrayOnlinePlayer(scene) //!convert method to onlinePlayer
          })

          scene.onlinePlayerItemsBar.add([scene.onlinePlayerLikedButtonCircle, scene.onlinePlayerLikedButton])

          scene.isOnlinePlayerItemsBarDisplayed = true
        } else {
          ManageSession.likedOnlinePlayer = {}

          const type = "liked"
          const name = type + "_" + player.user_id
          const pub = 2
          const value = ManageSession.likedOnlinePlayer
          updateObject(type, name, value, pub)
        }

      })


      scene.onlinePlayerHomeButtonCircle = scene.add
        .circle(0, -70, 25, 0xffffff)
        .setOrigin(0.5, 0.5)
        .setInteractive({ useHandCursor: true })
        .setStrokeStyle(3, 0x0000);
      scene.onlinePlayerHomeButton = scene.add.image(0, -70, "home")

      scene.onlinePlayerHomeButtonCircle.on("pointerdown", () => {

        scene.onlinePlayerHomeEnterButtonCircle = scene.add
          .circle(-30, -120, 25, 0xffffff)
          .setOrigin(0.5, 0.5)
          .setInteractive({ useHandCursor: true })
          .setStrokeStyle(2, 0x0000)
          .on("pointerdown", () => {
            // entering the home of a player
            HistoryTracker.switchScene(scene, "DefaultUserHome", ManageSession.selectedOnlinePlayer.id)
            console.log("ManageSession.selectedOnlinePlayer.id", ManageSession.selectedOnlinePlayer.id)
          })
        scene.onlinePlayerHomeEnterButton = scene.add.image(-30, -120, "enter_home")

        scene.onlinePlayerHomeSaveCircle = scene.add
          .circle(30, -120, 25, 0xffffff)
          .setOrigin(0.5, 0.5)
          .setInteractive({ useHandCursor: true })
          .setStrokeStyle(2, 0x0000)
          .on("pointerup", () => {
            // saving the home of a player
            // ManageSession.addressBook[player.user_id] = player.user_id

            console.log("!!! ManageSession.selectedOnlinePlayer", ManageSession.selectedOnlinePlayer)

            console.log("ManageSession address book", ManageSession.addressbook)

            // console.log("ManageSession.addressbook.addressbook", ManageSession.addressbook.addressbook)


            const entry = { user_id: ManageSession.selectedOnlinePlayer.id }

            const isExist = ManageSession.addressbook.addressbook.some(element => element.user_id == entry.user_id)

            console.log("isExist", isExist)
            if (!isExist) {
              console.log("updated")
              ManageSession.addressbook.addressbook.push(entry)

              console.log("ManageSession address book", ManageSession.addressbook)

              const type = "addressbook"
              const name = type + "_" + ManageSession.userProfile.id
              const pub = 2
              const value = ManageSession.addressbook
              console.log("value ManageSession.addressbook", value)
              updateObject(type, name, value, pub)
            } else {
              console.log("this user id is already in addressbook list")
            }
          })

        scene.onlinePlayerHomeSaveButton = scene.add.image(30, -120, "save_home")

        scene.onlinePlayerItemsBar.add([scene.onlinePlayerHomeEnterButtonCircle, scene.onlinePlayerHomeEnterButton, scene.onlinePlayerHomeSaveCircle, scene.onlinePlayerHomeSaveButton])
      })

      // adding all buttons to the container
      scene.onlinePlayerItemsBar.add([scene.onlinePlayerHomeButtonCircle, scene.onlinePlayerHomeButton])
    } else {
      scene.isOnlinePlayerItemsBarDisplayed = false
      scene.onlinePlayerItemsBar.setVisible(false)
      scene.onlinePlayerLikedPanel.setVisible(false)
    }
  }

  parseNewOnlinePlayerArray(scene) {
    if (ManageSession.createOnlinePlayerArray.length > 0) {

      ManageSession.createOnlinePlayerArray.forEach(onlinePlayer => {
        //console.log("new onlinePlayer", onlinePlayer)

        Promise.all([getAccount(onlinePlayer.user_id)]).then(rec => {
          // console.log("rec", rec)
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

    //console.log("onlinePlayer", onlinePlayer)

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

  itemsBarOnlinePlayer(scene, onlinePlayer) {
    scene.avatarDetailsContainer.setVisible(true)
    scene.onlinePlayerID = onlinePlayer.anims.currentFrame.textureKey.split("_")[0];
  }

  async createItemsBarOnlinePlayer(scene) {
    //display and populate the items bar
    //x, y
    //player.x is in the middle of the screen, we use that with an offset 
    //scene.sys.game.canvas.height = bottom of the screen, so we subtract height of the items bar to get y

    const itemsBarWidth = 100
    const itemsBarHeight = 250
    const zoomFactor = scene.UI_Scene.currentZoom

    const itemsBarX = scene.player.x + (itemsBarWidth * 1.4)
    const itemsBarY = (scene.player.y + ((scene.sys.game.canvas.height / 2) / zoomFactor)) - itemsBarHeight - 30

    scene.avatarDetailsContainer = scene.add.container(itemsBarX, itemsBarY)

    scene.avatarDetailsBox = scene.add.graphics()
    scene.avatarDetailsBox.fillStyle(0xffffff, 1).lineStyle(3, 0x000000, 1)
    scene.avatarDetailsBox.fillRoundedRect(0, 0, itemsBarWidth, itemsBarHeight, 24).strokeRoundedRect(0, 0, itemsBarWidth, itemsBarHeight, 24)

    scene.transparentBox = scene.add.rectangle(0, 0, itemsBarWidth, itemsBarHeight)
      .setOrigin(0)
      .setInteractive({ useHandCursor: true })
      // we make a call to get artworks once the player hovers on the heart button
      .on("pointerover", async () => {
        console.log("over!")
        if (scene.onlinePlayerID) {
          await listImages("drawing", scene.onlinePlayerID, 100).then(async (response) => {
            scene.onlinePlayerArtworks = response
            console.log("on hover show artworks", scene.onlinePlayerArtworks)
            if (scene.onlinePlayerArtworks.length > 0) {
              let count = 0
              scene.onlinePlayerDownloadedImages = {
                artworks: await Promise.all(
                  scene.onlinePlayerArtworks.map(async (element) => {
                    const key = `${element.key}_128`;
                    if (!scene.textures.exists(key)) {
                      const currentImage = await convertImage(
                        element.value.url,
                        "128",
                        "png"
                      )
                      scene.load.image(key, currentImage);
                      scene.load.start(); // load the image in memory
                    }
                    count++
                    console.log("IN", count)
                    return { name: `${key}` };
                  })
                ),
              }
              console.log("OUT", count)
              if (count == scene.onlinePlayerArtworks.length) {
                isArtworksDownloaded = true
                console.log("isArtworksDownloaded", isArtworksDownloaded)
              }
            }
          })
        }
      })

    scene.scrollablePanelOnlinePlayer = scene.add.container(0, 0);

    scene.avatarDetailsCloseButton = scene.add
      .circle(-25, -25, 25, 0xffffff)
      .setOrigin(0.5, 0.5)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(3, 0x0000)
      .on("pointerup", () => {
        scene.avatarDetailsContainer.setVisible(false)
        // if (scene.scrollablePanelOnlinePlayer) {
        //   scene.scrollablePanelOnlinePlayer.destroy()
        // }
        scene.scrollablePanelOnlinePlayer.setVisible(false)
      })
    scene.avatarDetailsCloseImage = scene.add.image(-25, -25, "close")

    scene.avatarDetailsHouseButton = scene.add
      .circle(50, 50, 25, 0xffffff)
      .setOrigin(0.5, 0.5)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0x0000)
      .on("pointerup", () => {
        console.log(scene.onlinePlayerID)
        if (scene.onlinePlayerID) {
          scene.physics.pause();
          scene.player.setTint(0xff0000);

          ManageSession.socket.rpc("leave", scene.location);

          scene.player.location = "DefaultUserHome";

          scene.time.addEvent({
            delay: 500,
            callback: () => {
              ManageSession.location = "DefaultUserHome";
              ManageSession.createPlayer = true;
              ManageSession.getStreamUsers("join", "DefaultUserHome");
              scene.scene.stop(scene.scene.key);
              if (scene.onlinePlayerID) {
                scene.scene.start("DefaultUserHome", {
                  user_id: scene.onlinePlayerID,
                });
              } else {
                scene.scene.start("DefaultUserHome");
              }
            },
            callbackScope: scene,
            loop: false,
          });
        }
      })

    scene.avatarDetailsHouseImage = scene.add.image(50, 50, "home")
    scene.avatarDetailsContainer.add([scene.avatarDetailsBox, scene.avatarDetailsCloseButton, scene.avatarDetailsCloseImage, scene.transparentBox, scene.avatarDetailsHouseButton, scene.avatarDetailsHouseImage])

    // ---------------------------------
    // heart button and scroll container
    scene.avatarDetailsHeartButton = scene.add
      .circle(50, 110, 25, 0xffffff)
      .setOrigin(0.5, 0.5)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0x0000)

    scene.avatarDetailsHeartImage = scene.add.image(50, 110, "heart")
    scene.avatarDetailsContainer.add([scene.avatarDetailsHeartButton, scene.avatarDetailsHeartImage])

    let isArtworksDownloaded = false

    // scene.avatarDetailsHeartButton.on("pointerover", async () => {

    // })

    scene.avatarDetailsHeartButton.on("pointerup", async () => {
      console.log("scrollBAR 111")
      if (scene.onlinePlayerID && isArtworksDownloaded && scene.onlinePlayerArtworks.length > 0) {
        console.log("scrollBAR 222")
        scene.scrollablePanelOnlinePlayer.setVisible(false)
        scene.scrollablePanelOnlinePlayer = scene.rexUI.add
          .scrollablePanel({
            x: itemsBarX + itemsBarWidth * 2 + 2,
            y: itemsBarY + itemsBarHeight / 2,
            width: 200,
            height: itemsBarHeight,

            scrollMode: 0,

            background: scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, 0xffffff),

            panel: {
              child: R_UI.createPanel(scene, scene.onlinePlayerDownloadedImages),
            },

            slider: {
              track: scene.rexUI.add.roundRectangle(0, 0, 20, 10, 10, 0x000000),
              thumb: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 13, 0xff9900),
            },

            space: {
              left: 10, right: 10, top: 10, bottom: 10, panel: 10,
            },

          })
          .layout()
        // .setName("onlinePlayerScrollablePanel")

        scene.input.topOnly = false;
        const labels = [];
        labels.push(
          ...scene.scrollablePanelOnlinePlayer.getElement("#artworks.items", true)
        )

      }
      isArtworksDownloaded = false
    })
  }

  // movePlayerAddressbook(scene) {
  //   const x = scene.player.x - 50
  //   const y = scene.player.y + 110
  //   scene.playerAddressbookMask.x = x
  //   scene.playerAddressbookMask.y = y
  //   scene.playerAddressbookContainer.x = x
  //   scene.playerAddressbookContainer.y = y
  //   scene.playerAddressbookZone.x = x
  //   scene.playerAddressbookZone.y = y
  // }

  async getAccountDetails(id) {
    await getFullAccount(id).then((rec) => {
      return rec
    })
  }

}

export default new Player()
