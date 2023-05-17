import { get } from 'svelte/store';
import ManageSession from '../ManageSession';
import PlayerDefault from '../class/PlayerDefault';
import PlayerDefaultShadow from '../class/PlayerDefaultShadow';
import Player from '../class/Player';
// import Preloader from '../class/Preloader';
import GraffitiWall from '../class/GraffitiWall';
import Background from '../class/Background';
import CoordinatesTranslator from '../class/CoordinatesTranslator';
import GenerateLocation from '../class/GenerateLocation';
import Exhibition from '../class/Exhibition';
// eslint-disable-next-line no-unused-vars
import { dlog } from '../helpers/DebugLog';
import { PlayerPos, PlayerZoom } from '../playerState';
import { SCENE_INFO } from '../../../constants';
import { handleEditMode, handlePlayerMovement } from '../helpers/InputHelper';

const { Phaser } = window;

export default class Artworld extends Phaser.Scene {
  constructor() {
    super('Artworld');

    this.worldSize = new Phaser.Math.Vector2(0, 0);

    this.debug = false;

    this.phaser = this;

    this.player = {};
    this.playerShadow = {};
    this.playerMovingKey = 'moving';
    this.playerStopKey = 'stop';
    this.playerAvatarKey = '';

    // testing
    this.resolveLoadErrorCache = [];

    this.homes = [];
    this.homesRepreseneted = [];

    // shadow
    this.playerShadowOffset = -8;
  }

  async preload() {
    ManageSession.currentScene = this.scene; // getting a central scene context
    // Preloader.Loading(this); // .... PRELOADER VISUALISER
  }

  async create() {
    //!
    // get scene size from SCENE_INFO constants
    // copy worldSize over to ManageSession, so that positionTranslation can be done there
    const sceneInfo = SCENE_INFO.find((obj) => obj.scene === this.scene.key);
    this.worldSize.x = sceneInfo.sizeX;
    this.worldSize.y = sceneInfo.sizeY;
    ManageSession.worldSize = this.worldSize;
    //!

    handleEditMode(this);

    Background.standardWithDots(this);

    handlePlayerMovement(this);

    const {
      artworldToPhaser2DX, artworldToPhaser2DY,
    } = CoordinatesTranslator;

    this.makeWorldElements();

    // .......  PLAYER ..........................................JA even ..........................................
    //* create default player and playerShadow
    //* create player in center with artworldCoordinates
    this.player = new PlayerDefault(
      this,
      artworldToPhaser2DX(this.worldSize.x, get(PlayerPos).x),
      artworldToPhaser2DY(this.worldSize.y, get(PlayerPos).y),
      ManageSession.playerAvatarPlaceholder,
    ).setDepth(201);

    this.playerShadow = new PlayerDefaultShadow({
      scene: this,
      texture: ManageSession.playerAvatarPlaceholder,
    }).setDepth(200);

    // for back button, has to be done after player is created for the history tracking!
    // SceneSwitcher.pushLocation(this);

    // ....... PLAYER VS WORLD .............................................................................
    this.gameCam = this.cameras.main; // .setBackgroundColor(0xFFFFFF);

    PlayerZoom.subscribe((zoom) => {
      this.gameCam.zoom = zoom;
    });

    this.gameCam.startFollow(this.player);
    // this.physics.world.setBounds(0, 0, this.worldSize.x, this.worldSize.y);
    // https://phaser.io/examples/v3/view/physics/arcade/world-bounds-event
    // ......... end PLAYER VS WORLD .......................................................................

    // .......... locations ................................................................................
    // ServerCall.getHomesFiltered('GreenSquare', this);
    this.generateLocations();
    // .......... end locations ............................................................................

    Player.loadPlayerAvatar(this);
  } // end create

