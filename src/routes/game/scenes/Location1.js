import ManageSession from '../ManageSession';

import PlayerDefault from '../class/PlayerDefault';
import PlayerDefaultShadow from '../class/PlayerDefaultShadow';
import Player from '../class/Player';
import Preloader from '../class/Preloader';
import BouncingBird from '../class/BouncingBird';
import GraffitiWall from '../class/GraffitiWall';
import CoordinatesTranslator from '../class/CoordinatesTranslator';
import GenerateLocation from '../class/GenerateLocation';
import SceneSwitcher from '../class/SceneSwitcher';
import Background from '../class/Background';
import Move from '../class/Move';
import { dlog } from '../helpers/DebugLog';


const { Phaser } = window;

export default class Location1 extends Phaser.Scene {
  constructor() {
    super('Location1');

    this.location = 'Location1';

    this.worldSize = new Phaser.Math.Vector2(3000, 3000);

    this.debug = false;

    this.gameStarted = false;
    this.phaser = this;
    // this.playerPos;
    this.onlinePlayers = [];

    this.newOnlinePlayers = [];

    this.avatarName = [];
    this.tempAvatarName = '';
    this.loadedAvatars = [];

    this.player = {};
    this.playerShadow = {};
    this.playerMovingKey = 'moving';
    this.playerStopKey = 'stop';
    this.playerAvatarKey = '';

    // .......................REX UI ............
    this.COLOR_PRIMARY = 0xff5733;
    this.COLOR_LIGHT = 0xffffff;
    this.COLOR_DARK = 0x000000;
    this.data = null;
    // ....................... end REX UI ......

    this.isClicking = false;
    this.cursorKeyIsDown = false;
    this.swipeDirection = 'down';
    this.swipeAmount = new Phaser.Math.Vector2(0, 0);
    this.target = new Phaser.Math.Vector2();
    this.distance = 1;
    this.distanceTolerance = 9;

    // shadow
    this.playerShadowOffset = -8;

    this.currentZoom = 1;
  }

  async preload() {
    // .... PRELOADER VISUALISER ..........................
    Preloader.Loading(this);

    this.load.image('art1', './assets/art_styles/drawing_painting/699f77a8e723a41f0cfbec5434e7ac5c.jpg');
    this.load.image('art2', './assets/art_styles/drawing_painting/f7f2e083a0c70b97e459f2966bc8c3ae.jpg');
    this.load.image('art3', './assets/art_styles/drawing_painting/doodle_dogman.png');
    this.load.image('art5', './assets/art_styles/drawing_painting/e13ad7758c0241352ffe203feffd6ff2.jpg');
    // .... end PRELOADER VISUALISER .......................
  }

