import { get } from 'svelte/store';
import ManageSession from '../ManageSession';
import PlayerDefault from '../class/PlayerDefault';
import PlayerDefaultShadow from '../class/PlayerDefaultShadow';
import Player from '../class/Player';
import Background from '../class/Background';
import CoordinatesTranslator from '../class/CoordinatesTranslator';
import GenerateLocation from '../class/GenerateLocation';
import ServerCall from '../class/ServerCall';

import { dlog } from '../../../helpers/debugLog';
import { PlayerPos } from '../playerState';

import { SCENE_INFO, ART_DISPLAY_SIZE, ART_OFFSET_BETWEEN } from '../../../constants';

import { handleEditMode, handlePlayerMovement } from '../helpers/InputHelper';
import { findSceneInfo } from '../helpers/UrlHelpers';

import * as Phaser from 'phaser';

export default class UnderwaterWorld extends Phaser.Scene {
  constructor() {
    super('UnderwaterWorld');

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

    // underwaterworld
    this.load.image('artWorldPortalUnderwater', './assets/world_underwater_blue/Portaal_naarhuis_water.png');
    this.load.image('bubbles_1_water', './assets/world_underwater_blue/bubbles_1_water.png');
    this.load.image('cloud01_water', './assets/world_underwater_blue/cloud01_water.png');
    this.load.image('Inkvis_water', './assets/world_underwater_blue/Inkvis_water.png');
    this.load.image('jellyvis1_water', './assets/world_underwater_blue/jellyvis1_water.png');
    this.load.image('koral_water_01', './assets/world_underwater_blue/koral_water_01.png');
    this.load.image('koral_water_02', './assets/world_underwater_blue/koral_water_02.png');
    this.load.image('koral_water_03', './assets/world_underwater_blue/koral_water_03.png');
    this.load.image('koral_water_04', './assets/world_underwater_blue/koral_water_04.png');
    this.load.image('light1_water', './assets/world_underwater_blue/light1_water.png');
    this.load.image('light_2_water', './assets/world_underwater_blue/light_2_water.png');
    this.load.image('Rif_1_a', './assets/world_underwater_blue/Rif_1_a.png');
    this.load.image('Rif_1_b', './assets/world_underwater_blue/Rif_1_b.png');
    this.load.image('Rif_1_c', './assets/world_underwater_blue/Rif_1_c.png');
    this.load.image('Rif_2_a', './assets/world_underwater_blue/Rif_2_a.png');
    this.load.image('Rif_2_b', './assets/world_underwater_blue/Rif_2_b.png');
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
    const sceneInfo = findSceneInfo(SCENE_INFO, this.scene.key);

    this.worldSize.x = sceneInfo.sizeX;
    this.worldSize.y = sceneInfo.sizeY;
    ManageSession.worldSize = this.worldSize;
    //!

    handleEditMode(this);

    const { artworldToPhaser2DX, artworldToPhaser2DY } = CoordinatesTranslator;

    Background.gradientStretchedToFitWorld({
      scene: this,
      tileMapName: 'WorldBackgroundTileMap',
      gradientColor1: 0x729fee,
      gradientColor2: 0x173b72,
      tileWidth: 512,
    });

    Background.rectangle({
      scene: this,
      gradient1: 0x325ca3,
      gradient2: 0x325ca3,
      gradient3: 0xffffff,
      gradient4: 0xffffff,
      alpha: 1,
      width: 512,
      height: 512,
      posX: this.worldSize.x / 2,
      posY: 760,
      name: 'backgroundSky',
    });
    // this.backgroundSky.setScale(11, 3);
    this.backgroundSky.displayWidth = this.worldSize.x;
    this.backgroundSky.displayHeight = 760 * 2;
    handlePlayerMovement(this);

    // this.makeWorldElements();

    // .......  PLAYER ..........................................JA even ..........................................
    //* create default player and playerShadow
    //* create player in center with artworldCoordinates
    this.player = new PlayerDefault(
      this,
      artworldToPhaser2DX(this.worldSize.x, get(PlayerPos).x),
      artworldToPhaser2DY(this.worldSize.y, get(PlayerPos).y)
    ).setDepth(201);

    this.playerShadow = new PlayerDefaultShadow({
      scene: this,
      texture: ManageSession.playerAvatarPlaceholder,
    }).setDepth(200);

    // ....... PLAYER VS WORLD .............................................................................
    this.gameCam = this.cameras.main; // .setBackgroundColor(0xFFFFFF);

    // UI scene is subscribed to zoom changes and passes it on to the current scene via ManageSession.currentScene
    this.gameCam.zoom = ManageSession.currentZoom;

    this.gameCam.startFollow(this.player);
    // ......... end PLAYER VS WORLD .......................................................................

    await ServerCall.getHomesFiltered(this.scene.key, this);

    // create accessable locations
    this.generateLocations();
    this.makeWorldElements();
    // .......... end locations ............................................................................

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
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 1800)
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

  generateLocations() {
    // we set draggable on restart scene with a global flag

    let locationVector = new Phaser.Math.Vector2(650, 1143);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);

