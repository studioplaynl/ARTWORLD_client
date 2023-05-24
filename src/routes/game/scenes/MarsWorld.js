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

export default class MarsWorld extends Phaser.Scene {
  constructor() {
    super('MarsWorld');

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
      gradientColor1: 0xe29953,
      gradientColor2: 0xd46146,
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

    let locationVector = new Phaser.Math.Vector2(162, 109);
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
      locationImage: 'artWorldPortalMars',
      enterButtonImage: 'enter_button',
      locationText: 'Paarse Cirkel Wereld',
      referenceName: 'this.purpleCircleLocation',
      fontColor: 0x8dcb0e,
    });
    this.purpleCircleLocation.setScale(3);
  }

  makeWorldElements() {
    // .........vulcano1_bright............................................................
    this.krater_mars_1 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -1142),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -52),
      'krater_mars',
    );
    this.krater_mars_1.name = 'krater_mars_1';
    this.krater_mars_1.setScale(0.94);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.krater_mars_1.setInteractive({ draggable: true });
    }

    // .........rots1_mars_1............................................................
    this.rots1_mars_1 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -2077),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -1657),
      'rots1_mars',
    );
    this.rots1_mars_1.name = 'rots1_mars_1';
    this.rots1_mars_1.setScale(1.98);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.rots1_mars_1.setInteractive({ draggable: true });
    }


    // .........rots2_mars_1............................................................
    this.rots2_mars_1 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 1913),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 395),
      'rots2_mars',
    );
    this.rots2_mars_1.name = 'rots2_mars_1';
    this.rots2_mars_1.setScale(1.98);
    this.rots2_mars_1.setFlipX(true);

    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.rots2_mars_1.setInteractive({ draggable: true });
    }

    // .........rots2_mars_2............................................................
    this.rots2_mars_2 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 1673),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 2160),
      'rots2_mars',
    );
    this.rots2_mars_2.name = 'rots2_mars_2';
    this.rots2_mars_2.setScale(1.5);
    this.rots2_mars_2.setFlipX(true);

    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.rots2_mars_2.setInteractive({ draggable: true });
    }

    // .........rots3_mars_1............................................................
    this.rots3_mars_1 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -2042),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 870),
      'rots3_mars',
    );
    this.rots3_mars_1.name = 'rots3_mars_1';
    this.rots3_mars_1.setScale(1.66);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.rots3_mars_1.setInteractive({ draggable: true });
    }

    // .........rots4_mars_1............................................................
    this.rots4_mars_1 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -252),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -1540),
      'rots4_mars',
    );
    this.rots4_mars_1.name = 'rots4_mars_1';
    this.rots4_mars_1.setScale(1.08);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.rots4_mars_1.setInteractive({ draggable: true });
    }


    // .........rots5_mars_1............................................................
    this.rots5_mars_1 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 615),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 2120),
      'rots5_mars',
    );
    this.rots5_mars_1.name = 'rots5_mars_1';
    this.rots5_mars_1.setScale(1.46);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.rots5_mars_1.setInteractive({ draggable: true });
    }

    // .........rots6_mars_1............................................................
    this.rots6_mars_1 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -1420),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 2185),
      'rots6_mars',
    );
    this.rots6_mars_1.name = 'rots6_mars_1';
    this.rots6_mars_1.setScale(1.44);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.rots6_mars_1.setInteractive({ draggable: true });
    }

    // .........rover_all_one_layer_mars_1............................................................
    this.rover_all_one_layer_mars_1 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -380),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 1265),
      'rover_all_one_layer_mars',
    );
    this.rover_all_one_layer_mars_1.name = 'rover_all_one_layer_mars_1';
    this.rover_all_one_layer_mars_1.setScale(0.98);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.rover_all_one_layer_mars_1.setInteractive({ draggable: true });
    }
    // .........rots2_mars_3 >> on top of rover_all_one_layer_mars_1 ...................
    this.rots2_mars_3 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -722),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 1520),
      'rots2_mars',
    );
    this.rots2_mars_3.name = 'rots2_mars_3';
    this.rots2_mars_3.setScale(1.5);
    this.rots2_mars_3.setFlipX(true);

    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.rots2_mars_3.setInteractive({ draggable: true });
    }


    // .........ufo_atwork1_mars_1............................................................
    this.ufo_atwork1_mars_1 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 1430),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -1327),
      'ufo_atwork1_mars',
    );
    this.ufo_atwork1_mars_1.name = 'ufo_atwork1_mars_1';
    this.ufo_atwork1_mars_1.setScale(2);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.ufo_atwork1_mars_1.setInteractive({ draggable: true });
    }

    // .........ufo_slapend_vloer_mars_1............................................................
    this.ufo_slapend_vloer_mars_1 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -2195),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 2085),
      'ufo_slapend_vloer_mars',
    );
    this.ufo_slapend_vloer_mars_1.name = 'ufo_slapend_vloer_mars_1';
    this.ufo_slapend_vloer_mars_1.setScale(1.46);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.ufo_slapend_vloer_mars_1.setInteractive({ draggable: true });
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
