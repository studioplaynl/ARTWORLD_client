import ManageSession from "../ManageSession"
import PlayerDefault from "../class/PlayerDefault"
import PlayerDefaultShadow from "../class/PlayerDefaultShadow"
import Player from "../class/Player.js"
import Preloader from "../class/Preloader.js"
import Background from "../class/Background.js"
import CoordinatesTranslator from "../class/CoordinatesTranslator.js"
import GenerateLocation from "../class/GenerateLocation.js"
import HistoryTracker from "../class/HistoryTracker.js"
import Move from "../class/Move.js"
import ServerCall from "../class/ServerCall"

export default class BlueSail extends Phaser.Scene {
  constructor() {
    super("BlueSail")
    this.location = "BlueSail"

    this.worldSize = new Phaser.Math.Vector2(5500, 5500)

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
  }

  async preload() {
    Preloader.Loading(this) //.... PRELOADER VISUALISER

    //added after linting 
    //outline effect
    //this.load.plugin('rexoutlinepipelineplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexoutlinepipelineplugin.min.js', true);
    //added after linting 
    //outline effect
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
    // username: "user88"
    // version: "0579e989a16f3e228a10d49d13dc3da6"

    // the order of creation is the order of drawing: first = bottom ...............................
    Background.rectangle({
      scene: this,
      name: 'bgImageWhite',
      posX: 0,
      posY: 0,
      setOrigin: 0,
      gradient1: 0xffffff,
      gradient2: 0xffffff,
      gradient3: 0xffffff,
      gradient4: 0xffffff,
      alpha: 1,
      width: this.worldSize.x,
      height: this.worldSize.y,
    });

    // this.bgImage = this.add.image(0, 0, 'bgImageWhite').setOrigin(0);;

    Background.repeatingDots({
      scene: this,
      gridOffset: 80,
      dotWidth: 2,
      dotColor: 0x7300ed,
      backgroundColor: 0xffffff,
    });

    // make a repeating set of rectangles around the artworld canvas
    const middleCoordinates = new Phaser.Math.Vector2(CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 0), CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 0))
    this.borderRectArray = []

    for (let i = 0; i < 3; i++) {

      this.borderRectArray[i] = this.add.rectangle(0, 0, this.worldSize.x + (80 * i), this.worldSize.y + (80 * i))
      this.borderRectArray[i].setStrokeStyle(6 + (i * 2), 0x7300ed)

      this.borderRectArray[i].x = middleCoordinates.x
      this.borderRectArray[i].y = middleCoordinates.y

    }

    

    //............................................... end homes area ................................................................................

    //!
    this.touchBackgroundCheck = this.add.rectangle(0, 0, this.worldSize.x, this.worldSize.y, 0xfff000)
      .setInteractive() //{ useHandCursor: true }
      //.on('pointerup', () => console.log('touched background'))
      .on('pointerdown', () => ManageSession.playerMove = true)
      .setDepth(219)
      .setOrigin(0)
      .setVisible(false)

    this.touchBackgroundCheck.input.alwaysEnabled = true //this is needed for an image or sprite to be interactive also when alpha = 0 (invisible)
    //!

    

    // about drag an drop multiple  objects efficiently https://www.youtube.com/watch?v=t56DvozbZX4&ab_channel=WClarkson
    // End Background .........................................................................................

    //.......  PLAYER ....................................................................................
    //* create default player and playerShadow
    //* create player in center with artworldCoordinates
    this.player = new PlayerDefault(this, CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, ManageSession.playerPosX), CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, ManageSession.playerPosY), this.playerAvatarPlaceholder).setDepth(201)
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

    //! needed for handling object dragging
    this.input.on('dragstart', function (pointer, gameObject) {

    }, this)

    this.input.on("drag", function (pointer, gameObject, dragX, dragY) {
      gameObject.x = dragX
      gameObject.y = dragY

      if (gameObject.name == "handle") {
        gameObject.data.get('vector').set(dragX, dragY) //get the vector data for curve handle objects
      }

    }, this)

    this.input.on('dragend', function (pointer, gameObject) {
      let worldX = Math.round(CoordinatesTranslator.Phaser2DToArtworldX(this.worldSize.x, gameObject.x))
      let worldY = Math.round(CoordinatesTranslator.Phaser2DToArtworldY(this.worldSize.y, gameObject.y))

        //store the original scale when selecting the gameObject for the first time
      if (ManageSession.selectedGameObject != gameObject) {
        ManageSession.selectedGameObject = gameObject
        
        ManageSession.selectedGameObjectStartScale = gameObject.scale
        ManageSession.selectedGameObjectStartPosition.x = gameObject.x
        ManageSession.selectedGameObjectStartPosition.y = gameObject.y
        console.log("editMode info startScale:", ManageSession.selectedGameObjectStartScale)
      }
        console.log("editMode info posX posY: ", worldX, worldY, "scale:", ManageSession.selectedGameObject.scale, "width*scale:", Math.round(ManageSession.selectedGameObject.width * ManageSession.selectedGameObject.scale), "height*scale:", Math.round(ManageSession.selectedGameObject.height * ManageSession.selectedGameObject.scale), "name:", ManageSession.selectedGameObject.name)
    }, this)
    //!

    //.......... locations ................................................................................
    // create the user homes
    ServerCall.getHomesFiltered("home", this.location, this)
    
    // create accessable locations 
    this.generateLocations()
    //.......... end locations ............................................................................

    Player.loadPlayerAvatar(this)
    // this.avatarDetailsContainer.setDepth(999)

    // .......... loadplayers art
    // const userID = ManageSession.userProfile.id
    // await listObjects("drawing", userID, 100).then((rec) => {
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


  generateLocations() {
    //we set draggable on restart scene with a global flag

    let locationVector = new Phaser.Math.Vector2(0, 0)
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
      this.worldSize,
      locationVector
    )

    Background.circle({
      scene: this,
      name: 'purple_circle_location_image',
      // setOrigin: 0,
      posX: locationVector.x,
      posY: locationVector.y,
      gradient1: 0x7300eb,
      gradient2: 0x3a4bba,
      gradient3: 0x3a4bba,
      gradient4: 0x3a4bba,
      alpha: 1,
      size: 200,
      imageOnly: true
    });

     this.purpleCircleLocation = new GenerateLocation({
      scene: this,
      type: "image",
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: "Artworld",
      locationImage: "purple_circle_location_image",
      enterButtonImage: "enter_button",
      locationText: "Paarse Cirkel Wereld",
      referenceName: "this.purpleCircleLocation",
      fontColor: 0x8dcb0e,
    })

    locationVector = new Phaser.Math.Vector2(-400, 300)
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
      this.worldSize,
      locationVector
    )

    Background.rectangle({
      scene: this,
      name: 'green_square_location_image',
      // posX: 0,
      // posY: 0,
      // setOrigin: 0,
      gradient1: 0x15d64a,
      gradient2: 0x15d64a,
      gradient3: 0x2b8042,
      gradient4: 0x2b8042,
      alpha: 1,
      width: 140,
      height: 140,
      imageOnly: true
    });

    this.greenSquareLocation = new GenerateLocation({
      scene: this,
      type: "image",
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: "GreenSquare",
      locationImage: "green_square_location_image",
      enterButtonImage: "enter_button",
      locationText: "Groene Vierkant Wereld",
        referenceName: "this.greenSquareLocation",
      fontColor: 0x8dcb0e,
    })


    locationVector = new Phaser.Math.Vector2(403, 327)
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
      this.worldSize,
      locationVector
    )

    // green_square world for homes
    // 
    Background.triangle({
      scene: this,
      name: 'turquoise_triangle_location_image',
      // setOrigin: 0,
      posX: locationVector.x,
      posY: locationVector.y,
      gradient1: 0x40E0D0,
      gradient2: 0x40E0D0,
      gradient3: 0x39C9BB,
      gradient4: 0x39C9BB,
      alpha: 1,
      size: 200,
      imageOnly: true
    });

    this.turquoiseTriangle = new GenerateLocation({
      scene: this,
      type: "image",
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: "TurquoiseTriangle",
      locationImage:  'turquoise_triangle_location_image',
      enterButtonImage: "enter_button",
      locationText: "Turquoise Driehoek Wereld",
              referenceName: "this.turquoiseTriangle",

      fontColor: 0x8dcb0e,
    })

    locationVector = new Phaser.Math.Vector2(417, -51)
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
      this.worldSize,
      locationVector
    )

    this.yellowDiamondLocation = new GenerateLocation({
      scene: this,
      type: "image",
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: "YellowDiamond",
      locationImage: "yellow_diamond_location_image",
      enterButtonImage: "enter_button",
      locationText: "Gele Diamant Wereld",
      referenceName: "this.yellowDiamondLocation", 
      fontColor: 0x8dcb0e,
    })

    locationVector = new Phaser.Math.Vector2(-400, -400)
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
      this.worldSize,
      locationVector
    )

    // green_square world for homes
    // 
    Background.star({
      scene: this,
      name: 'red_star_location_image',
      gradient1: 0xE50000,
      gradient2: 0xE50000,
      alpha: 1,
      size: 200,
      imageOnly: true,
      spikes: 5
    });

    this.redStar = new GenerateLocation({
      scene: this,
      type: "image",
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: "RedStar",
      locationImage:  'red_star_location_image',
      enterButtonImage: "enter_button",
      locationText: "Rode Ster Wereld",
                    referenceName: "this.redStar",

      fontColor: 0x8dcb0e,
    })


    locationVector = new Phaser.Math.Vector2(-535, 35 )
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
      this.worldSize,
      locationVector
    )

    this.pencil = new GenerateLocation({
      scene: this,
      type: "image",

      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      appUrl: "drawing",
      locationImage: "pencil",
      enterButtonImage: "enter_button",
      locationText: "drawingApp",
                          referenceName: "this.pencil",

      fontColor: 0x8dcb0e,
      color1: 0x8dcb0e,
      color2: 0x3f8403,
      color3: 0x63a505,
    })
    this.pencil.rotation = 0.12


  }

  update() {

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
      //Move.checkIfPlayerReachedMoveGoal(this) // to stop the player when it reached its destination
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
