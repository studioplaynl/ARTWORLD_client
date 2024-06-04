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
import { PlayerPos } from '../playerState';
import { SCENE_INFO, ART_DISPLAY_SIZE, ART_OFFSET_BETWEEN } from '../../../constants';
import { handleEditMode, handlePlayerMovement } from '../helpers/InputHelper';

import * as Phaser from 'phaser';

export default class FireWorld extends Phaser.Scene {
  constructor() {
    super('FireWorld');

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

    // FireWorld
    this.load.image('artWorldPortalFire', './assets/world_fireworld/Portal_vuur_Terug.png');
    this.load.image('lavafall_boy', './assets/world_fireworld/lavafall_boy.png');
    this.load.image('tree1_vuur_licht', './assets/world_fireworld/tree1_vuur_licht.png');
    this.load.image('tree2_vuur_licht', './assets/world_fireworld/tree2_vuur_licht.png');
    this.load.image('tree3_vuur_licht', './assets/world_fireworld/tree3_vuur_licht.png');
    this.load.image('vulcano1_kleur_helder', './assets/world_fireworld/vulcano1_kleur_helder.png');
    this.load.image('vulkan2', './assets/world_fireworld/vulkan2.png');
    this.load.image('vuur_wereld_Lavameer01', './assets/world_fireworld/vuur_wereld_Lavameer01.png');
  }

