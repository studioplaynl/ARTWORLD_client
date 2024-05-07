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
import {
  SCENE_INFO,
  ART_DISPLAY_SIZE,
  ART_OFFSET_BETWEEN
 } from '../../../constants';
import { handleEditMode, handlePlayerMovement } from '../helpers/InputHelper';
import PlaceElement from '../class/PlaceElement';
// import PreloadScene from './PreloadScene';

import * as Phaser from 'phaser';


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

    // Pizzaworld
    const folderPath = './assets/world_pizza/';
    this.localAssetsCheck = {};


    const loadArray = [
      { key: 'Portal_naarHuis_pizza', path: `${folderPath}Portal_naarHuis_pizza.png` },

      { key: 'kaasbrugg_01_pizza', path: `${folderPath}03c_bruggcorrectie_6_6_23.png` },
      { key: 'kaasbrugg_02_pizza', path: `${folderPath}03b_bruggcorrectie_6_6_23.png` },
      { key: 'kaasbrugg_03_pizza', path: `${folderPath}03a_bruggcorrectie_6_6_23.png` },


      { key: 'Slice_Caprese_metTomaatpeople', path: `${folderPath}Slice_Caprese_metTomaatpeople.png` },

      { key: 'pizza_margarita', path: `${folderPath}margarita_00_corr_6_6_23.png` },
      { key: 'pizza_margarita2', path: `${folderPath}margarita_02_correctie_6_6_23.png` },
      { key: 'pizza_margarita3', path: `${folderPath}margarita_01_correctie_6_6_23.png` },

      { key: 'ananasguy', path: `${folderPath}ananasGuy_04_correctie_6_6_23.png` },
      { key: 'basil_2a', path: `${folderPath}basil_2a.png` },
      { key: 'paprika_g1', path: `${folderPath}paprika_g1.png` },
      { key: 'paprika_y1', path: `${folderPath}paprika_y1.png` },
      { key: 'korr_tomaat03_b', path: `${folderPath}korr_tomaat03_b.png` },
    ];

    ServerCall.loadAssetArray(this, loadArray, 'localImage');
    // this.load.image('Portal_naarHuis_pizza', `${folderPath}Portal_naarHuis_pizza.png`);
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
    // .......... end locations ............................................................................

    // create accessable locations
    this.makeWorldElements();
    this.generateLocations();
    // .......... end locations ............................................................................

    // .......... likes ............................................................................
    this.loadAndPlaceLiked();
    this.likedBalloonAnimation();
    // .......... end likes ............................................................................

    Player.loadPlayerAvatar(this);
  } // end create

  likedBalloonAnimation() {
    this.balloonContainer = this.add.container(0, 0);

    this.likedBalloon = this.add.image(
      0,
      0,
      'likedBalloon',
    );
    this.likedBalloon.name = 'likedBalloon';

    // CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, 4000),
    //   CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 400),

    this.balloonContainer.add(this.likedBalloon);

    this.balloonContainer.setPosition(
      CoordinatesTranslator.artworldToPhaser2DX(this.worldSize.x, (this.worldSize.x / 1.5)),
      CoordinatesTranslator.artworldToPhaser2DY(this.worldSize.y, 1200),
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
      type, userId, serverObjectsHandler, artSize, artMargin,
    });
  }

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
