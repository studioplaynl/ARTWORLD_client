import { CONFIG } from "../config.js";
import manageSession from "../manageSession";
import { getAccount } from '../../../api.js';

import playerDefault from '../class/playerDefault'
import playerDefaultShadow from '../class/playerDefaultShadow'
import Player from '../class/Player.js'
import onlinePlayerLoader from '../class/onlinePlayer.js'
import preloader from '../preLoader.js'

export default class Location1Scene extends Phaser.Scene {

  constructor() {
    super("location1_Scene");

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

    this.location = "location1"

    //.......................REX UI ............
    this.COLOR_PRIMARY = 0xff5733;
    this.COLOR_LIGHT = 0xffffff;
    this.COLOR_DARK = 0x000000;
    this.data
    //....................... end REX UI ......

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
    //.... PRELOADER VISUALISER ...............................................................................................
    preloader.Loading(this)
    //.... end PRELOADER VISUALISER ...............................................................................................


    //drawing on a wall
    this.load.image('brush', 'assets/brush3.png');
    this.load.image('brickWall', 'assets/brickwall_white.jpg');

    //....... IMAGES ......................................................................
    this.load.image("sky", "./assets/sky.png");
    this.load.image("star", "./assets/star.png");
    this.load.image('ground', 'assets/platform.png');

    this.load.image('museum', 'assets/museum.png');

    this.load.image("entrance", "assets/entrance.jpg");

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
    this.load.image("background5", "./assets/test_backgrounds/desktop1121573.jpg")

    this.load.image("art1", "./assets/art_styles/drawing_painting/699f77a8e723a41f0cfbec5434e7ac5c.jpg")
    this.load.image("art2", "./assets/art_styles/drawing_painting/f7f2e083a0c70b97e459f2966bc8c3ae.jpg")
    this.load.image("art3", "./assets/art_styles/drawing_painting/doodle_dogman.png")
    // this.load.image("art4", "./assets/art_styles/drawing_painting/87b2481918d9c9491c9b998008a2053c.jpg") // 30ties style graphic

    this.load.image("art5", "./assets/art_styles/drawing_painting/e13ad7758c0241352ffe203feffd6ff2.jpg")

    this.load.image("exhibit1", "./assets/art_styles/people/04b49a9aa5f7ada5d8d96deba709c9d4.jpg")
    this.load.image("exhibit2", "./assets/art_styles/repetition/4c15d943b5b4993b42917fbfb5996c1f.jpg")
    this.load.image("exhibit3", "./assets/art_styles/repetition/dd5315e5a77ff9601259325341a0bca9.jpg")
    this.load.image("exhibit4", "./assets/art_styles/people/28bc857da206c33c5f97bfbcf40e9970.jpg")


    //....... end IMAGES ......................................................................

    //....... TILEMAP .........................................................................
    //  //1
    //   this.load.image(
    //     "tiles",
    //     "./assets/tilesets/tuxmon-sample-32px-extruded.png"
    //   );

    //   this.load.tilemapTiledJSON("map", "./assets/tilemaps/tuxemon-town.json");
    //   //end 1

    // // 2
    // this.load.svg(
    //   "tiles",
    //   "./assets/tilesets/64x64dot.svg"
    // );

    // this.load.tilemapTiledJSON("map", "./assets/tilemaps/svg_ortho_200x200.json");
    // // end 2



    //....... end TILEMAP ......................................................................



  }

