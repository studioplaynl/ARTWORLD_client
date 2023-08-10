import { get } from 'svelte/store';
import ManageSession from '../ManageSession';
import PlayerDefault from '../class/PlayerDefault';
import PlayerDefaultShadow from '../class/PlayerDefaultShadow';
import Player from '../class/Player';
import Background from '../class/Background';
import CoordinatesTranslator from '../class/CoordinatesTranslator';
import GenerateLocation from '../class/GenerateLocation';
import ServerCall from '../class/ServerCall';
// eslint-disable-next-line no-unused-vars
import { dlog } from '../../../helpers/debugLog';
import { PlayerPos, PlayerZoom } from '../playerState';
import { SCENE_INFO } from '../../../constants';
import { handleEditMode, handlePlayerMovement } from '../helpers/InputHelper';

const { Phaser } = window;

export default class SlimeWorld extends Phaser.Scene {
  constructor() {
    super('SlimeWorld');

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
    const sceneInfo = SCENE_INFO.find((obj) => obj.scene === this.scene.key);
    this.worldSize.x = sceneInfo.sizeX;
    this.worldSize.y = sceneInfo.sizeY;
    ManageSession.worldSize = this.worldSize;
    //!

    handleEditMode(this);

    Background.gradientStretchedToFitWorld({
      scene: this,
      tileMapName: 'WorldBackgroundTileMap',
      gradientColor1: 0xc0d72c,
      gradientColor2: 0x7c8305,
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
      locationImage: 'artWorldPortalSlime',
      enterButtonImage: 'enter_button',
      locationText: 'Paarse Cirkel Wereld',
      referenceName: 'this.purpleCircleLocation',
      fontColor: 0x8dcb0e,
    });
    this.purpleCircleLocation.setScale(1.5);
  }

