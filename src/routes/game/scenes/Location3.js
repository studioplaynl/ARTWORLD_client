import { CONFIG } from "../config";
import ManageSession from "../ManageSession";
//import { getAvatar } from '../../profile.svelte';
import { getAccount } from '../../../api.js';
import { compute_slots } from "svelte/internal";
import { location } from "svelte-spa-router";
import Player from "../class/Player";
import DebugFuntions from "../class/DebugFuntions";
import HistoryTracker from "../class/HistoryTracker";
import TestLoader from "../class/TestLoader.js"

export default class Location3 extends Phaser.Scene {

  constructor() {
    super("Location3");
    this.gameStarted = false;
    this.phaser = this;
    // this.playerPos;
    this.onlinePlayers = [];
    this.currentOnlinePlayer;
    this.avatarName = [];
    this.tempAvatarName = ""
    this.loadedAvatars = [];

    this.location = "Location3"

    this.playerAvatarPlaceholder = "playerAvatar";
    this.playerAvatarKey = ""
    this.createdPlayer = false;
    this.playerMovingKey = "moving";
    this.playerStopKey = "stop";

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
    this.load.image("sky", "./assets/sky.png");
    this.load.image("star", "./assets/star.png");
    this.load.spritesheet(
      "avatar1",
      "./assets/spritesheets/cloud_breathing.png",
      { frameWidth: 68, frameHeight: 68 }
    );

    this.load.image("onlinePlayer", "./assets/pieceYellow_border05.png");

    this.load.image("ball", "./assets/ball_grey.png")

    //test backgrounds
    // this.load.image("background1", "./assets/test_backgrounds/wp4676605-4k-pc-wallpapers.jpg")
    // this.load.image("background2", "./assets/test_backgrounds/desktop112157.jpg")
    // this.load.image("background3", "./assets/test_backgrounds/desktop251515.jpg")
    // this.load.image("background4", "./assets/test_backgrounds/desktop512758.jpg")
    //this.load.image("background5", "./assets/test_backgrounds/desktop1121573.jpg")

    //....... end IMAGES ......................................................................

    //....... TILEMAP .........................................................................
    //1
    this.load.image(
      "tiles",
      "./assets/tilesets/tuxmon-sample-32px-extruded.png"
    );

    this.load.tilemapTiledJSON("map", "./assets/tilemaps/tuxemon-town.json");
    //   //end 1

    // // 2
    // this.load.svg(
    //   "tiles",
    //   "./assets/tilesets/64x64dot.svg"
    // );

    // this.load.tilemapTiledJSON("map", "./assets/tilemaps/svg_ortho_200x200.json");
    // // end 2

    //....... end TILEMAP ......................................................................

    // //load events
    // this.load.on('progress', function (value) {
    //   console.log(value);
    // });

    // this.load.on('fileprogress', function (file) {
    //   console.log(file.src);
    // });
    // this.load.on('complete', function () {
    //   console.log('complete');
    // });

    // //set rpc location
    // ManageSession.createPlayer = true
    // ManageSession.updateOnlinePlayers = true

    // this.createdPlayer = false

    // // await ManageSession.getStreamUsers("join", ManageSession.location)
    // await ManageSession.createSocket();
    // ManageSession.createPlayer = true
    // ManageSession.updateOnlinePlayers = true
  }