  async create() {

    //timers
    manageSession.updateMovementTimer = 0;
    manageSession.updateMovementInterval = 60; //1000 / frames =  millisec

    //.......  LOAD PLAYER AVATAR ..........................................................................
    this.playerIdText = manageSession.userProfile.id;

    manageSession.createPlayer = true
    console.log("manageSession.createPlayer: ")
    console.log(manageSession.createPlayer)
    //....... end LOAD PLAYER AVATAR .......................................................................

    //this.generateTileMap()
    this.generateBackground()

    this.createDrawingTexture()
    // this.add.image(0,0, "background1").setOrigin(0).setScale(0.5)
    // this.add.image(0,0, "background2").setOrigin(0).setScale(0.8)
    // this.add.image(0,0, "background3").setOrigin(0).setScale(1)

    // this.add.image(0,-300, "background5").setOrigin(0).setScale(1)

    //.......  PLAYER ..........................................................................
    //set playerAvatarKey to a placeholder, so that the player loads even when the networks is slow, and the dependencies on player will funciton
    this.playerAvatarPlaceholder = "avatar1";

    //*create deafult player and playerShadow
    this.player = new playerDefault(this, 300, 800, this.playerAvatarPlaceholder)
    this.playerShadow = new playerDefaultShadow({ scene: this, texture: this.playerAvatarPlaceholder })

    //this.player.setCollideWorldBounds(true); // if true the map does not work properly, needed to stay on the map

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


    //     // 1 and 2
    //     this.gameCam.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    // // end 1 and 2
    // grid
    //!setBounds has to be set before follow, otherwise the camera doesn't follow!
    this.gameCam.setBounds(0, 0, 6200, 6200);
    this.gameCam.zoom = 1
    // end grid
    this.gameCam.startFollow(this.player);

    //this.player.setCollideWorldBounds(true);

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

    this.generateBouncingBird()

    //......... DEBUG FUNCTIONS ............................................................................
    this.debugFunctions();
    //this.createDebugText();
    //......... end DEBUG FUNCTIONS .........................................................................

    this.UI_Scene = this.scene.get("UI_Scene")
    this.scene.launch("UI_Scene")
    this.currentZoom = this.UI_Scene.currentZoom
    this.UI_Scene.location = this.location

    this.gameCam.zoom = this.currentZoom

    //console.log(this.UI_Scene)
    console.log(this.currentZoom)

    //this.exampleREXUI()

    // identifies if the pointer is down on a graffiti wall
    // if the condition is true, the avatar stops any movement
    this.input.on('pointerdown', (pointer, object) => {
      if (object[0]?.name && object[0]?.name == "graffitiBrickWall" || object[0]?.name == "graffitiDotWall") {
        this.graffitiDrawing = true
      }
    })
    this.input.on('pointerup', () => {
      this.graffitiDrawing = false
    })

  } // end create

