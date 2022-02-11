import { CONFIG } from "../config.js"
import ManageSession from "../ManageSession"
import PlayerDefault from '../class/PlayerDefault'
import PlayerDefaultShadow from "../class/PlayerDefaultShadow.js"
import Player from '../class/Player.js'
import DebugFuntions from "../class/DebugFuntions.js"
import CoordinatesTranslator from "../class/CoordinatesTranslator.js"
import GenerateLocation from "../class/GenerateLocation.js"
import HistoryTracker from "../class/HistoryTracker"
import TestLoader from "../class/TestLoader.js"
import Move from "../class/Move.js"

//import { getAvatar } from '../../profile.svelte'
import { getAccount, listImages } from '../../../api.js'

import { compute_slots } from "svelte/internal"
import { location } from "svelte-spa-router"

export default class Location4 extends Phaser.Scene {
  constructor() {
    super("Location4");

    this.worldSize = new Phaser.Math.Vector2(3000, 3000)

    this.debug = false

    this.gameStarted = false;
    this.phaser = this;
    // this.playerPos;
    this.onlinePlayers = [];
    this.newOnlinePlayers = []

    this.currentOnlinePlayer;
    this.avatarName = [];
    this.tempAvatarName = ""
    this.loadedAvatars = [];

    this.player
    this.playerShadow
    this.playerContainer
    this.playerAvatarPlaceholder = "playerAvatar";
    this.playerAvatarKey = ""
    this.createdPlayer = false;
    this.playerMovingKey = "moving";
    this.playerStopKey = "stop";

    this.offlineOnlineUsers

    this.location = "Location4"

    this.cursors;
    this.pointer;
    this.isClicking = false;
    this.arrowDown = false;
    this.swipeDirection = "down"
    this.swipeAmount = new Phaser.Math.Vector2(0, 0)
    this.graffitiDrawing = false

    //pointer location example
    // this.source // = player
    this.target = new Phaser.Math.Vector2();
    this.distance;

    //shadow
    this.playerShadowOffset = -8;
    this.playerIsMovingByClicking = false;

    this.currentZoom
    this.UI_Scene

  }

  async preload() {

    // loading bar
    TestLoader.run(this)

    //....... IMAGES ......................................................................
    let userID = ManageSession.sessionStored.user_id
    let drawings = await listImages("drawing", userID, 10)

    //exhibition
    this.load.image("exhibit1", "./assets/art_styles/drawing_painting/699f77a8e723a41f0cfbec5434e7ac5c.jpg")
    // this.load.image("exhibit1", "./assets/art_styles/people/04b49a9aa5f7ada5d8d96deba709c9d4.jpg")
    this.load.image("exhibit2", "./assets/art_styles/repetition/4c15d943b5b4993b42917fbfb5996c1f.jpg")
    this.load.image("exhibit3", "./assets/art_styles/repetition/dd5315e5a77ff9601259325341a0bca9.jpg")
    this.load.image("exhibit4", "./assets/art_styles/people/28bc857da206c33c5f97bfbcf40e9970.jpg")


    //this.load.video('videoFile', './assets/video/kunstlab_vrolijkheid.mp4', 'loadeddata', false, true);
    //....... end IMAGES ......................................................................


    //set rpc location
    // ManageSession.location = "Location4"
    // await ManageSession.createSocket();

    console.log(drawings)
  }

