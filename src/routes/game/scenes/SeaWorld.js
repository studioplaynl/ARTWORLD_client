import { get } from 'svelte/store';
import ManageSession from '../ManageSession';
import PlayerDefault from '../class/PlayerDefault';
import PlayerDefaultShadow from '../class/PlayerDefaultShadow';
import Player from '../class/Player';
import Preloader from '../class/Preloader';
import Background from '../class/Background';
import CoordinatesTranslator from '../class/CoordinatesTranslator';
import GenerateLocation from '../class/GenerateLocation';
import ServerCall from '../class/ServerCall';
// eslint-disable-next-line no-unused-vars
import { dlog } from '../helpers/DebugLog';
import { PlayerPos, PlayerZoom } from '../playerState';
import { SCENE_INFO } from '../../../constants';
import { handleEditMode, handlePlayerMovement } from '../helpers/InputHelper';

const { Phaser } = window;

export default class SeaWorld extends Phaser.Scene {
  constructor() {
    super('SeaWorld');

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
    Preloader.Loading(this); // .... PRELOADER VISUALISER
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

    Background.gradientStretchedToFitWorld({
      scene: this,
      tileMapName: 'WorldBackgroundTileMap',
      gradientColor1: 0x68b7b6,
      gradientColor2: 0x457479,
      tileWidth: 512,
    });

    handlePlayerMovement(this);

    const {
      artworldToPhaser2DX, artworldToPhaser2DY,
    } = CoordinatesTranslator;

    // this.makeWorldElements();

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
    // ......... end PLAYER VS WORLD .......................................................................

    ServerCall.getHomesFiltered(this.scene.key, this);

    // create accessable locations
    this.generateLocations();
    this.makeWorldElements();
    // .......... end locations ............................................................................

    Player.loadPlayerAvatar(this);
  } // end create

  generateLocations() {
    // we set draggable on restart scene with a global flag

    let locationVector = new Phaser.Math.Vector2(0, 0);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
      this.worldSize,
      locationVector,
    );

