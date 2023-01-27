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

export default class TurquoiseTriangle extends Phaser.Scene {
  constructor() {
    super('TurquoiseTriangle');
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

    Background.standardWithDots(this);

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

    // locationVector = new Phaser.Math.Vector2(374, 240);
    // locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
    //   this.worldSize,
    //   locationVector,
    // );

    // Background.rectangle({
    //   scene: this,
    //   name: 'green_square_location_image',
    //   // posX: 0,
    //   // posY: 0,
    //   // setOrigin: 0,
    //   gradient1: 0x15d64a,
    //   gradient2: 0x15d64a,
    //   gradient3: 0x2b8042,
    //   gradient4: 0x2b8042,
    //   alpha: 1,
    //   width: 140,
    //   height: 140,
    //   imageOnly: true,
    // });

    // this.greenSquareLocation = new GenerateLocation({
    //   scene: this,
    //   type: 'image',
    //   draggable: ManageSession.gameEditMode,
    //   x: locationVector.x,
    //   y: locationVector.y,
    //   locationDestination: 'GreenSquare',
    //   locationImage: 'green_square_location_image',
    //   enterButtonImage: 'enter_button',
    //   locationText: 'Groene Vierkant Wereld',
    //   referenceName: 'this.greenSquareLocation',
    //   fontColor: 0x8dcb0e,
    // });

    // locationVector = new Phaser.Math.Vector2(-400, -400);
    // locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
    //   this.worldSize,
    //   locationVector,
    // );

    // Background.star({
    //   scene: this,
    //   name: 'red_star_location_image',
    //   gradient1: 0xE50000,
    //   gradient2: 0xE50000,
    //   alpha: 1,
    //   size: 200,
    //   imageOnly: true,
    //   spikes: 5,
    // });

    // this.redStar = new GenerateLocation({
    //   scene: this,
    //   type: 'image',
    //   draggable: ManageSession.gameEditMode,
    //   x: locationVector.x,
    //   y: locationVector.y,
    //   locationDestination: 'RedStar',
    //   locationImage: 'red_star_location_image',
    //   enterButtonImage: 'enter_button',
    //   locationText: 'Rode Ster Wereld',
    //   referenceName: 'this.redStar',
    //   fontColor: 0x8dcb0e,
    // });

    // locationVector = new Phaser.Math.Vector2(26, 411);
    // locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
    //   this.worldSize,
    //   locationVector,
    // );

    // this.yellowDiamondLocation = new GenerateLocation({
    //   scene: this,
    //   type: 'image',
    //   draggable: ManageSession.gameEditMode,
    //   x: locationVector.x,
    //   y: locationVector.y,
    //   locationDestination: 'YellowDiamond',
    //   locationImage: 'yellow_diamond_location_image',
    //   enterButtonImage: 'enter_button',
    //   locationText: 'Gele Diamant Wereld',
    //   referenceName: 'this.yellowDiamondLocation',
    //   fontColor: 0x8dcb0e,
    // });

    // locationVector = new Phaser.Math.Vector2(-546, -84);
    // locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(
    //   this.worldSize,
    //   locationVector,
    // );

    // this.blueSailLocation = new GenerateLocation({
    //   scene: this,
    //   type: 'image',
    //   draggable: ManageSession.gameEditMode,
    //   x: locationVector.x,
    //   y: locationVector.y,
    //   locationDestination: 'BlueSail',
    //   locationImage: 'blue_sail_location_image',
    //   enterButtonImage: 'enter_button',
    //   locationText: 'Blauwe Zeil Wereld',
    //   referenceName: 'this.blueSailLocation',
    //   fontColor: 0x8dcb0e,
    // });


    locationVector = new Phaser.Math.Vector2(-395, 207);
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
