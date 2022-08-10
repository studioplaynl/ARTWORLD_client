import { CONFIG } from '../../../constants';
import ManageSession from '../ManageSession';
import { getAccount } from '../../../api.js';

import PlayerDefault from '../class/PlayerDefault';
import PlayerDefaultShadow from '../class/PlayerDefaultShadow.js';
import Player from '../class/Player.js';
import Preloader from '../class/Preloader.js';
import BouncingBird from '../class/BouncingBird.js';
import GraffitiWall from '../class/GraffitiWall.js';
import CoordinatesTranslator from '../class/CoordinatesTranslator.js';
import GenerateLocation from '../class/GenerateLocation.js';
import SceneSwitcher from '../class/SceneSwitcher.js';
import Move from '../class/Move.js';

const { Phaser } = window;

export default class Location1 extends Phaser.Scene {
  constructor() {
    super('Location1');

    this.worldSize = new Phaser.Math.Vector2(3000, 3000);

    this.debug = false;

    this.gameStarted = false;
    this.phaser = this;
    // this.playerPos;
    this.onlinePlayers = [];

    this.newOnlinePlayers = [];

    this.currentOnlinePlayer;
    this.avatarName = [];
    this.tempAvatarName = '';
    this.loadedAvatars = [];

    this.player;
    this.playerShadow;
    this.playerAvatarPlaceholder = 'playerAvatar';
    this.playerAvatarKey = '';
    this.playerMovingKey = 'moving';
    this.playerStopKey = 'stop';

    this.offlineOnlineUsers;

    this.location = 'Location1';

    // .......................REX UI ............
    this.COLOR_PRIMARY = 0xff5733;
    this.COLOR_LIGHT = 0xffffff;
    this.COLOR_DARK = 0x000000;
    this.data;
    // ....................... end REX UI ......

    this.cursors;
    this.pointer;
    this.isClicking = false;
    this.arrowDown = false;
    this.swipeDirection = 'down';
    this.swipeAmount = new Phaser.Math.Vector2(0, 0);

    // pointer location example
    // this.source // = player
    this.target = new Phaser.Math.Vector2();
    this.distance;

    // shadow
    this.playerShadowOffset = -8;
    this.playerIsMovingByClicking = false;

    this.currentZoom;
  }

  async preload() {
    // .... PRELOADER VISUALISER ...............................................................................................
    Preloader.Loading(this);
    // .... end PRELOADER VISUALISER ...............................................................................................

    // ....... IMAGES ......................................................................
    this.load.image('sky', './assets/sky.png');
    this.load.image('star', './assets/star.png');
    this.load.image('ground', 'assets/platform.png');

    this.load.image('entrance', 'assets/entrance.jpg');

    // test backgrounds
    // this.load.image("background1", "./assets/test_backgrounds/wp4676605-4k-pc-wallpapers.jpg")
    // this.load.image("background2", "./assets/test_backgrounds/desktop112157.jpg")
    // this.load.image("background3", "./assets/test_backgrounds/desktop251515.jpg")
    // this.load.image("background4", "./assets/test_backgrounds/desktop512758.jpg")
    this.load.image('background5', './assets/test_backgrounds/desktop1121573.jpg');

    this.load.image('art1', './assets/art_styles/drawing_painting/699f77a8e723a41f0cfbec5434e7ac5c.jpg');
    this.load.image('art2', './assets/art_styles/drawing_painting/f7f2e083a0c70b97e459f2966bc8c3ae.jpg');
    this.load.image('art3', './assets/art_styles/drawing_painting/doodle_dogman.png');
    // this.load.image("art4", "./assets/art_styles/drawing_painting/87b2481918d9c9491c9b998008a2053c.jpg") // 30ties style graphic

    this.load.image('art5', './assets/art_styles/drawing_painting/e13ad7758c0241352ffe203feffd6ff2.jpg');

    this.load.image('exhibit1', './assets/art_styles/people/04b49a9aa5f7ada5d8d96deba709c9d4.jpg');
    this.load.image('exhibit2', './assets/art_styles/repetition/4c15d943b5b4993b42917fbfb5996c1f.jpg');
    this.load.image('exhibit3', './assets/art_styles/repetition/dd5315e5a77ff9601259325341a0bca9.jpg');
    this.load.image('exhibit4', './assets/art_styles/people/28bc857da206c33c5f97bfbcf40e9970.jpg');
    // ....... end IMAGES ......................................................................

    // ....... TILEMAP .........................................................................
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
    // ....... end TILEMAP ......................................................................
  }