  makeWorldElements() {
    // .........bubbleface1_slime............................................................
    this.bubbleface1_slime = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 1989),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 1853),
      'bubbleface1_slime',
    );
    this.bubbleface1_slime.name = 'bubbleface1_slime';
    this.bubbleface1_slime.setScale(1.8);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.bubbleface1_slime.setInteractive({ draggable: true });
    }

    // .........bubbleplant1_1_slime............................................................
    this.bubbleplant1_1_slime = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -590),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 1040),
      'bubbleplant1_slime',
    );
    this.bubbleplant1_1_slime.name = 'bubbleplant1_1_slime';
    this.bubbleplant1_1_slime.setScale(1.29);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.bubbleplant1_1_slime.setInteractive({ draggable: true });
    }

    // .........bubbleplant1_2_slime............................................................
    this.bubbleplant1_2_slime = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 593),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 2043),
      'bubbleplant1_slime',
    );
    this.bubbleplant1_2_slime.name = 'bubbleplant1_1_slime';
    this.bubbleplant1_2_slime.setScale(1.98);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.bubbleplant1_2_slime.setInteractive({ draggable: true });
    }


    // .........bubbleplant2_1_slime............................................................
    this.bubbleplant2_1_slime = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 1573),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 18),
      'bubbleplant2_slime',
    );
    this.bubbleplant2_1_slime.name = 'bubbleplant2_1_slime';
    this.bubbleplant2_1_slime.setScale(1.48);
    this.bubbleplant2_1_slime.setFlipX(true);

    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.bubbleplant2_1_slime.setInteractive({ draggable: true });
    }

    // .........bubbleplant2_2_slime............................................................
    this.bubbleplant2_2_slime = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 2366),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 68),
      'bubbleplant2_slime',
    );
    this.bubbleplant2_2_slime.name = 'bubbleplant2_2_slime';
    this.bubbleplant2_2_slime.setScale(0.97);
    // this.bubbleplant2_2_slime.setFlipX(true);

    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.bubbleplant2_2_slime.setInteractive({ draggable: true });
    }

    // .........cantarella_tree_1_1_slime............................................................
    this.cantarella_tree_1_1_slime = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -517),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 2215),
      'cantarella_tree_1_slime',
    );
    this.cantarella_tree_1_1_slime.name = 'cantarella_tree_1_1_slime';
    this.cantarella_tree_1_1_slime.setScale(1.4);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.cantarella_tree_1_1_slime.setInteractive({ draggable: true });
    }

    // .........cantarella_tree_1_2_slime............................................................
    this.cantarella_tree_1_2_slime = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -1067),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 1942),
      'cantarella_tree_1_slime',
    );
    this.cantarella_tree_1_2_slime.name = 'cantarella_tree_1_2_slime';
    this.cantarella_tree_1_2_slime.setScale(0.87);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.cantarella_tree_1_2_slime.setInteractive({ draggable: true });
    }


    // .........cantarella_tree_2_slime............................................................

    this.cantarella_tree_2_slime = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -1957),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 695),
      'cantarella_tree_2_slime',
    );
    this.cantarella_tree_2_slime.name = 'cantarella_tree_2_slime';
    this.cantarella_tree_2_slime.setScale(2.3);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.cantarella_tree_2_slime.setInteractive({ draggable: true });
    }

    // .........cantarella_tree_3_slime............................................................
    this.cantarella_tree_3_slime = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -2122),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 2015),
      'cantarella_tree_3_slime',
    );
    this.cantarella_tree_3_slime.name = 'cantarella_tree_3_slime';
    this.cantarella_tree_3_slime.setScale(1.8);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.cantarella_tree_3_slime.setInteractive({ draggable: true });
    }


    // .........cantarella_tree_4_1_slime............................................................
    this.cantarella_tree_4_1_slime = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 342),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 55),
      'cantarella_tree_4_slime',
    );
    this.cantarella_tree_4_1_slime.name = 'cantarella_tree_4_1_slime';
    this.cantarella_tree_4_1_slime.setScale(1.46);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.cantarella_tree_4_1_slime.setInteractive({ draggable: true });
    }

    // .........cantarella_tree_4_2_slime............................................................
    this.cantarella_tree_4_2_slime = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 1091),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -88),
      'cantarella_tree_4_slime',
    );
    this.cantarella_tree_4_2_slime.name = 'cantarella_tree_4_2_slime';
    this.cantarella_tree_4_2_slime.setScale(1.24);
    this.cantarella_tree_4_2_slime.setFlipX(true);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.cantarella_tree_4_2_slime.setInteractive({ draggable: true });
    }

    // .........cantarella_tree_6_slime............................................................
    this.cantarella_tree_6_slime = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -1340),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 490),
      'cantarella_tree_6_slime',
    );
    this.cantarella_tree_6_slime.name = 'cantarella_tree_6_slime';
    this.cantarella_tree_6_slime.setScale(1.67);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.cantarella_tree_6_slime.setInteractive({ draggable: true });
    }

    // .........cantarella_tree_7_slime............................................................
    this.cantarella_tree_7_slime = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -363),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -214),
      'cantarella_tree_7_slime',
    );
    this.cantarella_tree_7_slime.name = 'cantarella_tree_7_slime';
    this.cantarella_tree_7_slime.setScale(1.24);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.cantarella_tree_7_slime.setInteractive({ draggable: true });
    }

    // .........rups_slime............................................................
    this.rups_slime = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 1730),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -1700),
      'rups_slime',
    );
    this.rups_slime.name = 'rups_slime';
    this.rups_slime.setScale(1.9);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.rups_slime.setInteractive({ draggable: true });
    }

    // .........slimepool_1_slime............................................................
    this.slimepool_1_slime = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -1390),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -1305),
      'slimepool_1_slime',
    );
    this.slimepool_1_slime.name = 'slimepool_1_slime';
    this.slimepool_1_slime.setScale(2.83);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.slimepool_1_slime.setInteractive({ draggable: true });
    }

    // // .........tree2_vuur_licht_3............................................................
    // this.tree2_vuur_licht_3 = this.add.image(
    //   CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -1592),
    //   CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -1565),
    //   'tree2_vuur_licht',
    // );
    // this.tree2_vuur_licht_3.name = 'tree2_vuur_licht_3';
    // this.tree2_vuur_licht_3.setScale(1.46);
    // // we set elements draggable for edit mode by restarting the scene and checking for a flag
    // if (ManageSession.gameEditMode) {
    //   this.tree2_vuur_licht_3.setInteractive({ draggable: true });
    // }

    // // .........tree3_1............................................................
    // this.tree3_vuur_licht_1 = this.add.image(
    //   CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 55),
    //   CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -760),
    //   'tree3_vuur_licht',
    // );
    // this.tree3_vuur_licht_1.name = 'tree3_vuur_licht_1';
    // this.tree3_vuur_licht_1.setScale(1.46);
    // // we set elements draggable for edit mode by restarting the scene and checking for a flag
    // if (ManageSession.gameEditMode) {
    //   this.tree3_vuur_licht_1.setInteractive({ draggable: true });
    // }

    // // .........tree3_2............................................................
    // this.tree3_vuur_licht_2 = this.add.image(
    //   CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -355),
    //   CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 140),
    //   'tree3_vuur_licht',
    // );
    // this.tree3_vuur_licht_2.name = 'tree3_vuur_licht_2';
    // this.tree3_vuur_licht_2.setScale(1.46);
    // // we set elements draggable for edit mode by restarting the scene and checking for a flag
    // if (ManageSession.gameEditMode) {
    //   this.tree3_vuur_licht_2.setInteractive({ draggable: true });
    // }

    // // .........tree3_vuur_licht_3............................................................
    // this.tree3_vuur_licht_3 = this.add.image(
    //   CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -410),
    //   CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -1850),
    //   'tree3_vuur_licht',
    // );
    // this.tree3_vuur_licht_3.name = 'tree3_vuur_licht_3';
    // this.tree3_vuur_licht_3.setScale(2.3);
    // // we set elements draggable for edit mode by restarting the scene and checking for a flag
    // if (ManageSession.gameEditMode) {
    //   this.tree3_vuur_licht_3.setInteractive({ draggable: true });
    // }
    // // ............................................................................................................
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