    this.purpleCircleLocation = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'Artworld',
      locationImage: 'artWorldPortalSea',
      enterButtonImage: 'enter_button',
      locationText: 'Paarse Cirkel Wereld',
      referenceName: 'this.purpleCircleLocation',
      fontColor: 0x8dcb0e,
    });

    locationVector = new Phaser.Math.Vector2(-535, 35);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
      this.worldSize,
      locationVector,
    );

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
      referenceName: 'this.pencil',

      fontColor: 0x8dcb0e,
      color1: 0x8dcb0e,
      color2: 0x3f8403,
      color3: 0x63a505,
    });
    this.pencil.rotation = 0.12;
  }

  makeWorldElements() {
    // .........Zeeslang_head............................................................
    this.Zeeslang_head = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -1790),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 1598),
      'Zeeslang_head',
    );
    this.Zeeslang_head.name = 'Zeeslang_head';
    this.Zeeslang_head.setScale(2.5);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.Zeeslang_head.setInteractive({ draggable: true });
    }

    // .........Zeeslang_tail_B............................................................
    this.Zeeslang_tail_B = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -350),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 1488),
      'Zeeslang_tail_B',
    );
    this.Zeeslang_tail_B.name = 'Zeeslang_tail_B';
    this.Zeeslang_tail_B.setScale(2.1);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.Zeeslang_tail_B.setInteractive({ draggable: true });
    }

    // .........zeeRif_1............................................................
    this.zeeRif_1 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 2045),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -642),
      'zeeRif_1',
    );
    this.zeeRif_1.name = 'zeeRif_1';
    this.zeeRif_1.setScale(4);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.zeeRif_1.setInteractive({ draggable: true });
    }

    // .........zeeRif_1_1............................................................
    this.zeeRif_1_1 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -675),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -1802),
      'zeeRif_1',
    );
    this.zeeRif_1_1.name = 'zeeRif_1_1';
    this.zeeRif_1_1.setScale(4);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.zeeRif_1_1.setInteractive({ draggable: true });
    }

    // .........zeeRif_1_2............................................................
    this.zeeRif_1_2 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -675),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -1802),
      'zeeRif_1',
    );
    this.zeeRif_1_2.name = 'zeeRif_1_2';
    this.zeeRif_1_2.setScale(3);
    this.zeeRif_1_2.setFlipX(true);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.zeeRif_1_2.setInteractive({ draggable: true });
    }

    // .........zeeRif_1_3............................................................
    this.zeeRif_1_3 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 2120),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -1977),
      'zeeRif_1',
    );
    this.zeeRif_1_3.name = 'zeeRif_1_3';
    this.zeeRif_1_3.setScale(3.6);
    this.zeeRif_1_3.setFlipX(true);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.zeeRif_1_3.setInteractive({ draggable: true });
    }

    // .........zeeRif_2............................................................
    this.zeeRif_2 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 1150),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 2013),
      'zeeRif_2',
    );
    this.zeeRif_2.name = 'zeeRif_2';
    this.zeeRif_2.setScale(7);
    this.zeeRif_2.setRotation(0.04);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.zeeRif_2.setInteractive({ draggable: true });
    }

    // .........zeeRif_3............................................................
    this.zeeRif_3 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -1915),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 548),
      'zeeRif_3',
    );
    this.zeeRif_3.name = 'zeeRif_3';
    this.zeeRif_3.setScale(5);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.zeeRif_3.setInteractive({ draggable: true });
    }

    // .........zeeRif_3_2............................................................
    this.zeeRif_3_2 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 1350),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 418),
      'zeeRif_3',
    );
    this.zeeRif_3_2.name = 'zeeRif_3_2';
    this.zeeRif_3_2.setScale(4.3);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.zeeRif_3_2.setInteractive({ draggable: true });
    }


    // .........zeeRif_3_3............................................................
    this.zeeRif_3_3 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -1740),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -1717),
      'zeeRif_3',
    );
    this.zeeRif_3_3.name = 'zeeRif_3_3';
    this.zeeRif_3_3.setScale(3);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.zeeRif_3_3.setInteractive({ draggable: true });
    }

    // .........zeeRif_3_4............................................................
    this.zeeRif_3_4 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 720),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -1757),
      'zeeRif_3',
    );
    this.zeeRif_3_4.name = 'zeeRif_3_4';
    this.zeeRif_3_4.setScale(5.3);
    this.zeeRif_3_4.setFlipX(true);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.zeeRif_3_4.setInteractive({ draggable: true });
    }

    // .........Zeeslang_tail_A............................................................
    this.Zeeslang_tail_A = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 975),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 1508),
      'Zeeslang_tail_A',
    );
    this.Zeeslang_tail_A.name = 'Zeeslang_tail_A';
    this.Zeeslang_tail_A.setScale(2.1);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.Zeeslang_tail_A.setInteractive({ draggable: true });
    }

    // .........Zeeslang_tail_curveB............................................................
    this.Zeeslang_tail_curveB = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 1870),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 1048),
      'Zeeslang_tail_curveB',
    );
    this.Zeeslang_tail_curveB.name = 'Zeeslang_tail_curveB';
    this.Zeeslang_tail_curveB.setScale(2.1);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.Zeeslang_tail_curveB.setInteractive({ draggable: true });
    }

    // .........Zeeslang_tail_curveB_flip............................................................
    this.Zeeslang_tail_curveB_flip = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 1970),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 38),
      'Zeeslang_tail_curveB',
    );
    this.Zeeslang_tail_curveB_flip.name = 'Zeeslang_tail_curveB_flip';
    this.Zeeslang_tail_curveB_flip.setScale(1.9);
    this.Zeeslang_tail_curveB_flip.setFlipX(true);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.Zeeslang_tail_curveB_flip.setInteractive({ draggable: true });
    }

    // .........Zeeslang_tail_A_flip............................................................
    this.Zeeslang_tail_A_flip = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 1010),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -562),
      'Zeeslang_tail_A',
    );
    this.Zeeslang_tail_A_flip.name = 'Zeeslang_tail_A_flip';
    this.Zeeslang_tail_A_flip.setScale(1.7);
    this.Zeeslang_tail_A_flip.setFlipX(true);
    this.Zeeslang_tail_A_flip.rotation = -0.24;
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.Zeeslang_tail_A_flip.setInteractive({ draggable: true });
    }

    // .........Zeeslang_tail_B_flip............................................................
    this.Zeeslang_tail_B_flip = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -395),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -832),
      'Zeeslang_tail_B',
    );
    this.Zeeslang_tail_B_flip.name = 'Zeeslang_tail_B_flip';
    this.Zeeslang_tail_B_flip.setScale(1.6);
    this.Zeeslang_tail_B_flip.setFlipX(true);

    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.Zeeslang_tail_B_flip.setInteractive({ draggable: true });
    }


    // .........Zeeslang_tail_curveA............................................................
    this.Zeeslang_tail_curveA = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -1690),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -502),
      'Zeeslang_tail_curveA',
    );
    this.Zeeslang_tail_curveA.name = 'Zeeslang_tail_curveA';
    this.Zeeslang_tail_curveA.setScale(1.9);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.Zeeslang_tail_curveA.setInteractive({ draggable: true });
    }

    // .........Zeeslang_tail_curveA_flip............................................................
    this.Zeeslang_tail_curveA_flip = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -2035),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 148),
      'Zeeslang_tail_curveA',
    );
    this.Zeeslang_tail_curveA_flip.name = 'Zeeslang_tail_curveA_flip';
    this.Zeeslang_tail_curveA_flip.setScale(1.4);
    this.Zeeslang_tail_curveA_flip.setFlipX(true);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.Zeeslang_tail_curveA_flip.setInteractive({ draggable: true });
    }

    // .........Zeeslang_tail............................................................
    this.Zeeslang_tail = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -1370),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 503),
      'Zeeslang_tail',
    );
    this.Zeeslang_tail.name = 'Zeeslang_tail';
    this.Zeeslang_tail.setScale(1.2);
    this.Zeeslang_tail.setFlipX(true);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.Zeeslang_tail.setInteractive({ draggable: true });
    }

    // .........floating_egg_1............................................................
    this.floating_egg_1 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -795),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 203),
      'floating_egg',
    );
    this.floating_egg_1.name = 'floating_egg_1';
    this.floating_egg_1.setScale(2);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.floating_egg_1.setInteractive({ draggable: true });
    }

    // .........floating_egg_1_2............................................................
    this.floating_egg_1_2 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -840),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 658),
      'floating_egg',
    );
    this.floating_egg_1_2.name = 'floating_egg_1_2';
    this.floating_egg_1_2.setScale(1.8);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.floating_egg_1_2.setInteractive({ draggable: true });
    }

    // .........floating_egg_1_3............................................................
    this.floating_egg_1_3 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -860),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 893),
      'floating_egg',
    );
    this.floating_egg_1_3.name = 'floating_egg_1_3';
    this.floating_egg_1_3.setScale(1.6);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.floating_egg_1_3.setInteractive({ draggable: true });
    }

    // .........floating_egg_1_4............................................................
    this.floating_egg_1_4 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -635),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 858),
      'floating_egg',
    );
    this.floating_egg_1_4.name = 'floating_egg_1_4';
    this.floating_egg_1_4.setScale(2);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.floating_egg_1_4.setInteractive({ draggable: true });
    }

    // .........floating_egg_1_5............................................................
    this.floating_egg_1_5 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -615),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 713),
      'floating_egg',
    );
    this.floating_egg_1_5.name = 'floating_egg_1_5';
    this.floating_egg_1_5.setScale(2.2);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.floating_egg_1_5.setInteractive({ draggable: true });
    }

    // .........floating_egg_1_6............................................................
    this.floating_egg_1_6 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -280),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 553),
      'floating_egg',
    );
    this.floating_egg_1_6.name = 'floating_egg_1_6';
    this.floating_egg_1_6.setScale(1.9);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.floating_egg_1_6.setInteractive({ draggable: true });
    }

    // .........floating_egg_1_7............................................................
    this.floating_egg_1_7 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 145),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 668),
      'floating_egg',
    );
    this.floating_egg_1_7.name = 'floating_egg_1_7';
    this.floating_egg_1_7.setScale(1.8);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.floating_egg_1_7.setInteractive({ draggable: true });
    }

    // .........floating_egg_1_8............................................................
    this.floating_egg_1_8 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -1070),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 153),
      'floating_egg',
    );
    this.floating_egg_1_8.name = 'floating_egg_1_8';
    this.floating_egg_1_8.setScale(2);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.floating_egg_1_8.setInteractive({ draggable: true });
    }

    // .........floating_egg_1_9............................................................
    this.floating_egg_1_9 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -10),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 333),
      'floating_egg',
    );
    this.floating_egg_1_9.name = 'floating_egg_1_9';
    this.floating_egg_1_9.setScale(1.6);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.floating_egg_1_9.setInteractive({ draggable: true });
    }

    // .........floating_egg_1_10............................................................
    this.floating_egg_1_10 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -920),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 58),
      'floating_egg',
    );
    this.floating_egg_1_10.name = 'floating_egg_1_10';
    this.floating_egg_1_10.setScale(2);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.floating_egg_1_10.setInteractive({ draggable: true });
    }

    // .........floating_egg_1_11............................................................
    this.floating_egg_1_11 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 375),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 158),
      'floating_egg',
    );
    this.floating_egg_1_11.name = 'floating_egg_1_11';
    this.floating_egg_1_11.setScale(1.8);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.floating_egg_1_11.setInteractive({ draggable: true });
    }

    // .........floating_egg_1_12............................................................
    this.floating_egg_1_12 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 645),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 18),
      'floating_egg',
    );
    this.floating_egg_1_12.name = 'floating_egg_1_12';
    this.floating_egg_1_12.setScale(1.6);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.floating_egg_1_12.setInteractive({ draggable: true });
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