  makeWorldElements() {
    Background.circle({
      scene: this,
      name: 'gradientAmsterdam1',
      posX: CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 1743),
      posY: CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -634),
      size: 810,
      gradient1: 0x85feff,
      gradient2: 0xff01ff,
    });
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) { this.gradientAmsterdam1.setInteractive({ draggable: true }); }

    Background.circle({
      scene: this,
      name: 'gradientAmsterdam2',
      posX: CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -2093),
      posY: CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 1011),
      size: 564,
      gradient1: 0xfbff00,
      gradient2: 0x85feff,
    });
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) { this.gradientAmsterdam2.setInteractive({ draggable: true }); }

    Background.circle({
      scene: this,
      name: 'purple_circle',
      posX: CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 0),
      posY: CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 0),
      size: 558,
      gradient1: 0x7300EB,
      gradient2: 0x3a4bba,
    });
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) { this.purple_circle.setInteractive({ draggable: true }); }

    // ............................................... homes area .....................................
    // grass background for houses
    Background.circle({
      scene: this,
      name: 'gradientGrass1',
      posX: CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -2107),
      posY: CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 120),
      size: 920,
      gradient1: 0x15d64a,
      gradient2: 0x2b8042,
    });
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) { this.gradientGrass1.setInteractive({ draggable: true }); }

    // paths for the houses
    this.createCurveWithHandles();

    // sunglass_stripes
    this.sunglasses_stripes = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -893),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 1129),
      'sunglass_stripes',
    );
    this.sunglasses_stripes.name = 'sunglass_stripes';
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) { this.sunglasses_stripes.setInteractive({ draggable: true }); }

    this.train = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 652),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 1357),
      'metro_train_grey',
    );
    this.train.name = 'train';
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.train.setInteractive({ draggable: true });
    } else {
      // when not in edit mode add animation tween
      this.tweens.add({
        targets: this.train,
        duration: 3000,
        x: '+=1750',
        yoyo: false,
        repeat: -1,
        repeatDelay: 8000,
        // ease: 'Sine.easeInOut'
      });
    }


    // create(scene, x, y, width, height, name, color, imageFile = null) {
    GraffitiWall.create(
      this,
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 2323),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 1306),
      800,
      400,
      'graffitiBrickWall',
      0,
      'brickWall',
    );
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) { this.graffitiBrickWall.setInteractive({ draggable: true }); }

    // ...................................................................................................
    // DRAW A SUN

    Background.circle({
      scene: this,
      name: 'sunDrawingExample',
      posX: CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 1269),
      posY: CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 2200),
      size: 400,
      gradient1: 0xffdf87,
      gradient2: 0xf7f76f,
    });
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.sunDrawingExample.setInteractive({ draggable: true });
    } else {
      // when we are not in edit mode
      this.tweens.add({
        targets: this.sunDrawingExample,
        duration: 3000,
        scaleX: 1.8,
        scaleY: 1.8,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      this.sunDrawingExample.setInteractive()
        .on('pointerup', () => {
          this.sunDraw.setVisible(true);
          this.sunDrawCloseButton.setVisible(true);
          this.sunDrawSaveButton.setVisible(true);
          this.physics.pause();
        });

      GraffitiWall.create(
        this,
        CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 1383),
        CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 1600),
        400,
        400,
        'sunDraw',
        180,
        'artFrame_512',
      );
      this.sunDraw.setVisible(false);


      this.sunDrawCloseButton = this.add.image(
        this.sunDraw.x + (this.sunDraw.width / 1.8),
        this.sunDraw.y - (this.sunDraw.width / 2),

        'close',
      );
      this.sunDrawCloseButton.setInteractive()
        .on('pointerup', () => {
          this.sunDraw.setVisible(false);
          this.sunDrawCloseButton.setVisible(false);
          this.sunDrawSaveButton.setVisible(false);
          this.physics.resume();
        });
      this.sunDrawCloseButton.setVisible(false);

      this.sunDrawSaveButton = this.add.image(
        this.sunDrawCloseButton.x,
        this.sunDrawCloseButton.y + (this.sunDrawCloseButton.width * 1.1),

        'save',
      );
      this.sunDrawSaveButton.setInteractive()
        .on('pointerup', () => {
          const RT = this.sunDraw.getByName('sunDraw');
          RT.saveTexture('DrawnSun');
          this.sunDrawingExample.setTexture('DrawnSun');
        });
      this.sunDrawSaveButton.setVisible(false);
    }
    // end DRAW A SUN
    // ......................................................................................

    // ...............................................
    // DRAW A CLOUD

    this.cloudDrawingExample = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 1200),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 2050),

      'drawn_cloud',
    );
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    this.cloudDrawingExample.name = 'cloudDrawingExample';
    if (ManageSession.gameEditMode) {
      this.cloudDrawingExample.setInteractive({ draggable: true });
    } else {
      this.tweens.add({
        targets: this.cloudDrawingExample,
        duration: 8000,
        x: '-=1600',
        // scaleY: 1.8,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      this.cloudDrawingExample.setInteractive()
        .on('pointerup', () => {
          this.cloudDraw.setVisible(true);
          this.cloudDrawCloseButton.setVisible(true);
          this.cloudDrawSaveButton.setVisible(true);
        });

      GraffitiWall.create(
        this,
        CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 1200),
        CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 1500),
        600,
        400,
        'cloudDraw',
        2,
        'artFrame_512',
      );
      this.cloudDraw.setVisible(false);

      this.cloudDrawCloseButton = this.add.image(
        this.cloudDraw.x + (this.cloudDraw.width / 1.8),
        this.cloudDraw.y - (this.cloudDraw.width / 1.8),

        'close',
      );
      this.cloudDrawCloseButton.setInteractive()
        .on('pointerup', () => {
          this.cloudDraw.setVisible(false);
          this.cloudDrawCloseButton.setVisible(false);
          this.cloudDrawSaveButton.setVisible(false);
        });
      this.cloudDrawCloseButton.setVisible(false);

      this.cloudDrawSaveButton = this.add.image(
        this.cloudDrawCloseButton.x,
        this.cloudDrawCloseButton.y + (this.cloudDrawCloseButton.width * 1.1),

        'save',
      );
      this.cloudDrawSaveButton.setInteractive()
        .on('pointerup', () => {
          const RT = this.cloudDraw.getByName('cloudDraw');
          RT.saveTexture('DrawnCloud');
          this.cloudDrawingExample.setTexture('DrawnCloud');
        });
      this.cloudDrawSaveButton.setVisible(false);
    }
    // end DRAW A CLOUD
    // ...................................................................................................


    // ...................................................................................................
    this.photo_camera = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 662),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 1377),

      'photo_camera',
    ).setFlip(true, false);
    this.photo_camera.name = 'photo_camera';
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) { this.photo_camera.setInteractive({ draggable: true }); }

    this.tree_palm = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 992),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 772),
      'tree_palm',
    );
    this.tree_palm.name = 'tree_palm';
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) { this.tree_palm.setInteractive({ draggable: true }); }

    Exhibition.AbriBig({
      scene: this,
      name: 'exhibit_outdoor_big1',
      posX: CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -300),
      posY: CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 1262),
      size: 564,
    });
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) { this.exhibit_outdoor_big1.setInteractive({ draggable: true }); }


    Exhibition.AbriSmall2({
      scene: this,
      name: 'exhibit_outdoor_small2_1',
      posX: CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 1659),
      posY: CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 287),
      size: 564,
    });
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) { this.exhibit_outdoor_small2_1.setInteractive({ draggable: true }); }
  }

  /** Create a curve with handles in edit mode
 * @todo Work in progress, replace with CurveWithHandles class? */
  createCurveWithHandles() {
    // const path = { t: 0, vec: new Phaser.Math.Vector2() };

    this.curve = new Phaser.Curves.Spline([
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -2497),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 328),
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -2254),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 146),
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -2128),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -173),
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -1806),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -3),
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -1849),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 467),
    ]);

    const { points } = this.curve;

    //  Create drag-handles for each point
    if (ManageSession.gameEditMode) {
      for (let i = 0; i < points.length; i++) {
        const point = points[i];

        this.handle = this.add.image(point.x, point.y, 'ball', 0).setScale(0.1).setInteractive().setDepth(40);
        this.handle.name = 'handle';

        this.handle.setData('vector', point);

        this.input.setDraggable(this.handle);
      }
    }
    this.curveGraphics = this.add.graphics();
    this.curveGraphics.lineStyle(60, 0xffff00, 1);
    this.curve.draw(this.curveGraphics, 64);
  }

  generateLocations() {
    let locationVector = new Phaser.Math.Vector2(-400, 300);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
      this.worldSize,
      locationVector,
    );

    Background.rectangle({
      scene: this,
      name: 'green_square_location_image',
      // posX: 0,
      // posY: 0,
      // setOrigin: 0,
      gradient1: 0x15d64a,
      gradient2: 0x15d64a,
      gradient3: 0x2b8042,
      gradient4: 0x2b8042,
      alpha: 1,
      width: 140,
      height: 140,
      imageOnly: true,
    });

    this.greenSquareLocation = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'GreenSquare',
      locationImage: 'green_square_location_image',
      enterButtonImage: 'enter_button',
      locationText: 'Groene Vierkant Wereld',
      referenceName: 'this.greenSquareLocation',
      fontColor: 0x8dcb0e,
    });

    locationVector = new Phaser.Math.Vector2(2, 460);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
      this.worldSize,
      locationVector,
    );

    this.fireWorldLocation = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'FireWorld',
      locationImage: 'fireWorldPortal',
      enterButtonImage: 'enter_button',
      locationText: 'Vuur Wereld',
      referenceName: 'this.fireWorldLocation',
      fontColor: 0x8dcb0e,
    });

    locationVector = new Phaser.Math.Vector2(-436, -56);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
      this.worldSize,
      locationVector,
    );

    this.yellowDiamondLocation = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'YellowDiamond',
      locationImage: 'yellow_diamond_location_image',
      enterButtonImage: 'enter_button',
      locationText: 'Gele Diamant Wereld',
      referenceName: 'this.yellowDiamondLocation',
      fontColor: 0x8dcb0e,
    });

    locationVector = new Phaser.Math.Vector2(355, 332);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
      this.worldSize,
      locationVector,
    );

    this.blueSailLocation = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'BlueSail',
      locationImage: 'blue_sail_location_image',
      enterButtonImage: 'enter_button',
      locationText: 'Blauwe Zeil Wereld',
      referenceName: 'this.blueSailLocation',
      fontColor: 0x8dcb0e,
    });

    locationVector = new Phaser.Math.Vector2(449, -14);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
      this.worldSize,
      locationVector,
    );

    Background.triangle({
      scene: this,
      name: 'turquoise_triangle_location_image',
      // setOrigin: 0,
      posX: locationVector.x,
      posY: locationVector.y,
      gradient1: 0x40E0D0,
      gradient2: 0x40E0D0,
      gradient3: 0x39C9BB,
      gradient4: 0x39C9BB,
      alpha: 1,
      size: 200,
      imageOnly: true,
    });

    this.turquoiseTriangle = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'TurquoiseTriangle',
      locationImage: 'turquoise_triangle_location_image',
      enterButtonImage: 'enter_button',
      locationText: 'Turquoise Driehoek Wereld',
      referenceName: 'this.turquoiseTriangle',
      fontColor: 0x8dcb0e,
    });

    locationVector = new Phaser.Math.Vector2(-407, -403);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
      this.worldSize,
      locationVector,
    );

    Background.star({
      scene: this,
      name: 'red_star_location_image',
      gradient1: 0xE50000,
      gradient2: 0xE50000,
      alpha: 1,
      size: 200,
      imageOnly: true,
      spikes: 5,
    });

    this.redStar = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'RedStar',
      locationImage: 'red_star_location_image',
      enterButtonImage: 'enter_button',
      locationText: 'Rode Ster Wereld',
      referenceName: 'this.redStar',
      fontColor: 0x8dcb0e,
    });

    locationVector = new Phaser.Math.Vector2(16, -483);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
      this.worldSize,
      locationVector,
    );

    this.robotWorldLocation = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'RobotWorld',
      locationImage: 'robotWorldPortal',
      enterButtonImage: 'enter_button',
      locationText: 'Robot Wereld',
      referenceName: 'this.robotWorldLocation',
      fontColor: 0x8dcb0e,
    });

    locationVector = new Phaser.Math.Vector2(394, -389);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
      this.worldSize,
      locationVector,
    );

    this.slimeWorldLocation = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'SlimeWorld',
      locationImage: 'slimeWorldPortal',
      enterButtonImage: 'enter_button',
      locationText: 'Slijm Wereld',
      referenceName: 'this.slimeWorldLocation',
      fontColor: 0x8dcb0e,
    });

    locationVector = new Phaser.Math.Vector2(-783, 642);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
      this.worldSize,
      locationVector,
    );

    this.marsWorldLocation = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'MarsWorld',
      locationImage: 'marsWorldPortal',
      enterButtonImage: 'enter_button',
      locationText: 'Mars Wereld',
      referenceName: 'this.marsWorldLocation',
      size: 226,
      fontColor: 0x8dcb0e,
    });

    locationVector = new Phaser.Math.Vector2(409, 730);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
      this.worldSize,
      locationVector,
    );

    this.underwaterWorldLocation = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'UnderwaterWorld',
      locationImage: 'underwaterWorldPortal',
      enterButtonImage: 'enter_button',
      locationText: 'Onderwater Wereld',
      referenceName: 'this.underwaterWorldLocation',
      size: 300,
      fontColor: 0x8dcb0e,
    });


    locationVector = new Phaser.Math.Vector2(-935, 45);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
      this.worldSize,
      locationVector,
    );

    this.seaWorldLocation = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'SeaWorld',
      locationImage: 'seaWorldPortal',
      enterButtonImage: 'enter_button',
      locationText: 'Zee Wereld',
      referenceName: 'this.seaWorldLocation',
      size: 300,
      fontColor: 0x8dcb0e,
    });

    locationVector = new Phaser.Math.Vector2(-370, 677);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
      this.worldSize,
      locationVector,
    );

    this.cloudWorldLocation = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'CloudWorld',
      locationImage: 'cloudWorldPortal',
      enterButtonImage: 'enter_button',
      locationText: 'Wolken Wereld',
      referenceName: 'this.cloudWorldLocation',
      fontColor: 0x8dcb0e,
    });

    locationVector = new Phaser.Math.Vector2(-1295, 439);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
      this.worldSize,
      locationVector,
    );

    this.moonWorldLocation = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'MoonWorld',
      locationImage: 'artWorldPortalMoon',
      enterButtonImage: 'enter_button',
      locationText: 'Maan Wereld',
      referenceName: 'this.moonWorldLocation',
      fontColor: 0x8dcb0e,
    });

    // ---- Location 1 ----------------------
    locationVector = new Phaser.Math.Vector2(-1215, -589);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
      this.worldSize,
      locationVector,
    );

    this.location1 = new GenerateLocation({
      scene: this,
      type: 'isoBox',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'Location1',
      enterButtonImage: 'enter_button',
      locationText: 'Location 1',
      referenceName: 'Location1',
      fontColor: 0x8dcb0e,
      color1: 0xffe31f,
      color2: 0xf2a022,
      color3: 0xf8d80b,
    });


    //* set the particle first on 0,0 so they are below the mario_star
    //* later move them relative to the mario_star
    // var particles = this.add.particles('music_quarter_note').setDepth(139)

    // var music_emitter = particles.createEmitter({
    //   x: 0,
    //   y: 0,
    //   lifespan: { min: 2000, max: 8000 },
    //   speed: { min: 80, max: 120 },
    //   angle: { min: 270, max: 360 },
    //   gravityY: -50,
    //   gravityX: 50,
    //   scale: { start: 1, end: 0 },
    //   quantity: 1,
    //   frequency: 1600,
    // })

    // sound apps ............................................................

    locationVector = new Phaser.Math.Vector2(-667, -763);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
      this.worldSize,
      locationVector,
    );

    this.mario_star = new GenerateLocation({
      scene: this,
      type: 'image',
      size: 200,
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      externalUrl: 'https://minghai.github.io/MarioSequencer/',
      locationImage: 'mario_star',
      enterButtonImage: 'enter_button',
      locationText: 'Mario Sound',
      referenceName: 'MarioSound',
      fontColor: 0x8dcb0e,
      color1: 0x8dcb0e,
      color2: 0x3f8403,
      color3: 0x63a505,
    });
    this.mario_star.setDepth(140);

    locationVector = new Phaser.Math.Vector2(-247, -1048);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
      this.worldSize,
      locationVector,
    );

    this.mario_star = new GenerateLocation({
      scene: this,
      type: 'image',
      size: 200,
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      externalUrl: 'https://musiclab.chromeexperiments.com/Song-Maker/',
      locationImage: 'songmaker',
      enterButtonImage: 'enter_button',
      locationText: 'Song Maker',
      referenceName: 'songmaker',
      fontColor: 0x8dcb0e,
      color1: 0x8dcb0e,
      color2: 0x3f8403,
      color3: 0x63a505,
    });
    this.mario_star.setDepth(140);

    locationVector = new Phaser.Math.Vector2(532, -781);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
      this.worldSize,
      locationVector,
    );

    this.mario_star = new GenerateLocation({
      scene: this,
      type: 'image',
      size: 200,
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      externalUrl: 'https://musiclab.chromeexperiments.com/Kandinsky/',
      locationImage: 'kandinsky',
      enterButtonImage: 'enter_button',
      locationText: 'Kandinsky Sound',
      referenceName: 'kandinsky',
      fontColor: 0x8dcb0e,
      color1: 0x8dcb0e,
      color2: 0x3f8403,
      color3: 0x63a505,
    });
    this.mario_star.setDepth(140);
    // music_emitter.setPosition(this.mario_star.x + 15, this.mario_star.y - 20)



    locationVector = new Phaser.Math.Vector2(143, -1056);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
      this.worldSize,
      locationVector,
    );

    this.mario_star = new GenerateLocation({
      scene: this,
      type: 'image',
      size: 200,
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      externalUrl: 'https://musiclab.chromeexperiments.com/Melody-Maker/',
      locationImage: 'melodymaker',
      enterButtonImage: 'enter_button',
      locationText: 'Melody Maker',
      referenceName: 'melodymaker',
      fontColor: 0x8dcb0e,
      color1: 0x8dcb0e,
      color2: 0x3f8403,
      color3: 0x63a505,
    });
    this.mario_star.setDepth(140);

    locationVector = new Phaser.Math.Vector2(-2125, 1017);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
      this.worldSize,
      locationVector,
    );
    // end sound apps ............................................................
    this.pencil = new GenerateLocation({
      scene: this,
      type: 'image',

      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      appUrl: 'drawing',
      locationImage: 'pencil',
      enterButtonImage: 'enter_button',
      locationText: 'drawingApp',
      referenceName: 'drawingApp',
      fontColor: 0x8dcb0e,
      color1: 0x8dcb0e,
      color2: 0x3f8403,
      color3: 0x63a505,
    });
    this.pencil.rotation = 0.12;

    locationVector = new Phaser.Math.Vector2(-1555, 809);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
      this.worldSize,
      locationVector,
    );

    this.animalGardenChallenge = new GenerateLocation({
      scene: this,
      type: 'image',

      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'ChallengeAnimalGarden',
      locationImage: 'dinoA',
      enterButtonImage: 'enter_button',
      locationText: 'animal Garden',
      referenceName: 'animalGardenChallenge',
      fontColor: 0x8dcb0e,
      color1: 0x8dcb0e,
      color2: 0x3f8403,
      color3: 0x63a505,
    });

    locationVector = new Phaser.Math.Vector2(1464, 989);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
      this.worldSize,
      locationVector,
    );

    this.flowerFieldChallenge = new GenerateLocation({
      scene: this,
      type: 'image',

      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'ChallengeFlowerField',
      locationImage: 'flower',
      enterButtonImage: 'enter_button',
      locationText: 'bloemen Veld',
      referenceName: 'flowerFieldChallenge',
      fontColor: 0x8dcb0e,
      color1: 0x8dcb0e,
      color2: 0x3f8403,
      color3: 0x63a505,
    });
  }

  update() {
    // don't move the player with clicking and swiping in edit mode
    if (!ManageSession.gameEditMode) {
      // ...... ONLINE PLAYERS ................................................
      Player.parseNewOnlinePlayerArray(this);
      // ........... PLAYER SHADOW .............................................................................
      // the shadow follows the player with an offset
      this.playerShadow.x = this.player.x + this.playerShadowOffset;
      this.playerShadow.y = this.player.y + this.playerShadowOffset;
      // ........... end PLAYER SHADOW .........................................................................
    } else {
      // when in edit mode
      this.updateCurveGraphics();
    }
  } // update

  updateCurveGraphics() {
    this.curveGraphics.clear();
    this.curveGraphics.lineStyle(60, 0xffff00, 1);
    this.curve.draw(this.curveGraphics, 64);
  }
} // class
