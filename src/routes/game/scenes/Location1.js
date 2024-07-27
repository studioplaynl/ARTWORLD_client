import { get } from 'svelte/store';
import ManageSession from '../ManageSession';
import PlayerDefault from '../class/PlayerDefault';
import PlayerDefaultShadow from '../class/PlayerDefaultShadow';
import Player from '../class/Player';
import BouncingBird from '../class/BouncingBird';
import GraffitiWall from '../class/GraffitiWall';
import CoordinatesTranslator from '../class/CoordinatesTranslator';
import GenerateLocation from '../class/GenerateLocation';
import Background from '../class/Background';
import { SCENE_INFO, ART_DISPLAY_SIZE, ART_OFFSET_BETWEEN } from '../../../constants';
import { PlayerPos } from '../playerState';
import { handleEditMode, handlePlayerMovement } from '../helpers/InputHelper';
import { dlog } from '../../../helpers/debugLog';
import ServerCall from '../class/ServerCall';
import { getSceneInfo } from '../helpers/UrlHelpers';

import * as Phaser from 'phaser';

export default class Location1 extends Phaser.Scene {
  constructor() {
    super('Location1');

    this.worldSize = new Phaser.Math.Vector2(0, 0);

    this.debug = false;

    this.phaser = this;

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

    // shadow
    this.playerShadowOffset = -8;
  }

  async preload() {
    //!
    /** subscription to the loaderror event
     * strangely: if the more times the subscription is called, the more times the event is fired
     * so we subscribe here only once in the scene
     * so we don't have to remember to subribe to it when we download something that needs error handling
     */
    this.load.on('loaderror', (offendingFile) => {
      dlog('loaderror', offendingFile);
      if (typeof offendingFile !== 'undefined') {
        ServerCall.resolveLoadError(offendingFile);
      }
    });
    //!

    // .... PRELOADER VISUALISER ..........................
    this.load.image('art1', './assets/art_styles/drawing_painting/699f77a8e723a41f0cfbec5434e7ac5c.jpg');
    this.load.image('art2', './assets/art_styles/drawing_painting/f7f2e083a0c70b97e459f2966bc8c3ae.jpg');
    this.load.image('art3', './assets/art_styles/drawing_painting/doodle_dogman.png');
    this.load.image('art5', './assets/art_styles/drawing_painting/e13ad7758c0241352ffe203feffd6ff2.jpg');
    // .... end PRELOADER VISUALISER .......................
  }

  async create() {
    //!
    // show physics debug boundaries in gameEditMode
    if (ManageSession.gameEditMode) {
      this.physics.world.drawDebug = true;
    } else {
      this.physics.world.drawDebug = false;
      this.physics.world.debugGraphic.clear();
    }

    // get scene size from SCENE_INFO constants
    // copy worldSize over to ManageSession, so that positionTranslation can be done there
    const sceneInfo = getSceneInfo(SCENE_INFO, this.scene.key);

    this.worldSize.x = sceneInfo.sizeX;
    this.worldSize.y = sceneInfo.sizeY;
    ManageSession.worldSize = this.worldSize;
    //!

    const { artworldToPhaser2DX, artworldToPhaser2DY } = CoordinatesTranslator;

    handleEditMode(this);

    Background.standardWithDots(this);

    handlePlayerMovement(this);

    this.makeWoldElements();

    // graffiti walls
    GraffitiWall.create(this, 2200, 600, 800, 600, 'graffitiBrickWall', '0x000000', 'brickWall');
    // GraffitiWall.create(this, 600, 1200, 600, 1200, "graffitiDotWall", 0x000000)

    // .......  PLAYER ..........................................................................

    //* create default player and playerShadow
    this.player = new PlayerDefault(
      this,
      artworldToPhaser2DX(this.worldSize.x, get(PlayerPos).x),
      artworldToPhaser2DY(this.worldSize.y, get(PlayerPos).y)
    ).setDepth(201);

    this.playerShadow = new PlayerDefaultShadow({
      scene: this,
      texture: ManageSession.playerAvatarPlaceholder,
    }).setDepth(200);

    // Player.loadPlayerAvatar(this);
    // .......  end PLAYER .............................................................................

    // ....... onlinePlayers ...........................................................................

    // ....... end onlinePlayers .......................................................................

    // ....... PLAYER VS WORLD ..........................................................................
    this.gameCam = this.cameras.main; // .setBackgroundColor(0xFFFFFF);

    // UI scene is subscribed to zoom changes and passes it on to the current scene via ManageSession.currentScene
    this.gameCam.zoom = ManageSession.currentZoom;

    this.gameCam.startFollow(this.player);
    this.physics.world.setBounds(0, 0, this.worldSize.x, this.worldSize.y);
    // https://phaser.io/examples/v3/view/physics/arcade/world-bounds-event
    // ......... end PLAYER VS WORLD .......................................................................

    //     // 1 and 2
    //     this.gameCam.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    // // end 1 and 2
    // grid

    // ......... end PLAYER VS WORLD ......................................................................

    this.generateLocations();

    // this.generateBouncingBird()
    BouncingBird.generate(this, 900, 400, 1.5);

    this.loadAndPlaceLiked();
    this.likedBalloonAnimation();
    // .......... end likes ............................................................................

    Player.loadPlayerAvatar(this);
  } // end create

