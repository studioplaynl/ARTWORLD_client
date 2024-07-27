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
import PlaceElement from '../class/PlaceElement';
import { getSceneInfo } from '../helpers/UrlHelpers';

import * as Phaser from 'phaser';

export default class CloudWorld extends Phaser.Scene {
  constructor() {
    super('CloudWorld');

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
    this.load.on('loaderror', (offendingFile) => {
      dlog('loaderror', offendingFile);
      if (typeof offendingFile !== 'undefined') {
        ServerCall.resolveLoadError(offendingFile);
      }
    });

    await this.getAssests();
  }

  async getAssests() {
    this.localAssetsCheck = {};

    const folderPath = './assets/world_clouds/';
    const loadArray = [
      {
        key: 'artWorldPortalCloud',
        path: `${folderPath}cloud_portal_naarHome.png`,
      },

      {
        key: 'cloud_ballonpeople_1b',
        path: `${folderPath}cloud_ballonpeople_1b.png`,
      },
      {
        key: 'cloud_ballonpeople_2',
        path: `${folderPath}cloud_ballonpeople_2.png`,
      },
      {
        key: 'cloud_ballonpeople_3',
        path: `${folderPath}cloud_ballonpeople_3.png`,
      },
      {
        key: 'cloud_ballonpeople_4',
        path: `${folderPath}cloud_ballonpeople_4.png`,
      },
      { key: 'cloud_berg1', path: `${folderPath}cloud_berg1.png` },
      {
        key: 'cloud_berg1_tweekeer',
        path: `${folderPath}cloud_berg1_tweekeer.png`,
      },
      {
        key: 'cloud_berg2_metCloud_achtergrond',
        path: `${folderPath}cloud_berg2_metCloud_achtergrond.png`,
      },
      { key: 'cloud_berg3', path: `${folderPath}cloud_berg3.png` },
      {
        key: 'cloud_berg3_mitWolken',
        path: `${folderPath}cloud_berg3_mitWolken.png`,
      },
      { key: 'cloud_brug_1', path: `${folderPath}cloud_brug_1.png` },
      { key: 'cloud_brug_2', path: `${folderPath}cloud_brug_2.png` },
      { key: 'cloud_C1', path: `${folderPath}cloud_C1.png` },
      { key: 'cloud_C2_withface', path: `${folderPath}cloud_C2_withface.png` },
      { key: 'cloud_C3', path: `${folderPath}cloud_C3.png` },
      { key: 'cloud_C4', path: `${folderPath}cloud_C4.png` },
      { key: 'cloud_C5', path: `${folderPath}cloud_C5.png` },
      {
        key: 'cloud_C5_achtergrond',
        path: `${folderPath}cloud_C5_achtergrond.png`,
      },
      { key: 'cloud_huis_1', path: `${folderPath}cloud_huis_1.png` },
      { key: 'cloud_huis_2', path: `${folderPath}cloud_huis_2.png` },
      { key: 'cloud_huis_3', path: `${folderPath}cloud_huis_3.png` },
    ];

    ServerCall.loadAssetArray(this, loadArray, 'localImage');
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

    handleEditMode(this);

    Background.gradientStretchedToFitWorld({
      scene: this,
      tileMapName: 'WorldBackgroundTileMap',
      gradientColor1: 0x9de0ff,
      gradientColor2: 0x1999c5,
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
    this.makeWorldElements();
    this.generateLocations();
    // .......... end locations ............................................................................

    this.loadAndPlaceLiked();
    this.likedBalloonAnimation();
    // .......... end liks ............................................................................

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

    let locationVector = new Phaser.Math.Vector2(945, -382);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);

    this.purpleCircleLocation = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'Artworld',
      locationImage: 'artWorldPortalCloud',
      enterButtonImage: 'enter_button',
      locationText: 'Paarse Cirkel Wereld',
      referenceName: 'this.purpleCircleLocation',
      size: 500,
      fontColor: 0x8dcb0e,
    });
  }

  makeWorldElements() {
    // .........cloud_ballonpeople_1b............................................................
    PlaceElement.image({
      x: -366,
      y: 1597,
      file: 'cloud_ballonpeople_1b',
      scale: 1,
      scene: this,
    });

    // .........cloud_ballonpeople_2............................................................
    PlaceElement.image({
      x: 1160,
      y: 2183,
      file: 'cloud_ballonpeople_2',
      scale: 1,
      scene: this,
    });

    // .........cloud_ballonpeople_3............................................................
    PlaceElement.image({
      x: -1310,
      y: -220,
      file: 'cloud_ballonpeople_3',
      scale: 1,
      scene: this,
    });

    // .........cloud_ballonpeople_4............................................................
    PlaceElement.image({
      x: -2324,
      y: 2433,
      file: 'cloud_ballonpeople_4',
      scale: 1,
      scene: this,
    });

    // .........cloud_berg2_metCloud_achtergrond............................................................
    PlaceElement.image({
      x: 2170,
      y: -1600,
      file: 'cloud_berg2_metCloud_achtergrond',
      scale: 2.03,
      scene: this,
    });

    // .........cloud_berg3............................................................
    PlaceElement.image({
      x: -743,
      y: -2010,
      file: 'cloud_berg3',
      scale: 1.72,
      flipX: true,
      scene: this,
      tint: 0x9de0ff,
    });

    // .........cloud_berg3_mitWolken............................................................
    PlaceElement.image({
      x: -1791,
      y: -1633,
      file: 'cloud_berg3_mitWolken',
      scale: 3,
      scene: this,
    });

    // .........cloud_berg1_tweekeer............................................................
    PlaceElement.image({
      x: 767,
      y: -1707,
      file: 'cloud_berg1_tweekeer',
      scale: 2.82,
      scene: this,
    });

    // .........cloud_C3_2............................................................
    PlaceElement.image({
      x: 1386,
      y: 518,
      name: 'cloud_C3_2',
      file: 'cloud_C3',
      scale: 2.36,
      flipX: true,
      scene: this,
    });

    // .........cloud_C1............................................................
    PlaceElement.image({
      x: 1243,
      y: 1623,
      file: 'cloud_C1',
      scale: 3.34,
      scene: this,
    });

    // .........cloud_C3............................................................
    PlaceElement.image({
      x: -1130,
      y: 1033,
      file: 'cloud_C3',
      scale: 2.8,
      scene: this,
    });

    // .........cloud_C4............................................................
    PlaceElement.image({
      x: -1207,
      y: 2073,
      file: 'cloud_C4',
      scale: 2.7,
      scene: this,
    });

    // .........cloud_C5_achtergrond............................................................
    PlaceElement.image({
      x: 480,
      y: 2276,
      file: 'cloud_C5_achtergrond',
      scale: 1,
      scene: this,
    });

    // .........cloud_C5_achtergrond_2............................................................
    PlaceElement.image({
      x: 75,
      y: -1691,
      file: 'cloud_C5_achtergrond',
      scale: 1,
      scene: this,
    });

    // .........cloud_huis_1............................................................
    PlaceElement.image({
      x: 2158,
      y: 1665,
      file: 'cloud_huis_1',
      scale: 1,
      scene: this,
    });

    // .........cloud_huis_3............................................................
    PlaceElement.image({
      x: -575,
      y: -1231,
      file: 'cloud_huis_3',
      scale: 0.5,
      alpha: 0.8,
      scene: this,
    });

    // .........cloud_brug_1............................................................
    PlaceElement.image({
      x: -206,
      y: 1303,
      file: 'cloud_brug_1',
      scale: 0.28,
      alpha: 0.7,
      flipX: true,
      scene: this,
    });

    // .........cloud_brug_1_2............................................................
    PlaceElement.image({
      x: 130,
      y: 1523,
      name: 'cloud_brug_1_2',
      file: 'cloud_brug_1',
      scale: 0.156,
      alpha: 0.7,
      flipX: true,
      scene: this,
    });

    // .........cloud_brug_2............................................................
    PlaceElement.image({
      x: 310,
      y: 1779,
      file: 'cloud_brug_2',
      alpha: 0.5,
      scale: 0.4,
      scene: this,
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
    }
  } // update
} // class
