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

export default class RobotWorld extends Phaser.Scene {
  constructor() {
    super('RobotWorld');

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

    // Background.standardWithDots(this);

    // green gradient background
    Background.rectangle({
      scene: this,
      name: 'robot_world_background_image',
      posX: 0,
      posY: 0,
      setOrigin: 0,
      gradient1: 0x3de8bc,
      gradient2: 0x3de8bc,
      gradient3: 0x169876,
      gradient4: 0x169876,
      alpha: 1,
      width: this.worldSize.x,
      height: this.worldSize.y,
      imageOnly: false,
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
      locationImage: 'artWorldPortal',
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
    this.purpleCircleLocation.scale = 1.5;

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
    this.Robot_Clap_NoAnimation = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 1693),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -847),
      'Robot_Clap_NoAnimation',
    );
    this.Robot_Clap_NoAnimation.name = 'Robot_Clap_NoAnimation';
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.Robot_Clap_NoAnimation.setInteractive({ draggable: true });
    }

    this.robothuis1_ms = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 1193),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 600),
      'robothuis1_ms',
    );
    this.robothuis1_ms.name = 'robothuis1_ms';
    this.robothuis1_ms.setScale(0.5);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.robothuis1_ms.setInteractive({ draggable: true });
    }

    this.robothuis3_ms = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -990),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 1770),
      'robothuis3_ms',
    );
    this.robothuis3_ms.name = 'robothuis3_ms';
    this.robothuis3_ms.setScale(0.5);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.robothuis3_ms.setInteractive({ draggable: true });
    }

    this.robot_treeC_01 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -1717),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 903),

      'robot_treeC_01',
    );
    this.robot_treeC_01.setScale(0.5);
    this.robot_treeC_01.setDepth(202);
    this.robot_treeC_01.name = 'robot_treeC_01';
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.robot_treeC_01.setInteractive({ draggable: true });
    }

    this.robot_treeC_02 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 60),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 2514),
      'robot_treeC_02',
    );
    this.robot_treeC_02.setDepth(202);
    this.robot_treeC_02.setScale(0.5);
    this.robot_treeC_02.name = 'robot_treeC_02';
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.robot_treeC_02.setInteractive({ draggable: true });
    }


    // paths for the houses
    this.createCurveWithHandles();
  }

  /** Create a curve with handles in edit mode
 * @todo Work in progress, replace with CurveWithHandles class? */
  createCurveWithHandles() {
    // const path = { t: 0, vec: new Phaser.Math.Vector2() };

    this.curve1 = new Phaser.Curves.Spline([
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -2361),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -1424),
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 187),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 2367),
    ]);

    const { points } = this.curve1;
    console.log('points1', points);
    //  Create drag-handles for each point
    if (ManageSession.gameEditMode) {
      for (let i = 0; i < points.length; i++) {
        const point = points[i];

        this.handle1 = this.add.image(point.x, point.y, 'ball', 0).setScale(0.1).setInteractive().setDepth(40);
        this.handle1.name = 'handle';

        this.handle1.setData('vector', point);

        this.input.setDraggable(this.handle1);
      }
    }
    this.curveGraphics1 = this.add.graphics();
    this.curveGraphics1.lineStyle(60, 0x0c5c44, 1);
    this.curve1.draw(this.curveGraphics1, 64);
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
    } else {
      // when in edit mode
      this.updateCurveGraphics();
    }
  } // update

  updateCurveGraphics() {
    this.curveGraphics1.clear();
    this.curveGraphics1.lineStyle(60, 0x0c5c44, 1);
    this.curve1.draw(this.curveGraphics1, 64);
  }
} // class
