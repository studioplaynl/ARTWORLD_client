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

export default class PizzaWorld extends Phaser.Scene {
  constructor() {
    super('PizzaWorld');

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

    this.localAssetsCheck = {};

    // const folderPath = './assets/world_pizza/';
    // const loadArray = [
    //   { key: 'artWorldPortalPizza', path: `${folderPath}Portal_naarHuis_pizza.png` },

    //   { key: 'kaasbrugg_01_pizza', path: `${folderPath}kaasbrugg_01_pizza.png` },
    //   { key: 'kaasbrugg_02_pizza', path: `${folderPath}kaasbrugg_02_pizza.png` },
    //   { key: 'kaasbrugg_03_pizza', path: `${folderPath}kaasbrugg_03_pizza.png` },
    //   { key: 'Slice_Caprese_metTomaatpeople', path: `${folderPath}Slice_Caprese_metTomaatpeople.png` },
    //   { key: 'Slice_Hawaii_metAnanasPeople', path: `${folderPath}Slice_Hawaii_metAnanasPeople.png` },
    // ];

    // ServerCall.loadAssetArray(this, loadArray, 'localImage');
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
      gradientColor1: 0xa5936d,
      gradientColor2: 0xa5936d,
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
      locationImage: 'artWorldPortalPizza',
      enterButtonImage: 'enter_button',
      locationText: 'Paarse Cirkel Wereld',
      referenceName: 'this.purpleCircleLocation',
      // size: 500,
      fontColor: 0x8dcb0e,
    });
  }

  makeWorldElements() {
    // .........Slice_Caprese_metTomaatpeople............................................................
    PlaceElement.image({
      x: 644,
      y: 59,
      file: 'Slice_Caprese_metTomaatpeople',
      scale: 1,
      scene: this,
    });

    // .........Slice_Caprese_zonder............................................................
    PlaceElement.image({
      x: 439,
      y: 1769,
      file: 'Slice_Caprese_zonder',
      scale: 1,
      rotation: -1.15,
      scene: this,
    });

    // .........Slice_Caprese_zonder_2............................................................
    PlaceElement.image({
      x: 2094,
      y: 614,
      file: 'Slice_Caprese_zonder',
      name: 'Slice_Caprese_zonder_2',
      scale: 1,
      rotation: -1.15,
      scene: this,
    });

    // .........Slice_Caprese_zonder_3............................................................
    PlaceElement.image({
      x: -1496,
      y: 1789,
      file: 'Slice_Caprese_zonder',
      name: 'Slice_Caprese_zonder_3',
      scale: 1,
      rotation: -2.15,
      scene: this,
    });

    // .........Slice_Caprese_zonder_4............................................................
    PlaceElement.image({
      x: 49,
      y: -2031,
      file: 'Slice_Caprese_zonder',
      name: 'Slice_Caprese_zonder_4',
      scale: 1,
      rotation: 1.05,
      scene: this,
    });

    // .........Slice_Hawaii_metAnanasPeople............................................................
    PlaceElement.image({
      x: -618,
      y: 435,
      file: 'Slice_Hawaii_metAnanasPeople',
      scale: 1.3,
      rotation: -0.05,
      scene: this,
    });

    // .........Slice_Hawaii_ZonderPineaplePeople............................................................
    PlaceElement.image({
      x: -1970,
      y: -767,
      file: 'Slice_Hawaii_ZonderPineaplePeople',
      scale: 1.3,
      rotation: -1.15,
      scene: this,
    });

    // .........Slice_Salami_metSalamiworm............................................................
    PlaceElement.image({
      x: -235,
      y: -738,
      file: 'Slice_Salami_metSalamiworm',
      scale: 1.4,
      scene: this,
    });

    // .........Slice_Salami_zonder............................................................
    PlaceElement.image({
      x: 1670,
      y: -1415,
      file: 'Slice_Salami_zonder',
      scale: 1.4,
      rotation: -1.35,
      scene: this,
    });

    // .........kaasbrugg_01_pizza............................................................
    PlaceElement.image({
      x: -497,
      y: -94,
      file: 'kaasbrugg_01_pizza',
      scale: 1.9,
      rotation: 0.1,
      scene: this,
    });

    // .........kaasbrugg_02_pizza............................................................
    PlaceElement.image({
      x: 433,
      y: -537,
      file: 'kaasbrugg_02_pizza',
      scale: 2.03,
      scene: this,
    });

    // .........kaasbrugg_03_pizza............................................................
    PlaceElement.image({
      x: 170,
      y: 780,
      file: 'kaasbrugg_03_pizza',
      scale: 2.04,
      rotation: 0.1,
      // flipX: true,
      scene: this,
      tint: 0x9de0ff,
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