  async create() {
    const { gameEditMode } = ManageSession;
    // copy worldSize over to ManageSession, so that positionTranslation can be done there
    ManageSession.worldSize = this.worldSize;

    this.generateBackground();
    //!
    // this.touchBackgroundCheck = this.add.rectangle(0, 0, this.worldSize.x, this.worldSize.y, 0xfff000);
    Background.rectangle({
      scene: this,
      posX: 0,
      posY: 0,
      color: 0xffff00,
      alpha: 1,
      width: this.worldSize.x,
      height: this.worldSize.y,
      name: 'touchBackgroundCheck',
      setOrigin: 0,
    });

    this.touchBackgroundCheck
    // draggable to detect player drag movement
      .setInteractive() // { useHandCursor: true } { draggable: true }
      .on('pointerup', () => dlog('touched background'))
      .on('pointerdown', () => { ManageSession.playerIsAllowedToMove = true; })
      .setDepth(219)
      .setOrigin(0);
    this.touchBackgroundCheck.setVisible(false);

    // this is needed for an image or sprite to be interactive also when alpha = 0 (invisible)
    this.touchBackgroundCheck.input.alwaysEnabled = true;

    // graffiti walls
    GraffitiWall.create(this, 2200, 600, 800, 600, 'graffitiBrickWall', 0x000000, 'brickWall');
    // GraffitiWall.create(this, 600, 1200, 600, 1200, "graffitiDotWall", 0x000000)

    // .......  PLAYER ..........................................................................

    //* create default player and playerShadow
    this.player = new PlayerDefault(
      this,
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 0),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 0),
      ManageSession.playerAvatarPlaceholder,
    ).setDepth(201);

    this.playerShadow = new PlayerDefaultShadow({
      scene: this,
      texture: ManageSession.playerAvatarPlaceholder,
    }).setDepth(200);

    // for back button, has to be done after player is created for the history tracking!
    SceneSwitcher.pushLocation(this);

    // Player.loadPlayerAvatar(this);
    // .......  end PLAYER .............................................................................

    // ....... onlinePlayers ...........................................................................

    // ....... end onlinePlayers .......................................................................

    // ....... PLAYER VS WORLD ..........................................................................
    this.gameCam = this.cameras.main; // .setBackgroundColor(0xFFFFFF);
    this.gameCam.zoom = 1;
    this.gameCam.startFollow(this.player);
    this.physics.world.setBounds(0, 0, this.worldSize.x, this.worldSize.y);
    // https://phaser.io/examples/v3/view/physics/arcade/world-bounds-event
    // ......... end PLAYER VS WORLD .......................................................................

    //     // 1 and 2
    //     this.gameCam.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    // // end 1 and 2
    // grid

    //! needed for handling object dragging // this is needed of each scene dragging is used
    this.input.on('dragstart', (pointer, gameObject) => {

    }, this);

    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;

      if (gameObject.name == 'handle') {
        gameObject.data.get('vector').set(dragX, dragY); // get the vector data for curve handle objects
      }
    }, this);

    this.input.on('dragend', function (pointer, gameObject) {
      const worldX = Math.round(CoordinatesTranslator.Phaser2DToArtworldX(this.worldSize.x, gameObject.x));
      const worldY = Math.round(CoordinatesTranslator.Phaser2DToArtworldY(this.worldSize.y, gameObject.y));


      // store the original scale when selecting the gameObject for the first time
      if (ManageSession.selectedGameObject !== gameObject) {
        ManageSession.selectedGameObject = gameObject;
        ManageSession.selectedGameObjectStartScale = gameObject.scale;
        ManageSession.selectedGameObjectStartPosition.x = gameObject.x;
        ManageSession.selectedGameObjectStartPosition.y = gameObject.y;
        console.log('editMode info startScale:', ManageSession.selectedGameObjectStartScale);
      }
      // ManageSession.selectedGameObject = gameObject

      console.log(
        'editMode info posX posY: ',
        worldX,
        worldY,
        'scale:',
        ManageSession.selectedGameObject.scale,
        'width*scale:',
        Math.round(ManageSession.selectedGameObject.width * ManageSession.selectedGameObject.scale),
        'height*scale:',
        Math.round(ManageSession.selectedGameObject.height * ManageSession.selectedGameObject.scale),
        'name:',
        ManageSession.selectedGameObject.name,
      );
    }, this);
    //!
    // ......... end PLAYER VS WORLD ......................................................................

    this.generateLocations();

    // this.generateBouncingBird()
    BouncingBird.generate(this, 900, 400, 1.5);

    Player.loadPlayerAvatar(this);
    // this.exampleREXUI()
  } // end create



  generateBackground() {
    //* .......... scattered art works for the demo .....................................................
    // this.add.image(0, 200, "background4").setOrigin(0,0).setScale(1.3)
    // this.add.image(0, -300, "background5").setOrigin(0, 0).setScale(1)

    Background.rectangle({
      scene: this,
      name: 'bgImageWhite',
      posX: 0,
      posY: 0,
      setOrigin: 0,
      color: 0xffffff,
      alpha: 1,
      width: this.worldSize.x,
      height: this.worldSize.y,
    });

    Background.repeatingDots({
      scene: this,
      gridOffset: 80,
      dotWidth: 2,
      dotColor: 0x7300ed,
      backgroundColor: 0xffffff,
    });

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
    const { gameEditMode } = ManageSession;
    let locationVector = new Phaser.Math.Vector2(-200, -200);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);
    const location3 = new GenerateLocation({
      scene: this,
      type: 'image',
      x: locationVector.x,
      y: locationVector.y,
      draggable: gameEditMode,
      locationDestination: 'Location3',
      locationImage: 'museum',
      enterButtonImage: 'enter_button',
      locationText: 'Location 3',
      referenceName: 'Location3',
      fontColor: 0x8dcb0e,
    });

    locationVector = new Phaser.Math.Vector2(200, 200);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);
    const location4 = new GenerateLocation({
      scene: this,
      type: 'isoTriangle',
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'Location4',
      locationImage: 'museum',
      enterButtonImage: 'enter_button',
      locationText: 'Location 4',
      fontColor: 0x8dcb0e,
      color1: 0x8dcb0e,
      color2: 0x3f8403,
      color3: 0x63a505,
    });
  }

  update() {
    const { gameEditMode } = ManageSession;

    // zoom in and out of game
    this.gameCam.zoom = ManageSession.currentZoom;

    // don't move the player with clicking and swiping in edit mode
    if (!gameEditMode) {
      // ...... ONLINE PLAYERS ................................................
      Player.parseNewOnlinePlayerArray(this);
      // ........... PLAYER SHADOW .............................................................................
      // the shadow follows the player with an offset
      this.playerShadow.x = this.player.x + this.playerShadowOffset;
      this.playerShadow.y = this.player.y + this.playerShadowOffset;
      // ........... end PLAYER SHADOW .........................................................................

      if (this.input.activePointer.downX != this.input.activePointer.upX) {
        Move.moveByDragging(this);
      } else {
        Move.moveByTapping(this);
      }
    } else {
      // when in edit mode
    }
  } // update
} // class
