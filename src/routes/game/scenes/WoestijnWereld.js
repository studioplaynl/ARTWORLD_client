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
import PlaceElement from '../class/PlaceElement';
// import PreloadScene from './PreloadScene';

const { Phaser } = window;

export default class WoestijnWereld extends Phaser.Scene {
  constructor() {
    super('WoestijnWereld');

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

    this.localAssetsCheck = {};

    // Woestijn
    this.localAssetsCheck = {};

    const folderPath = './assets/world_woestijn/';


    const loadArray = [
      { key: 'Portal_naarHuis_woestijn', path: `${folderPath}Portal_woestijn_naarHuis-fs8.png` },

      { key: 'oasis_blauw_01_ring', path: `${folderPath}oasis_blauw 01_ring-fs8.png` },
      { key: 'oasis_blauw_01', path: `${folderPath}oasis_blauw 01-fs8.png` },
      { key: 'oasis_blauw_02', path: `${folderPath}oasis_blauw_02-fs8.png` },

      { key: 'oasis_blauw_03', path: `${folderPath}oasis_blauw_03-fs8.png` },
      { key: 'oasis_blauw_04', path: `${folderPath}oasis_blauw_04-fs8.png` },
      { key: 'pyradmide_01', path: `${folderPath}pyradmide_01-fs8.png` },
      { key: 'pyradmide_02', path: `${folderPath}pyradmide_02-fs8.png` },
      { key: 'pyradmide_03', path: `${folderPath}pyradmide_03-fs8.png` },
      { key: 'pyradmide_GodofWater', path: `${folderPath}pyradmide_GodofWater-fs8.png` },
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
    const sceneInfo = SCENE_INFO.find((obj) => obj.scene === this.scene.key);
    this.worldSize.x = sceneInfo.sizeX;
    this.worldSize.y = sceneInfo.sizeY;
    ManageSession.worldSize = this.worldSize;
    //!

    handleEditMode(this);

    Background.gradientStretchedToFitWorld({
      scene: this,
      tileMapName: 'WorldBackgroundTileMap',
      gradientColor1: 0xdcc580,
      gradientColor2: 0xcea937,
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
    this.makeWorldElements();
    this.generateLocations();
    // .......... end locations ............................................................................

    Player.loadPlayerAvatar(this);
  } // end create

  generateLocations() {
    // we set draggable on restart scene with a global flag

    let locationVector = new Phaser.Math.Vector2(612, 1922);
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
      locationImage: 'Portal_naarHuis_woestijn',
      enterButtonImage: 'enter_button',
      locationText: 'Paarse Cirkel Wereld',
      referenceName: 'this.purpleCircleLocation',
      size: 800,
      fontColor: 0x8dcb0e,
    });
  }

  makeWorldElements() {
    // .........oasis_blauw_01............................................................
    PlaceElement.image({
      x: -925,
      y: 1662,
      file: 'oasis_blauw_01',
      scale: 1.1,
      // rotation: -0.05,
      scene: this,
    });

    // .........oasis_blauw_02............................................................
    PlaceElement.image({
      x: 1822,
      y: 1255,
      file: 'oasis_blauw_02',
      scale: 1.6,
      // rotation: -0.05,
      scene: this,
    });

    // .........oasis_blauw_03............................................................
    PlaceElement.image({
      x: -1683,
      y: 760,
      file: 'oasis_blauw_03',
      scale: 1.4,
      // rotation: -0.05,
      scene: this,
    });

    // .........oasis_blauw_04............................................................
    PlaceElement.image({
      x: -1580,
      y: 116,
      file: 'oasis_blauw_04',
      scale: 1.3,
      // rotation: -0.05,
      scene: this,
    });


    // .........pyradmide_01............................................................
    PlaceElement.image({
      x: 260,
      y: -1717,
      file: 'pyradmide_01',
      scale: 1.8,
      // rotation: -0.05,
      scene: this,
    });

    // .........pyradmide_02............................................................
    PlaceElement.image({
      x: 1507,
      y: -1357,
      file: 'pyradmide_02',
      scale: 2.2,
      // rotation: -0.05,
      scene: this,
    });

    // .........pyradmide_03............................................................
    PlaceElement.image({
      x: -873,
      y: -2144,
      file: 'pyradmide_03',
      scale: 1.9,
      // rotation: -0.05,
      scene: this,
    });

    // .........pyradmide_GodofWater............................................................
    PlaceElement.image({
      x: 960,
      y: 256,
      file: 'pyradmide_GodofWater',
      scale: 1.4,
      // rotation: -0.05,
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
