/**
 * @file Artworld.js
 * @author Maarten
 *
 *  What is this file for?
 *  ======================
 *  This file is the main scene for the Artworld.
 *  Portals to other worlds are located here.
 *  We load the player and NetworkedPlayer here.
 *  We have some animations with Tweens in the scene.
 *
 * Making a new world involves:
 * - CHECK THAT nakama.js is SET TO ARTWORLD SERVER!! on the register page it is visible on which server you are
 * - making a new scene file
 * - make the background image 5500x5500 72 dpi
 * - make assets smaller (compress)
 * - make assets folder and upload assets to folder
 * - put assets in world
 * - correct the keys for the assets in the scene file
 * - correct portal to artworld with gameEdit mode
 * - change the names inside the scene file
 * - adding the scene to the constans.js file
 * - adding the scene to the gameconfig.js file
 *  - make QR codes with the right nakama server
 *  - paste users in google sheet
 *  - save QR images
 *  - load QR sheets with 24 images
 *
 * - correct position of portal in artworld with gameEdit mode
 *  - place all houses in world with gameEdit mode, save with U key
 * - push new code to github
 * - deploy new code to server
 */

import { get } from 'svelte/store';
import ManageSession from '../ManageSession';
import PlayerDefault from '../class/PlayerDefault';
import PlayerDefaultShadow from '../class/PlayerDefaultShadow';
import Player from '../class/Player';
// import Preloader from '../class/Preloader';
// import GraffitiWall from '../class/GraffitiWall';
import Background from '../class/Background';
import CoordinatesTranslator from '../class/CoordinatesTranslator';
import GenerateLocation from '../class/GenerateLocation';
// import Exhibition from '../class/Exhibition';

import { dlog } from '../../../helpers/debugLog';
import { PlayerPos } from '../playerState';
import { SCENE_INFO, ART_DISPLAY_SIZE, ART_OFFSET_BETWEEN } from '../../../constants';
import { handleEditMode, handlePlayerMovement } from '../helpers/InputHelper';
import ServerCall from '../class/ServerCall';
import { getSceneInfo } from '../helpers/UrlHelpers';


import * as Phaser from 'phaser';