  async create() {

    // for back button
    HistoryTracker.locationPush(this);

    //timers
    ManageSession.updateMovementTimer = 0;
    ManageSession.updateMovementInterval = 60; //1000 / frames =  millisec

    //.......  SOCKET ..........................................................................
    this.playerIdText = ManageSession.userProfile.id;

    // ManageSession.playerObjectSelf = JSON.parse(localStorage.getItem("profile"));
    // console.log("ManageSession.playerObjectSelf")
    // console.log(ManageSession.playerObjectSelf)
    ManageSession.createPlayer = true
    // console.log("ManageSession.createPlayer: ")
    // console.log(ManageSession.createPlayer)

    //ManageSession.createSocket();
    //....... end SOCKET .......................................................................

    this.generateBackground()
    //.......  PLAYER ..........................................................................
    this.playerAvatarPlaceholder = "avatar1";
    this.player = new PlayerDefault(this, CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 0), CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 0), this.playerAvatarPlaceholder)

    this.playerShadow = new PlayerDefaultShadow({ scene: this, texture: this.playerAvatarPlaceholder })

    //create player group
    this.playerGroup = this.add.group();
    this.playerGroup.add(this.player);
    this.playerGroup.add(this.playerShadow);

    //set playerAvatarKey to a placeholder, so that the player loads even when the networks is slow, and the dependencies on player will funciton

    // //1
    // this.player = this.physics.add
    //   .sprite(spawnPoint.x, spawnPoint.y, this.playerAvatarPlaceholder)
    //   .setDepth(101);
    // //end 1

    //2
    // this.player = this.physics.add
    //   .sprite(300, 800, this.playerAvatarPlaceholder)
    //   .setDepth(101);
    this.onlinePlayersGroup = this.add.group();
    // this.player.body.onOverlap = true;
    //end 2

    // this.playerShadow = this.add.sprite(this.player.x + this.playerShadowOffset, this.player.y + this.playerShadowOffset, this.playerAvatarPlaceholder).setDepth(100);

    // this.playerShadow.anchor.set(0.5);
    // this.playerShadow.setTint(0x000000);
    // this.playerShadow.alpha = 0.2;


    //this.player.setCollideWorldBounds(true); // if true the map does not work properly, needed to stay on the map

    //  Our player animations, turning, walking left and walking right.
    // this.playerMovingKey = "moving"
    // this.playerStopKey = "stop"

    // this.anims.create({
    //   key: this.playerMovingKey,
    //   frames: this.anims.generateFrameNumbers("avatar1", { start: 0, end: 8 }),
    //   frameRate: 20,
    //   repeat: -1,
    // });

    // this.anims.create({
    //   key: this.playerStopKey,
    //   frames: this.anims.generateFrameNumbers("avatar1", { start: 4, end: 4 }),
    // });
    //.......  end PLAYER .............................................................................

    //....... onlinePlayers ...........................................................................

    //....... end onlinePlayers .......................................................................

    //....... PLAYER VS WORLD ..........................................................................
    this.gameCam = this.cameras.main //.setBackgroundColor(0xFFFFFF);

    //setBounds has to be set before follow, otherwise the camera doesn't follow!

    // grid
    this.gameCam.setBounds(0, 0, this.worldSize.x, this.worldSize.y);
    this.gameCam.zoom = 1
    // end grid
    this.gameCam.startFollow(this.player);

    //this.player.setCollideWorldBounds(true);

    //......... end PLAYER VS WORLD ......................................................................

    //......... INPUT ....................................................................................
    this.cursors = this.input.keyboard.createCursorKeys();
    //.......... end INPUT ................................................................................

    this.locationDialogBoxContainersGroup = this.add.group();


    // this.generateLocations()

    this.add.image(200, 200, "exhibit1").setOrigin(0).setScale(.53)
    this.add.image(600, 200, "exhibit2").setOrigin(0).setScale(.45)
    this.add.image(1000, 200, "exhibit3").setOrigin(0).setScale(.55)
    this.add.image(1400, 200, "exhibit4").setOrigin(0).setScale(.6)

    let platforms = this.physics.add.staticGroup();

    platforms.create(1300, 1300, 'ground').setScale(2).refreshBody()
    platforms.create(300, 1300, 'ground').setScale(2).refreshBody()

    this.physics.add.collider(this.player, platforms);
    //this.generateBouncingBird()

    //......... DEBUG FUNCTIONS ............................................................................
    DebugFuntions.keyboard(this)
    //this.createDebugText();
    //......... end DEBUG FUNCTIONS .........................................................................

    this.UI_Scene = this.scene.get("UI_Scene")
    this.scene.launch("UI_Scene")
    this.currentZoom = this.UI_Scene.currentZoom
    this.UI_Scene.location = this.location

    this.gameCam.zoom = this.currentZoom

  } // end create

  generateBouncingBird() {
    var container = this.add.container();
    var leg1 = this.add.isobox(415, 340, 10, 50, 0xffe31f, 0xf2a022, 0xf8d80b);
    var leg2 = this.add.isobox(390, 350, 10, 50, 0xffe31f, 0xf2a022, 0xf8d80b);
    var body1 = this.add.isobox(360, 288, 50, 22, 0x00b9f2, 0x016fce, 0x028fdf);
    var body2 = this.add.isobox(400, 300, 80, 80, 0x00b9f2, 0x016fce, 0x028fdf);
    var beak = this.add.isobox(430, 270, 40, 10, 0xffe31f, 0xf2a022, 0xf8d80b);
    var eye = this.add.isobox(394, 255, 30, 15, 0xffffff, 0xffffff, 0xffffff).setFaces(false, true, false);
    var pupil = this.add.isobox(391, 255, 15, 10, 0x000000, 0x000000, 0x000000).setFaces(false, true, false);
    var wing = this.add.isobox(366, 300, 50, 10, 0x00b9f2, 0x016fce, 0x028fdf);
    container.add([leg1, leg2, body1, body2, beak, eye, pupil, wing]);
    container.x = 900;
    container.y = 400;
    container.setScale(1.5);

    this.tweens.add({
      targets: container,
      y: '-=160',
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  generateLocations() {
    // //this.location2 = this.physics.add.staticGroup();
    // this.location2 = this.physics.add.image(400, 600, "ball").setScale(0.4).setDepth(50)
    // this.location2.body.setCircle(190, 12, 12)
    // this.location2.setImmovable(true)

    // // this.location2.setData("entered", false)
    // // this.location2.setName("Location2")
    // this.createLocationDialogbox("Location2", 200, 150)


    // //........ location3 ...................
    // this.location3 = this.add.isotriangle(900, 900, 150, 150, false, 0x8dcb0e, 0x3f8403, 0x63a505);
    // this.physics.add.existing(this.location3);
    // this.location3.body.setSize(this.location3.width, this.location3.height)
    // this.location3.body.setOffset(0, -(this.location3.height / 4))
    // //can't set ositriangle to immmovable
    // //this.location3.setImmovable(true)

    // // this.location3.setData("entered", false)
    // // this.location3.setName("Location3")

    // this.createLocationDialogbox("Location3", 200, 150)

    //........ location1 ...................
    // this.location1 = this.add.isobox(200, 1200, 100, 150, 0xffe31f, 0xf2a022, 0xf8d80b);
    // this.physics.add.existing(this.location1);
    // this.location1.body.setSize(this.location1.width, this.location1.height * 1.4)
    // this.location1.body.setOffset(0, -(this.location1.height / 1.4))
    // //this.location4.setImmovable(true)
    // this.createLocationDialogbox("Location1", 200, 150)
  }

  // createLocationDialogbox(locationName, mainWidth, mainHeight) {
  //   let location = "this." + locationName
  //   location = eval(location)

  //   location.setData("entered", false)
  //   // location.setName(locationName)

  //   //create variable for the text of the dialog box, set the text after
  //   let nameText = "this." + location.name + "DialogBox"
  //   nameText = this.add.text(mainWidth - 60, mainHeight - 30, locationName, { fill: '#000' })

  //   //create variable to hold dialogbox graphics
  //   let nameBox = "this." + location.name + "DialogBox"

  //   //background panel for dialogbox
  //   nameBox = this.add.graphics();
  //   nameBox.fillStyle(0xfffff00, 0.4)
  //   nameBox.fillRoundedRect(0, 0, mainWidth, mainHeight, 32)
  //   nameBox.setVisible(false)

  //   //create variable for texture that holds the graphics and the clickable area for the dialogbox
  //   let nameTexture = "this." + location.name + "Texture"

  //   nameTexture = this.add.renderTexture(0, 0, mainWidth, mainHeight);
  //   nameTexture.draw(nameBox);
  //   nameTexture.setInteractive(new Phaser.Geom.Rectangle(0, 0, mainWidth, mainWidth), Phaser.Geom.Rectangle.Contains)
  //   nameTexture.on('pointerdown', () => { this.enterLocationScene(location.name) });

  //   //create container that holds all of the dialogbox: can be moved and hidden
  //   let nameContainer = "this." + location.name + "DialogBoxContainer"

  //   // nameContainer = this.add.container(location.x - (mainWidth / 2), location.y - (mainHeight / 2), [nameTexture, nameText]).setDepth(900)
  //   nameContainer = this.add.container(location.body.x + (location.body.width / 4), location.body.y + (location.body.height / 4), [nameTexture, nameText]).setDepth(900)

  //   nameContainer.setVisible(false)
  //   nameContainer.setName(location.name)

  //   //add everything to the container
  //   this.locationDialogBoxContainersGroup.add(nameContainer);

  //   //call overlap between player and the location, set the callback function and scope
  //   this.physics.add.overlap(this.player, location, this.confirmEnterLocation, null, this)
  // }

  // confirmEnterLocation(player, location, show) {
  //   if (!location.getData("entered")) {
  //     //start event
  //     show = false
  //     this.time.addEvent({ delay: 2000, callback: this.enterLocationDialogBox, args: [player, location, show], callbackScope: this, loop: false })

  //     //show the box
  //     show = true
  //     this.enterLocationDialogBox(player, location, show)
  //     location.setData("entered", true)
  //   }
  // }

  // enterLocationDialogBox(player, location, show) {
  //   let container = "this." + location.name + "DialogBoxContainer"
  //   container = eval(container)

  //   let nameContainer = location.name
  //   let search = { name: location }

  //   container = Phaser.Actions.GetFirst(this.locationDialogBoxContainersGroup.getChildren(), { name: nameContainer });

  //   if (show) {
  //     container.setVisible(show)
  //   } else {
  //     container.setVisible(show)
  //     location.setData("entered", show)
  //   }
  // }

  // enterLocationScene(location) {
  //   this.physics.pause()
  //   this.player.setTint(0xff0000)

  //   //player has to explicitly leave the stream it was in!
  //   ManageSession.socket.rpc("leave", this.location)

  //   console.log(this.location)

  //   this.player.location = location
  //   console.log("this.player.location:")
  //   console.log(this.player.location)

  //   setTimeout(() => {
  //     ManageSession.location = location

  //     console.log(ManageSession.location)
  //     ManageSession.createPlayer = true
  //     ManageSession.getStreamUsers("join", location)
  //     this.scene.start(location)
  //   }, 1000)
  // }

  generateBackground() {
    //fill in textures
    let background = this.add.rectangle(0, 0, 6000, 6000, 0xFFFFFF)

    let cross = [
      '.....',
      '..1..',
      '.111.',
      '..1..',
      '.....',

    ]

    //generate the texture from the array
    this.textures.generate('cross', { data: cross, pixelWidth: 3 });

    //display the texture on an image
    const gridWidth = 4000
    const offset = 50

    for (let i = 0; i < gridWidth; i += offset) {
      for (let j = 0; j < gridWidth; j += offset) {
        this.add.image(i, j, 'cross').setOrigin(0, 1);
      }
    }

    // this.add.image(0, 200, "background4").setOrigin(0,0).setScale(1.3)
    //this.add.image(0, -300, "background5").setOrigin(0, 0).setScale(1)

    // let graphics = this.add.graphics();

    // graphics.fillStyle(0x0000ff, 1);

    // graphics.fillCircle(800, 300, 200);

    // for (let i = 0; i < 250; i += 60) {
    //   graphics.lineStyle(5, 0xFF00FF, 1.0);
    //   graphics.beginPath();
    //   graphics.moveTo(800, 200 + i);
    //   graphics.lineTo(1200, 200 + i);
    //   graphics.closePath();
    //   graphics.strokePath();
    // }

    // for (let i = 0; i < 250; i += 60) {
    //   graphics.lineStyle(5, 0xFF00FF, 1.0);
    //   graphics.beginPath();
    //   graphics.moveTo(900 + i, 150);
    //   graphics.lineTo(900 + i, 550);
    //   graphics.closePath();
    //   graphics.strokePath();
    // }

    // let rectangle = this.add.graphics();
    // rectangle.setVisible(false);
    // rectangle.fillGradientStyle(0xff0000, 0xff0000, 0xffff00, 0xffff00, 1);
    // rectangle.fillRect(0, 0, 400, 400);

    // let rt = this.add.renderTexture(200, 100, 600, 600);
    // let rt2 = this.add.renderTexture(100, 600, 600, 600);

    // rt.draw(rectangle);
    // rt2.draw(rectangle);

    // let eraser = this.add.circle(0, 0, 190, 0x000000);
    // eraser.setVisible(false);

    // rt.erase(eraser, 200, 200);

    // rt2.erase(rt, 0, 0)

    // rt2.x = 400
    // rt2.y = 600

    //end fill in textures
  }

  generateTileMap() {
    //....... TILEMAP .............................................................................
    // // 2
    // const map = this.make.tilemap({ key: "map" });
    // // end 2

    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)
    //     //1
    //      const tileset = map.addTilesetImage("tuxmon-sample-32px-extruded", "tiles");


    //     // Parameters: layer name (or index) from Tiled, tileset, x, y

    //     const belowLayer = map.createLayer("Below Player", tileset, 0, 0);
    //     const worldLayer = map.createLayer("World", tileset, 0, 0);
    //     const aboveLayer = map.createLayer("Above Player", tileset, 0, 0);

    //     worldLayer.setCollisionByProperty({ collides: true });

    //     // By default, everything gets depth sorted on the screen in the order we created things. Here, we
    //     // want the "Above Player" layer to sit on top of the player, so we explicitly give it a depth.
    //     // Higher depths will sit on top of lower depth objects.
    //     aboveLayer.setDepth(10);

    //     // Object layers in Tiled let you embed extra info into a map - like a spawn point or custom
    //     // collision shapes. In the tmx file, there's an object layer with a point named "Spawn Point"
    //     const spawnPoint = map.findObject(
    //       "Objects",
    //       (obj) => obj.name === "Spawn Point"
    //     );
    // //end 1

    // //2
    // const tileset = map.addTilesetImage("64x64dot", "tiles");

    // const aboveLayer = map.createLayer("Tile Layer 1", tileset, 0, 0);
    // aboveLayer.setDepth(10);
    // // end 2

    // const worldLayer = map.createLayer("World", tileset, 0, 0);
    // const aboveLayer = map.createLayer("Above Player", tileset, 0, 0);

    // worldLayer.setCollisionByProperty({ collides: true });

    // const spawnPoint = map.findObject(
    //   "Objects",
    //   (obj) => obj.name === "Spawn Point"
    // );
    //ed

    //....... end TILEMAP ......................................................................
  }

  loadAndCreatePlayerAvatar() {
    //check if account info is loaded
    if (ManageSession.sessionStored.user_id != null) {
      //check for createPlayer flag
      if (ManageSession.createPlayer) {
        ManageSession.createPlayer = false;
        //console.log("ManageSession.createPlayer = false;")

        //set the location of the player to this location

        this.createdPlayer = false;

        //console.log("loadAndCreatePlayerAvatar")

        // is playerAvaterKey already in loadedAvatars?
        //no -> load the avatar and add to loadedAvatars
        //yes -> dont load the avatar

        this.playerAvatarKey = ManageSession.playerObjectSelf.id + "_" + ManageSession.playerObjectSelf.create_time
        // console.log(this.playerAvatarKey)
        // console.log("this.textures.exists(this.playerAvatarKey): ")
        // console.log(this.textures.exists(this.playerAvatarKey))

        //if the texture already exists attach it again to the player
        if (!this.textures.exists(this.playerAvatarKey)) {
          //check if url is not empty for some reason, returns so that previous image is kept
          if (ManageSession.playerObjectSelf.url === "") {
            console.log("avatar url is empty")
            ManageSession.createPlayer = false;
            console.log("ManageSession.createPlayer = false;")
            this.createdPlayer = true;
            console.log("this.createdPlayer = true;")
            return
          } else {
            // console.log(" loading: ManageSession.playerObjectSelf.url: ")
            // console.log(ManageSession.playerObjectSelf.url)

            this.load.spritesheet(
              this.playerAvatarKey,
              ManageSession.playerObjectSelf.url, { frameWidth: 128, frameHeight: 128 }
            );

            this.load.once(Phaser.Loader.Events.COMPLETE, () => {
              console.log("loadAndCreatePlayerAvatar complete")
              if (this.textures.exists(this.playerAvatarKey)) {

                this.attachtAvatarToPlayer()

              }// if (this.textures.exists(this.playerAvatarKey)) 
            })
          }

          this.load.start(); // load the image in memory
          //console.log("this.load.start();");

        } else {
          this.attachtAvatarToPlayer()
        }
      }//if(ManageSession.playerCreated)
    }
  }

  attachtAvatarToPlayer() {
    const avatar = this.textures.get(this.playerAvatarKey)
    const avatarWidth = avatar.frames.__BASE.width
    const avatarHeight = avatar.frames.__BASE.height

    const avatarFrames = Math.round(avatarWidth / avatarHeight)
    //console.log("avatarFrames: " + avatarFrames)

    //make an animation if the image is wider than tall
    if (avatarFrames > 1) {
      //.. animation for the player avatar ............................................

      this.playerMovingKey = "moving" + "_" + this.playerAvatarKey;
      this.playerStopKey = "stop" + "_" + this.playerAvatarKey;

      this.anims.create({
        key: this.playerMovingKey,
        frames: this.anims.generateFrameNumbers(this.playerAvatarKey, { start: 0, end: avatarFrames - 1 }),
        frameRate: (avatarFrames + 2) * 2,
        repeat: -1,
        yoyo: true
      });

      this.anims.create({
        key: this.playerStopKey,
        frames: this.anims.generateFrameNumbers(this.playerAvatarKey, { start: 0, end: 0 }),
      });

      //.. end animation for the player avatar ............................................
    }

    // texture loaded so use instead of the placeholder
    this.player.setTexture(this.playerAvatarKey)

    this.playerShadow.setTexture(this.playerAvatarKey)

    //scale the player to 68px
    const width = 128
    this.player.displayWidth = width
    this.player.scaleY = this.player.scaleX

    this.playerShadow.displayWidth = width
    this.playerShadow.scaleY = this.playerShadow.scaleX

    //set the collision body
    const portionWidth = width / 3
    this.player.body.setCircle(portionWidth, portionWidth / 4, portionWidth / 4)


    //place the player in the last known position
    // this.player.x = this.player.posX
    // this.player.y = this.player.posY

    // console.log("player avatar has loaded ")
    // console.log("this.playerAvatarKey")
    // console.log(this.playerAvatarKey)
    this.player.location = this.location

    console.log("this.player: ")
    console.log(this.player)

    this.createdPlayer = true;
    // console.log("this.createdPlayer = true;")

    //send the current player position over the network
    ManageSession.sendMoveMessage(Math.round(this.player.x), Math.round(this.player.y));
  }

  createDebugText() {
    this.headerText = this.add
      .text(CONFIG.WIDTH / 2, 20, "", {
        fontFamily: "Arial",
        fontSize: "36px",
      })
      .setOrigin(0.5)
      .setScrollFactor(0) //fixed on screen
      .setShadow(3, 3, '#000000', 0)
      .setDepth(1000);

    this.add
      .text(
        this.headerText.x,
        this.headerText.y,
        "user_id: " + this.playerIdText,
        {
          fontFamily: "Arial",
          fontSize: "16px",
        }
      )
      .setOrigin(0.5)
      .setScrollFactor(0) //fixed on screen
      .setInteractive() //make clickable
      .setShadow(1, 1, '#000000', 0)
      .setDepth(1000);


    this.opponentsIdText = this.add
      .text(this.headerText.x, this.playerIdText.y + 14, "", {
        fontFamily: "Arial",
        fontSize: "11px",
      })
      .setOrigin(0.5)
      .setScrollFactor(0) //fixed on screen
      .setDepth(1000);

    this.allConnectedUsersText = "onlineUsers[ ]: " + JSON.parse(ManageSession.allConnectedUsers)

    this.add.text(110, 20, this.allConnectedUsersText, { fontFamily: "Arial", fontSize: "22px" })
      .setOrigin(0.5)
      .setScrollFactor(0) //fixed on screen
      .setShadow(1, 1, '#000000', 0)
      .setDepth(1000);

    this.allConnectedUsersText2 = this.add.text(110, 40, "", { fontFamily: "Arial", fontSize: "22px" })
      .setOrigin(0.5)
      .setScrollFactor(0) //fixed on screen
      .setShadow(1, 1, '#000000', 0)
      .setDepth(1000);

    this.onlinePlayersText = this.add.text(110, 70, "onlinePlayers[ ]", { fontFamily: "Arial", fontSize: "22px" })
      .setOrigin(0.5)
      .setScrollFactor(0) //fixed on screen
      .setShadow(1, 1, '#000000', 0)
      .setDepth(300);

    this.onlinePlayersText2 = this.add.text(110, 90, "", { fontFamily: "Arial", fontSize: "22px" })
      .setOrigin(0.5)
      .setScrollFactor(0) //fixed on screen
      .setShadow(1, 1, '#000000', 0)
      .setDepth(1000);


    this.onlinePlayersGroupText = this.add.text(110, 120, "playersGroup[ ]", { fontFamily: "Arial", fontSize: "22px" })
      .setOrigin(0.5)
      .setScrollFactor(0) //fixed on screen
      .setShadow(1, 1, '#000000', 0)
      .setDepth(1000);

    this.onlinePlayersGroupText2 = this.add.text(110, 140, "", { fontFamily: "Arial", fontSize: "22px" })
      .setOrigin(0.5)
      .setScrollFactor(0) //fixed on screen
      .setShadow(1, 1, '#000000', 0)
      .setDepth(1000);

  }

  createOnlinePlayers() {
    //ManageSession.connectedOpponents //list of the opponents
    //for each of the opponents, attach a png,

    //TODO loading is broken, so I'm checking if the player avater has already loaded, after that I load onlineUsers
    if (this.createdPlayer) {
      //first check if onlineplayers need to be created
      if (ManageSession.createOnlinePlayers) {
        console.log("creating onlineplayer")
        ManageSession.createOnlinePlayers = false

        //ManageSession.allConnnectedUsers are all the users that are in the stream, we first have to load the new arrivals: this.newOnlinePlayers
        this.newOnlinePlayers = []

        if (this.debug) {
          console.log("")
          console.log("createOnlinePlayers...");
        }

        //all current onlinePlayers, or an empty []
        this.onlinePlayers = this.onlinePlayersGroup.getChildren() || []

        // ..... DESTROY OFFLINE PLAYERS ........................................................................................................................................................................
        //check if there are players in this.onlinePlayers that are not in .allConnectedUsers ->  they need to be destroyed
        this.offlineOnlineUsers = []

        this.onlinePlayers.forEach(player => {
          const playerID = player.user_id
          const found = ManageSession.allConnectedUsers.some(user => user.user_id === playerID)
          if (!found) this.offlineOnlineUsers.push(player)
        })

        if (this.debug) {
          console.log("this.offlineOnlineUsers")
          console.log(this.offlineOnlineUsers)
        }

        //players in this.onlinePlayers that are not in .allConnectedUsers -> they need to be deactivated and hidden
        if (this.offlineOnlineUsers.length > 0) {
          //hide users
          if (this.debug) {
            console.log("")
            console.log("# Players that are not online anymore")
          }



          for (let i = 0; i < this.offlineOnlineUsers.length; i++) {
            //check if the user_id is in this.onlinePlayers
            console.log(this.offlineOnlineUsers[i])
            this.offlineOnlineUsers[i].destroy()

            //get the index of user_id from this.offlineOnlineUsers[i].user_id in this.onlinePlayers and deactivate them in this.onlinePlayers
            // let index = this.onlinePlayers.findIndex(function (person) {
            //   return person.user_id == this.offlineOnlineUsers[i].user_id
            // });

            // this.onlinePlayers[index].active = false
            // this.onlinePlayers[index].visible = false
            // if (this.debug) {
            //   console.log("deactivated and hidden User: ")
            //   console.log(this.onlinePlayers[index])
            //   console.log("")
            // }
          }

        }
        //......... end DESTROY OFFLINE PLAYERS ............................................................................................................................................................


        //...... LOAD NEW PLAYERS ........................................................................................
        //(new) players present in .allConnectedUsers but not in this.onlinePlayers ->load their avatar and animation
        this.newOnlinePlayers = []
        ManageSession.allConnectedUsers.forEach(player => {
          const playerID = player.user_id
          const found = this.onlinePlayers.some(user => user.user_id === playerID)
          if (!found) this.newOnlinePlayers.push(player)
        })
        if (this.debug) {
          console.log("  ")
          console.log("new Online Players")
          console.log(newOnlinePlayers)
          console.log("  ")
        }

        //load the spritesheet for the new online user //give the online player a placeholder avatar
        this.newOnlinePlayers.forEach((element, i) => {

          let elementCopy = element
          // console.log("elementCopy: ")
          // console.log(elementCopy)
          //a new user
          this.tempAvatarName = element.user_id + "_" + element.avatar_time;

          //if the texture already exists attach it again to the player
          if (!this.textures.exists(this.tempAvatarName)) {

            //add it to loading queue
            this.load.spritesheet(this.tempAvatarName, element.avatar_url, { frameWidth: 128, frameHeight: 128 })

            if (this.debug) {
              console.log("loading: ")
              console.log(this.tempAvatarName)
            }

            console.log("give the online player a placeholder avatar first")
            //give the online player a placeholder avatar first
            element = this.add.sprite(element.posX, element.posY, this.playerAvatarPlaceholder)
              .setDepth(90)

            element.setData("movingKey", "moving");
            element.setData("stopKey", "stop");

            //create animation for moving
            this.anims.create({
              key: element.getData("movingKey"),
              frames: this.anims.generateFrameNumbers(this.playerAvatarPlaceholder, { start: 0, end: 8 }),
              frameRate: 20,
              repeat: -1,
            });

            //create animation for stop
            this.anims.create({
              key: element.getData("stopKey"),
              frames: this.anims.generateFrameNumbers(this.playerAvatarPlaceholder, { start: 4, end: 4 }),
            });

            Object.assign(element, elementCopy); //add all data from elementCopy to element; like prev Position, Location, UserID
            element.x = element.posX
            element.y = element.posY

            // add new player to group
            this.onlinePlayersGroup.add(element)
          } else {
            //! if the avatar already existed; get the player from the onlinePlayers array !

            //this.attachtAvatarToOnlinePlayer(element)
          }
        })

        //update this.onlinePlayers, hidden or visible
        this.onlinePlayers = this.onlinePlayersGroup.getChildren()
        if (this.debug) {
          console.log("all players in the group, hidden or visible ")
          console.log(this.onlinePlayers)
        }

        //added new players
        this.load.start(); // load the image in memory
        console.log("started loading new (online) avatars")
        //.... end load new Avatars ....................................................................................

        //when the images are loaded the new ones should be set to the players
        this.load.on('filecomplete', () => {
          console.log("players added: ")
          console.log(this.newOnlinePlayers)

          this.onlinePlayers = this.onlinePlayersGroup.getChildren()

          for (let i = 0; i < this.onlinePlayers.length; i++) {

            this.attachtAvatarToOnlinePlayer(this.onlinePlayers[i])
          } //for (let i = 0; i < this.onlinePlayers.length; i++)
        }) //this.load.on('filecomplete', () =>

        console.log("ManageSession.allConnectedUsers")
        console.log(ManageSession.allConnectedUsers)

        //this.onlinePlayers = this.onlinePlayersGroup.getChildren()

        //? not necessary
        // ManageSession.allConnectedUsers.forEach((player, i) => {

        //   var index = this.onlinePlayers.findIndex(function (player) {
        //     return player.user_id == ManageSession.allConnectedUsers[i].user_id
        //   });

        //   this.onlinePlayers[index].active = true
        //   this.onlinePlayers[index].visible = true
        //   console.log("make all allConnectedUsers visible")
        //   console.log(this.onlinePlayers[index])
        // })
        //send player position over the network for the online users to see
        ManageSession.sendMoveMessage(Math.round(this.player.x), Math.round(this.player.y));

      }//if (ManageSession.createOnlinePlayers)
    }//if (ManageSession.createdPlayer) 
  } //createRemotePlayer

  attachtAvatarToOnlinePlayer(player) {
    this.tempAvatarName = player.user_id + "_" + player.avatar_time;
    //this.onlinePlayers[i] = this.add.image(this.onlinePlayers[i].posX, this.onlinePlayers[i].posY, this.tempAvatarName)

    console.log("player added: ")
    console.log(player)

    //sometimes the player is not visible because the postion is 0,0
    if (player.posX == 0 && player.posY == 0) {
      player.posX = 300
      player.posY = 400
    }

    player.x = player.posX
    player.y = player.posY


    console.log("avatar key: ")
    console.log(this.tempAvatarName)

    player.setTexture(this.tempAvatarName)

    player.active = true
    player.visible = true

    const avatar = this.textures.get(this.tempAvatarName)
    const avatarWidth = avatar.frames.__BASE.width
    const avatarHeight = avatar.frames.__BASE.height

    const avatarFrames = Math.round(avatarWidth / avatarHeight)
    console.log(avatarFrames)

    if (avatarFrames > 1) {

      // set names for the moving and stop animations

      player.setData("movingKey", "moving" + "_" + this.tempAvatarName);
      player.setData("stopKey", "stop" + "_" + this.tempAvatarName);

      //create animation for moving
      this.anims.create({
        key: player.getData("movingKey"),
        frames: this.anims.generateFrameNumbers(this.tempAvatarName, { start: 0, end: avatarFrames - 1 }),
        frameRate: (avatarFrames + 2) * 2,
        repeat: -1,
        yoyo: true
      });

      //create animation for stop
      this.anims.create({
        key: player.getData("stopKey"),
        frames: this.anims.generateFrameNumbers(this.tempAvatarName, { start: 0, end: 0 }),
      });
    } //if (avatarFrames > 1) {

    this.updateOnlinePlayers = true
  }

  playerMovingByClicking() {

    if (!this.input.activePointer.isDown && this.isClicking == true) {
      this.target.x = this.input.activePointer.worldX
      this.target.y = this.input.activePointer.worldY
      this.physics.moveToObject(this.player, this.target, 200);
      this.isClicking = false;
      this.playerIsMovingByClicking = true;
    } else if (this.input.activePointer.isDown && this.isClicking == false) {
      this.isClicking = true;
    }

    this.distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.target.x, this.target.y);


    //  4 is our distance tolerance, i.e. how close the source can get to the target
    //  before it is considered as being there. The faster it moves, the more tolerance is required.
    if (this.playerIsMovingByClicking) {
      if (this.distance < 10) {
        this.player.body.reset(this.target.x, this.target.y);
        this.playerIsMovingByClicking = false
      } else {
        this.sendPlayerMovement();
      }
    }

  }

  sendPlayerMovement() {
    if (this.createdPlayer) {
      if (
        ManageSession.updateMovementTimer > ManageSession.updateMovementInterval
      ) {
        ManageSession.sendMoveMessage(Math.round(this.player.x), Math.round(this.player.y));
        ManageSession.updateMovementTimer = 0;
      }
    }
  }

  updateMovementOnlinePlayers() {
    if (this.createdPlayer) {
      if (ManageSession.updateOnlinePlayers) {
        if (ManageSession.allConnectedUsers != null && ManageSession.allConnectedUsers.length > 0) {
          for (let i = 0; i < ManageSession.allConnectedUsers.length; i++) {
            let tempPlayer = this.onlinePlayers.find(o => o.user_id === ManageSession.allConnectedUsers[i].user_id) || {};
            const movingKey = tempPlayer.getData("movingKey")

            //get the key for the moving animation of the player, and play it
            tempPlayer.anims.play(movingKey, true);

            tempPlayer.x = ManageSession.allConnectedUsers[i].posX;
            tempPlayer.y = ManageSession.allConnectedUsers[i].posY;

            // //get the key for the stop animation of the player, and play it
            setTimeout(() => {
              tempPlayer.anims.play(tempPlayer.getData("stopKey"), true);
            }, 500);

            //get the key for the stop animation of the player, and play it
            // tempPlayer.anims.play(tempPlayer.getData("stopKey"), true);
            //   console.log("updating online players")
          }
          ManageSession.updateOnlinePlayers = false;
        }
      }
    }
  }

  update(time, delta) {
    //...... ONLINE PLAYERS ................................................
    Player.loadPlayerAvatar(this)
    Player.parseNewOnlinePlayerArray(this)
    //.......................................................................

    //ManageSession.loadAndCreatePlayerAvatar("AZC1_Scene")

    this.gameCam.zoom = this.UI_Scene.currentZoom;

    //........... PLAYER SHADOW .............................................................................
    this.playerShadow.x = this.player.x + this.playerShadowOffset
    this.playerShadow.y = this.player.y + this.playerShadowOffset
    //........... end PLAYER SHADOW .........................................................................


    //....... moving ANIMATION ......................................................................................
    // Move.movingAnimation(this)
    Move.checkIfPlayerIsMoving(this)
    //....... end moving ANIMATION .................................................................................

    //this.playerMovingByClicking()
    Move.identifySurfaceOfPointerInteraction(this)

    // to detect if the player is clicking/tapping on one place or swiping
    if (this.input.activePointer.downX != this.input.activePointer.upX) {
      Move.moveBySwiping(this)
    } else {
      Move.moveByTapping(this)
    }

    if (this.playerLikedPanel) {
      Move.moveScrollablePanel(this)
    }

    if (this.playerItemsBar) {
      Move.movePlayerContainer(this)
    }

  } //update
} //class
