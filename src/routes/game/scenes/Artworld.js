import ManageSession from "../ManageSession"
import { listImages, convertImage, getAccount } from "../../../api.js"

import PlayerDefault from "../class/PlayerDefault"
import PlayerDefaultShadow from "../class/PlayerDefaultShadow"
import Player from "../class/Player.js"
import Preloader from "../class/Preloader.js"
import BouncingBird from "../class/BouncingBird.js"
import GraffitiWall from "../class/GraffitiWall"
import Background from "../class/Background.js"
import CoordinatesTranslator from "../class/CoordinatesTranslator.js"
import GenerateLocation from "../class/GenerateLocation.js"
import HistoryTracker from "../class/HistoryTracker.js"
import Move from "../class/Move.js"
import ServerCall from "../class/ServerCall"
import Exhibition from "../class/Exhibition"

export default class Artworld extends Phaser.Scene {
  constructor() {
    super("Artworld")

    this.worldSize = new Phaser.Math.Vector2(6000, 6000)

    this.debug = false

    this.gameStarted = false
    this.phaser = this
    // this.playerPos
    this.onlinePlayers = []

    this.newOnlinePlayers = []

    this.currentOnlinePlayer
    this.avatarName = []
    this.tempAvatarName = ""
    this.loadedAvatars = []

    this.player
    this.playerShadow
    this.playerAvatarPlaceholder = "avatar1"
    this.playerMovingKey = "moving"
    this.playerStopKey = "stop"
    this.playerAvatarKey = ""
    this.createdPlayer = false

    this.artDisplaySize = 64
    this.artArray = []

    //testing
    this.resolveLoadErrorCache = []

    this.playerContainer

    this.homes = []
    this.homesRepreseneted = []

    this.offlineOnlineUsers

    this.location = "Artworld"

    //.......................REX UI ............
    this.COLOR_PRIMARY = 0xff5733
    this.COLOR_LIGHT = 0xffffff
    this.COLOR_DARK = 0x000000
    this.data
    //....................... end REX UI ......

    this.cursors
    this.pointer
    this.isClicking = false
    this.cursorKeyIsDown = false
    this.swipeDirection = "down"
    this.swipeAmount = new Phaser.Math.Vector2(0, 0)
    this.graffitiDrawing = false

    //pointer location example
    // this.source // = player
    this.target = new Phaser.Math.Vector2()
    this.distance
    this.distanceTolerance = 9

    //shadow
    this.playerShadowOffset = -8
    this.playerIsMovingByClicking = false

    this.currentZoom

    //itemsbar

    // size for the artWorks
    this.artPreviewSize = 128

    this.artUrl = []
    this.userArtServerList = []
    this.progress = []

    // pop-up buttons of the user's avatar
    this.isPopUpButtonsDisplayed
    this.playerContainer
    this.selectedPlayerID

    this.homeButtonCircle
    this.homeButtonImage
    this.heartButtonCircle
    this.heartButtonImage

    this.scrollablePanel

    this.progress = []

    this.editModeElements = []
  }

  async preload() {
    Preloader.Loading(this) //.... PRELOADER VISUALISER
  }

