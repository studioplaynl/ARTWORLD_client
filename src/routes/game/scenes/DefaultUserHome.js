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
import { PlayerPos } from '../playerState';
import CoordinatesTranslator from '../class/CoordinatesTranslator';
import PlayerDefault from '../class/PlayerDefault';
import PlayerDefaultShadow from '../class/PlayerDefaultShadow';
import Player from '../class/Player';
import Background from '../class/Background';
import { HomeElements, homeElement_Selected } from '../../../storage';
import { homeIsOfSelf } from '../../../session';
import GalleryManager from '../class/GalleryManager';
import { SCENE_INFO, ART_ICON_SIZE, ART_PREVIEW_SIZE, ART_OFFSET_BETWEEN } from '../../../constants';
import { handlePlayerMovement } from '../helpers/InputHelper';
import ServerCall from '../class/ServerCall';
import { getSceneInfo } from '../helpers/UrlHelpers';
import { dlog } from '../../../helpers/debugLog';

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

    this.userHomeStopmotionServerList = {};
    this.userHomedrawing_ServerList = {};
    this.drawingGroup = null;
    this.stopmotionGroup = null;

    this.drawingHomeElementServerList = {};
    this.homeElementsDrawing_Group = null;

    // sizes for the artWorks
    this.artIconSize = ART_ICON_SIZE;
    this.artPreviewSize = ART_PREVIEW_SIZE;
    this.artMargin = ART_OFFSET_BETWEEN;

    this.location = '';

    // shadow
    this.playerShadowOffset = -8;

    this.unsubscribe_HomeElements = null;
  }

  init(data) {
    this.location = data.user_id;
  }

  async preload() {
    // set homeElement_Selected store to empty so there is nothing selected when we enter a home
    homeElement_Selected.set('');

    this.homeElements_Drawing_Group = this.add.group();
    this.homeElements_Stopmotion_Group = this.add.group();
    this.homeElements_Animal_Group = this.add.group();
    this.homeElements_Flower_Group = this.add.group();

    //! Check if this is home of player
    this.selfHome = await ServerCall.checkIfHomeSelf(this.location);
    /* set homeIsOfSelf to true if this is the home of the player
      this is used to determine if the player can edit the homeElements
      we reference it also in topbar to show icons of the avatar and the home
    */
    homeIsOfSelf.set(this.selfHome);

    this.drawingGalleryManager = new GalleryManager({
      scene: this,
      type: 'drawing',
      pageSize: 3,
      CurrentPage: 1,
      selfHome: this.selfHome,
      location: this.location,
    });

    this.stopmotionGalleryManager = new GalleryManager({
      scene: this,
      type: 'stopmotion',
      pageSize: 3,
      CurrentPage: 1,
      selfHome: this.selfHome,
      location: this.location,
    });

    await this.drawingGalleryManager.initializeGalleries();
    await this.stopmotionGalleryManager.initializeGalleries();

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
    // Listen for the shutdown event, this works!
    this.events.on('shutdown', this.onShutdown, this);

    // get homeElements from server and subscribe to the store
    await HomeElements.getFromServer(this.location);

    this.unsubscribe_HomeElements = HomeElements.subscribe((value) => {
      if (value === undefined) return;

      // dlog('UIScene reactivity HomeElements', value);
      this.loadAndPlaceHomeElements();
    });

    // show physics debug boundaries in gameEditMode
    if (ManageSession.gameEditMode) {
      this.physics.world.drawDebug = true;
    } else {
      this.physics.world.drawDebug = false;
      this.physics.world.debugGraphic.clear();
    }

    /** get scene size from SCENE_INFO constants
     * copy worldSize over to ManageSession, so that positionTranslation can be done there  */
    const sceneInfo = getSceneInfo(SCENE_INFO, this.scene.key);

    this.worldSize.x = sceneInfo.sizeX;
    this.worldSize.y = sceneInfo.sizeY;
    ManageSession.worldSize = this.worldSize;
    // ------------------------------- //

    Background.diamondAlternatedDots(this);

    handlePlayerMovement(this);

    const { artworldToPhaser2DX, artworldToPhaser2DY } = CoordinatesTranslator;

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

    // UI scene is subscribed to zoom changes and passes it on to the current scene via ManageSession.currentZoom
    this.gameCam.zoom = ManageSession.currentZoom;

    this.gameCam.startFollow(this.player);
    this.physics.world.setBounds(0, 0, this.worldSize.x, this.worldSize.y);
    // ......... end PLAYER VS WORLD .......................................................................

    Player.loadPlayerAvatar(this);

    this.loadAndPlaceHomeElements();
  } // end create

  async loadAndPlaceHomeElements() {
    const store = HomeElements.showContent();
    //if there are no homeElements ServerCall will take care of that
    ServerCall.downloadAndPlaceHomeElements(store);
  }

  update() {
    // ........... PLAYER SHADOW .............................................................................
    // the shadow follows the player with an offset
    this.playerShadow.x = this.player.x + this.playerShadowOffset;
    this.playerShadow.y = this.player.y + this.playerShadowOffset;
    // ........... end PLAYER SHADOW .........................................................................
  } // update

  onShutdown() {
    // this is called when the scene is shut down, works!

    // Unsubscribe from all events

    // Unsubscribe when the scene is shut down
    this.drawingGalleryManager.unsubscribe();
    this.stopmotionGalleryManager.unsubscribe();

    if (this.unsubscribe_HomeElements) {
      this.unsubscribe_HomeElements();
      this.unsubscribe_HomeElements = null;
    }

    // Remove the event listener
    this.events.off('shutdown', this.onShutdown, this);
  }
} // class
