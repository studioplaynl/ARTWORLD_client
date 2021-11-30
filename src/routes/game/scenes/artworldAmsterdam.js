import { CONFIG } from "../config.js";
import manageSession from "../manageSession"
import { getAccount } from '../../../api.js'

import playerDefault from '../class/playerDefault'
import playerDefaultShadow from '../class/playerDefaultShadow'
import playerLoadOnlineAvatar from '../class/playerLoadOnlineAvatar.js'
import onlinePlayerLoader from '../class/onlinePlayer.js'
import preloader from '../preLoader.js'
import bouncingBird from "../class/bouncingBird.js"
import background from "../class/backgroud.js"
import debugFunctions from "../class/debugFunctions.js"
import playerMoving from "../class/playerMoving.js"

export default class artworldAmsterdam extends Phaser.Scene {

  constructor() {
    super("artworldAmsterdam");

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
    this.playerAvatarPlaceholder = "playerAvatar"
    this.playerAvatarKey = ""
    this.createdPlayer = false
    this.playerMovingKey = "moving"
    this.playerStopKey = "stop"

    this.offlineOnlineUsers

    this.location = "artworldAmsterdam"

    //.......................REX UI ............
    this.COLOR_PRIMARY = 0xff5733
    this.COLOR_LIGHT = 0xffffff
    this.COLOR_DARK = 0x000000
    this.data
    //....................... end REX UI ......

    this.cursors
    this.pointer
    this.isClicking = false
    this.arrowDown = false
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
    preloader.Loading(this) //.... PRELOADER VISUALISER
  }

  async create() {
    //timers
    manageSession.updateMovementTimer = 0;
    manageSession.updateMovementInterval = 60; //1000 / frames =  millisec

    //.......  LOAD PLAYER AVATAR ..........................................................................
    manageSession.createPlayer = true
    console.log("manageSession.createPlayer: ")
    console.log(manageSession.createPlayer)
    //....... end LOAD PLAYER AVATAR .......................................................................

    background.repeatingDots({ scene: this, gridOffset: 50, dotWidth: 2, dotColor: 0x909090, backgroundColor: 0xFFFFFF})

    //.......  PLAYER ..........................................................................
    //set playerAvatarKey to a placeholder, so that the player loads even when the networks is slow, and the dependencies on player will funciton
    this.playerAvatarPlaceholder = "avatar1";
    this.playerMovingKey = "moving"
    this.playerStopKey = "stop"

    //*create deafult player and playerShadow
    this.player = new playerDefault(this, 300, 800, this.playerAvatarPlaceholder)
    this.playerShadow = new playerDefaultShadow({ scene: this, texture: this.playerAvatarPlaceholder })

    //create player group
    this.playerGroup = this.add.group();
    this.playerGroup.add(this.player);
    this.playerGroup.add(this.playerShadow);
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
    this.locationDialogBoxContainersGroup = this.add.group();
    this.generateLocations()
    //.......... end locations .........................................

    bouncingBird.generate({ scene: this, birdX: 200, birdY: 200, birdScale: 1.2 })

    //......... DEBUG FUNCTIONS ............................................................................
    debugFunctions.keyboard(this);
    //this.createDebugText();
    //......... end DEBUG FUNCTIONS .........................................................................

    //......... UI Scene  ...............................................
    this.UI_Scene = this.scene.get("UI_Scene")
    this.scene.launch("UI_Scene")
    this.currentZoom = this.UI_Scene.currentZoom
    this.UI_Scene.location = this.location
    this.gameCam.zoom = this.currentZoom
    //console.log(this.UI_Scene)
    //console.log(this.currentZoom)
    //......... end UI Scene ............................................

    // temp location
    


  }



  generateLocations() {
    //........ location1 ...................
    this.location1 = this.add.isotriangle(100, 600, 150, 150, false, 0x8dcb0e, 0x3f8403, 0x63a505);
    this.physics.add.existing(this.location1);
    this.location1.body.setSize(this.location1.width, this.location1.height)
    this.location1.body.setOffset(0, -(this.location1.height / 4))
    //can't set ositriangle to immmovable
    //this.location1.setImmovable(true)

    // this.location1.setData("entered", false)
    // this.location1.setName("location1")

    this.createLocationDialogbox("location1", 200, 150)
  }

