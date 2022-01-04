import { CONFIG } from "../config.js";
import ManageSession from "../ManageSession"
import { listObjects, updateObject, updateObjectAdmin } from '../../../api.js'

import PlayerDefault from '../class/PlayerDefault'
import PlayerDefaultShadow from '../class/PlayerDefaultShadow'
import Player from '../class/Player.js'
import Preloader from '../Preloader.js'
import BouncingBird from "../class/BouncingBird.js"
import Background from "../class/Background.js"
import DebugFuntions from "../class/DebugFuntions.js"
import CoordinatesTranslator from "../class/CoordinatesTranslator.js"
import GenerateLocation from "../class/GenerateLocation.js"
import HistoryTracker from "../class/HistoryTracker.js";

export default class ArtworldAmsterdam extends Phaser.Scene {

  constructor() {
    super("ArtworldAmsterdam");

    this.worldSize = new Phaser.Math.Vector2(3000, 3000)

    this.debug = false

    this.gameStarted = false
    this.phaser = this
    // this.playerPos;
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

    this.playerContainer
    this.selectedPlayerID

    this.homes = []
    this.homesRepreseneted = []
    this.homesGenerate = false

    this.offlineOnlineUsers

    this.location = "ArtworldAmsterdam"

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
    this.target = new Phaser.Math.Vector2();
    this.distance

    //shadow
    this.playerShadowOffset = -8
    this.playerIsMovingByClicking = false

    this.currentZoom
    this.UI_Scene

    //itemsbar
    this.itemsbar

    // size for the artWorks
    this.artPreviewSize = 128

    this.artUrl = []
    this.userArtServerList = []
    this.progress = []
  }

  async preload() {
    Preloader.Loading(this) //.... PRELOADER VISUALISER

    //get a list of homes from users in ArtworldAmsterdam
    await listObjects("home", null, 100).then((rec) => {
      //console.log("rec: ", rec)
      this.homes = rec
      //console.log(this.homes)
      this.homesGenerate = true
    })

  }