  async create() {
    //!
    //listen to this even to unsubscribe stores when leaving a scene
    this.events.on('unsubscribeStores', this.unsubscribeStores, this);

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
      gradientColor1: 0x958f8d,
      gradientColor2: 0x4c4845,
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
      locationImage: 'artWorldPortalFire',
      enterButtonImage: 'enter_button',
      locationText: 'Paarse Cirkel Wereld',
      referenceName: 'this.purpleCircleLocation',
      fontColor: 0x8dcb0e,
    });
    this.purpleCircleLocation.setScale(1.5);
  }

  makeWorldElements() {
    // .........vulcano1_bright............................................................
    this.vulcano1_bright_1 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -1787),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 1538),
      'vulcano1_kleur_helder'
    );
    this.vulcano1_bright_1.name = 'vulcano1_bright_1';
    this.vulcano1_bright_1.setScale(1.91);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.vulcano1_bright_1.setInteractive({ draggable: true });
    }

    // .........vuur_wereld_Lavameer01............................................................
    this.vuur_wereld_Lavameer01_1 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -602),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 1203),
      'vuur_wereld_Lavameer01'
    );
    this.vuur_wereld_Lavameer01_1.name = 'vuur_wereld_Lavameer01_1';
    this.vuur_wereld_Lavameer01_1.setScale(1.98);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.vuur_wereld_Lavameer01_1.setInteractive({ draggable: true });
    }

    // .........lavafall_boy............................................................
    this.lavafall_boy_1 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 1513),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 335),
      'lavafall_boy'
    );
    this.lavafall_boy_1.name = 'lavafall_boy_1';
    this.lavafall_boy_1.setScale(1.98);
    this.lavafall_boy_1.setFlipX(true);

    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.lavafall_boy_1.setInteractive({ draggable: true });
    }

    // .........vulkan2 + vuur_wereld_Lavameer01_2............................................................
    // the volcano goes on top of the lake, therefore is loaded after the lake
    this.vuur_wereld_Lavameer01_2 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -1737),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -435),
      'vuur_wereld_Lavameer01'
    );
    this.vuur_wereld_Lavameer01_2.name = 'vuur_wereld_Lavameer01_2';
    this.vuur_wereld_Lavameer01_2.setScale(1.46);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.vuur_wereld_Lavameer01_2.setInteractive({ draggable: true });
    }

    this.vulkan2_1 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -947),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -165),
      'vulkan2'
    );
    this.vulkan2_1.name = 'vulkan2_1';
    this.vulkan2_1.setScale(2.3);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.vulkan2_1.setInteractive({ draggable: true });
    }

    // .........vuur_wereld_Lavameer01_3............................................................
    this.vuur_wereld_Lavameer01_3 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 1003),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -1090),
      'vuur_wereld_Lavameer01'
    );
    this.vuur_wereld_Lavameer01_3.name = 'vuur_wereld_Lavameer01_3';
    this.vuur_wereld_Lavameer01_3.setScale(1.26);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.vuur_wereld_Lavameer01_3.setInteractive({ draggable: true });
    }

    // .........tree1_1............................................................
    this.tree1_vuur_licht_1 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -245),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -805),
      'tree1_vuur_licht'
    );
    this.tree1_vuur_licht_1.name = 'tree1_vuur_licht_1';
    this.tree1_vuur_licht_1.setScale(1.46);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.tree1_vuur_licht_1.setInteractive({ draggable: true });
    }

    // .........tree1_2............................................................
    this.tree1_vuur_licht_2 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 405),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -830),
      'tree1_vuur_licht'
    );
    this.tree1_vuur_licht_2.name = 'tree1_vuur_licht_2';
    this.tree1_vuur_licht_2.setScale(1.24);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.tree1_vuur_licht_2.setInteractive({ draggable: true });
    }

    // .........tree1_vuur_licht_3............................................................
    this.tree1_vuur_licht_3 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 1740),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -1890),
      'tree1_vuur_licht'
    );
    this.tree1_vuur_licht_3.name = 'tree1_vuur_licht_3';
    this.tree1_vuur_licht_3.setScale(2.44);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.tree1_vuur_licht_3.setInteractive({ draggable: true });
    }

    // .........tree1_vuur_licht_4............................................................
    this.tree1_vuur_licht_4 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -795),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -1797),
      'tree1_vuur_licht'
    );
    this.tree1_vuur_licht_4.name = 'tree1_vuur_licht_4';
    this.tree1_vuur_licht_4.setScale(2);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.tree1_vuur_licht_4.setInteractive({ draggable: true });
    }

    // .........tree2_1............................................................
    this.tree2_vuur_licht_1 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 305),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 20),
      'tree2_vuur_licht'
    );
    this.tree2_vuur_licht_1.name = 'tree2_vuur_licht_1';
    this.tree2_vuur_licht_1.setScale(1.46);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.tree2_vuur_licht_1.setInteractive({ draggable: true });
    }

    // .........tree2_vuur_licht_2............................................................
    this.tree2_vuur_licht_2 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -515),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -670),
      'tree2_vuur_licht'
    );
    this.tree2_vuur_licht_2.name = 'tree2_vuur_licht_2';
    this.tree2_vuur_licht_2.setScale(1.46);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.tree2_vuur_licht_2.setInteractive({ draggable: true });
    }

    // .........tree2_vuur_licht_3............................................................
    this.tree2_vuur_licht_3 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -1592),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -1565),
      'tree2_vuur_licht'
    );
    this.tree2_vuur_licht_3.name = 'tree2_vuur_licht_3';
    this.tree2_vuur_licht_3.setScale(1.46);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.tree2_vuur_licht_3.setInteractive({ draggable: true });
    }

    // .........tree3_1............................................................
    this.tree3_vuur_licht_1 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 55),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -760),
      'tree3_vuur_licht'
    );
    this.tree3_vuur_licht_1.name = 'tree3_vuur_licht_1';
    this.tree3_vuur_licht_1.setScale(1.46);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.tree3_vuur_licht_1.setInteractive({ draggable: true });
    }

    // .........tree3_2............................................................
    this.tree3_vuur_licht_2 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -355),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 140),
      'tree3_vuur_licht'
    );
    this.tree3_vuur_licht_2.name = 'tree3_vuur_licht_2';
    this.tree3_vuur_licht_2.setScale(1.46);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.tree3_vuur_licht_2.setInteractive({ draggable: true });
    }

    // .........tree3_vuur_licht_3............................................................
    this.tree3_vuur_licht_3 = this.add.image(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, -410),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, -1850),
      'tree3_vuur_licht'
    );
    this.tree3_vuur_licht_3.name = 'tree3_vuur_licht_3';
    this.tree3_vuur_licht_3.setScale(2.3);
    // we set elements draggable for edit mode by restarting the scene and checking for a flag
    if (ManageSession.gameEditMode) {
      this.tree3_vuur_licht_3.setInteractive({ draggable: true });
    }
    // ............................................................................................................
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

  unsubscribeStores() {
    console.log('unsubscribeStores in ', this.scene.key);
    ServerCall.unsubscribeStores();
    if (!this.storeSubscriptions) return;
    if (this.storeSubscriptions.length === 0) return;

    this.storeSubscriptions.forEach((subscription) => {
      subscription();
    });
  }
} // class