  exampleREXUI() {
    //! REX UI
    this.data = {
      name: 'Rex',
      skills: [
        { name: 'A' },
        { name: 'B' },
        { name: 'C' },
        { name: 'D' },
        { name: 'E' },
      ],
      items: [
        { name: 'A' },
        { name: 'B' },
        { name: 'C' },
        { name: 'D' },
        { name: 'E' },
        { name: 'F' },
        { name: 'G' },
        { name: 'H' },
        { name: 'I' },
        { name: 'J' },
        { name: 'K' },
        { name: 'L' },
        { name: 'M' },
      ],

    };

    //https://codepen.io/rexrainbow/pen/Gazmyz
    var videoPanel = this.CreateMainPanel(this, 1600, 1500)
      .layout()
      //.drawBounds(this.add.graphics(), 0xff0000)
      .popUp(1000)

    //*feature discussion about ui plugin
    //! https://phaser.discourse.group/t/phaser-3-rexui-plugins/384/26
    this.scrollablePanel = this.rexUI.add.scrollablePanel({
      x: 250,
      y: 600,
      width: 400,
      // height: 220,

      scrollMode: 1,

      background: this.rexUI.add.roundRectangle(0, 0, 2, 2, 10, this.COLOR_PRIMARY),

      panel: {
        child: this.createPanel(this, this.data),

        mask: {
          padding: 1
        },
      },

      // Children-interactive is registered at scrollablePanel, which is create last.
      // Set depth of track, thum game object above scrollablePanel, otherwise slider won't receive input at all.
      slider: {
        track: this.rexUI.add.roundRectangle(0, 0, 20, 10, 10, this.COLOR_DARK).setDepth(1),
        thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, 13, this.COLOR_LIGHT).setDepth(1),
      },

      space: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10,

        panel: 10,
      }
    })
      .layout()
    // .drawBounds(this.add.graphics(), 0xff0000);


    // Add children-interactive
    // this.input.topOnly = true;
    var panel = this.scrollablePanel.getElement('panel');
    var print = this.add.text(0, 0, '');
    this.rexUI.setChildrenInteractive(this.scrollablePanel, {
      targets: [
        panel.getByName('skills', true),
        panel.getByName('items', true)
      ]
    })
      .on('child.click', function (child) {
        var category = child.getParentSizer().name;
        print.text += `${category}:${child.text}\n`;
      })

    

  }

  CreateMainPanel(scene, x, y) {
    // Create elements
    var background = scene.rexUI.add.roundRectangle(0, 0, 0, 0, 20, this.COLOR_DARK);
    var videoPanel = this.CreateVideoPanel(scene);
    var controllerPanel = this.CreateControllerPanel(scene);
    this.ControlVideo(controllerPanel, videoPanel);
    // Compose elemets
    var mainPanel = scene.rexUI.add.sizer({
      orientation: 'y',
      x: x,
      y: y,
    })
      .addBackground(background)
      .add(videoPanel, 0, 'center', { left: 20, right: 20, top: 20, bottom: 10 }, true)
      .add(controllerPanel, 0, 'center', { left: 20, right: 20, bottom: 20 }, true)

    return mainPanel;
  }

  CreateControllerPanel(scene) {
    return scene.rexUI.add.numberBar({
      icon: scene.add.image(0, 0, 'play'),
      slider: {
        track: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, this.COLOR_DARK),
        indicator: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, this.COLOR_PRIMARY),
        input: 'click',
      },

      text: scene.rexUI.add.BBCodeText(0, 0, '', {
        fixedWidth: 50, fixedHeight: 36,
        valign: 'center', halign: 'right'
      }),

      space: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10,

        icon: 10,
        slider: 10,
      },

    });
  }

  CreateVideoPanel(scene) {
    return scene.add.video(0, 0, 'test')
      .setDisplaySize(600, 337.5)
  }

  ControlVideo(controller, video) {
    // Play button
    var played = false;
    var playButton = controller.getElement('icon');
    playButton
      .setInteractive()
      .on('pointerdown', function () {
        var textureKey = playButton.texture.key;
        if (textureKey === 'play') {
          if (!played) {
            played = true;
            video.play();
          } else {
            video.setPaused(false);
          }
        } else {
          video.setPaused();
        }

        if (video.isPlaying()) {
          playButton.setTexture('pause');
        } else {
          playButton.setTexture('play');
        }
      });

    // Playback time
    var lastVideoProgress = undefined;
    video.scene.events.on('update', function () {
      var currentVideoProgress = video.getProgress();
      if (lastVideoProgress !== currentVideoProgress) {
        lastVideoProgress = currentVideoProgress;
        controller.value = currentVideoProgress;
        controller.text = Math.floor(video.getCurrentTime() * 10) / 10;
      }
    })
    controller.on('valuechange', function (newValue) {
      if (video.getProgress() !== newValue) {
        video.seekTo(newValue);
      }
    });
  }

  createPanel(scene, data) {
    var sizer = scene.rexUI.add.sizer({
      orientation: 'x',
      space: { item: 10 }
    })
      .add(
        this.createHeader(scene, data), // child
        { expand: true }
      )
      .add(
        this.createTable(scene, data, 'skills', 1), // child
        { expand: true }
      )
      .add(
        this.createTable(scene, data, 'items', 2), // child
        { expand: true }
      )
    return sizer;
  }

  createHeader(scene, data) {
    var title = scene.rexUI.add.label({
      orientation: 'x',
      text: scene.add.text(0, 0, 'Character'),
    });
    var picture = scene.add.rexCircleMaskImage(0, 0, 'art1').setScale(0.1)
    var header = scene.rexUI.add.label({
      orientation: 'y',
      icon: picture,
      text: scene.add.text(0, 0, data.name),

      space: { icon: 10 }
    });

    return scene.rexUI.add.sizer({
      orientation: 'y',
      space: { left: 5, right: 5, top: 5, bottom: 5, item: 10 }
    })
      .addBackground(
        scene.rexUI.add.roundRectangle(0, 0, 0, 0, 0, undefined).setStrokeStyle(2, this.COLOR_LIGHT, 1)
      )
      .add(
        title, // child
        { expand: true, align: 'left' }
      )
      .add(header, // child
        { proportion: 1, expand: true }
      );
  };

  createTable(scene, data, key, rows) {
    var capKey = key.charAt(0).toUpperCase() + key.slice(1);
    var title = scene.rexUI.add.label({
      orientation: 'x',
      text: scene.add.text(0, 0, capKey),
    });

    var items = data[key];
    var columns = Math.ceil(items.length / rows);
    var table = scene.rexUI.add.gridSizer({
      column: columns,
      row: rows,

      rowProportions: 1,
      space: { column: 10, row: 10 },
      name: key  // Search this name to get table back
    });

    var item, r, c;
    var iconSize = (rows === 1) ? 80 : 40;
    for (var i = 0, cnt = items.length; i < cnt; i++) {
      item = items[i];
      r = i % rows;
      c = (i - r) / rows;
      table.add(
        this.createIcon(scene, item, iconSize, iconSize),
        c,
        r,
        'top',
        0,
        true
      );
    }

    return scene.rexUI.add.sizer({
      orientation: 'y',
      space: { left: 10, right: 10, top: 10, bottom: 10, item: 10 }
    })
      .addBackground(
        scene.rexUI.add.roundRectangle(0, 0, 0, 0, 0, undefined).setStrokeStyle(2, this.COLOR_LIGHT, 1)
      )
      .add(
        title, // child
        0, // proportion
        'left', // align
        0, // paddingConfig
        true // expand
      )
      .add(table, // child
        1, // proportion
        'center', // align
        0, // paddingConfig
        true // expand
      );
  }

  createIcon(scene, item, iconWidth, iconHeight) {
    var label = scene.rexUI.add.label({
      orientation: 'y',
      icon: scene.rexUI.add.roundRectangle(0, 0, iconWidth, iconHeight, 5, this.COLOR_LIGHT),
      text: scene.add.text(0, 0, item.name),

      space: { icon: 3 }
    });
    return label;
  };


  createDrawingTexture() {
    //....................graffiti wall....................................................................................................
    //pos
    const graffitiWallX = 2200
    const graffitiWallY = 600
    //size
    const graffitiWallWidth = 800
    const graffitiWallHeight = 600

    // var graffitiWallContainer = this.add.container(); 
    let rt = this.add.renderTexture(graffitiWallX, graffitiWallY, graffitiWallWidth, graffitiWallHeight).setInteractive().setDepth(1001).setName("graffitiBrickWall");
    let graffitiWall = this.add.image(graffitiWallX, graffitiWallY, 'brickWall').setOrigin(0).setDepth(1000)

    graffitiWall.displayWidth = graffitiWallWidth
    graffitiWall.displayHeight = graffitiWallHeight
    //this.add.graphics().fillStyle(0x000000).lineStyle(1, 0xffffff).fillRect(0, 0, 1200, 600).strokeRect(0, 0, 1200, 600).setDepth(1000);

    //this.add.text(136, 8, '<- draw in here\n   press SPACE to clear');

    var hsv = Phaser.Display.Color.HSVColorWheel();

    var i = 0;

    this.input.keyboard.on('keydown-' + 'SPACE', function () {

      rt.clear();

    });

    rt.on('pointerdown', function (pointer) {
      this.graffitiDrawing = true
      this.isClicking = true
      this.draw('brush', pointer.worldX - graffitiWallX, pointer.worldY - graffitiWallY, 1, hsv[i].color);

    });

    rt.on('pointermove', function (pointer) {

      if (pointer.isDown) {
        this.graffitiDrawing = true
        this.isClicking = true
        this.draw('brush', pointer.worldX - graffitiWallX, pointer.worldY - graffitiWallY, 1, hsv[i].color);
        i = Phaser.Math.Wrap(i + 1, 0, 360);
      }
    })

    rt.on('pointerup', function (pointer) {
      this.graffitiDrawing = false
      console.log("brush is up2")
    })

    // graffitiWallContainer.add([leg1, leg2, body1, body2, beak, eye, pupil, wing]);

    // var tt = rt.saveTexture('doodle');

    // var blocks = this.add.group({ key: 'doodle', repeat: 35, setScale: { x: 0.2, y: 0.1 } });

    // Phaser.Actions.GridAlign(blocks.getChildren(), {
    //     width: 7,
    //     height: 5,
    //     cellWidth: 128,
    //     cellHeight: 128,
    //     x: 128,
    //     y: 128
    // });

    // var i = 0;

    // blocks.children.iterate(function (child) {

    //     this.tweens.add({
    //         targets: child,
    //         scaleX: 1,
    //         scaleY: 1,
    //         ease: 'Sine.easeInOut',
    //         duration: 400,
    //         delay: i * 50,
    //         repeat: -1,
    //         yoyo: true
    //     });

    //     i++;

    //     if (i % 14 === 0)
    //     {
    //         i = 0;
    //     }

    // }, this);

    const graffitiWall2X = 600
    const graffitiWall2Y = 1200
    //size
    const graffitiWall2Width = 600
    const graffitiWall2Height = 1200

    // var graffitiWallContainer = this.add.container(); 
    let rt2 = this.add.renderTexture(graffitiWall2X, graffitiWall2Y, graffitiWall2Width, graffitiWall2Height).setInteractive().setDepth(1001).setName("graffitiDotWall");
    //let graffitiWall2 = this.add.image(graffitiWall2X, graffitiWall2Y, 'brickWall').setOrigin(0).setDepth(1000)

    // graffitiWall2.displayWidth = graffitiWall2Width
    // graffitiWall2.displayHeight = graffitiWall2Height

    rt2.on('pointerdown', function (pointer) {
      this.graffitiDrawing = true
      this.isClicking = true
      console.log(this.graffitiDrawing)
      this.draw('brush', pointer.worldX - graffitiWall2X - 4, pointer.worldY - graffitiWall2Y - 4, 1, 0x000000);

    });

    rt2.on('pointermove', function (pointer) {
      if (pointer.isDown) {
        this.graffitiDrawing = true
        this.isClicking = true
        //console.log(this.graffitiDrawing)
        this.draw('brush', pointer.worldX - graffitiWall2X, pointer.worldY - graffitiWall2Y, 1, 0x000000);
      }
      if (pointer.isUp) {
        this.graffitiDrawing = false
        //console.log(this.graffitiDrawing)
      }
    });

    rt2.on('pointerup', function (pointer) {
      this.graffitiDrawing = false
      //console.log(this.graffitiDrawing)
    });
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
    this.location2 = this.physics.add.image(400, 600, "ball").setScale(0.4).setDepth(50)
    this.location2.body.setCircle(190, 12, 12)
    this.location2.setImmovable(true)

    // this.location2.setData("entered", false)
    // this.location2.setName("location2")
    this.createLocationDialogbox("location2", 200, 150)


    //........ location3 ...................
    this.location3 = this.add.isotriangle(900, 900, 150, 150, false, 0x8dcb0e, 0x3f8403, 0x63a505);
    this.physics.add.existing(this.location3);
    this.location3.body.setSize(this.location3.width, this.location3.height)
    this.location3.body.setOffset(0, -(this.location3.height / 4))
    //can't set ositriangle to immmovable
    //this.location3.setImmovable(true)

    // this.location3.setData("entered", false)
    // this.location3.setName("location3")

    this.createLocationDialogbox("location3", 200, 150)

    //........ location4 ...................
    this.location4 = this.physics.add.image(200, 1050, "museum").setScale(0.4).setDepth(50)
    this.location4.setImmovable(true)
    this.createLocationDialogbox("location4", 200, 150)

    //........ location5 ...................
    this.location5 = this.add.isobox(1200, 1200, 100, 150, 0xffe31f, 0xf2a022, 0xf8d80b);
    this.physics.add.existing(this.location5);
    this.location5.body.setSize(this.location5.width, this.location5.height * 1.4)
    this.location5.body.setOffset(0, -(this.location5.height / 1.4))
    this.createLocationDialogbox("location5", 200, 150)

    // location6
    this.location6 = this.physics.add.image(800, 600, "entrance").setScale(0.4).setDepth(100)
    this.location6.setImmovable(true)
    this.createLocationDialogbox("location6", 200, 150)

    // location7
    this.location7 = this.physics.add.image(600, 800, "entrance").setScale(0.4).setDepth(100)
    this.location7.setImmovable(true)
    this.createLocationDialogbox("location7", 200, 150)
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

    // on entering another location we want to keep a record for "back button"
    manageSession.previousLocation = this.scene.key;

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

  generateBackground() {
    //fill in textures

    ///*........... white background of 6000x6000 pix .............................................................
    this.add.rectangle(0, 0, 8000, 8000, 0xFFFFFF)

    //*........... repeating pattern on the white background .............................................................
    const gridWidth = 4000
    const offset = 50

    //......... repeating dots as pattern on white background .............................................................
    //background dot size
    let dotWidth = 2

    //create the dot: graphics
    let bgDot = this.add.graphics()
    bgDot.fillStyle(0x909090);
    bgDot.fillCircle(dotWidth, dotWidth, dotWidth).setVisible(false)

    //create renderTexture
    let bgDotRendertexture = this.add.renderTexture(0, 0, dotWidth * 2, dotWidth * 2)

    //draw gaphics to renderTexture
    bgDotRendertexture.draw(bgDot)

    //save the rendertexture with a key ('dot')
    let t = bgDotRendertexture.saveTexture('dot');

    for (let i = 0; i < gridWidth; i += offset) {
      for (let j = 0; j < gridWidth; j += offset) {
        this.add.image(i, j, 'dot').setOrigin(0);
      }
    }
    //......... end repeating dots ...................................................................

    //..... cross grid background .............................................................
    // // // 1. make an array with color values
    // // let cross = [
    // //   '.....',
    // //   '..1..',
    // //   '.111.',
    // //   '..1..',
    // //   '.....',

    // // ]

    // // // 2. generate the texture from the array
    // // this.textures.generate('cross', { data: cross, pixelWidth: 3 });

    // // // 3. display the texture as an image
    // // const gridWidth = 4000
    // // const offset = 50

    // // // 4. repeat the image in a x, y  grid
    // // for (let i = 0; i < gridWidth; i += offset) {
    // //   for (let j = 0; j < gridWidth; j += offset) {
    // //     this.add.image(i, j, 'cross').setOrigin(0, 1);
    // //   }
    // // }
    //..... end cross grid background .............................................................
    //*........... end repeating pattern on the white background ........................................

    //* .......... scattered art works for the demo .....................................................
    // this.add.image(0, 200, "background4").setOrigin(0,0).setScale(1.3)
    //this.add.image(0, -300, "background5").setOrigin(0, 0).setScale(1)

    this.add.rexCircleMaskImage(1400, 600, "art1").setOrigin(0, 0).setScale(1) //stamp painting
    //this.add.image(300, 1200, "art2").setOrigin(0, 0).setScale(1.3) //keith harring
    this.add.image(800, 1200, "art3").setOrigin(0, 0).setScale(1.5) //dog doodle
    //this.add.image(2400, 200, "art4").setOrigin(0, 0).setScale(1) // 30ties style graphic
    this.add.image(300, 1200, "art5").setOrigin(0, 0).setScale(1.6) //keith harring

    //* .......... end scattered art works for the demo .................................................

    //*............. graphics as examples for the demo ..................................................
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

    //*............. end graphics as examples for the demo .............................................
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
  }//generateTileMap



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

    this.allConnectedUsersText = "onlineUsers[ ]: " + JSON.parse(manageSession.allConnectedUsers)

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

  debugFunctions() {
    this.input.keyboard.on('keyup-A', function (event) {
      //get online player group
      const displaylist = this.onlinePlayersGroup.getChildren()
      console.log(displaylist)
    }, this);

    this.input.keyboard.on('keyup-ONE', function (event) {

      console.log('1 key');

      manageSession.getStreamUsers("get_users", this.location)

    }, this);

    this.input.keyboard.on('keyup-S', function (event) {

      console.log('S key');

      //list all images in the textureManager
      console.log(this.textures.list)

      //Return an array listing the events for which the emitter has registered listeners.
      console.log("Return an array listing the events for which the emitter has registered listeners: ")
      console.log(this.textures.eventNames())

    }, this);

    this.input.keyboard.on('keyup-D', function (event) {

      console.log('D key');

      console.log(" ")
      console.log('this.onlinePlayers: ')
      console.log(this.onlinePlayers)

      console.log("manageSession.allConnectedUsers: ")
      console.log(manageSession.allConnectedUsers)

      console.log("onlinePlayerGroup Children: ")
      console.log(this.onlinePlayersGroup.getChildren())

      console.log("this.player: ")
      console.log(this.player)

    }, this);

    this.input.keyboard.on('keyup-F', function (event) {

      console.log('F key');

      console.log("manageSession.userProfile: ")
      console.log(manageSession.userProfile)

      console.log("this.createOnlinePlayers: ")
      console.log(manageSession.createOnlinePlayers)

      console.log("this.createdPlayer: ")
      console.log(this.createdPlayer)
    }, this);

    this.input.keyboard.on('keyup-Q', function (event) {

      console.log('Q key');
      getAccount();

    }, this);

    this.input.keyboard.on('keyup-W', function (event) {

      console.log('W key');


    }, this);

    // //  Receives every single key down event, regardless of type

    // this.input.keyboard.on('keydown', function (event) {

    //   console.dir(event);

    // }, this);
  }

  createOnlinePlayers() {
    //manageSession.connectedOpponents //list of the opponents
    //for each of the opponents, attach a png,

    //TODO loading is broken, so I'm checking if the player avater has already loaded, after that I load onlineUsers
    if (this.createdPlayer) {
      //first check if onlineplayers need to be created
      if (manageSession.createOnlinePlayers) {
        console.log("creating onlineplayer")
        manageSession.createOnlinePlayers = false

        //manageSession.allConnnectedUsers are all the users that are in the stream, we first have to load the new arrivals: this.newOnlinePlayers
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
          const found = manageSession.allConnectedUsers.some(user => user.user_id === playerID)
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
        manageSession.allConnectedUsers.forEach(player => {
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
          //} else {
          //! if the avatar already existed; get the player from the onlinePlayers array !

          this.attachtAvatarToOnlinePlayer(element)
          //}
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


        console.log("manageSession.allConnectedUsers")
        console.log(manageSession.allConnectedUsers)

        //this.onlinePlayers = this.onlinePlayersGroup.getChildren()

        //? not necessary
        // manageSession.allConnectedUsers.forEach((player, i) => {

        //   var index = this.onlinePlayers.findIndex(function (player) {
        //     return player.user_id == manageSession.allConnectedUsers[i].user_id
        //   });

        //   this.onlinePlayers[index].active = true
        //   this.onlinePlayers[index].visible = true
        //   console.log("make all allConnectedUsers visible")
        //   console.log(this.onlinePlayers[index])
        // })
        //send player position over the network for the online users to see
        manageSession.sendMoveMessage(Math.round(this.player.x), Math.round(this.player.y));

      }//if (manageSession.createOnlinePlayers)
    }//if (manageSession.createdPlayer) 
  } //createRemotePlayer

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

  playerMovingByKeyBoard() {
    const speed = 175;
    const prevVelocity = this.player.body.velocity.clone();

    // Stop any previous movement from the last frame
    this.player.body.setVelocity(0);

    // Horizontal movement
    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-speed);

      // this.arrowDown = true;
      this.sendPlayerMovement();
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(speed);
      // this.arrowDown = true
      this.sendPlayerMovement();
    }

    // Vertical movement
    if (this.cursors.up.isDown) {
      this.player.body.setVelocityY(-speed);
      // this.arrowDown = true
      this.sendPlayerMovement();
    } else if (this.cursors.down.isDown) {
      this.player.body.setVelocityY(speed);
      // this.arrowDown = true
      this.sendPlayerMovement();
    }

    // Normalize and scale the velocity so that player can't move faster along a diagonal
    this.player.body.velocity.normalize().scale(speed);
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

  identifySurfaceOfSwiping() {
    // identifies if the pointer is down on a graffiti wall
    // if the condition is true, the avatar stops any movement
    this.input.on('pointerdown', (pointer, object) => {
      if (object[0] && object[0]?.name == "graffitiBrickWall" || object[0]?.name == "graffitiDotWall") {
        this.graffitiDrawing = true;
      }
    })
    this.input.on('pointerup', () => {
      this.graffitiDrawing = false
    })
  }

  playerMovingBySwiping() {
    if (this.input.activePointer.isDown
      && this.isClicking == false &&
      this.graffitiDrawing == false) {
      console.log("One")
      this.isClicking = true
    }
    if (
      !this.input.activePointer.isDown &&
      this.isClicking == true &&
      this.graffitiDrawing == false
    ) {
      console.log("Two")
      const playerX = this.player.x
      const playerY = this.player.y

      const swipeX = this.input.activePointer.upX - this.input.activePointer.downX
      const swipeY = this.input.activePointer.upY - this.input.activePointer.downY

      this.swipeAmount.x = swipeX
      this.swipeAmount.y = swipeY

      let moveSpeed = this.swipeAmount.length()
      if (moveSpeed > 450) moveSpeed = 450

      this.playerIsMovingByClicking = true; // trigger moving animation


      this.target.x = playerX + swipeX
      this.target.y = playerY + swipeY
      this.physics.moveToObject(this.player, this.target, moveSpeed * 2);
      this.isClicking = false;

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
    Player.loadOnlineAvatar(this)

    this.gameCam.zoom = this.UI_Scene.currentZoom;

    //.......................................................................

    // //........... PLAYER SHADOW .............................................................................
    this.playerShadow.x = this.player.x + this.playerShadowOffset
    this.playerShadow.y = this.player.y + this.playerShadowOffset
    // //........... end PLAYER SHADOW .........................................................................

    //.......... UPDATE TIMER      ..........................................................................
    manageSession.updateMovementTimer += delta;
    // console.log(time) //running time in millisec
    // console.log(delta) //in principle 16.6 (60fps) but drop to 41.8ms sometimes
    //....... end UPDATE TIMER  ..............................................................................

    //........ PLAYER MOVE BY KEYBOARD  ......................................................................
    if (!this.playerIsMovingByClicking) {
      this.playerMovingByKeyBoard();
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
    this.playerMovingBySwiping()
    this.identifySurfaceOfSwiping()

  } //update
} //class