  async create() {
    //copy worldSize over to ManageSession, so that positionTranslation can be done there
    ManageSession.worldSize = this.worldSize

    // collection: "home"
    // create_time: "2022-01-19T16:31:43Z"
    // key: "Amsterdam"
    // permission_read: 2
    // permission_write: 1
    // update_time: "2022-01-19T16:32:27Z"
    // user_id: "4c0003f0-3e3f-4b49-8aad-10db98f2d3dc"
    // value:
    // url: "home/4c0003f0-3e3f-4b49-8aad-10db98f2d3dc/3_current.png"
    // sername: "user88"
    // version: "0579e989a16f3e228a10d49d13dc3da6"

    //.......  LOAD PLAYER AVATAR ..........................................................................
    ManageSession.createPlayer = true
    //....... end LOAD PLAYER AVATAR .......................................................................

    Background // the order of creation is the order of drawing: first = bottom ...............................
    Background.repeatingDots({
      scene: this,
      gridOffset: 80,
      dotWidth: 2,
      dotColor: 0x909090,
      backgroundColor: 0xfafafa,
    })

    Background.circle({
      scene: this,
      name: "gradientAmsterdam1",
      posX: CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -249),
      posY: CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 66),
      size: 810,
      gradient1: 0x85feff,
      gradient2: 0xff01ff,
    })
    this.editModeElements.push(this.gradientAmsterdam1)

    Background.circle({
      scene: this,
      name: "gradientAmsterdam2",
      posX: CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 51),
      posY: CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 684),
      size: 564,
      gradient1: 0xfbff00,
      gradient2: 0x85feff,
    })
    this.editModeElements.push(this.gradientAmsterdam2)

    Background.circle({
      scene: this,
      name: "gradientAmsterdam3",
      posX: CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 654),
      posY: CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -303),
      size: 914,
      gradient1: 0x3a4bba,
      gradient2: 0xbb00ff,
    })
    this.editModeElements.push(this.gradientAmsterdam3)

    this.touchBackgroundCheck = this.add.rectangle(0, 0, this.worldSize.x, this.worldSize.y, 0xfff000)
      .setInteractive() //{ useHandCursor: true }
      .on('pointerup', () => console.log('touched background'))
      .on('pointerdown', () => ManageSession.playerMove = true)
      .setDepth(219)
      .setOrigin(0)
      .setVisible(false)

    this.touchBackgroundCheck.input.alwaysEnabled = true //this is needed for an image or sprite to be interactive also when alpha = 0 (invisible)


    // sunglass_stripes
    this.sunglasses_striped = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 564),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 383.34),
      "sunglass_stripes"
    )
    this.editModeElements.push(this.sunglasses_striped)

    this.train = this.add.image(CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -790), CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 800), 'metro_train_grey')
    this.tweens.add({
      targets: this.train,
      duration: 3000,
      x: '+=2360',
      yoyo: false,
      repeat: -1,
      repeatDelay: 8000,
      //ease: 'Sine.easeInOut'
    })
    this.editModeElements.push(this.sunglasses_striped)

    //create(scene, x, y, width, height, name, color, imageFile = null) {
    GraffitiWall.create(this, CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 1062), CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 776), 800, 400, "graffitiBrickWall", 0, 'brickWall')
    this.editModeElements.push(this.graffitiBrickWall)

    //...................................................................................................
    // DRAW A SUN 
    //...................................................................................................

    Background.circle({
      scene: this,
      name: "sunDrawingExample",
      posX: CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 1269),
      posY: CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 2200),
      size: 400,
      gradient1: 0xffdf87,
      gradient2: 0xf7f76f,
    })
    this.editModeElements.push(this.sunDrawingExample)

    this.tweens.add({
      targets: this.sunDrawingExample,
      duration: 3000,
      scaleX: 1.8,
      scaleY: 1.8,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    this.sunDrawingExample.setInteractive()
      .on('pointerup', () => {

        this.sunDraw.setVisible(true)
        this.sunDrawCloseButton.setVisible(true)
        this.sunDrawSaveButton.setVisible(true)
      })

    GraffitiWall.create(this, CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 1383), CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 1600), 400, 400, "sunDraw", 180, 'artFrame_512')
    this.editModeElements.push(this.sunDraw)
    this.sunDraw.setVisible(false)

    this.sunDrawCloseButton = this.add.image(this.sunDraw.x + (this.sunDraw.width / 1.8), this.sunDraw.y - (this.sunDraw.width / 2), 'close')
    this.sunDrawCloseButton.setInteractive()
      .on('pointerup', () => {
        this.sunDraw.setVisible(false)
        this.sunDrawCloseButton.setVisible(false)
        this.sunDrawSaveButton.setVisible(false)
      })
    this.sunDrawCloseButton.setVisible(false)

    this.sunDrawSaveButton = this.add.image(this.sunDrawCloseButton.x, this.sunDrawCloseButton.y + (this.sunDrawCloseButton.width * 1.1), 'save')
    this.sunDrawSaveButton.setInteractive()
      .on('pointerup', () => {
        let RT = this.sunDraw.getByName("sunDraw")
        RT.saveTexture('DrawnSun')
        console.log("this.sunDrawingExample", this.sunDrawingExample)
        this.sunDrawingExample.setTexture('DrawnSun')
      })
    this.sunDrawSaveButton.setVisible(false)
    //.........................................................................................................................
    // DRAW A CLOUD
    //...................................................................................................

    this.cloudDrawingExample = this.add.image(CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 1200), CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 2050), "drawn_cloud")
    this.editModeElements.push(this.cloudDrawingExample)

    this.tweens.add({
      targets: this.cloudDrawingExample,
      duration: 8000,
      x: '-=1600',
      //scaleY: 1.8,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    this.cloudDrawingExample.setInteractive()
      .on('pointerup', () => {
        this.cloudDraw.setVisible(true)
        this.cloudDrawCloseButton.setVisible(true)
        this.cloudDrawSaveButton.setVisible(true)
      })

    GraffitiWall.create(this, CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 1200), CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 1500), 600, 400, "cloudDraw", 2, 'artFrame_512')
    this.editModeElements.push(this.cloudDraw)
    this.cloudDraw.setVisible(false)

    this.cloudDrawCloseButton = this.add.image(this.cloudDraw.x + (this.cloudDraw.width / 1.8), this.cloudDraw.y - (this.cloudDraw.width / 1.8), 'close')
    this.cloudDrawCloseButton.setInteractive()
      .on('pointerup', () => {
        this.cloudDraw.setVisible(false)
        this.cloudDrawCloseButton.setVisible(false)
        this.cloudDrawSaveButton.setVisible(false)
      })
    this.cloudDrawCloseButton.setVisible(false)

    this.cloudDrawSaveButton = this.add.image(this.cloudDrawCloseButton.x, this.cloudDrawCloseButton.y + (this.cloudDrawCloseButton.width * 1.1), 'save')
    this.cloudDrawSaveButton.setInteractive()
      .on('pointerup', () => {
        let RT = this.cloudDraw.getByName("cloudDraw")
        RT.saveTexture('DrawnCloud')
        this.cloudDrawingExample.setTexture('DrawnCloud')
      })
    this.cloudDrawSaveButton.setVisible(false)

    //...................................................................................................
    this.photo_camera = this.add.image(CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -784.67), CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 800), 'photo_camera').setFlip(true, false)
    this.editModeElements.push(this.photo_camera)

    this.tree_palm = this.add.image(CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 117),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 1106.33),
      "tree_palm")
    this.editModeElements.push(this.tree_palm)

    Exhibition.AbriBig({
      scene: this,
      name: "exhibit_outdoor_big1",
      posX: CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -500),
      posY: CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 1357),
      size: 564,
    })
    this.editModeElements.push(this.exhibit_outdoor_big1)

    Exhibition.AbriSmall2({
      scene: this,
      name: "exhibit_outdoor_small2_1",
      posX: CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -777),
      posY: CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 39),
      size: 564,
    })
    //this.exhibit_outdoor_small2_1_mesh.setTexture("mario_star")
    this.editModeElements.push(this.exhibit_outdoor_small2_1)

    //! needed for handling object dragging
    this.input.on('dragstart', function (pointer, gameObject) {

    }, this)

    this.input.on("drag", function (pointer, gameObject, dragX, dragY) {
      gameObject.x = dragX;
      gameObject.y = dragY;
    }, this)

    this.input.on('dragend', function (pointer, gameObject) {
      let worldX = CoordinatesTranslator.Phaser2DToArtworldX(this.worldSize.x, gameObject.x)
      let worldY = CoordinatesTranslator.Phaser2DToArtworldY(this.worldSize.y, gameObject.y)
      console.log(worldX, worldY)
    }, this)
    //!

    // about drag an drop multiple  objects efficiently https://www.youtube.com/watch?v=t56DvozbZX4&ab_channel=WClarkson
    // End Background .........................................................................................

    //.......  PLAYER ....................................................................................
    //* create default player and playerShadow
    //* create player in center with artworldCoordinates
    this.player = new PlayerDefault(this, CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, ManageSession.playerPosX), CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, ManageSession.playerPosY), this.playerAvatarPlaceholder).setDepth(201)
    //Player.createPlayerItemsBar(this)
    this.playerShadow = new PlayerDefaultShadow({ scene: this, texture: this.playerAvatarPlaceholder }).setDepth(200)
    // for back button, has to be done after player is created for the history tracking!
    HistoryTracker.pushLocation(this)

    //....... PLAYER VS WORLD .............................................................................
    this.gameCam = this.cameras.main //.setBackgroundColor(0xFFFFFF);
    this.gameCam.zoom = 1
    this.gameCam.startFollow(this.player)
    this.physics.world.setBounds(0, 0, this.worldSize.x, this.worldSize.y)
    //https://phaser.io/examples/v3/view/physics/arcade/world-bounds-event
    //......... end PLAYER VS WORLD .......................................................................



    //.......... locations ................................................................................
    ServerCall.getHomesFiltered("home", "Amsterdam", 100, this)
    this.generateLocations()
    //.......... end locations ............................................................................

    //BouncingBird.generate({ scene: this, birdX: 200, birdY: 200, birdScale: 1.2 })

    //create items bar for onlineplayer, after UIscene, because it need currentZoom
    //Player.createOnlinePlayerItemsBar(this)
    Player.loadPlayerAvatar(this)
    // this.avatarDetailsContainer.setDepth(999)

    // .......... loadplayers art
    // const userID = ManageSession.userProfile.id
    // await listImages("drawing", userID, 100).then((rec) => {
    //   //this.userArtServerList is an array with objects, in the form of:

    //   //collection: "drawing"
    //   //create_time: "2022-01-27T16:46:00Z"
    //   //key: "1643301959176_cyaanConejo"
    //   //permission_read: 1
    //   //permission_write: 1
    //   //update_time: "2022-02-09T13:47:01Z"
    //   //user_id: "5264dc23-a339-40db-bb84-e0849ded4e68"
    //   //value:
    //   //  displayname: "cyaanConejo"
    //   //  json: "drawing/5264dc23-a339-40db-bb84-e0849ded4e68/0_1643301959176_cyaanConejo.json"
    //   //  previewUrl: "https://d3hkghsa3z4n1z.cloudfront.net/fit-in/64x64/drawing/5264dc23-a339-40db-bb84-e0849ded4e68/0_1643301959176_cyaanConejo.png?signature=6339bb9aa7f10a73387337ce0ab59ab5d657e3ce95b70a942b339cbbd6f15355"
    //   //  status: ""
    //   //  url: "drawing/5264dc23-a339-40db-bb84-e0849ded4e68/0_1643301959176_cyaanConejo.png"
    //   //  version: 0

    //   //permission_read: 1 indicates hidden
    //   //permission_read: 2 indicates visible

    //   //we filter out the visible artworks
    //   //filter only the visible art = "permission_read": 2
    //   this.userArtServerList = rec.filter(obj => obj.permission_read == 2)

    //   console.log("this.userArtServerList", this.userArtServerList)
    //   if (this.userArtServerList.length > 0) {
    //     this.userArtServerList.forEach((element, index, array) => {
    //       this.downloadArt(element, index, array)
    //     })

    //   }
    // })
  } //end create

  async downloadArt(element, index, array) {
    //! we are placing the artWorks 'around' (left and right of) the center of the world
    const totalArtWorks = array.length
    const imageKeyUrl = element.value.url
    const imgSize = this.artDisplaySize.toString()
    const fileFormat = "png"
    // put the artworks 'around' the center, which means: take total artworks * space = total x space eg 3 * 550 = 1650
    // we start at middleWorld.x - totalArtWidth + (artIndex * artDisplaySize) 

    const totalArtWidth = (this.artDisplaySize + 38) * totalArtWorks

    const middleWorldX = CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 0)
    const startXArt = middleWorldX - (totalArtWidth / 2)

    if (this.textures.exists(imageKeyUrl)) { // if the image has already downloaded, then add image by using the key

      let random = Math.floor(Math.random() * this.artArray.length)
      this.exhibit_outdoor_big1_mesh.setTexture(this.artArray[random])

      random = Math.floor(Math.random() * this.artArray.length)
      this.exhibit_outdoor_small2_1_mesh.setTexture(this.artArray[random])

    } else { // otherwise download the image and add it

      const convertedImage = await convertImage(imageKeyUrl, imgSize, fileFormat)
      this.load.image(imageKeyUrl, convertedImage)

      this.load.start() // start the load queue to get the image in memory
    }

    this.load.on('filecomplete', (key) => {
      // on completion of each specific artwork

      // we don't want to trigger any other load completions 
     
        // adds a frame to the container
        this.artArray.push(key)
      
    })

    this.load.on("complete", () => {
      let random = Math.floor(Math.random() * this.artArray.length)
      this.exhibit_outdoor_big1_mesh.setTexture(this.artArray[random])

      random = Math.floor(Math.random() * this.artArray.length)
      this.exhibit_outdoor_small2_1_mesh.setTexture(this.artArray[random])

    })
  }//end downloadArt



  generateLocations() {
    let location1Vector = new Phaser.Math.Vector2(-701.83, -304.33)
    location1Vector = CoordinatesTranslator.artworldVectorToPhaser2D(
      this.worldSize,
      location1Vector
    )

    const location1 = new GenerateLocation({
      scene: this,
      type: "isoBox",
      draggable: false,
      x: location1Vector.x,
      y: location1Vector.y,
      locationDestination: "Location1",
      locationImage: "museum",
      enterButtonImage: "enter_button",
      locationText: "Location 1",
      fontColor: 0x8dcb0e,
      color1: 0xffe31f,
      color2: 0xf2a022,
      color3: 0xf8d80b,
    })

    //*set the particle first on 0,0 so they are below the mario_star
    //*later move them relative to the mario_star
    var particles = this.add.particles('music_quarter_note').setDepth(139)

    var music_emitter = particles.createEmitter({
      x: 0,
      y: 0,
      lifespan: { min: 2000, max: 8000 },
      speed: { min: 80, max: 120 },
      angle: { min: 270, max: 360 },
      gravityY: -50,
      gravityX: 50,
      scale: { start: 1, end: 0 },
      quantity: 1,
      frequency: 1600,
    })

    location1Vector = new Phaser.Math.Vector2(22.81, -428.32)
    location1Vector = CoordinatesTranslator.artworldVectorToPhaser2D(
      this.worldSize,
      location1Vector
    )

    this.mario_star = new GenerateLocation({
      scene: this,
      type: "image",
      size: 200,
      draggable: false,
      x: location1Vector.x,
      y: location1Vector.y,
      internalUrl: "mariosound",
      locationImage: "mario_star",
      enterButtonImage: "enter_button",
      locationText: "MarioSound",
      fontColor: 0x8dcb0e,
      color1: 0x8dcb0e,
      color2: 0x3f8403,
      color3: 0x63a505,
    })
    this.mario_star.setDepth(140)

    music_emitter.setPosition(this.mario_star.x + 15, this.mario_star.y - 20)
  }

  update(time, delta) {

    // zoom in and out of game
    this.gameCam.zoom = ManageSession.currentZoom

    //don't move the player with clicking and swiping in edit mode
    if (!ManageSession.gameEditMode) {
      //...... ONLINE PLAYERS ................................................
      Player.parseNewOnlinePlayerArray(this)
      //........... PLAYER SHADOW .............................................................................
      // the shadow follows the player with an offset
      this.playerShadow.x = this.player.x + this.playerShadowOffset
      this.playerShadow.y = this.player.y + this.playerShadowOffset
      //........... end PLAYER SHADOW .........................................................................

      //....... stopping PLAYER ......................................................................................
      Move.checkIfPlayerReachedMoveGoal(this) // to stop the player when it reached its destination
      //....... end stopping PLAYER .................................................................................

      // to detect if the player is clicking/tapping on one place or swiping
      if (this.input.activePointer.downX != this.input.activePointer.upX) {
        Move.moveBySwiping(this)
      } else {
        Move.moveByTapping(this)
      }
    } else {
      //when in edit mode

    }

  } //update
} //class