  async create() {
    
    // for back button
    HistoryTracker.push(this);

    //timers
    ManageSession.updateMovementTimer = 0;
    ManageSession.updateMovementInterval = 60; //1000 / frames =  millisec

    //.......  SOCKET ..........................................................................
    this.playerIdText = ManageSession.user_id;

    // ManageSession.location = this.location
    // ManageSession.createPlayer = true
    // ManageSession.getStreamUsers("join", this.location)

    //ManageSession.createSocket();
    //....... end SOCKET .......................................................................

    this.generateTileMap()
    //this.generateBackground()

    // this.add.image(0,0, "background1").setOrigin(0,0).setScale(0.5)
    // this.add.image(0,0, "background2").setOrigin(0,0).setScale(0.8)
    // this.add.image(0,0, "background3").setOrigin(0,0).setScale(1)

    // this.add.image(0,-300, "background5").setOrigin(0,0).setScale(1)

    //.......  PLAYER ..........................................................................
    //create player group
    this.playerGroup = this.add.group();

    //set playerAvatarKey to a placeholder, so that the player loads even when the networks is slow, and the dependencies on player will funciton
    this.playerAvatarPlaceholder = "onlinePlayer";
    // //1
    // this.player = this.physics.add
    //   .sprite(spawnPoint.x, spawnPoint.y, this.playerAvatarPlaceholder)
    //   .setDepth(101);
    // //end 1

    //2
    this.player = this.physics.add
      .sprite(300, 800, this.playerAvatarPlaceholder)
      .setDepth(101);

    this.player.body.onOverlap = true;
    //end 2

    this.playerShadow = this.add.sprite(this.player.x + this.playerShadowOffset, this.player.y + this.playerShadowOffset, this.playerAvatarPlaceholder).setDepth(100);

    // this.playerShadow.anchor.set(0.5);
    this.playerShadow.setTint(0x000000);
    this.playerShadow.alpha = 0.2;


    this.playerGroup.add(this.player);
    this.playerGroup.add(this.playerShadow);

    //this.player.setCollideWorldBounds(true); // if true the map does not work properly, needed to stay on the map

    //  Our player animations, turning, walking left and walking right.
    this.playerMovingKey = "moving"
    this.playerStopKey = "stop"

    this.anims.create({
      key: this.playerMovingKey,
      frames: this.anims.generateFrameNumbers("avatar1", { start: 0, end: 8 }),
      frameRate: 20,
      repeat: -1,
    });

    this.anims.create({
      key: this.playerStopKey,
      frames: this.anims.generateFrameNumbers("avatar1", { start: 4, end: 4 }),
    });
    //.......  end PLAYER .............................................................................

    //....... onlinePlayers ...........................................................................
    // add onlineplayers group
    this.onlinePlayersGroup = this.add.group();
    //....... end onlinePlayers .......................................................................

    //....... PLAYER VS WORLD ..........................................................................
    this.gameCam = this.cameras.main //.setBackgroundColor(0xFFFFFF);

    //setBounds has to be set before follow, otherwise the camera doesn't follow!
    // 1 and 2
    //  this.gameCam.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    // end 1 and 2

    // grid
    this.gameCam.setBounds(0, 0, 3200, 3200);
    this.gameCam.zoom = 1
    // end grid
    this.gameCam.startFollow(this.player);

    this.player.setCollideWorldBounds(true);

    // Watch the player and worldLayer for collisions, for the duration of the scene:
    //-->off
    //this.physics.add.collider(this.player, worldLayer);
    //<--off
    //......... end PLAYER VS WORLD ......................................................................

    //......... INPUT ....................................................................................
    this.cursors = this.input.keyboard.createCursorKeys();
    //.......... end INPUT ................................................................................

    this.locationDialogBoxContainersGroup = this.add.group();
    this.generateLocations()
    //this.generateBouncingBird()

    //......... DEBUG FUNCTIONS ............................................................................
    DebugFuntions.keyboard(this)
    //this.createDebugText();
    //......... end DEBUG FUNCTIONS .........................................................................

    this.UI_Scene = this.scene.get("UI_Scene")
    this.scene.launch("UI_Scene")
    this.currentZoom = this.UI_Scene.currentZoom
    this.UI_Scene.location = "Location3"
    this.gameCam.zoom = this.currentZoom

    console.log(this.UI_Scene)
    console.log(this.currentZoom)

  } // end create

  rescaleScene() {

  }

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
    //this.location2 = this.physics.add.staticGroup();
    // this.location1 = this.physics.add.image(400, 600, "ball").setScale(0.4).setDepth(50)
    // this.location1.body.setCircle(190, 12, 12)
    // this.location1.setImmovable(true)

    // // this.location2.setData("entered", false)
    // // this.location2.setName("Location2")
    // this.createLocationDialogbox("Location1", 200, 150)


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