export default class Artworld extends Phaser.Scene {
  constructor() {
    super('Artworld');

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
    // artworld elements
    // this.load.image('drawn_cloud', './assets/drawn_cloud.png');
    // this.load.svg('sunglass_stripes', 'assets/svg/sunglass_stripes.svg');
    // this.load.svg('photo_camera', 'assets/svg/photo_camera.svg', {
    //   scale: 2.4,
    // });
    // this.load.svg('tree_palm', './assets/svg/tree_palm.svg');
    // this.load.svg('music_quarter_note', 'assets/svg/music_note_quarter_note.svg');
    // this.load.svg('metro_train_grey', 'assets/svg/metro_train_grey.svg');

    this.load.svg('mario_star', 'assets/svg/mario_star.svg');
    this.load.svg('yellow_diamond_location_image', 'assets/svg/geleRuit.svg');
    this.load.svg('blue_sail_location_image', 'assets/svg/blauwZeil.svg');
    // app icons; sound apps
    this.load.image('songmaker', './assets/apps/songmaker.png');
    this.load.image('melodymaker', './assets/apps/melodymaker.png');
    this.load.image('kandinsky', './assets/apps/kandinsky.png');

    // world portals in Artworld
    this.load.image('robotWorldPortal', './assets/world_robot_torquoise/portaal_robot_zonderAnimatie.png');
    this.load.image('artWorldPortalMoon', './assets/world_moon/maan_portalRaket_naarMaan.png');
    this.load.image('artWorldPortalPizza', './assets/world_pizza/Portal_naarPizza_pizza.png');
    this.load.image('seaWorldPortal', './assets/world_seaworld/zee_ship_Portaal_naarZEE.png');
    this.load.image('marsWorldPortal', './assets/world_mars_red/portal_gotoMars_mars.png');
    this.load.image('fireWorldPortal', './assets/world_fireworld/Portal_vuur_Naartoe_zonderAnimatie.png');
    this.load.image('underwaterWorldPortal', './assets/world_underwater_blue/Portaal_naarWater_water.png');
    this.load.image('slimeWorldPortal', './assets/world_slime_world/Portal_goSlime_slime.png');

    this.load.image('artWorldPortalUnderground', './assets/world_underground/Portal_naarOndergrond.png');
    this.load.image('artWorldPortalWoestijn', './assets/world_woestijn/Portal_woestijn_naarWoestijn-fs8.png');
    this.load.image('artWorldPortalIjs', './assets/world_ice/Portaal_Naar_Ice-fs8.png');

    this.load.image('artWorldPortalIjsco', './assets/world_ijsco/Portaal_vanHOMEnaarICECREAM_corr-fs8.png');

    this.load.image('cloudWorldPortal', './assets/world_clouds/cloud_portal_naarCloud.png');
    this.load.image('beeWorldPortal', './assets/world_bees/02b_Portaal_home_naar_bee-fs8.png');
    this.load.image('bergenWorldPortal', './assets/world_bergen/Portaal2_NaarBergen_CROP-fs8.png');
    this.load.image('prismaWorldPortal', './assets/world_prism/Portaal_Prisma_naar_PrismaCROP-fs8.png');
    this.load.image('jungleWorldPortal', './assets/world_jungle/portaal_naarJungle_crop-fs8.png');
    this.load.image('flamengoWorldPortal', './assets/world_flamengo/_Portaal_Flamingocity_naarMeteor_small-fs8.png');
    this.load.image('paarseRivierWorldPortal', './assets/world_paarse_rivier/02b_portaal_River_naarRivier-fs8.png');
    this.load.image('swampWorldPortal', './assets/world_swamp/02a_portaal_swamp_naarSwamp400px-fs8.png');
    this.load.image('salamanderWorldPortal', './assets/world_salamander/portaal_naarSalamanderWereld-fs8.png');

    this.load.image('dennenBosWorldPortal', './assets/world_dennenbos/22_dennenbos_portaal-fs8.png');

    this.load.image(
      'vliegendeEilandenPortal',
      './assets/world_vliegendeEilanden/02b_Portale_w23_naarVliegendeEilanden-fs8.png'
    );

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

    // background image array
    const folderPath = './assets/world_artworld/';

    this.backgroundImageKey = 'artworld_background_';
    //  load 9 images in a for loop
    for (let i = 0; i < 16; i++) {
      // const key = 'image' + i;
      const name = folderPath + 'image_part_' + i + '.jpeg';
      this.load.image(this.backgroundImageKey + i, name);
    }
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

    // Background.diamondAlternatedDots(this);
    this.loadBackgroundImageArray();

    handlePlayerMovement(this);

    const { artworldToPhaser2DX, artworldToPhaser2DY } = CoordinatesTranslator;

    // .......  PLAYER ..........................................JA even ..........................................
    //* create default player and playerShadow
    //* create player in center with artworldCoordinates
    this.player = new PlayerDefault(
      this,
      artworldToPhaser2DX(this.worldSize.x, get(PlayerPos).x),
      artworldToPhaser2DY(this.worldSize.y, get(PlayerPos).y),
      ManageSession.playerAvatarPlaceholder
    ).setDepth(201);

    this.playerShadow = new PlayerDefaultShadow({
      scene: this,
      texture: ManageSession.playerAvatarPlaceholder,
    }).setDepth(200);

    // ....... PLAYER VS WORLD .............................................................................
    this.gameCam = this.cameras.main; // .setBackgroundColor(0xFFFFFF);

    // UI scene is subscribed to zoom changes and passes it on to the current scene via ManageSession.currentScene
    this.gameCam.zoom = ManageSession.currentZoom;
    // this.gameCam.zoom = get(PlayerZoom);

    this.gameCam.startFollow(this.player);
    // this.physics.world.setBounds(0, 0, this.worldSize.x, this.worldSize.y);
    // https://phaser.io/examples/v3/view/physics/arcade/world-bounds-event
    // ......... end PLAYER VS WORLD .......................................................................

    // .......... locations ................................................................................
    // ServerCall.getHomesFiltered('GreenSquare', this);
    this.generateLocations();
    // .......... end locations ............................................................................

    this.loadAndPlaceLiked();
    this.likedBalloonAnimation();
    // .......... end likes ............................................................................

    Player.loadPlayerAvatar(this);
  } // end create

