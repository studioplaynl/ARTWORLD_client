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

    // RobotWorld
    this.load.image('artWorldPortal', './assets/world_robot_torquoise/portaal_robot_terug.png');
    this.load.image('robot_treeC_01', './assets/world_robot_torquoise/treeC_01.png');
    this.load.image('robot_treeC_02', './assets/world_robot_torquoise/treeC_02.png');
    this.load.image('robot_treeC_03', './assets/world_robot_torquoise/treeC_03.png');
    this.load.image('robot_treeC_04', './assets/world_robot_torquoise/treeC_04.png');
    this.load.image('robothuis3_ms', './assets/world_robot_torquoise/robothuis3_ms.png');
    this.load.image('robothuis1_ms', './assets/world_robot_torquoise/robohuis01metschadow.png');
    this.load.image('robothuis1_ms', './assets/world_robot_torquoise/robohuis01metschadow.png');
    this.load.image('Robot_Clap_NoAnimation', './assets/world_robot_torquoise/_Robot_Clap_NoAnimation.png');
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

    Background.gradientStretchedToFitWorld({
      scene: this,
      tileMapName: 'WorldBackgroundTileMap',
      gradientColor1: 0x3de8bc,
      gradientColor2: 0x169876,
      tileWidth: 512,
    });

    handlePlayerMovement(this);

    const { artworldToPhaser2DX, artworldToPhaser2DY } = CoordinatesTranslator;

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

  generateLocations() {
    // we set draggable on restart scene with a global flag

    let locationVector = new Phaser.Math.Vector2(0, 0);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);

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
    this.purpleCircleLocation.setScale(1.5);
  }

  makeWorldElements() {
    this.Robot_Clap_NoAnimation = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 1693),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -847),
      'Robot_Clap_NoAnimation'
    );
    this.Robot_Clap_NoAnimation.name = 'Robot_Clap_NoAnimation';
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.Robot_Clap_NoAnimation.setInteractive({ draggable: true });
    }

    this.robothuis1_ms = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 1193),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 600),
      'robothuis1_ms'
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
      'robothuis3_ms'
    );
    this.robothuis3_ms.name = 'robothuis3_ms';
    this.robothuis3_ms.setScale(0.5);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.robothuis3_ms.setInteractive({ draggable: true });
    }

    this.robot_treeC_01_1 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -752),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 523),
      'robot_treeC_01'
    );
    this.robot_treeC_01_1.setScale(0.4);
    this.robot_treeC_01_1.setDepth(202);
    this.robot_treeC_01_1.name = 'robot_treeC_01_1';
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.robot_treeC_01_1.setInteractive({ draggable: true });
    }

    this.robot_treeC_01_2 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -2372),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 578),
      'robot_treeC_01'
    );
    this.robot_treeC_01_2.setScale(0.74);
    this.robot_treeC_01_2.setDepth(202);
    this.robot_treeC_01_2.name = 'robot_treeC_01_2';
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.robot_treeC_01_2.setInteractive({ draggable: true });
    }

    this.robot_treeC_02_1 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 985),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -1196),
      'robot_treeC_02'
    );
    this.robot_treeC_02_1.setDepth(202);
    this.robot_treeC_02_1.setScale(0.5);
    this.robot_treeC_02_1.name = 'robot_treeC_02_1';
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.robot_treeC_02_1.setInteractive({ draggable: true });
    }

    this.robot_treeC_02_2 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -1965),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -856),
      'robot_treeC_02'
    );
    this.robot_treeC_02_2.setDepth(202);
    this.robot_treeC_02_2.setScale(0.5);
    this.robot_treeC_02_2.name = 'robot_treeC_02_2';
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.robot_treeC_02_2.setInteractive({ draggable: true });
    }

    this.robot_treeC_03_1 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -580),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 1014),
      'robot_treeC_03'
    );
    this.robot_treeC_03_1.setDepth(202);
    this.robot_treeC_03_1.setScale(0.5);
    this.robot_treeC_03_1.name = 'robot_treeC_03_1';
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.robot_treeC_03_1.setInteractive({ draggable: true });
    }

    this.robot_treeC_03_2 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 205),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 2559),
      'robot_treeC_03'
    );
    this.robot_treeC_03_2.setDepth(202);
    this.robot_treeC_03_2.setScale(0.5);
    this.robot_treeC_03_2.name = 'robot_treeC_03_2';
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.robot_treeC_03_2.setInteractive({ draggable: true });
    }

    this.robot_treeC_04_1 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -375),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 684),
      'robot_treeC_04'
    );
    this.robot_treeC_04_1.setDepth(202);
    this.robot_treeC_04_1.setScale(0.6);
    this.robot_treeC_04_1.name = 'robot_treeC_04_1';
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.robot_treeC_04_1.setInteractive({ draggable: true });
    }

    this.robot_treeC_04_2 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -2115),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -1071),
      'robot_treeC_04'
    );
    this.robot_treeC_04_2.setDepth(202);
    this.robot_treeC_04_2.setScale(0.6);
    this.robot_treeC_04_2.name = 'robot_treeC_04_2';
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.robot_treeC_04_2.setInteractive({ draggable: true });
    }

    // paths for the houses
    this.pointsCurve1 = [
      new Phaser.Math.Vector2(
        CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 187),
        CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 2367)
      ),
      new Phaser.Math.Vector2(
        CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -841),
        CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 846)
      ),
    ];

    this.createCurveWithHandles({
      color1: '0x2e4043',
      points: this.pointsCurve1,
      lineWidth: 60,
      lineAlpha: 1,
      lineResolution: 11,
      name: '1',
    });

    this.pointsCurve2 = [
      new Phaser.Math.Vector2(
        CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -867),
        CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 1570)
      ),
      new Phaser.Math.Vector2(
        CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 2709),
        CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -599)
      ),
    ];

    this.createCurveWithHandles({
      color1: '0x2e4043',
      points: this.pointsCurve2,
      lineWidth: 60,
      lineAlpha: 1,
      lineResolution: 11,
      name: '2',
    });

    this.pointsCurve3 = [
      new Phaser.Math.Vector2(
        CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -2661),
        CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 1987)
      ),
      new Phaser.Math.Vector2(
        CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 1431),
        CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -604)
      ),
    ];

    this.createCurveWithHandles({
      color1: '0x2e4043',
      points: this.pointsCurve3,
      lineWidth: 60,
      lineAlpha: 1,
      lineResolution: 11,
      name: '3',
    });

    this.pointsCurve4 = [
      new Phaser.Math.Vector2(
        CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -454),
        CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 560)
      ),
      new Phaser.Math.Vector2(
        CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -2584),
        CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -2544)
      ),
    ];

    this.createCurveWithHandles({
      color1: '0x2e4043',
      points: this.pointsCurve4,
      lineWidth: 60,
      lineAlpha: 1,
      lineResolution: 11,
      name: '4',
    });

    this.pointsCurve5 = [
      new Phaser.Math.Vector2(
        CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -454),
        CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 1)
      ),
      new Phaser.Math.Vector2(
        CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -2719),
        CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -1)
      ),
    ];

    this.createCurveWithHandles({
      color1: '0x2e4043',
      points: this.pointsCurve5,
      lineWidth: 60,
      lineAlpha: 1,
      lineResolution: 11,
      name: '5',
    });

    this.pointsCurve6 = [
      new Phaser.Math.Vector2(
        CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 1199),
        CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 391)
      ),
      new Phaser.Math.Vector2(
        CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -649),
        CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -2561)
      ),
    ];

    this.createCurveWithHandles({
      color1: '0x2e4043',
      points: this.pointsCurve6,
      lineWidth: 60,
      lineAlpha: 1,
      lineResolution: 11,
      name: '6',
    });
  }

  /** Create a curve with handles in edit mode
   * @todo Work in progress, replace with CurveWithHandles class? */
  createCurveWithHandles(config) {
    const { color1 } = config;
    // const { color2 } = config;
    const { points } = config;
    const { lineWidth } = config;
    const { lineAlpha } = config;
    const { name } = config;
    const { lineResolution } = config;

    const curveName = `curve${name}`;
    const curveGraphicsName = `curveGraphics${name}`;
    this[curveName] = new Phaser.Curves.Spline(points);

    if (ManageSession.gameEditMode) {
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        const curveHandleName = `curveHandle${name}_${i}`;
        // const point = this[curveHandleName].getData('vector');

        this[curveHandleName] = this.add.image(point.x, point.y, 'ball', 0).setScale(0.1).setInteractive().setDepth(40);
        this[curveHandleName].setName(`handle_${curveHandleName}`);

        this[curveHandleName].setData('vector', point);
        this[curveHandleName].setData('lineResolution', lineResolution);
        this[curveHandleName].setData('curveHandle', curveHandleName);

        this.input.setDraggable(this[curveHandleName]);
      }
    }

    this[curveGraphicsName] = this.add.graphics();
    this[curveGraphicsName].lineStyle(lineWidth, color1, lineAlpha);
    this[curveName].draw(this[curveGraphicsName], lineResolution);
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
      this.updateCurveGraphics({ name: '1' });
      this.updateCurveGraphics({ name: '2' });
      this.updateCurveGraphics({ name: '3' });
      this.updateCurveGraphics({ name: '4' });
      this.updateCurveGraphics({ name: '5' });
      this.updateCurveGraphics({ name: '6' });
    }
  } // update

  updateCurveGraphics(config) {
    const { name } = config;

    const curveName = `curve${name}`;
    const curveGraphicsName = `curveGraphics${name}`;
    const { points } = this[curveName];

    let lineResolution = 32;
    const lineWidth = this[curveGraphicsName].commandBuffer[1];
    const color1 = this[curveGraphicsName].commandBuffer[2];
    const lineAlpha = this[curveGraphicsName].commandBuffer[3];

    points.forEach((element, index) => {
      const curveHandleName = `curveHandle${name}_${index}`;
      const point = this[curveHandleName].getData('vector');
      // dlog('curveGraphicsName', curveGraphicsName);
      points[index] = point;
      lineResolution = this[curveHandleName].getData('lineResolution');
      // dlog('this[curveHandleName] point', point);
    });

    // dlog('points', points);

    this[curveGraphicsName].clear();
    this[curveGraphicsName].lineStyle(lineWidth, color1, lineAlpha);
    this[curveName].draw(this[curveGraphicsName], lineResolution);
  }
} // class
