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
      x: 1274,
      y: 132,
      file: 'Slice_Caprese_metTomaatpeople',
      scale: 2.2,
      scene: this,
    });

    // .........pizza_alaMaarten_2............................................................
    PlaceElement.image({
      x: -938,
      y: 918,
      file: 'pizza_alaMaarten',
      name: 'pizza_alaMaarten_2',

      scale: 3,
      rotation: -0.05,
      scene: this,
    });


    // .........pizza_alaMaarten_3............................................................
    PlaceElement.image({
      x: -452,
      y: -1338,
      file: 'pizza_alaMaarten',
      name: 'pizza_alaMaarten_3',
      scale: 2.7,
      scene: this,
      rotation: -2.1,
    });

    // .........kaasbrugg_01_pizza............................................................
    PlaceElement.image({
      x: -777,
      y: -144,
      file: 'kaasbrugg_01_pizza',
      scale: 2,
      rotation: 0.1,
      scene: this,
    });

    // .........kaasbrugg_02_pizza............................................................
    PlaceElement.image({
      x: 973,
      y: -1352,
      file: 'kaasbrugg_02_pizza',
      scale: 2,
      scene: this,
    });

    // .........kaasbrugg_03_pizza............................................................
    PlaceElement.image({
      x: 492,
      y: 1313,
      file: 'kaasbrugg_03_pizza',
      name: 'kaasbrugg_03_pizza',
      scale: 2,
      rotation: 0,
      scene: this,
    });

    // .........ananasguy............................................................
    PlaceElement.image({
      x: -1898,
      y: 2058,
      file: 'ananasguy',
      scale: 2,
      rotation: 0,
      scene: this,
    });

    // .........basil_2a............................................................
    PlaceElement.image({
      x: 2102,
      y: 2148,
      file: 'basil_2a',
      scale: 4,
      rotation: 0,
      scene: this,
    });

    // .........paprika_g1............................................................
    PlaceElement.image({
      x: -1973,
      y: -1782,
      file: 'paprika_g1',
      scale: 1.7,
      rotation: 0,
      scene: this,
    });

    // .........paprika_y1............................................................
    PlaceElement.image({
      x: -2353,
      y: -1582,
      file: 'paprika_y1',
      scale: 2.2,
      rotation: 0,
      scene: this,
    });

    // .........korr_tomaat03_b............................................................
    PlaceElement.image({
      x: 1932,
      y: -2112,
      file: 'korr_tomaat03_b',
      scale: 2.2,
      rotation: 0,
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