    // //........ location4 ...................
    // this.location4 = this.add.isobox(200, 1200, 100, 150, 0xffe31f, 0xf2a022, 0xf8d80b);
    // this.physics.add.existing(this.location4);
    // this.location4.body.setSize(this.location4.width, this.location4.height * 1.4)
    // this.location4.body.setOffset(0, -(this.location4.height / 1.4))
    // //this.location4.setImmovable(true)
    // this.createLocationDialogbox("Location4", 200, 150)
  }

  // createLocationDialogbox(locationName, mainWidth, mainHeight) {
  //   let location = "this." + locationName
  //   location = eval(location)

  //   location.setData("entered", false)
  //   location.setName(locationName)

  //   //create variable for the text of the dialog box, set the text after
  //   let nameText = "this." + location.name + "DialogBox"
  //   nameText = this.add.text(mainWidth - 60, mainHeight - 30, 'OK!', { fill: '#000' })

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

  //     // this.location2DialogBoxText.input.enabled = show;
  //     container.setVisible(show)
  //     location.setData("entered", show)
  //   }
  // }

  // enterLocation2Scene() {
  //   this.physics.pause();
  //   this.player.setTint(0xff0000);
  //   this.scene.start("Location2");
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
    this.add.image(0, -300, "background5").setOrigin(0, 0).setScale(1)

    let graphics = this.add.graphics();

    graphics.fillStyle(0x0000ff, 1);

    graphics.fillCircle(800, 300, 200);

    for (let i = 0; i < 250; i += 60) {
      graphics.lineStyle(5, 0xFF00FF, 1.0);
      graphics.beginPath();
      graphics.moveTo(800, 200 + i);
      graphics.lineTo(1200, 200 + i);
      graphics.closePath();
      graphics.strokePath();
    }

    for (let i = 0; i < 250; i += 60) {
      graphics.lineStyle(5, 0xFF00FF, 1.0);
      graphics.beginPath();
      graphics.moveTo(900 + i, 150);
      graphics.lineTo(900 + i, 550);
      graphics.closePath();
      graphics.strokePath();
    }

    let rectangle = this.add.graphics();
    rectangle.setVisible(false);
    rectangle.fillGradientStyle(0xff0000, 0xff0000, 0xffff00, 0xffff00, 1);
    rectangle.fillRect(0, 0, 400, 400);

    let rt = this.add.renderTexture(200, 100, 600, 600);
    let rt2 = this.add.renderTexture(100, 600, 600, 600);

    rt.draw(rectangle);
    rt2.draw(rectangle);

    let eraser = this.add.circle(0, 0, 190, 0x000000);
    eraser.setVisible(false);

    rt.erase(eraser, 200, 200);

    rt2.erase(rt, 0, 0)

    rt2.x = 400
    rt2.y = 600

    //end fill in textures
  }

  generateTileMap() {
    //....... TILEMAP .............................................................................
    // 2
    const map = this.make.tilemap({ key: "map" });
    // end 2

    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)
    //1
    const tileset = map.addTilesetImage("tuxmon-sample-32px-extruded", "tiles");


    // Parameters: layer name (or index) from Tiled, tileset, x, y

    // const belowLayer = map.createLayer("Below Player", tileset, 0, 0);
    // const worldLayer = map.createLayer("World", tileset, 0, 0);
    // const aboveLayer = map.createLayer("Above Player", tileset, 0, 0);

    // worldLayer.setCollisionByProperty({ collides: true });

    // By default, everything gets depth sorted on the screen in the order we created things. Here, we
    // want the "Above Player" layer to sit on top of the player, so we explicitly give it a depth.
    // Higher depths will sit on top of lower depth objects.
    // aboveLayer.setDepth(10);

    // Object layers in Tiled let you embed extra info into a map - like a spawn point or custom
    // collision shapes. In the tmx file, there's an object layer with a point named "Spawn Point"
    // const spawnPoint = map.findObject(
    //   "Objects",
    //   (obj) => obj.name === "Spawn Point"
    // );
    //end 1

    //2
    // const tileset = map.addTilesetImage("64x64dot", "tiles");

    // const aboveLayer = map.createLayer("Tile Layer 1", tileset, 0, 0);
    // aboveLayer.setDepth(10);
    // end 2

    const belowLayer = map.createLayer("Below Player", tileset, 0, 0);
    const worldLayer = map.createLayer("World", tileset, 0, 0);
    const aboveLayer = map.createLayer("Above Player", tileset, 0, 0);

    worldLayer.setCollisionByProperty({ collides: true });

    const spawnPoint = map.findObject(
      "Objects",
      (obj) => obj.name === "Spawn Point"
    );

    //....... end TILEMAP ......................................................................
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
  }//attachtAvatarToPlayer

  createDebugText() {
    this.headerText = this.add
      .text(CONFIG.WIDTH / 2, 20, "", {
        fontFamily: "Arial",
        fontSize: "36px",
      })
      .setOrigin(0.5)
      .setScrollFactor(0) //fixed on screen
      .setShadow(3, 3, '#000000', 0)
      .setDepth(30);

    this.matchIdText = this.add
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
      .setDepth(30);

    // this.playerIdText = this.add
    //   .text(this.headerText.x, this.matchIdText.y + 14, "playerID", {
    //     fontFamily: "Arial",
    //     fontSize: "11px",
    //   })
    //   .setOrigin(0.5)
    //   .setScrollFactor(0) //fixed on screen
    //   .setDepth(30)
    //   .setShadow(1, 1, '#000000', 0);

    this.matchIdText.on("pointerup", () => {
      // this.onlinePlayers[0].setVisible(false); //works
      // this.onlinePlayers[0].destroy();
    });

    // this.opponentsIdText = this.add
    //   .text(this.headerText.x, this.playerIdText.y + 14, "", {
    //     fontFamily: "Arial",
    //     fontSize: "11px",
    //   })
    //   .setOrigin(0.5)
    //   .setScrollFactor(0) //fixed on screen
    //   .setDepth(30);

    // this.allConnectedUsersText = this.add.text(110, 20, "onlineUsers[ ]", { fontFamily: "Arial", fontSize: "22px" })
    //   .setOrigin(0.5)
    //   .setScrollFactor(0) //fixed on screen
    //   .setShadow(1, 1, '#000000', 0)
    //   .setDepth(300);

    // this.allConnectedUsersText2 = this.add.text(110, 40, "", { fontFamily: "Arial", fontSize: "22px" })
    //   .setOrigin(0.5)
    //   .setScrollFactor(0) //fixed on screen
    //   .setShadow(1, 1, '#000000', 0)
    //   .setDepth(300);

    // this.onlinePlayersText = this.add.text(110, 70, "onlinePlayers[ ]", { fontFamily: "Arial", fontSize: "22px" })
    //   .setOrigin(0.5)
    //   .setScrollFactor(0) //fixed on screen
    //   .setShadow(1, 1, '#000000', 0)
    //   .setDepth(300);

    // this.onlinePlayersText2 = this.add.text(110, 90, "", { fontFamily: "Arial", fontSize: "22px" })
    //   .setOrigin(0.5)
    //   .setScrollFactor(0) //fixed on screen
    //   .setShadow(1, 1, '#000000', 0)
    //   .setDepth(300);


    // this.onlinePlayersGroupText = this.add.text(110, 120, "playersGroup[ ]", { fontFamily: "Arial", fontSize: "22px" })
    //   .setOrigin(0.5)
    //   .setScrollFactor(0) //fixed on screen
    //   .setShadow(1, 1, '#000000', 0)
    //   .setDepth(300);

    // this.onlinePlayersGroupText2 = this.add.text(110, 140, "", { fontFamily: "Arial", fontSize: "22px" })
    //   .setOrigin(0.5)
    //   .setScrollFactor(0) //fixed on screen
    //   .setShadow(1, 1, '#000000', 0)
    //   .setDepth(300);

  }

  attachtAvatarToOnlinePlayer(player, preExisting) {
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
    if (!preExisting) {
      player.setTexture(this.tempAvatarName)
    } else {

    }


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
      console.log('player.getData("movingKey")')
      console.log(player.getData("movingKey"))

      console.log('player.getData("movingKey")')
      console.log(player.getData("movingKey"))

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
    if (
      ManageSession.updateMovementTimer > ManageSession.updateMovementInterval
    ) {
      ManageSession.sendMoveMessage(Math.round(this.player.x), Math.round(this.player.y));
      ManageSession.updateMovementTimer = 0;
    }
  }

  update(time, delta) {
    // //...... ONLINE PLAYERS ................................................
    Player.loadOnlinePlayers(this)
    Player.receiveOnlinePlayersMovement(this)
    Player.loadOnlineAvatar(this)

    //this.gameCam.zoom = this.UI_Scene.currentZoom;
    // console.log(this.currentZoom);

    // if (ManageSession.removeConnectedUser) {
    // }
    // //.......................................................................

    // //........... PLAYER SHADOW .............................................................................
    this.playerShadow.x = this.player.x + this.playerShadowOffset
    this.playerShadow.y = this.player.y + this.playerShadowOffset
    // //........... end PLAYER SHADOW .........................................................................

    //.......... UPDATE TIMER      ..........................................................................
    ManageSession.updateMovementTimer += delta;
    // console.log(time) //running time in millisec
    // console.log(delta) //in principle 16.6 (60fps) but drop to 41.8ms sometimes
    //....... end UPDATE TIMER  ..............................................................................

    // //........ PLAYER MOVE BY KEYBOARD  ......................................................................
    if (!this.playerIsMovingByClicking) {
      Player.moveByKeyboard(this)
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