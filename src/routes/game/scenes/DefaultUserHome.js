/**
 * @file DefaultUserHome
 * @author Maarten
 *
 *  What is this file for?
 *  ======================
 *  This is a scene that acts as a template for a players home
 *  The differentiator is the user ID, this is parced in init(data) and passed on by SceneSwitcher
 *
 *  In general it works like this:
 *  - We start a loading animation that ends when all art works have been loaded
 *      (phaser fires a this.scene.load.on('complete') when the loading queue finished)
 *  - We get the scene (house) size from the SCENE_INFO
 *  - We create:
 *      - a background
 *      - player movement handler
 *      - a player with a default avatar
 *      - game camera
 *      - player zoom level
 *      - physics bounds
 *      - load players personal Avatar
 *      - set a special position of the player
 *      - load and place artworks of the home owner
 */

import ManageSession from '../ManageSession';
import { get } from 'svelte/store';
import { Profile } from '../../../session';
import { PlayerPos } from '../playerState';
import CoordinatesTranslator from '../class/CoordinatesTranslator';
import PlayerDefault from '../class/PlayerDefault';
import PlayerDefaultShadow from '../class/PlayerDefaultShadow';
import Player from '../class/Player';
import Background from '../class/Background';
import { HomeElements, homeElements_Store } from '../../../storage';

import {
  SCENE_INFO,
  ART_ICON_SIZE,
  ART_PREVIEW_SIZE,
  ART_DISPLAY_SIZE_LARGE,
  ART_OFFSET_BETWEEN,
  IMAGE_BASE_SIZE,
} from '../../../constants';
import { handlePlayerMovement } from '../helpers/InputHelper';
import ServerCall from '../class/ServerCall';

import { dlog } from '../../../helpers/debugLog';

// import { listAllObjects } from '../../../helpers/nakamaHelpers';

import * as Phaser from 'phaser';

export default class DefaultUserHome extends Phaser.Scene {
  constructor() {
    super('DefaultUserHome');

    this.worldSize = new Phaser.Math.Vector2(6000, 2000);

    this.debug = false;

    this.phaser = this;

    this.avatarName = [];
    this.tempAvatarName = '';
    this.loadedAvatars = [];

    this.player = {};
    this.playerShadow = {};
    this.playerMovingKey = 'moving';
    this.playerStopKey = 'stop';
    this.playerAvatarKey = '';

    this.homes = [];
    this.homesRepreseneted = [];
    this.homesGenerate = false;

    this.userStopmotionServerList = {};
    this.userHomeDrawingServerList = {};
    this.drawingGroup = null;
    this.stopmotionGroup = null;

    this.drawingHomeElementServerList = {};
    this.homeElementsDrawing_Group = null;

    this.allUserArt = [];
    this.userArtServerList = [];
    this.userArtDisplayList = [];
    this.artUrl = [];

    // track for progress and completion of artworks
    this.progress = [];
    this.progressStopmotion = [];

    // sizes for the artWorks
    this.artIconSize = ART_ICON_SIZE;
    this.artPreviewSize = ART_PREVIEW_SIZE;
    this.artDisplaySize = ART_DISPLAY_SIZE_LARGE;
    this.artMargin = ART_OFFSET_BETWEEN;

    this.location = '';

    // shadow
    this.playerShadowOffset = -8;
  }

  init(data) {
    this.location = data.user_id;
  }

  async preload() {
    // this.loadAndPlaceArtworks();
    //! Check if this is home of player
    
    this.homeElements_Drawing_Group = this.add.group();
    this.homeElements_Stopmotion_Group = this.add.group();
    this.homeElements_Animal_Group = this.add.group();
    this.homeElements_Flower_Group = this.add.group();
    
    const selfHome = await ServerCall.checkIfHomeSelf(this.location);
    console.log('selfHome defaultUserHome: ', selfHome);

    // console.log('userHome: await ServerCall.getHomeElements(this.location)');
    // this has to be before the subscription to the event that fires when homeElements_Store changes
    // await ServerCall.getHomeElements(this.location);
    // console.log('FINISHED userHome: await ServerCall.getHomeElements(this.location)');
    
    //! working on imageGallery
    //! load all images
    // TODO store in a Drawings Store
    //! the list comes back ordered
    //! listAllObjects has pagination server-side, but this is not needed
    //! the pages can be loaded from local memory, when we come back on page 1
    //! we could call listAllObjects again to get a refresh
    
    // const allDrawings = await listAllObjects('drawing', this.location);
    // console.log('allDrawings: ', allDrawings);
    // the list comes back ordered
    
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
  } // end preload
  
