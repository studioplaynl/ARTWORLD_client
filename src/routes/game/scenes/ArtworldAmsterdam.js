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

    //.......  PLAYER ..........................................................................
    //*create deafult player and playerShadow
    this.player = new PlayerDefault(this, 300, 300, this.playerAvatarPlaceholder)
    
    this.playerShadow = new PlayerDefaultShadow({ scene: this, texture: this.playerAvatarPlaceholder })
    //.......  end PLAYER .............................................................................

    //....... onlinePlayers ...........................................................................
    // add onlineplayers group
    this.onlinePlayersGroup = this.add.group();
    //....... end onlinePlayers .......................................................................

    //....... PLAYER VS WORLD ..........................................................................
    this.gameCam = this.cameras.main //.setBackgroundColor(0xFFFFFF);
    //!setBounds has to be set before follow, otherwise the camera doesn't follow!
    this.gameCam.setBounds(0, 0, this.worldSize.x, this.worldSize.y);
    this.gameCam.zoom = 1
    this.gameCam.startFollow(this.player);
    //......... end PLAYER VS WORLD ......................................................................

    //......... INPUT ....................................................................................
    this.cursors = this.input.keyboard.createCursorKeys();
    //.......... end INPUT ................................................................................

    //.......... locations .........................................
    this.generateLocations()
    //.......... end locations .........................................

    //BouncingBird.generate({ scene: this, birdX: 200, birdY: 200, birdScale: 1.2 })

    //......... DEBUG FUNCTIONS ............................................................................
    DebugFuntions.keyboard(this);
    //this.createDebugText();
    //......... end DEBUG FUNCTIONS .........................................................................

    //......... UI Scene  ...............................................
    this.UI_Scene = this.scene.get("UI_Scene")
    this.scene.launch("UI_Scene")
    this.currentZoom = this.UI_Scene.currentZoom
    this.UI_Scene.location = this.location
    this.gameCam.zoom = this.currentZoom
    //......... end UI Scene ............................................
  }

  generateLocations() {
    this.locationDialogBoxContainersGroup = this.add.group();
    //........ location1 .......
    this.location1 = this.add.isotriangle(300,300, 150, 150, false, 0x8dcb0e, 0x3f8403, 0x63a505);
    
    //this.location1 = this.add.isotriangle(CoordinatesTranslator.artworldToPhaser2D(-100), CoordinatesTranslator.artworldToPhaser2D(100), 150, 150, false, 0x8dcb0e, 0x3f8403, 0x63a505);
    this.physics.add.existing(this.location1);
    this.location1.body.setSize(this.location1.width, this.location1.height)
    this.location1.body.setOffset(0, -(this.location1.height / 4))
    //can't set ositriangle to immmovable
    //this.location1.setImmovable(true)

    // this.location1.setData("entered", false)
    // this.location1.setName("Location1")

    this.createLocationDialogbox(this.location1, "Location1", 200, 150)
    LocationDialogbox.create(this, this.location1, "Location1", 200, 150)
  }

  createLocationDialogbox(location, locationName, mainWidth, mainHeight) {
    // let location = "this." + locationName
    location = eval(location)

    location.setData("entered", false)
    location.setName(locationName)

    //create variable for the text of the dialog box, set the text after
    let nameText = "this." + location.name + "DialogBox"
    nameText = this.add.text(mainWidth - 60, mainHeight - 30, locationName, { fill: '#000' })

    //create variable to hold dialogbox graphics
    let nameBox = "this." + location.name + "DialogBox"

    //background panel for dialogbox
    nameBox = this.add.graphics();
    nameBox.fillStyle(0xfffff00, 0.4)
    nameBox.fillRoundedRect(0, 0, mainWidth, mainHeight, 32)
    nameBox.setVisible(false)

    //create variable for texture that holds the graphics and the clickable area for the dialogbox
    let nameTexture = "this." + location.name + "Texture"

    nameTexture = this.add.renderTexture(0, 0, mainWidth, mainHeight);
    nameTexture.draw(nameBox);
    nameTexture.setInteractive(new Phaser.Geom.Rectangle(0, 0, mainWidth, mainWidth), Phaser.Geom.Rectangle.Contains)
    nameTexture.on('pointerdown', () => { this.enterLocationScene(location.name) });

    //create container that holds all of the dialogbox: can be moved and hidden
    let nameContainer = "this." + location.name + "DialogBoxContainer"

    // nameContainer = this.add.container(location.x - (mainWidth / 2), location.y - (mainHeight / 2), [nameTexture, nameText]).setDepth(900)
    nameContainer = this.add.container(location.body.x + (location.body.width / 4), location.body.y + (location.body.height / 4), [nameTexture, nameText]).setDepth(900)

    nameContainer.setVisible(false)
    nameContainer.setName(location.name)

    //add everything to the container
    this.locationDialogBoxContainersGroup.add(nameContainer);

    //call overlap between player and the location, set the callback function and scope
    this.physics.add.overlap(this.player, location, this.confirmEnterLocation, null, this)
  }

  confirmEnterLocation(player, location, show) {
    if (!location.getData("entered")) {
      //start event
      show = false
      this.time.addEvent({ delay: 2000, callback: this.enterLocationDialogBox, args: [player, location, show], callbackScope: this, loop: false })

      //show the box
      show = true
      this.enterLocationDialogBox(player, location, show)
      location.setData("entered", true)
    }
  }

  enterLocationDialogBox(player, location, show) {
    let container = "this." + location.name + "DialogBoxContainer"
    container = eval(container)

    let nameContainer = location.name
    let search = { name: location }

    container = Phaser.Actions.GetFirst(this.locationDialogBoxContainersGroup.getChildren(), { name: nameContainer });

    if (show) {
      container.setVisible(show)
    } else {
      container.setVisible(show)
      location.setData("entered", show)
    }
  }

  enterLocationScene(location) {

    console.log("Location scene")
    console.log(location)

    ManageSession.previousLocation = this.scene.key
    ManageSession.currentLocation = location

    this.physics.pause()
    this.player.setTint(0xff0000)

    //player has to explicitly leave the stream it was in!
    console.log("leave, this.location")
    console.log(this.location)
    ManageSession.socket.rpc("leave", this.location)

    this.player.location = location
    console.log("this.player.location:")
    console.log(location)

    setTimeout(() => {
      ManageSession.location = location
      ManageSession.createPlayer = true
      ManageSession.getStreamUsers("join", location)
      this.scene.stop(this.scene.key)
      this.scene.start(location)
    }, 1000)

  }

  update(time, delta) {
    //...... ONLINE PLAYERS ................................................
    Player.loadOnlinePlayers(this)
    Player.receiveOnlinePlayersMovement(this)
    Player.loadOnlineAvatar(this)

    this.gameCam.zoom = this.UI_Scene.currentZoom;
    //.......................................................................

    //........... PLAYER SHADOW .............................................................................
    this.playerShadow.x = this.player.x + this.playerShadowOffset
    this.playerShadow.y = this.player.y + this.playerShadowOffset
    //........... end PLAYER SHADOW .........................................................................

    //.......... UPDATE TIMER      ..........................................................................
    ManageSession.updateMovementTimer += delta;
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
    Player.moveBySwiping(this)

  } //update
} //class