  async create() {

    // for back button
    HistoryTracker.push(this);

    //timers
    ManageSession.updateMovementTimer = 0;
    ManageSession.updateMovementInterval = 60; //1000 / frames =  millisec

    //.......  LOAD PLAYER AVATAR ..........................................................................
    ManageSession.createPlayer = true
    //....... end LOAD PLAYER AVATAR .......................................................................

    Background.repeatingDots({ scene: this, gridOffset: 50, dotWidth: 2, dotColor: 0x909090, backgroundColor: 0xFFFFFF })

    //.......  PLAYER ....................................................................................
    //*create deafult player and playerShadow
    //* create player in center with artworldCoordinates
    this.player = new PlayerDefault(this, CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 0), CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 0), this.playerAvatarPlaceholder)

    this.playerShadow = new PlayerDefaultShadow({ scene: this, texture: this.playerAvatarPlaceholder })
    //.......  end PLAYER ................................................................................

    //....... onlinePlayers ..............................................................................
    // add onlineplayers group
    this.onlinePlayersGroup = this.add.group();
    //....... end onlinePlayers ..........................................................................

    //....... PLAYER VS WORLD .............................................................................
    this.gameCam = this.cameras.main //.setBackgroundColor(0xFFFFFF);
    //!setBounds has to be set before follow, otherwise the camera doesn't follow!
    this.gameCam.setBounds(0, 0, this.worldSize.x, this.worldSize.y);
    this.gameCam.zoom = 1
    this.gameCam.startFollow(this.player);
    //......... end PLAYER VS WORLD .......................................................................

    //......... INPUT .....................................................................................
    this.cursors = this.input.keyboard.createCursorKeys();
    //.......... end INPUT ................................................................................

    //.......... locations ................................................................................
    //generating homes from online query is not possible in create, because the server query can take time
    this.generateLocations()
    //.......... end locations ............................................................................

    //BouncingBird.generate({ scene: this, birdX: 200, birdY: 200, birdScale: 1.2 })

    //......... DEBUG FUNCTIONS ...........................................................................
    DebugFuntions.keyboard(this);
    //this.createDebugText();
    //......... end DEBUG FUNCTIONS .......................................................................
    // create itemsbar
    //  this.itemsbar = this.add.graphics();

    //  this.itemsbar.fillStyle(0xffff00, 1);

    //  //  32px radius on the corners
    //  this.itemsbar.fillRoundedRect(32, 32, 300, 200, 32);

    //Test changing the addressbook object
    // '{ "user_id": ' + ManageSession.userProfile.id + ', "posY": ' + "100" + ', "posY": "' + "110" + '" }'
    const value = '{"user_id": "b9ae6807-1ce1-4b71-a8a3-f5958be4d340", "posX": "500", "posY": "110"}'

    const type = "addressbook"
    const name = type + "_" + ManageSession.userProfile.id
    const pub = 2
    
    updateObject(type, name, value, pub)

    


    //......... UI Scene  .................................................................................
    this.UI_Scene = this.scene.get("UI_Scene")
    this.scene.launch("UI_Scene")
    this.currentZoom = this.UI_Scene.currentZoom
    this.UI_Scene.location = this.location
    this.gameCam.zoom = this.currentZoom
    //......... end UI Scene ..............................................................................
  }//end create

  createItemsBar() {

  }
  generateHomes() {

    //check if server query is finished, if there are homes to make
    if (this.homes != null && this.homesGenerate) {
      console.log("generate homes!")

      this.homes.forEach((element, index) => {
        // console.log(element.collection)
        // console.log(element.value.posX)

        let locationDescription = element.user_id.substring(0, 7);
        this.homesRepreseneted[index] = new GenerateLocation({ scene: this, userHome: element.user_id, draggable: false, type: "isoBox", x: CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, element.value.posX), y: CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, element.value.posY), locationDestination: "DefaultUserHome", locationText: locationDescription, locationImage: "museum", enterButtonImage: "arrow_down_32px", fontColor: 0x8dcb0e, color1: 0xffe31f, color2: 0xf2a022, color3: 0xf8d80b })

      }) //end forEach

      this.homesGenerate = false
    }
  }

  generateLocations() {
    let location1Vector = new Phaser.Math.Vector2(-400, -100)
    location1Vector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, location1Vector)

    const location1 = new GenerateLocation({ scene: this, type: "isoBox", x: location1Vector.x, y: location1Vector.y, locationDestination: "Location1", locationImage: "museum", enterButtonImage: "arrow_down_32px", locationText: "Location 1", fontColor: 0x8dcb0e, color1: 0xffe31f, color2: 0xf2a022, color3: 0xf8d80b })


    location1Vector = new Phaser.Math.Vector2(-400, 100)
    location1Vector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, location1Vector)

    const location2 = new GenerateLocation({ scene: this, type: "isoBox", x: location1Vector.x, y: location1Vector.y, locationDestination: "Location2", locationImage: "museum", enterButtonImage: "arrow_down_32px", locationText: "Location 2", fontColor: 0x8dcb0e, color1: 0x8dcb0e, color2: 0x3f8403, color3: 0x63a505 })

  }

  update(time, delta) {
    //...... ONLINE PLAYERS ................................................
    Player.loadOnlinePlayers(this)
    Player.receiveOnlinePlayersMovement(this)
    Player.loadOnlineAvatar(this)
    this.generateHomes()

    this.gameCam.zoom = this.UI_Scene.currentZoom
    //.......................................................................

    //........... PLAYER SHADOW .............................................................................
    // the shadow follows the player with an offset
    this.playerShadow.x = this.player.x + this.playerShadowOffset
    this.playerShadow.y = this.player.y + this.playerShadowOffset
    //........... end PLAYER SHADOW .........................................................................

    //.......... UPDATE TIMER      ..........................................................................
    ManageSession.updateMovementTimer += delta
    // console.log(time) //running time in millisec
    // console.log(delta) //in principle 16.6 (60fps) but drop to 41.8ms sometimes
    //....... end UPDATE TIMER  ..............................................................................

    //........ PLAYER MOVE BY KEYBOARD  ......................................................................
    if (!this.playerIsMovingByClicking) {
      Player.moveByKeyboard(this) //player moving with keyboard with playerMoving Class
    }

    Player.moveByCursor(this)
    //....... end PLAYER MOVE BY KEYBOARD  ..........................................................................

    //....... moving ANIMATION ......................................................................................
    Player.movingAnimation(this)
    //....... end moving ANIMATION .................................................................................

    //this.playerMovingByClicking()

    // to detect if the player is clicking/tapping on one place or swiping
    if (this.input.activePointer.downX != this.input.activePointer.upX) {
      Player.moveBySwiping(this)
    } else {
      Player.moveByTapping(this)
    }

  } //update
} //class