  loadBackgroundImageArray() {
    const partSize = 1535;
    let beginImage = 0;

    const grid = 4;

    for (let j = 0; j < grid; j++) {
      for (let i = 0; i < grid; i++) {
        this.add.image(partSize * j, partSize * i, this.backgroundImageKey + beginImage).setOrigin(0);
        beginImage++;
      }
    }
  }

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
    const artSize = ART_DISPLAY_SIZE;
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
    let locationVector = new Phaser.Math.Vector2(2447, 2547);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);

    Background.rectangle({
      scene: this,
      name: 'green_square_location_image',
      gradient1: 0x15d64a,
      gradient2: 0x15d64a,
      gradient3: 0x2b8042,
      gradient4: 0x2b8042,
      alpha: 1,
      width: 140,
      height: 140,
      imageOnly: true,
    });

    this.greenSquareLocation = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'GreenSquare',
      locationImage: 'green_square_location_image',
      enterButtonImage: 'enter_button',
      locationText: 'Groene Vierkant Wereld',
      referenceName: 'this.greenSquareLocation',
      fontColor: 0x8dcb0e,
    });

    locationVector = new Phaser.Math.Vector2(-118, 1960);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);

    this.fireWorldLocation = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'FireWorld',
      locationImage: 'fireWorldPortal',
      enterButtonImage: 'enter_button',
      locationText: 'Vuur Wereld',
      referenceName: 'this.fireWorldLocation',
      fontColor: 0x8dcb0e,
    });

    locationVector = new Phaser.Math.Vector2(2794, 2427);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);

    this.yellowDiamondLocation = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'YellowDiamond',
      locationImage: 'yellow_diamond_location_image',
      enterButtonImage: 'enter_button',
      locationText: 'Gele Diamant Wereld',
      referenceName: 'this.yellowDiamondLocation',
      fontColor: 0x8dcb0e,
    });

    locationVector = new Phaser.Math.Vector2(1812, 2829);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);

    this.blueSailLocation = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'BlueSail',
      locationImage: 'blue_sail_location_image',
      enterButtonImage: 'enter_button',
      locationText: 'Blauwe Zeil Wereld',
      referenceName: 'this.blueSailLocation',
      fontColor: 0x8dcb0e,
    });

    locationVector = new Phaser.Math.Vector2(2172, 2806);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);

    Background.triangle({
      scene: this,
      name: 'turquoise_triangle_location_image',
      // setOrigin: 0,
      posX: locationVector.x,
      posY: locationVector.y,
      gradient1: 0x40e0d0,
      gradient2: 0x40e0d0,
      gradient3: 0x39c9bb,
      gradient4: 0x39c9bb,
      alpha: 1,
      size: 200,
      imageOnly: true,
    });

    this.turquoiseTriangle = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'TurquoiseTriangle',
      locationImage: 'turquoise_triangle_location_image',
      enterButtonImage: 'enter_button',
      locationText: 'Turquoise Driehoek Wereld',
      referenceName: 'this.turquoiseTriangle',
      fontColor: 0x8dcb0e,
    });

    locationVector = new Phaser.Math.Vector2(2846, 2114);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);

    Background.star({
      scene: this,
      name: 'red_star_location_image',
      gradient1: 0xe50000,
      gradient2: 0xe50000,
      alpha: 1,
      size: 200,
      imageOnly: true,
      spikes: 5,
    });

    this.redStar = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'RedStar',
      locationImage: 'red_star_location_image',
      enterButtonImage: 'enter_button',
      locationText: 'Rode Ster Wereld',
      referenceName: 'this.redStar',
      fontColor: 0x8dcb0e,
    });

    locationVector = new Phaser.Math.Vector2(-7, -843);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);

    this.robotWorldLocation = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'RobotWorld',
      locationImage: 'robotWorldPortal',
      enterButtonImage: 'enter_button',
      locationText: 'Robot Wereld',
      referenceName: 'this.robotWorldLocation',
      fontColor: 0x8dcb0e,
    });

    locationVector = new Phaser.Math.Vector2(1431, -729);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);

    this.slimeWorldLocation = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'SlimeWorld',
      locationImage: 'slimeWorldPortal',
      enterButtonImage: 'enter_button',
      locationText: 'Slijm Wereld',
      referenceName: 'this.slimeWorldLocation',
      fontColor: 0x8dcb0e,
    });

    locationVector = new Phaser.Math.Vector2(1234, 1135);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);

    this.marsWorldLocation = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'MarsWorld',
      locationImage: 'marsWorldPortal',
      enterButtonImage: 'enter_button',
      locationText: 'Mars Wereld',
      referenceName: 'this.marsWorldLocation',
      size: 226,
      fontColor: 0x8dcb0e,
    });

    locationVector = new Phaser.Math.Vector2(-1231, -1287);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);

    this.underwaterWorldLocation = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'UnderwaterWorld',
      locationImage: 'underwaterWorldPortal',
      enterButtonImage: 'enter_button',
      locationText: 'Onderwater Wereld',
      referenceName: 'this.underwaterWorldLocation',
      size: 354,
      fontColor: 0x8dcb0e,
    });

    locationVector = new Phaser.Math.Vector2(-265, -1312);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);

    this.seaWorldLocation = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'SeaWorld',
      locationImage: 'seaWorldPortal',
      enterButtonImage: 'enter_button',
      locationText: 'Zee Wereld',
      referenceName: 'this.seaWorldLocation',
      size: 354,
      fontColor: 0x8dcb0e,
    });

    locationVector = new Phaser.Math.Vector2(-951, -902);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);

    this.cloudWorldLocation = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'CloudWorld',
      locationImage: 'cloudWorldPortal',
      enterButtonImage: 'enter_button',
      locationText: 'Wolken Wereld',
      referenceName: 'this.cloudWorldLocation',
      fontColor: 0x8dcb0e,
    });

    locationVector = new Phaser.Math.Vector2(-1985, 419);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);

    this.moonWorldLocation = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'MoonWorld',
      locationImage: 'artWorldPortalMoon',
      enterButtonImage: 'enter_button',
      locationText: 'Maan Wereld',
      referenceName: 'this.moonWorldLocation',
      fontColor: 0x8dcb0e,
    });

    locationVector = new Phaser.Math.Vector2(1782, 398);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);

    this.pizzaWorldLocation = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'PizzaWorld',
      locationImage: 'artWorldPortalPizza',
      enterButtonImage: 'enter_button',
      locationText: 'Pizza Wereld',
      referenceName: 'this.pizzaWorldLocation',
      fontColor: 0x8dcb0e,
    });

    locationVector = new Phaser.Math.Vector2(2187, -58);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);

    this.underrgoundWorldLocation = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'UndergroundWorld',
      locationImage: 'artWorldPortalUnderground',
      enterButtonImage: 'enter_button',
      locationText: 'Ondergrond Wereld',
      referenceName: 'this.underrgoundWorldLocation',
      fontColor: 0x8dcb0e,
    });

    locationVector = new Phaser.Math.Vector2(686, 12);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);

    this.woestijnWorldLocation = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'WoestijnWereld',
      locationImage: 'artWorldPortalWoestijn',
      enterButtonImage: 'enter_button',
      locationText: 'Woestijn Wereld',
      referenceName: 'this.woestijnWorldLocation',
      fontColor: 0x8dcb0e,
      size: 354,
    });

    locationVector = new Phaser.Math.Vector2(-322, -192);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);

    this.ijsWorldLocation = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'IjsWereld',
      locationImage: 'artWorldPortalIjs',
      enterButtonImage: 'enter_button',
      locationText: 'Ijs Wereld',
      referenceName: 'this.ijsWorldLocation',
      fontColor: 0x8dcb0e,
      size: 354,
    });

    locationVector = new Phaser.Math.Vector2(77, 542);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);

    this.ijscoWorldLocation = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'IjscoWereld',
      locationImage: 'artWorldPortalIjsco',
      enterButtonImage: 'enter_button',
      locationText: 'Ijsco Wereld',
      referenceName: 'this.ijscoWorldLocation',
      fontColor: 0x8dcb0e,
      size: 354,
    });

    locationVector = new Phaser.Math.Vector2(1418, -110);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);

    this.bijenWorldLocation = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'BijenWereld',
      locationImage: 'beeWorldPortal',
      enterButtonImage: 'enter_button',
      locationText: 'Bijen Wereld',
      referenceName: 'this.bijenWorldLocation',
      fontColor: 0x8dcb0e,
      size: 238,
    });

    locationVector = new Phaser.Math.Vector2(-1215, 1500);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);

    this.bergenWorldPortal = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'BergenWereld',
      locationImage: 'bergenWorldPortal',
      enterButtonImage: 'enter_button',
      locationText: 'Bergen Wereld',
      referenceName: 'this.bergenWorldPortal',
      fontColor: 0x8dcb0e,
      size: 240,
    });

    locationVector = new Phaser.Math.Vector2(-1452, 809);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);

    this.prismaWorldPortal = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'PrismaWereld',
      locationImage: 'prismaWorldPortal',
      enterButtonImage: 'enter_button',
      locationText: 'Prisma Wereld',
      referenceName: 'this.prismaWorldPortal',
      fontColor: 0x8dcb0e,
      size: 340,
    });

    locationVector = new Phaser.Math.Vector2(1429, -1570);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);

    this.jungleWorldPortal = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'JungleWereld',
      locationImage: 'jungleWorldPortal',
      enterButtonImage: 'enter_button',
      locationText: 'Jungle Wereld',
      referenceName: 'this.jungleWorldPortal',
      fontColor: 0x8dcb0e,
      size: 310,
    });

    locationVector = new Phaser.Math.Vector2(-333, 919);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);

    this.flamengoWorld = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'FlamengoWereld',
      locationImage: 'flamengoWorldPortal',
      enterButtonImage: 'enter_button',
      locationText: 'Flamengo Wereld',
      referenceName: 'this.flamengoWorld',
      fontColor: 0x8dcb0e,
      size: 156,
    });

    locationVector = new Phaser.Math.Vector2(-830, 459);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);

    this.rivierWorld = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'RivierWereld',
      locationImage: 'paarseRivierWorldPortal',
      enterButtonImage: 'enter_button',
      locationText: 'Rivier Wereld',
      referenceName: 'this.rivierWorld',
      fontColor: 0x8dcb0e,
      size: 231,
    });

    locationVector = new Phaser.Math.Vector2(440, 1043);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);

    this.swampWorld = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'MoerasWereld',
      locationImage: 'swampWorldPortal',
      enterButtonImage: 'enter_button',
      locationText: 'Moeras Wereld',
      referenceName: 'this.swampWorld',
      fontColor: 0x8dcb0e,
      size: 231,
    });

    locationVector = new Phaser.Math.Vector2(-700, -1851);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);

    this.salamanderWorld = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'SalamanderWereld',
      locationImage: 'salamanderWorldPortal',
      enterButtonImage: 'enter_button',
      locationText: 'Salamander Wereld',
      referenceName: 'this.salamanderWorld',
      fontColor: 0x8dcb0e,
      size: 231,
    });

    locationVector = new Phaser.Math.Vector2(1124, 1835);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);

    this.vliegendeEilandenWereld = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'VliegendeEilandenWereld',
      locationImage: 'vliegendeEilandenPortal',
      enterButtonImage: 'enter_button',
      locationText: 'VliegendeEilanden Wereld',
      referenceName: 'this.vliegendeEilandenWereld',
      fontColor: 0x8dcb0e,
      size: 231,
    });

    locationVector = new Phaser.Math.Vector2(331, -1995);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);

    this.dennenBosWereld = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'DennenbosWereld',
      locationImage: 'dennenBosWorldPortal',
      enterButtonImage: 'enter_button',
      locationText: 'Dennenbos Wereld',
      referenceName: 'this.dennenBosWereld',
      fontColor: 0x8dcb0e,
      size: 231,
    });

    // ---- Location 1 ----------------------
    // locationVector = new Phaser.Math.Vector2(-1215, -589);
    // locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);

    // this.location1 = new GenerateLocation({
    //   scene: this,
    //   type: 'isoBox',
    //   draggable: ManageSession.gameEditMode,
    //   x: locationVector.x,
    //   y: locationVector.y,
    //   locationDestination: 'Location1',
    //   enterButtonImage: 'enter_button',
    //   locationText: 'Location 1',
    //   referenceName: 'Location1',
    //   fontColor: 0x8dcb0e,
    //   color1: 0xffe31f,
    //   color2: 0xf2a022,
    //   color3: 0xf8d80b,
    // });

    //* set the particle first on 0,0 so they are below the mario_star
    //* later move them relative to the mario_star
    // var particles = this.add.particles('music_quarter_note').setDepth(139)

    // var music_emitter = particles.createEmitter({
    //   x: 0,
    //   y: 0,
    //   lifespan: { min: 2000, max: 8000 },
    //   speed: { min: 80, max: 120 },
    //   angle: { min: 270, max: 360 },
    //   gravityY: -50,
    //   gravityX: 50,
    //   scale: { start: 1, end: 0 },
    //   quantity: 1,
    //   frequency: 1600,
    // })

    // sound apps ............................................................

    locationVector = new Phaser.Math.Vector2(-2477, 1824);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);

    this.mario_star = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      externalUrl: 'https://minghai.github.io/MarioSequencer/',
      locationImage: 'mario_star',
      enterButtonImage: 'enter_button',
      locationText: 'Mario Sound',
      referenceName: 'MarioSound',
      fontColor: 0x8dcb0e,
      color1: 0x8dcb0e,
      color2: 0x3f8403,
      color3: 0x63a505,
    });
    this.mario_star.setDepth(140);

    locationVector = new Phaser.Math.Vector2(-1630, -2628);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);

    this.songMaker = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      externalUrl: 'https://musiclab.chromeexperiments.com/Song-Maker/',
      locationImage: 'songmaker',
      enterButtonImage: 'enter_button',
      locationText: 'Song Maker',
      referenceName: 'songmaker',
      fontColor: 0x8dcb0e,
      color1: 0x8dcb0e,
      color2: 0x3f8403,
      color3: 0x63a505,
    });
    this.songMaker.setDepth(140);

    locationVector = new Phaser.Math.Vector2(-2588, -1908);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);

    this.Kandinsky = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      externalUrl: 'https://musiclab.chromeexperiments.com/Kandinsky/',
      locationImage: 'kandinsky',
      enterButtonImage: 'enter_button',
      locationText: 'Kandinsky Sound',
      referenceName: 'kandinsky',
      fontColor: 0x8dcb0e,
      color1: 0x8dcb0e,
      color2: 0x3f8403,
      color3: 0x63a505,
    });
    this.Kandinsky.setDepth(140);
    // music_emitter.setPosition(this.mario_star.x + 15, this.mario_star.y - 20)

    locationVector = new Phaser.Math.Vector2(-2427, -2236);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);

    this.MelodyMaker = new GenerateLocation({
      scene: this,
      type: 'image',
      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      externalUrl: 'https://musiclab.chromeexperiments.com/Melody-Maker/',
      locationImage: 'melodymaker',
      enterButtonImage: 'enter_button',
      locationText: 'Melody Maker',
      referenceName: 'melodymaker',
      fontColor: 0x8dcb0e,
      color1: 0x8dcb0e,
      color2: 0x3f8403,
      color3: 0x63a505,
    });
    this.MelodyMaker.setDepth(140);

    // locationVector = new Phaser.Math.Vector2(-2125, 1017);
    // locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);
    // // end sound apps ............................................................
    // this.pencil = new GenerateLocation({
    //   scene: this,
    //   type: 'image',

    //   draggable: ManageSession.gameEditMode,
    //   x: locationVector.x,
    //   y: locationVector.y,
    //   appUrl: 'drawing',
    //   locationImage: 'pencil',
    //   enterButtonImage: 'enter_button',
    //   locationText: 'drawingApp',
    //   referenceName: 'drawingApp',
    //   fontColor: 0x8dcb0e,
    //   color1: 0x8dcb0e,
    //   color2: 0x3f8403,
    //   color3: 0x63a505,
    // });
    // this.pencil.rotation = 0.12;

    locationVector = new Phaser.Math.Vector2(1048, 592);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);

    this.animalGardenChallenge = new GenerateLocation({
      scene: this,
      type: 'image',

      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'ChallengeAnimalGarden',
      locationImage: 'dinoA',
      enterButtonImage: 'enter_button',
      locationText: 'animal Garden',
      referenceName: 'animalGardenChallenge',
      fontColor: 0x8dcb0e,
      color1: 0x8dcb0e,
      color2: 0x3f8403,
      color3: 0x63a505,
    });

    locationVector = new Phaser.Math.Vector2(794, -761);
    locationVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);

    this.flowerFieldChallenge = new GenerateLocation({
      scene: this,
      type: 'image',

      draggable: ManageSession.gameEditMode,
      x: locationVector.x,
      y: locationVector.y,
      locationDestination: 'ChallengeFlowerField',
      locationImage: 'flower',
      enterButtonImage: 'enter_button',
      locationText: 'bloemen Veld',
      referenceName: 'flowerFieldChallenge',
      fontColor: 0x8dcb0e,
      color1: 0x8dcb0e,
      color2: 0x3f8403,
      color3: 0x63a505,
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
    } else {
      // when in edit mode
    }
  } // update
} // class