  likedBalloonAnimation() {
    this.balloonContainer = this.add.container(0, 0);

    this.likedBalloon = this.add.image(0, 0, 'likedBalloon');
    this.likedBalloon.name = 'likedBalloon';

    // CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 4000),
    //   CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 400),

    this.balloonContainer.add(this.likedBalloon);

    this.balloonContainer.setPosition(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, this.worldSize.x / 1.5),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 1200)
    );
    this.balloonContainer.setDepth(602);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.likedBalloon.setInteractive({ draggable: true });
    } else {
      // when not in edit mode add animation tween
      this.likedTween = this.tweens.add({
        targets: this.balloonContainer,
        duration: 90000,
        x: '-=8000',
        yoyo: false,
        repeat: -1,
        repeatDelay: 300,
        // ease: 'Sine.easeInOut',
        onRepeat() {
          // Your callback logic here
          ServerCall.replaceLikedsInBalloonContainer();
        },
      });
    }
  }

  async loadAndPlaceLiked() {
    //are accessed in Servercall.repositionContainers
    this.artDisplaySize = ART_DISPLAY_SIZE;
    this.artMargin = ART_OFFSET_BETWEEN;

    const type = 'downloadLikedDrawing';
    const serverObjectsHandler = ManageSession.likedStore;
    const userId = '';
    // dlog('this.location', location);
    const artSize = 256;
    const artMargin = artSize / 10;
    this.artMargin = artMargin;

    ServerCall.downloadAndPlaceArtByType({
      type,
      userId,
      serverObjectsHandler,
      artSize,
      artMargin,
    });
  }

  makeWoldElements() {
    //* .......... scattered art works for the demo .....................................................
    // this.add.image(0, 200, "background4").setOrigin(0,0).setScale(1.3)
    // this.add.image(0, -300, "background5").setOrigin(0, 0).setScale(1)

    //! this.add.rexCircleMaskImage(1400, 600, 'art1').setOrigin(0, 0).setScale(1); // stamp painting
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
      graphics.lineStyle(5, 0xff00ff, 1.0);
      graphics.beginPath();
      graphics.moveTo(800, 200 + i);
      graphics.lineTo(1200, 200 + i);
      graphics.closePath();
      graphics.strokePath();
    }

    for (let i = 0; i < 250; i += 60) {
      graphics.lineStyle(5, 0xff00ff, 1.0);
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

  generateLocations() {
    const { gameEditMode } = ManageSession;
    let locationVector = new Phaser.Math.Vector2(-200, -200);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);
    // eslint-disable-next-line no-unused-vars
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
    // eslint-disable-next-line no-unused-vars
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

    locationVector = new Phaser.Math.Vector2(544, -477);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);

    Background.circle({
      scene: this,
      name: 'purple_circle_location_image',
      // setOrigin: 0,
      posX: locationVector.x,
      posY: locationVector.y,
      gradient1: 0x7300eb,
      gradient2: 0x3a4bba,
      gradient3: 0x3a4bba,
      gradient4: 0x3a4bba,
      alpha: 1,
      size: 200,
      imageOnly: true,
    });

    this.purpleCircleLocation = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'Artworld',
      locationImage: 'purple_circle_location_image',
      enterButtonImage: 'enter_button',
      locationText: 'Paarse Cirkel Wereld',
      referenceName: 'this.purpleCircleLocation',
      fontColor: 0x8dcb0e,
    });
  }

  update() {
    const { gameEditMode } = ManageSession;

    // don't move the player with clicking and swiping in edit mode
    if (!gameEditMode) {
      // ...... ONLINE PLAYERS ................................................
      Player.parseNewOnlinePlayerArray(this);
      // ........... PLAYER SHADOW .............................................................................
      // the shadow follows the player with an offset
      this.playerShadow.x = this.player.x + this.playerShadowOffset;
      this.playerShadow.y = this.player.y + this.playerShadowOffset;
      // ........... end PLAYER SHADOW .........................................................................
    } else {
      // when in edit mode
    }
  } // update
} // class
