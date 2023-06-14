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
      locationImage: 'Portal_naarHuis_pizza',
      enterButtonImage: 'enter_button',
      locationText: 'Paarse Cirkel Wereld',
      referenceName: 'this.purpleCircleLocation',
      size: 400,
      fontColor: 0x8dcb0e,
    });
  }

  makeWorldElements() {
    // .........pizza_margarita............................................................
    PlaceElement.image({
      x: -938,
      y: 918,
      file: 'pizza_margarita',
      scale: 1.9,
      rotation: -0.05,
      scene: this,
    });


    // .........pizza_margarita2............................................................
    PlaceElement.image({
      x: -447,
      y: -1488,
      file: 'pizza_margarita2',
      scale: 1.9,
      scene: this,
    });

    // .........pizza_margarita3............................................................
    PlaceElement.image({
      x: 1359,
      y: 207,
      file: 'pizza_margarita3',
      scale: 1.9,
      scene: this,
    });

    // .........kaasbrugg_01_pizza............................................................
    PlaceElement.image({
      x: -637,
      y: -69,
      file: 'kaasbrugg_01_pizza',
      scale: 1.4,
      rotation: 0.1,
      scene: this,
    });

    // .........kaasbrugg_02_pizza............................................................
    PlaceElement.image({
      x: 1078,
      y: -1317,
      file: 'kaasbrugg_02_pizza',
      scale: 1,
      scene: this,
    });

    // .........kaasbrugg_03_pizza............................................................
    PlaceElement.image({
      x: 497,
      y: 1598,
      file: 'kaasbrugg_03_pizza',
      name: 'kaasbrugg_03_pizza',
      scale: 1.4,
      rotation: 0,
      scene: this,
    });

    // .........ananasguy............................................................
    PlaceElement.image({
      x: -2033,
      y: 2083,
      file: 'ananasguy',
      scale: 1.27,
      rotation: 0,
      scene: this,
    });

    // .........basil_2a............................................................
    PlaceElement.image({
      x: 2202,
      y: 2158,
      file: 'basil_2a',
      scale: 4,
      rotation: 0,
      scene: this,
    });

    // .........paprika_g1............................................................
    PlaceElement.image({
      x: -1813,
      y: -2412,
      file: 'paprika_g1',
      scale: 1.7,
      rotation: 0,
      scene: this,
    });

    // .........paprika_y1............................................................
    PlaceElement.image({
      x: -2213,
      y: -2152,
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