    this.purpleCircleLocation = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'Artworld',
      locationImage: 'artWorldPortalUnderwater',
      enterButtonImage: 'enter_button',
      locationText: 'Paarse Cirkel Wereld',
      referenceName: 'this.purpleCircleLocation',
      fontColor: 0x8dcb0e,
      size: 300,
    });
    this.purpleCircleLocation.setScale(3);
  }

  makeWorldElements() {
    // .........cloud01_water_1............................................................
    this.cloud01_water_1 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -417),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 2078),
      'cloud01_water'
    );
    this.cloud01_water_1.name = 'cloud01_water_1';
    this.cloud01_water_1.setScale(5.34);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.cloud01_water_1.setInteractive({ draggable: true });
    }
    // .........cloud01_water_2............................................................
    this.cloud01_water_2 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -1787),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 2113),
      'cloud01_water'
    );
    this.cloud01_water_2.name = 'cloud01_water_2';
    this.cloud01_water_2.setScale(2.0);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.cloud01_water_2.setInteractive({ draggable: true });
    }
    // .........cloud01_water_3............................................................
    this.cloud01_water_3 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 1167),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 2153),
      'cloud01_water'
    );
    this.cloud01_water_3.name = 'cloud01_water_3';
    this.cloud01_water_3.setScale(2.1);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.cloud01_water_3.setInteractive({ draggable: true });
    }

    // .........light1_water............................................................
    this.light1_water = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 1067),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 697),
      'light1_water'
    );
    this.light1_water.name = 'light1_water';
    this.light1_water.setScale(0.9);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.light1_water.setInteractive({ draggable: true });
    }

    // .........light_2_water............................................................
    this.light_2_water = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -907),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 272),
      'light_2_water'
    );
    this.light_2_water.name = 'light_2_water';
    this.light_2_water.setScale(1.5);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.light_2_water.setInteractive({ draggable: true });
    }

    // .........Rif_1_c............................................................
    this.Rif_1_c = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 1515),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -1688),
      'Rif_1_c'
    );
    this.Rif_1_c.name = 'Rif_1_c';
    this.Rif_1_c.setScale(2.79);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.Rif_1_c.setInteractive({ draggable: true });
    }

    // .........Rif_2_a............................................................
    this.Rif_2_a = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 73),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -1440),
      'Rif_2_a'
    );
    this.Rif_2_a.name = 'Rif_2_a';
    this.Rif_2_a.setScale(1.35);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.Rif_2_a.setInteractive({ draggable: true });
    }

    // .........Inkvis_water............................................................
    this.Inkvis_water = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -1417),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -985),
      'Inkvis_water'
    );
    this.Inkvis_water.name = 'Inkvis_water';
    this.Inkvis_water.setScale(1.98);
    // this.Inkvis_water.setFlipX(true);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.Inkvis_water.setInteractive({ draggable: true });
    }
    // .........Rif_1_a............................................................
    this.Rif_1_a = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -1242),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -2275),
      'Rif_1_a'
    );
    this.Rif_1_a.name = 'Rif_1_a';
    this.Rif_1_a.setScale(2.89);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.Rif_1_a.setInteractive({ draggable: true });
    }

    // .........Rif_1_b_1............................................................
    this.Rif_1_b_1 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 1246),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -2302),
      'Rif_1_b'
    );
    this.Rif_1_b_1.name = 'Rif_1_b_1';
    this.Rif_1_b_1.setScale(3.39);
    // this.Rif_1_b_2.setFlipX(true);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.Rif_1_b_1.setInteractive({ draggable: true });
    }
    // .........Rif_2_b_2............................................................
    this.Rif_2_b_2 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -2300),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -1745),
      'Rif_2_b'
    );
    this.Rif_2_b_2.name = 'Rif_2_b_2';
    this.Rif_2_b_2.setScale(1.03);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.Rif_2_b_2.setInteractive({ draggable: true });
    }
    // .........Rif_2_b_3............................................................
    this.Rif_2_b_3 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -1330),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -1715),
      'Rif_2_b'
    );
    this.Rif_2_b_3.name = 'Rif_2_b_3';
    this.Rif_2_b_3.setScale(0.67);
    this.Rif_2_b_3.setFlipX(true);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.Rif_2_b_3.setInteractive({ draggable: true });
    }
    // ............................................................................................................

    // .........Rif_2_b_1............................................................
    this.Rif_2_b_1 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 1630),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -1020),
      'Rif_2_b'
    );
    this.Rif_2_b_1.name = 'Rif_2_b_1';
    this.Rif_2_b_1.setScale(2.13);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.Rif_2_b_1.setInteractive({ draggable: true });
    }
    // ............................................................................................................

    // .........koral_water_01............................................................
    this.koral_water_01 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 1483),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -1765),
      'koral_water_01'
    );
    this.koral_water_01.name = 'koral_water_01';
    this.koral_water_01.setScale(1.0);
    this.koral_water_01.setDepth(202);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.koral_water_01.setInteractive({ draggable: true });
    }

    // .........koral_water_03_1............................................................
    this.koral_water_03_1 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 1835),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -1339),
      'koral_water_03'
    );
    this.koral_water_03_1.name = 'koral_water_03_1';
    this.koral_water_03_1.setScale(0.64);
    this.koral_water_03_1.setDepth(202);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.koral_water_03_1.setInteractive({ draggable: true });
    }
    // .........koral_water_03_2............................................................
    this.koral_water_03_2 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 2240),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -2290),
      'koral_water_03'
    );
    this.koral_water_03_2.name = 'koral_water_03_2';
    this.koral_water_03_2.setScale(1.0);
    this.koral_water_03_2.setDepth(202);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.koral_water_03_2.setInteractive({ draggable: true });
    }
    // .........koral_water_04_2............................................................
    this.koral_water_04_2 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 2163),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -1728),
      'koral_water_04'
    );
    this.koral_water_04_2.name = 'koral_water_04_2';
    this.koral_water_04_2.setScale(1);
    this.koral_water_04_2.setDepth(202);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.koral_water_04_2.setInteractive({ draggable: true });
    }

    // .........koral_water_04_1............................................................
    this.koral_water_04_1 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 58),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -988),
      'koral_water_04'
    );
    this.koral_water_04_1.name = 'koral_water_04_1';
    this.koral_water_04_1.setScale(1);
    this.koral_water_04_1.setDepth(202);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.koral_water_04_1.setInteractive({ draggable: true });
    }
    // .........koral_water_02............................................................
    this.koral_water_02 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 765),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -1783),
      'koral_water_02'
    );
    this.koral_water_02.name = 'koral_water_02';
    this.koral_water_02.setScale(1.0);
    this.koral_water_02.setDepth(202);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.koral_water_02.setInteractive({ draggable: true });
    }

    // .........jellyvis1_water_1............................................................
    this.jellyvis1_water_1 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 763),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -510),
      'jellyvis1_water'
    );
    this.jellyvis1_water_1.name = 'jellyvis1_water_1';
    this.jellyvis1_water_1.setScale(0.6);
    this.jellyvis1_water_1.rotation = -0.12;
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.jellyvis1_water_1.setInteractive({ draggable: true });
    }
    // .........jellyvis1_water_2............................................................
    this.jellyvis1_water_2 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 263),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -595),
      'jellyvis1_water'
    );
    this.jellyvis1_water_2.name = 'jellyvis1_water_2';
    this.jellyvis1_water_2.setScale(0.7);
    this.jellyvis1_water_2.rotation = -0.12;
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.jellyvis1_water_2.setInteractive({ draggable: true });
    }
    // .........jellyvis1_water_3............................................................
    this.jellyvis1_water_3 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 523),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -500),
      'jellyvis1_water'
    );
    this.jellyvis1_water_3.name = 'jellyvis1_water_3';
    this.jellyvis1_water_3.setScale(0.8);
    this.jellyvis1_water_3.rotation = -0.22;
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.jellyvis1_water_3.setInteractive({ draggable: true });
    }
    // .........jellyvis1_water_4............................................................
    this.jellyvis1_water_4 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 768),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -1015),
      'jellyvis1_water'
    );
    this.jellyvis1_water_4.name = 'jellyvis1_water_4';
    this.jellyvis1_water_4.setScale(1);
    this.jellyvis1_water_4.rotation = -0.32;
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.jellyvis1_water_4.setInteractive({ draggable: true });
    }

    // .........bubbles_1_water_1............................................................
    this.bubbles_1_water_1 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 968),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -1267),
      'bubbles_1_water'
    );
    this.bubbles_1_water_1.name = 'bubbles_1_water_1';
    this.bubbles_1_water_1.setScale(1.0);
    this.bubbles_1_water_1.setDepth(202);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.bubbles_1_water_1.setInteractive({ draggable: true });
    }
    // .........bubbles_1_water_2............................................................
    this.bubbles_1_water_2 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 68),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -532),
      'bubbles_1_water'
    );
    this.bubbles_1_water_2.name = 'bubbles_1_water_2';
    this.bubbles_1_water_2.setScale(1.0);
    this.bubbles_1_water_2.setFlipX(true);
    this.bubbles_1_water_2.setDepth(202);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.bubbles_1_water_2.setInteractive({ draggable: true });
    }
    // .........bubbles_1_water_3............................................................
    this.bubbles_1_water_3 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 713),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -857),
      'bubbles_1_water'
    );
    this.bubbles_1_water_3.name = 'bubbles_1_water_3';
    this.bubbles_1_water_3.setScale(1.0);
    this.bubbles_1_water_3.setFlipX(true);
    this.bubbles_1_water_3.setDepth(202);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.bubbles_1_water_3.setInteractive({ draggable: true });
    }
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

      // ....... stopping PLAYER ......................................................................................
      // Move.checkIfPlayerReachedMoveGoal(this) // to stop the player when it reached its destination
      // ....... end stopping PLAYER .................................................................................
    }
  } // update
} // class
