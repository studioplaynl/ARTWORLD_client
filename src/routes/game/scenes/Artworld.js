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
import CoordinatesTranslator from '../class/CoordinatesTranslator';
import GenerateLocation from '../class/GenerateLocation';
// import Exhibition from '../class/Exhibition';

// import { dlog } from '../../../helpers/debugLog';
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
    const locations = [
      'ChallengeAnimalGarden',
      'ChallengeFlowerField',
      'BlueSail',
      'GreenSquare',
      'RedStar',
      'TurquoiseTriangle',
      'YellowDiamond',
      'FireWorld',
      'RobotWorld',
      'SlimeWorld',
      'MarsWorld',
      'UnderwaterWorld',
      'SeaWorld',
      'CloudWorld',
      'MoonWorld',
      'PizzaWorld',
      'UndergroundWorld',
      'WoestijnWereld',
      'IjsWereld',
      'IjscoWereld',
      'BijenWereld',
      'BergenWereld',
      'PrismaWereld',
      'JungleWereld',
      'FlamengoWereld',
      'RivierWereld',
      'MoerasWereld',
      'SalamanderWereld',
      'VliegendeEilandenWereld',
      'DennenbosWereld',
      'MarioSound',
      'SongMaker', 
      'Kandinsky',
      'MelodyMaker'
    ];

    // Load portal images based on SCENE_INFO
    const artworld = SCENE_INFO.find(info => info.scene === 'Artworld');
    if (artworld && artworld.children) {
      artworld.children.forEach(child => {
        const imageKey = child.scene ? `${child.scene}_image` : `${child.scene_external}_image`;
        const imagePath = child.locationImage;
        
        if (imagePath.endsWith('.svg')) {
          this.load.svg(imageKey, imagePath);
        } else if (imagePath.match(/\.(png|jpg|jpeg)$/i)) {
          this.load.image(imageKey, imagePath);
        }
      });
    }

    // background image array
    const folderPath = './assets/world_artworld/';

    this.backgroundImageKey = 'artworld_background_';
    const totalImages = 49;
    for (let i = 0; i < totalImages; i++) {
      const name = folderPath + 'image_part_' + i + '.jpeg';
      this.load.image(this.backgroundImageKey + i, name);
    }

  }

  async create() {
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
    this.generateLocations();
    // .......... end locations ............................................................................

    this.loadAndPlaceLiked();
    this.likedBalloonAnimation();
    // .......... end likes ............................................................................

    Player.loadPlayerAvatar(this);
  } // end create

  loadBackgroundImageArray() {
    const partSize = 877;
    let beginImage = 0;

    const grid = 7;

    for (let j = 0; j < grid; j++) {
      for (let i = 0; i < grid; i++) {
        const xPosition = partSize * j; 
        const yPosition = partSize * i; 
        this.add.image(xPosition, yPosition, this.backgroundImageKey + beginImage).setOrigin(0);
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
    const artworld = SCENE_INFO.find(info => info.scene === 'Artworld');
    if (!artworld || !artworld.children) return;

    artworld.children.forEach(child => {
        const locationVector = new Phaser.Math.Vector2(child.position.x, child.position.y);
        const translatedVector = CoordinatesTranslator.artworldVectorToPhaser2D(this.worldSize, locationVector);

        const locationName = child.scene || child.scene_external;
        const imageKey = `${locationName}_image`;
        
        this[`${locationName}Location`] = new GenerateLocation({
            scene: this,
            type: 'image',
            draggable: ManageSession.gameEditMode,
            x: translatedVector.x,
            y: translatedVector.y,
            locationDestination: child.scene || null,
            externalUrl: child.externalUrl || null,
            locationImage: imageKey,
            enterButtonImage: 'enter_button',
            locationText: child.displayName,
            referenceName: `this.${locationName}Location`,
            fontColor: 0x8dcb0e,
            size: child.size || 200
        });
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
