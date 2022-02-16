import { CONFIG } from "../config.js"
import ManageSession from "../ManageSession"

import PlayerDefault from "../class/PlayerDefault"
import PlayerDefaultShadow from "../class/PlayerDefaultShadow"
import Player from "../class/Player.js"
import Preloader from "../class/Preloader.js"
import BouncingBird from "../class/BouncingBird.js"
import Background from "../class/Background.js"
import DebugFuntions from "../class/DebugFuntions.js"
import CoordinatesTranslator from "../class/CoordinatesTranslator.js"
import GenerateLocation from "../class/GenerateLocation.js"
import HistoryTracker from "../class/HistoryTracker.js"
import Move from "../class/Move.js"

export default class Location3 extends Phaser.Scene {

  constructor() {
    super("Location3")

    this.worldSize = new Phaser.Math.Vector2(3000, 3000)

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

    //....... IMAGES ......................................................................
    this.load.image("sky", "./assets/sky.png");
    this.load.image("star", "./assets/star.png");
    this.load.spritesheet(
      "avatar1",
      "./assets/spritesheets/cloud_breathing.png",
      { frameWidth: 68, frameHeight: 68 }
    );

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

  }

  async create() {

    // for back button
    HistoryTracker.pushLocation(this);

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

    //set playerAvatarKey to a placeholder, so that the player loads even when the networks is slow, and the dependencies on player will funciton
    this.playerAvatarPlaceholder = "onlinePlayer";

    this.player = new PlayerDefault(
      this,
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 50),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 50),
      this.playerAvatarPlaceholder
    ).setDepth(201)

    Player.createPlayerItemsBar(this)

    // this.playerTest = new PlayerDefault(
    //   this,
    //   CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 150),
    //   CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 150),
    //   this.playerAvatarPlaceholder
    // )
    // this.playerTest.setDepth(200).setVisible(false)


    this.playerShadow = new PlayerDefaultShadow({
      scene: this,
      texture: this.playerAvatarPlaceholder,
    }).setDepth(200)
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
    this.gameCam.startFollow(this.player)

    this.player.setCollideWorldBounds(true)

    // Watch the player and worldLayer for collisions, for the duration of the scene:
    //-->off
    //this.physics.add.collider(this.player, worldLayer);
    //<--off
    //......... end PLAYER VS WORLD ......................................................................

    //......... INPUT ....................................................................................
    this.cursors = this.input.keyboard.createCursorKeys();
    //.......... end INPUT ................................................................................

    this.locationDialogBoxContainersGroup = this.add.group();
    //this.generateLocations()
    //this.generateBouncingBird()

    //......... DEBUG FUNCTIONS ............................................................................
    DebugFuntions.keyboard(this)
    //this.createDebugText();
    //......... end DEBUG FUNCTIONS .........................................................................

    //......... UI Scene  .................................................................................
    this.UI_Scene = this.scene.get("UI_Scene")
    this.scene.launch("UI_Scene")
    this.currentZoom = this.UI_Scene.currentZoom
    this.UI_Scene.location = this.location
    this.gameCam.zoom = this.currentZoom
    //......... end UI Scene ..............................................................................

    //create items bar for onlineplayer, after UIscene, because it need currentZoom
    Player.createOnlinePlayerItemsBar(this)

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


    const belowLayer = map.createLayer("Below Player", tileset, 0, 0);
    const worldLayer = map.createLayer("World", tileset, 0, 0);
    const aboveLayer = map.createLayer("Above Player", tileset, 0, 0);

    // worldLayer.setCollisionByProperty({ collides: true })

    const spawnPoint = map.findObject(
      "Objects",
      (obj) => obj.name === "Spawn Point"
    );

    //....... end TILEMAP ......................................................................
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



  }



  update(time, delta) {
    //...... ONLINE PLAYERS ................................................
    Player.loadPlayerAvatar(this)
    Player.parseNewOnlinePlayerArray(this)
    //.......................................................................

    this.gameCam.zoom = this.UI_Scene.currentZoom;
    // console.log(this.currentZoom);

    // if (ManageSession.removeConnectedUser) {
    // }
    //.......................................................................

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

    // player items bar follows the position of the player 
    if (this.playerItemsBar) {
      Move.movePlayerItemsBar(this)
    }

    // player liked panel follows the position of the player 
    if (this.playerLikedPanel) {
      Move.movePlayerLikedPanel(this)
    }

    // once a movement is detected the addressbook is hidden
    if (this.playerAddressbookContainer) {
      Player.hideAddressbook(this)
    }
  } //update
} //class