  createLocationDialogbox(locationName, mainWidth, mainHeight) {
    let location = "this." + locationName
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
    const locationScene = location + "_Scene"
    console.log("location scene")
    console.log(locationScene)
    console.log()


    this.physics.pause()
    this.player.setTint(0xff0000)

    //player has to explicitly leave the stream it was in!
    console.log("leave, this.location")
    console.log(this.location)
    manageSession.socket.rpc("leave", this.location)

    this.player.location = location
    console.log("this.player.location:")
    console.log(location)

    setTimeout(() => {
      manageSession.location = location
      manageSession.createPlayer = true
      manageSession.getStreamUsers("join", location)
      this.scene.start(locationScene)
    }, 1000)


  }

  sendPlayerMovement() {
    if (this.createdPlayer) {
      if (
        manageSession.updateMovementTimer > manageSession.updateMovementInterval
      ) {
        manageSession.sendMoveMessage(Math.round(this.player.x), Math.round(this.player.y));
        //console.log(this.player.x)
        manageSession.updateMovementTimer = 0;
      }
      // this.scrollablePanel.x = this.player.x
      // this.scrollablePanel.y = this.player.y + 150
    }
  }

  updateMovementOnlinePlayers() {
    if (manageSession.updateOnlinePlayers) {
      if (!manageSession.createPlayer) {
        if (manageSession.allConnectedUsers != null && manageSession.allConnectedUsers.length > 0) {

          manageSession.allConnectedUsers.forEach(player => {
            // const playerID = player.user_id
            // const found = manageSession.allConnectedUsers.some(user => user.user_id === playerID)
            // if (found) {console.log(player)}

            let tempPlayer = this.onlinePlayers.find(o => o.user_id === player.user_id);
            if (typeof tempPlayer !== 'undefined') {

              tempPlayer.x = player.posX;
              tempPlayer.y = player.posY;

              const movingKey = tempPlayer.getData("movingKey")

              //get the key for the moving animation of the player, and play it
              tempPlayer.anims.play(movingKey, true);

              setTimeout(() => {
                tempPlayer.anims.play(tempPlayer.getData("stopKey"), true);
              }, 500);
            }

          })

          manageSession.updateOnlinePlayers = false;
        }
      }
    }
  }

  update(time, delta) {
    //...... ONLINE PLAYERS ................................................
    // this.createOnlinePlayers()
    onlinePlayerLoader.load(this)
    this.updateMovementOnlinePlayers()
    playerLoadOnlineAvatar.loadAvatar(this)

    this.gameCam.zoom = this.UI_Scene.currentZoom;

    //.......................................................................

    //........... PLAYER SHADOW .............................................................................
    this.playerShadow.x = this.player.x + this.playerShadowOffset
    this.playerShadow.y = this.player.y + this.playerShadowOffset
    //........... end PLAYER SHADOW .........................................................................

    //.......... UPDATE TIMER      ..........................................................................
    manageSession.updateMovementTimer += delta;
    // console.log(time) //running time in millisec
    // console.log(delta) //in principle 16.6 (60fps) but drop to 41.8ms sometimes
    //....... end UPDATE TIMER  ..............................................................................

    //........ PLAYER MOVE BY KEYBOARD  ......................................................................
    if (!this.playerIsMovingByClicking) {
      playerMoving.byKeyboard(this) //player moving with keyboard with playerMoving Class
    }

    if (
      this.cursors.up.isDown ||
      this.cursors.down.isDown ||
      this.cursors.left.isDown ||
      this.cursors.right.isDown
    ) {
      this.arrowDown = true
    } else {
      this.arrowDown = false
    }
    //....... end PLAYER MOVE BY KEYBOARD  ..........................................................................

    //....... moving ANIMATION ......................................................................................
    if (this.arrowDown || this.playerIsMovingByClicking) {
      this.player.anims.play(this.playerMovingKey, true);
      this.playerShadow.anims.play(this.playerMovingKey, true);
    } else if (!this.arrowDown || !this.playerIsMovingByClicking) {
      this.player.anims.play(this.playerStopKey, true);
      this.playerShadow.anims.play(this.playerStopKey, true);
    }
    //....... end moving ANIMATION .................................................................................

    //this.playerMovingByClicking()
    playerMoving.bySwiping(this)

  } //update
} //class