  async create() {
    this.generateBackground();
    this.touchBackgroundCheck = this.add.rectangle(0, 0, this.worldSize.x, this.worldSize.y, 0xfff000)
      .setInteractive() // { useHandCursor: true }
      .on('pointerup', () => console.log('touched background'))
      .on('pointerdown', () => ManageSession.playerIsAllowedToMove = true)
      .setDepth(219)
      .setOrigin(0)
      .setVisible(false);

    this.touchBackgroundCheck.input.alwaysEnabled = true; // this is needed for an image or sprite to be interactive also when alpha = 0 (invisible)

    // graffiti walls
    GraffitiWall.create(this, 2200, 600, 800, 600, 'graffitiBrickWall', 0x000000, 'brickWall');
    // GraffitiWall.create(this, 600, 1200, 600, 1200, "graffitiDotWall", 0x000000)

    // .......  PLAYER ..........................................................................
    // set playerAvatarKey to a placeholder, so that the player loads even when the networks is slow, and the dependencies on player will funciton
    this.playerAvatarPlaceholder = 'avatar1';

    //* create default player and playerShadow
    this.player = new PlayerDefault(this, CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 0), CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 0), this.playerAvatarPlaceholder).setDepth(201);
    this.playerShadow = new PlayerDefaultShadow({ scene: this, texture: this.playerAvatarPlaceholder }).setDepth(200);

    // for back button, has to be done after player is created for the history tracking!
    SceneSwitcher.pushLocation(this);

    Player.loadPlayerAvatar(this);
    // .......  end PLAYER .............................................................................

    // ....... onlinePlayers ...........................................................................

    // ....... end onlinePlayers .......................................................................

    // ....... PLAYER VS WORLD ..........................................................................
    this.gameCam = this.cameras.main; // .setBackgroundColor(0xFFFFFF);

    //     // 1 and 2
    //     this.gameCam.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    // // end 1 and 2
    // grid
    //! setBounds has to be set before follow, otherwise the camera doesn't follow!
    this.gameCam.setBounds(0, 0, this.worldSize.x, this.worldSize.y);
    this.gameCam.zoom = 1;
    // end grid
    this.gameCam.startFollow(this.player);

    // this.player.setCollideWorldBounds(true);

    // Watch the player and worldLayer for collisions, for the duration of the scene:
    // -->off
    // this.physics.add.collider(this.player, worldLayer);
    // <--off
    // ......... end PLAYER VS WORLD ......................................................................

    this.generateLocations();

    // this.generateBouncingBird()
    BouncingBird.generate(this, 900, 400, 1.5);

    // this.exampleREXUI()
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

    // https://codepen.io/rexrainbow/pen/Gazmyz
    const videoPanel = this.CreateMainPanel(this, 1600, 1500)
      .layout()
      // .drawBounds(this.add.graphics(), 0xff0000)
      .popUp(1000);

    //* feature discussion about ui plugin
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
          padding: 1,
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
      },
    })
      .layout();
    // .drawBounds(this.add.graphics(), 0xff0000);

    // Add children-interactive
    // this.input.topOnly = true;
    const panel = this.scrollablePanel.getElement('panel');
    const print = this.add.text(0, 0, '');
    this.rexUI.setChildrenInteractive(this.scrollablePanel, {
      targets: [
        panel.getByName('skills', true),
        panel.getByName('items', true),
      ],
    })
      .on('child.click', (child) => {
        const category = child.getParentSizer().name;
        print.text += `${category}:${child.text}\n`;
      });
  }

  CreateMainPanel(scene, x, y) {
    // Create elements
    const background = scene.rexUI.add.roundRectangle(0, 0, 0, 0, 20, this.COLOR_DARK);
    const videoPanel = this.CreateVideoPanel(scene);
    const controllerPanel = this.CreateControllerPanel(scene);
    this.ControlVideo(controllerPanel, videoPanel);
    // Compose elemets
    const mainPanel = scene.rexUI.add.sizer({
      orientation: 'y',
      x,
      y,
    })
      .addBackground(background)
      .add(videoPanel, 0, 'center', {
        left: 20, right: 20, top: 20, bottom: 10,
      }, true)
      .add(controllerPanel, 0, 'center', { left: 20, right: 20, bottom: 20 }, true);

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
        fixedWidth: 50,
        fixedHeight: 36,
        valign: 'center',
        halign: 'right',
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
      .setDisplaySize(600, 337.5);
  }

  ControlVideo(controller, video) {
    // Play button
    let played = false;
    const playButton = controller.getElement('icon');
    playButton
      .setInteractive()
      .on('pointerdown', () => {
        const textureKey = playButton.texture.key;
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
    let lastVideoProgress;
    video.scene.events.on('update', () => {
      const currentVideoProgress = video.getProgress();
      if (lastVideoProgress !== currentVideoProgress) {
        lastVideoProgress = currentVideoProgress;
        controller.value = currentVideoProgress;
        controller.text = Math.floor(video.getCurrentTime() * 10) / 10;
      }
    });
    controller.on('valuechange', (newValue) => {
      if (video.getProgress() !== newValue) {
        video.seekTo(newValue);
      }
    });
  }

  createPanel(scene, data) {
    const sizer = scene.rexUI.add.sizer({
      orientation: 'x',
      space: { item: 10 },
    })
      .add(
        this.createHeader(scene, data), // child
        { expand: true },
      )
      .add(
        this.createTable(scene, data, 'skills', 1), // child
        { expand: true },
      )
      .add(
        this.createTable(scene, data, 'items', 2), // child
        { expand: true },
      );
    return sizer;
  }

  createHeader(scene, data) {
    const title = scene.rexUI.add.label({
      orientation: 'x',
      text: scene.add.text(0, 0, 'Character'),
    });
    const picture = scene.add.rexCircleMaskImage(0, 0, 'art1').setScale(0.1);
    const header = scene.rexUI.add.label({
      orientation: 'y',
      icon: picture,
      text: scene.add.text(0, 0, data.name),

      space: { icon: 10 },
    });

    return scene.rexUI.add.sizer({
      orientation: 'y',
      space: {
        left: 5, right: 5, top: 5, bottom: 5, item: 10,
      },
    })
      .addBackground(
        scene.rexUI.add.roundRectangle(0, 0, 0, 0, 0, undefined).setStrokeStyle(2, this.COLOR_LIGHT, 1),
      )
      .add(
        title, // child
        { expand: true, align: 'left' },
      )
      .add(
        header, // child
        { proportion: 1, expand: true },
      );
  }

  createTable(scene, data, key, rows) {
    const capKey = key.charAt(0).toUpperCase() + key.slice(1);
    const title = scene.rexUI.add.label({
      orientation: 'x',
      text: scene.add.text(0, 0, capKey),
    });

    const items = data[key];
    const columns = Math.ceil(items.length / rows);
    const table = scene.rexUI.add.gridSizer({
      column: columns,
      row: rows,

      rowProportions: 1,
      space: { column: 10, row: 10 },
      name: key, // Search this name to get table back
    });

    let item; let r; let
      c;
    const iconSize = (rows === 1) ? 80 : 40;
    for (let i = 0, cnt = items.length; i < cnt; i++) {
      item = items[i];
      r = i % rows;
      c = (i - r) / rows;
      table.add(
        this.createIcon(scene, item, iconSize, iconSize),
        c,
        r,
        'top',
        0,
        true,
      );
    }

    return scene.rexUI.add.sizer({
      orientation: 'y',
      space: {
        left: 10, right: 10, top: 10, bottom: 10, item: 10,
      },
    })
      .addBackground(
        scene.rexUI.add.roundRectangle(0, 0, 0, 0, 0, undefined).setStrokeStyle(2, this.COLOR_LIGHT, 1),
      )
      .add(
        title, // child
        0, // proportion
        'left', // align
        0, // paddingConfig
        true, // expand
      )
      .add(
        table, // child
        1, // proportion
        'center', // align
        0, // paddingConfig
        true, // expand
      );
  }

  createIcon(scene, item, iconWidth, iconHeight) {
    const label = scene.rexUI.add.label({
      orientation: 'y',
      icon: scene.rexUI.add.roundRectangle(0, 0, iconWidth, iconHeight, 5, this.COLOR_LIGHT),
      text: scene.add.text(0, 0, item.name),

      space: { icon: 3 },
    });
    return label;
  }

  generateLocations() {
    let locationVector = new Phaser.Math.Vector2(-200, -200);

    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);
    const location3 = new GenerateLocation({
      scene: this, type: 'image', x: locationVector.x, y: locationVector.y, locationDestination: 'Location3', locationImage: 'museum', enterButtonImage: 'enter_button', locationText: 'Location 3', fontColor: 0x8dcb0e,
    });

    locationVector = new Phaser.Math.Vector2(200, 200);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);
    const location4 = new GenerateLocation({
      scene: this, type: 'isoTriangle', x: locationVector.x, y: locationVector.y, locationDestination: 'Location4', locationImage: 'museum', enterButtonImage: 'enter_button', locationText: 'Location 4', fontColor: 0x8dcb0e, color1: 0x8dcb0e, color2: 0x3f8403, color3: 0x63a505,
    });
  }

  generateBackground() {
    // fill in textures

    /// *........... white background of 6000x6000 pix .............................................................
    this.add.rectangle(0, 0, 8000, 8000, 0xFFFFFF);

    //* ........... repeating pattern on the white background .............................................................
    const gridWidth = 4000;
    const offset = 50;

    // ......... repeating dots as pattern on white background .............................................................
    // background dot size
    const dotWidth = 2;

    // create the dot: graphics
    const bgDot = this.add.graphics();
    bgDot.fillStyle(0x909090);
    bgDot.fillCircle(dotWidth, dotWidth, dotWidth).setVisible(false);

    // create renderTexture
    const bgDotRendertexture = this.add.renderTexture(0, 0, dotWidth * 2, dotWidth * 2);

    // draw gaphics to renderTexture
    bgDotRendertexture.draw(bgDot);

    // save the rendertexture with a key ('dot')
    const t = bgDotRendertexture.saveTexture('dot');

    for (let i = 0; i < gridWidth; i += offset) {
      for (let j = 0; j < gridWidth; j += offset) {
        this.add.image(i, j, 'dot').setOrigin(0);
      }
    }
    // ......... end repeating dots ...................................................................

    //* .......... scattered art works for the demo .....................................................
    // this.add.image(0, 200, "background4").setOrigin(0,0).setScale(1.3)
    // this.add.image(0, -300, "background5").setOrigin(0, 0).setScale(1)

    this.add.rexCircleMaskImage(1400, 600, 'art1').setOrigin(0, 0).setScale(1); // stamp painting
    // this.add.image(300, 1200, "art2").setOrigin(0, 0).setScale(1.3) //keith harring
    this.add.image(800, 1200, 'art3').setOrigin(0, 0).setScale(1.5); // dog doodle
    // this.add.image(2400, 200, "art4").setOrigin(0, 0).setScale(1) // 30ties style graphic
    this.add.image(300, 1200, 'art5').setOrigin(0, 0).setScale(1.6); // keith harring

    //* .......... end scattered art works for the demo .................................................

    //* ............. graphics as examples for the demo ..................................................
    const graphics = this.add.graphics();

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

    const rectangle = this.add.graphics();
    rectangle.setVisible(false);
    rectangle.fillGradientStyle(0xff0000, 0xff0000, 0xffff00, 0xffff00, 1);
    rectangle.fillRect(0, 0, 400, 400);

    const rt = this.add.renderTexture(200, 100, 600, 600);
    const rt2 = this.add.renderTexture(100, 600, 600, 600);

    rt.draw(rectangle);
    rt2.draw(rectangle);

    const eraser = this.add.circle(0, 0, 190, 0x000000);
    eraser.setVisible(false);

    rt.erase(eraser, 200, 200);

    rt2.erase(rt, 0, 0);

    rt2.x = 400;
    rt2.y = 600;

    //* ............. end graphics as examples for the demo .............................................
  }

  createDebugText() {
    this.headerText = this.add
      .text(CONFIG.WIDTH / 2, 20, '', {
        fontFamily: 'Arial',
        fontSize: '36px',
      })
      .setOrigin(0.5)
      .setScrollFactor(0) // fixed on screen
      .setShadow(3, 3, '#000000', 0)
      .setDepth(1000);

    this.add
      .text(
        this.headerText.x,
        this.headerText.y,
        `user_id: ${this.playerIdText}`,
        {
          fontFamily: 'Arial',
          fontSize: '16px',
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0) // fixed on screen
      .setInteractive() // make clickable
      .setShadow(1, 1, '#000000', 0)
      .setDepth(1000);

    this.opponentsIdText = this.add
      .text(this.headerText.x, this.playerIdText.y + 14, '', {
        fontFamily: 'Arial',
        fontSize: '11px',
      })
      .setOrigin(0.5)
      .setScrollFactor(0) // fixed on screen
      .setDepth(1000);

    this.allConnectedUsersText = `onlineUsers[ ]: ${JSON.parse(ManageSession.allConnectedUsers)}`;

    this.add.text(110, 20, this.allConnectedUsersText, { fontFamily: 'Arial', fontSize: '22px' })
      .setOrigin(0.5)
      .setScrollFactor(0) // fixed on screen
      .setShadow(1, 1, '#000000', 0)
      .setDepth(1000);

    this.allConnectedUsersText2 = this.add.text(110, 40, '', { fontFamily: 'Arial', fontSize: '22px' })
      .setOrigin(0.5)
      .setScrollFactor(0) // fixed on screen
      .setShadow(1, 1, '#000000', 0)
      .setDepth(1000);

    this.onlinePlayersText = this.add.text(110, 70, 'onlinePlayers[ ]', { fontFamily: 'Arial', fontSize: '22px' })
      .setOrigin(0.5)
      .setScrollFactor(0) // fixed on screen
      .setShadow(1, 1, '#000000', 0)
      .setDepth(300);

    this.onlinePlayersText2 = this.add.text(110, 90, '', { fontFamily: 'Arial', fontSize: '22px' })
      .setOrigin(0.5)
      .setScrollFactor(0) // fixed on screen
      .setShadow(1, 1, '#000000', 0)
      .setDepth(1000);

    this.onlinePlayersGroupText = this.add.text(110, 120, 'playersGroup[ ]', { fontFamily: 'Arial', fontSize: '22px' })
      .setOrigin(0.5)
      .setScrollFactor(0) // fixed on screen
      .setShadow(1, 1, '#000000', 0)
      .setDepth(1000);

    this.onlinePlayersGroupText2 = this.add.text(110, 140, '', { fontFamily: 'Arial', fontSize: '22px' })
      .setOrigin(0.5)
      .setScrollFactor(0) // fixed on screen
      .setShadow(1, 1, '#000000', 0)
      .setDepth(1000);
  }

  update(time, delta) {
    // ...... ONLINE PLAYERS ................................................
    Player.parseNewOnlinePlayerArray(this);
    // .......................................................................

    this.gameCam.zoom = ManageSession.currentZoom;

    // ........... PLAYER SHADOW .............................................................................
    // the shadow follows the player with an offset
    this.playerShadow.x = this.player.x + this.playerShadowOffset;
    this.playerShadow.y = this.player.y + this.playerShadowOffset;
    // ........... end PLAYER SHADOW .........................................................................

    // to detect if the player is clicking/tapping on one place or swiping
    if (this.input.activePointer.downX != this.input.activePointer.upX) {
      Move.moveBySwiping(this);
    } else {
      Move.moveByTapping(this);
    }
  } // update
} // class
