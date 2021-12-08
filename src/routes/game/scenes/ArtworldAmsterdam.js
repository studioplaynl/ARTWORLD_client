import { CONFIG } from "../config.js";
import ManageSession from "../ManageSession"
import { getAccount } from '../../../api.js'

import PlayerDefault from '../class/PlayerDefault'
import PlayerDefaultShadow from '../class/PlayerDefaultShadow'
import Player from '../class/Player.js'
import Preloader from '../Preloader.js'
import BouncingBird from "../class/BouncingBird.js"
import Background from "../class/Background.js"
import DebugFuntions from "../class/DebugFuntions.js"
import LocationDialogbox from "../class/LocationDialogbox.js";
import CoordinatesTranslator from "../class/CoordinatesTranslator.js"

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
    this.playerContainer
    this.playerAvatarPlaceholder = "avatar1"
    this.playerMovingKey = "moving"
    this.playerStopKey = "stop"
    this.playerAvatarKey = ""
    this.createdPlayer = false

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
  }

  async preload() {
    Preloader.Loading(this) //.... PRELOADER VISUALISER
  }

  async create() {

    // for back button history
    ManageSession.currentLocation = this.scene.key
    console.log("this.scene.key")
    console.log(this.scene.key)

    //timers
    ManageSession.updateMovementTimer = 0;
    ManageSession.updateMovementInterval = 60; //1000 / frames =  millisec

    //.......  LOAD PLAYER AVATAR ..........................................................................
    ManageSession.createPlayer = true
    // console.log("ManageSession.createPlayer: ")
    // console.log(ManageSession.createPlayer)
    //....... end LOAD PLAYER AVATAR .......................................................................

    Background.repeatingDots({ scene: this, gridOffset: 50, dotWidth: 2, dotColor: 0x909090, backgroundColor: 0xFFFFFF})

    //.......  PLAYER ....................................................................................
    //*create deafult player and playerShadow
    // create player in center with artworldCoordinates
    this.player = new PlayerDefault(this, CoordinatesTranslator.artworldToPhaser2D(this.worldSize.x, 0), CoordinatesTranslator.artworldToPhaser2D(this.worldSize.y, 0), this.playerAvatarPlaceholder)
    
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
    this.generateLocations()
    //.......... end locations ............................................................................

    //BouncingBird.generate({ scene: this, birdX: 200, birdY: 200, birdScale: 1.2 })

    //......... DEBUG FUNCTIONS ...........................................................................
    DebugFuntions.keyboard(this);
    //this.createDebugText();
    //......... end DEBUG FUNCTIONS .......................................................................

    //......... UI Scene  .................................................................................
    this.UI_Scene = this.scene.get("UI_Scene")
    this.scene.launch("UI_Scene")
    this.currentZoom = this.UI_Scene.currentZoom
    this.UI_Scene.location = this.location
    this.gameCam.zoom = this.currentZoom
    //......... end UI Scene ..............................................................................
  }

  generateLocations() {
    this.locationDialogBoxContainersGroup = this.add.group();
    //........ location1 .......

//* specify 
    this.location1 = this.add.isotriangle(CoordinatesTranslator.artworldToPhaser2D(this.worldSize.x, -1008), CoordinatesTranslator.artworldToPhaser2D(this.worldSize.y, -18), 150, 150, false, 0x8dcb0e, 0x3f8403, 0x63a505);
    this.physics.add.existing(this.location1);
    this.location1.body.setSize(this.location1.width, this.location1.height)
    this.location1.body.setOffset(0, -(this.location1.height / 4))
    LocationDialogbox.create(this, this.location1, "Location1", 200, 150)

    this.location2 = this.add.isotriangle(CoordinatesTranslator.artworldToPhaser2D(this.worldSize.x, -567), CoordinatesTranslator.artworldToPhaser2D(this.worldSize.y, -282), 150, 150, false, 0x8dcb0e, 0x3f8403, 0x63a505);
    this.physics.add.existing(this.location2);
    this.location2.body.setSize(this.location2.width, this.location2.height)
    this.location2.body.setOffset(0, -(this.location2.height / 4))
    LocationDialogbox.create(this, this.location2, "Location2", 200, 150)

    this.location3 = this.add.isotriangle(CoordinatesTranslator.artworldToPhaser2D(this.worldSize.x, -162), CoordinatesTranslator.artworldToPhaser2D(this.worldSize.y, -486), 150, 150, false, 0x8dcb0e, 0x3f8403, 0x63a505);
    this.physics.add.existing(this.location3);
    this.location3.body.setSize(this.location3.width, this.location3.height)
    this.location3.body.setOffset(0, -(this.location3.height / 4))
    LocationDialogbox.create(this, this.location3, "Location3", 200, 150)

    this.location4 = this.add.isotriangle(CoordinatesTranslator.artworldToPhaser2D(this.worldSize.x, 342), CoordinatesTranslator.artworldToPhaser2D(this.worldSize.y, -525), 150, 150, false, 0x8dcb0e, 0x3f8403, 0x63a505);
    this.physics.add.existing(this.location4);
    this.location4.body.setSize(this.location4.width, this.location4.height)
    this.location4.body.setOffset(0, -(this.location4.height / 4))
    LocationDialogbox.create(this, this.location4, "Location4", 200, 150)
  }

  update(time, delta) {
    //...... ONLINE PLAYERS ................................................
    Player.loadOnlinePlayers(this)
    Player.receiveOnlinePlayersMovement(this)
    Player.loadOnlineAvatar(this)

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
