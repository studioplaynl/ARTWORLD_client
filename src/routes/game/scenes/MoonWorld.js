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

const { Phaser } = window;

export default class MoonWorld extends Phaser.Scene {
  constructor() {
    super('MoonWorld');

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

    this.load.on('loaderror', (offendingFile) => {
      dlog('loaderror', offendingFile);
      if (typeof offendingFile !== 'undefined') {
        ServerCall.resolveLoadError(offendingFile);
        // this.resolveLoadError(offendingFile);
      }
    });

    // Preloader.Loading(this); // .... PRELOADER VISUALISER
    // Moonworld
    this.localAssetsCheck = {};
    const folderPath = './assets/world_moon/';

    const loadArray = [
      {
        key: 'maan_KORR_portalRaket_naarHUIS_alleDelen',
        path: `${folderPath}maan_KORR_portalRaket_naarHUIS_alleDelen.png`,
      },
      { key: 'maan_MAAN_a', path: `${folderPath}maan_MAAN_a.png` },
      { key: 'maan_meteoor_metStaart', path: `${folderPath}maan_meteoor_metStaart.png` },
      { key: 'maan_portalRaket_naarHUIS_A', path: `${folderPath}maan_portalRaket_naarHUIS_A.png` },
      { key: 'maan_spaceBubble', path: `${folderPath}maan_spaceBubble.png` },
      { key: 'maan_sputnik_metStaart', path: `${folderPath}maan_sputnik_metStaart.png` },
      { key: 'maan_steren', path: `${folderPath}maan_steren.png` },
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
      gradientColor1: 0x000000,
      gradientColor2: 0x002637,
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

    let locationVector = new Phaser.Math.Vector2(1880, -1596);
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
      locationImage: 'maan_portalRaket_naarHUIS_A',
      enterButtonImage: 'enter_button',
      locationText: 'Paarse Cirkel Wereld',
      referenceName: 'this.purpleCircleLocation',
      size: 440,
      fontColor: 0x8dcb0e,
    });
    this.purpleCircleLocation.rotation = 4;
  }

  makeWorldElements() {
    // .........maan_spaceBubble............................................................
    PlaceElement.image({
      x: 397,
      y: 1914,
      file: 'maan_spaceBubble',
      scale: 1.8,
      scene: this,
      rotation: 0.4,
      flipX: true,
    });

    // .........maan_MAAN_a............................................................
    PlaceElement.image({
      x: 245,
      y: -25,
      file: 'maan_MAAN_a',
      scale: 3.74,
      scene: this,
    });

    // .........maan_KORR_portalRaket_naarHUIS_alleDelen............................................................
    PlaceElement.image({
      x: 1944,
      y: -743,
      file: 'maan_KORR_portalRaket_naarHUIS_alleDelen',
      scale: 2,
      scene: this,
      rotation: 4,
    });

    // .........maan_meteoor_metStaart............................................................
    PlaceElement.image({
      x: -1167,
      y: -1723,
      file: 'maan_meteoor_metStaart',
      scale: 3.5,
      scene: this,
    });

    // .........maan_spaceBubble_2............................................................
    PlaceElement.image({
      x: 1000,
      y: 1980,
      name: 'maan_spaceBubble_2',

      file: 'maan_spaceBubble',
      scale: 2.56,
      scene: this,
    });

    // .........maan_sputnik_metStaart............................................................
    PlaceElement.image({
      x: -1910,
      y: 2027,
      file: 'maan_sputnik_metStaart',
      scale: 1.72,
      scene: this,
      rotation: -0.3,
    });

    // .........maan_steren............................................................
    PlaceElement.image({
      x: -1791,
      y: -1633,
      name: 'maan_ster',
      file: 'maan_steren',
      scale: 3,
      scene: this,
    });


    // .........maan_steren_2............................................................
    PlaceElement.image({
      x: -1816,
      y: -153,
      name: 'maan_ster_2',
      file: 'maan_steren',
      scale: 3,
      scene: this,
    });

    // .........maan_steren_3............................................................
    PlaceElement.image({
      x: 1039,
      y: -1918,
      name: 'maan_ster_3',
      file: 'maan_steren',
      scale: 3,
      scene: this,
    });

    // .........maan_steren_4............................................................
    PlaceElement.image({
      x: 2349,
      y: 1892,
      name: 'maan_ster_4',
      file: 'maan_steren',
      scale: 3,
      scene: this,
    });

    // .........maan_steren_5............................................................
    PlaceElement.image({
      x: -926,
      y: 1567,
      name: 'maan_ster_5',
      file: 'maan_steren',
      scale: 3,
      scene: this,
    });

    // .........maan_steren_6............................................................
    PlaceElement.image({
      x: -2366,
      y: 2332,
      name: 'maan_ster_6',
      file: 'maan_steren',
      scale: 3,
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