  async create() {
    // subscribe to event to show homeElements when the store changes
    this.homeElements_show_listener = this.game.events.on('homeElements_show', this.loadAndPlaceHomeElements, this);

    await HomeElements.getFromServer(this.location);

    // show physics debug boundaries in gameEditMode
    if (ManageSession.gameEditMode) {
      this.physics.world.drawDebug = true;
    } else {
      this.physics.world.drawDebug = false;
      this.physics.world.debugGraphic.clear();
    }

    /** get scene size from SCENE_INFO constants
     * copy worldSize over to ManageSession, so that positionTranslation can be done there  */
    const sceneInfo = SCENE_INFO.find((obj) => obj.scene === this.scene.key);
    this.worldSize.x = sceneInfo.sizeX;
    this.worldSize.y = sceneInfo.sizeY;
    ManageSession.worldSize = this.worldSize;
    //!

    Background.diamondAlternatedDots(this);

    handlePlayerMovement(this);

    const { artworldToPhaser2DX, artworldToPhaser2DY } = CoordinatesTranslator;
    console.log('targetLocation HOME PlayerPos: ', get(PlayerPos));

    // .......  PLAYER ....................................................................................
    //* create default player and playerShadow
    //* create player in center with Default 0 ,0 artworldCoordinates
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
    // .......  end PLAYER ................................................................................

    // ....... PLAYER VS WORLD .............................................................................
    this.gameCam = this.cameras.main; // .setBackgroundColor(0xFFFFFF);

    // UI scene is subscribed to zoom changes and passes it on to the current scene via ManageSession.currentScene
    this.gameCam.zoom = ManageSession.currentZoom;

    this.gameCam.startFollow(this.player);
    this.physics.world.setBounds(0, 0, this.worldSize.x, this.worldSize.y);
    // ......... end PLAYER VS WORLD .......................................................................

    Player.loadPlayerAvatar(this);

    this.loadAndPlaceHomeElements();
  } // end create

  async loadAndPlaceArtworks() {
    let type = 'downloadDrawingDefaultUserHome';
    let serverObjectsHandler = this.userHomeDrawingServerList;
    const userId = this.location;
    const artSize = this.artDisplaySize;
    const artMargin = artSize / 10;
    this.artMargin = artMargin;
    this.homeDrawingGroup = this.add.group();

    ServerCall.downloadAndPlaceArtByType({
      type,
      userId,
      serverObjectsHandler,
      artSize,
      artMargin,
    });

    type = 'downloadStopmotionDefaultUserHome';
    // this.userStopmotionServerList = [];
    serverObjectsHandler = this.userStopmotionServerList;
    this.homeStopmotionGroup = this.add.group();
    ServerCall.downloadAndPlaceArtByType({
      type,
      userId,
      serverObjectsHandler,
      artSize,
      artMargin,
    });
  }

  async loadAndPlaceHomeElements(){
    console.log('userHome: loadAndPlaceHomeElements');
    
    const value = get(homeElements_Store);
    
    console.log('userHome: homeElements_Store: ', value);

    // check if there are no homeElements
    if (value.length === 0) {
      dlog('loadAndPlaceHomeElements no homeElements: ', value);
      return;
    }

    const prevStore = value;
    ServerCall.downloadAndPlaceHomeElements({
      value
    });
  }

  update() {
    // ........... PLAYER SHADOW .............................................................................
    // the shadow follows the player with an offset
    this.playerShadow.x = this.player.x + this.playerShadowOffset;
    this.playerShadow.y = this.player.y + this.playerShadowOffset;
    // ........... end PLAYER SHADOW .........................................................................
  } // update

  shutdown() {
    if (this.homeElements_show_listener) this.homeElements_show_listener.remove();
    if (this.homeElement_Selected) this.homeElement_Selected.remove();
    if (this.toggleHomeElement_Controls) this.toggleHomeElement_Controls.remove();
  }
} // class
