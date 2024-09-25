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
import { 
  HomeElements, 
  homeElements_Store, 
  homeElement_Selected, 
 } from '../../../storage';
import { homeIsOfSelf } from '../../../session';
import GalleryManager from '../class/GalleryManager';

import {
  updateObject,
} from '../../../helpers/nakamaHelpers';

import {
  SCENE_INFO,
  ART_ICON_SIZE,
  ART_PREVIEW_SIZE,
  ART_DISPLAY_SIZE_LARGE,
  ART_OFFSET_BETWEEN,
} from '../../../constants';
import { handlePlayerMovement } from '../helpers/InputHelper';
import ServerCall from '../class/ServerCall';
import { getSceneInfo } from '../helpers/UrlHelpers';

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

    this.userHomeStopmotionServerList = {};
    this.userHomedrawing_ServerList = {};
    this.drawingGroup = null;
    this.stopmotionGroup = null;

    this.drawingHomeElementServerList = {};
    this.homeElementsDrawing_Group = null;

    this.allUserArt = [];
    this.userArtServerList = [];
    this.userArtDisplayList = [];
    this.artUrl = [];

    // sizes for the artWorks
    this.artIconSize = ART_ICON_SIZE;
    this.artPreviewSize = ART_PREVIEW_SIZE;
    this.artMargin = ART_OFFSET_BETWEEN;

    this.location = '';

    // shadow
    this.playerShadowOffset = -8;

    this.unsubscribe_HomeElements = null;

    this.unsubscribe_drawing_GalleryStore = null;
    this.drawing_Store = null;
    // ServerCall add some data to the drawing_ServerList (success of download).
    // The images we want to load we put in .array of drawing_ServerList
    this.drawing_ServerList = {};
    this.previousDrawingStore = null;
    this.homeGallery_drawing_PageSize = 3;
    this.homeGallery_drawing_CurrentPage = 1; 
    this.homeGallery_drawing_TotalPages = 1; 

    this.stopmotion_Store = null;
    // ServerCall add some data to the drawing_ServerList (success of download).
    // The images we want to load we put in .array of drawing_ServerList
    this.stopmotion_ServerList = {};
    this.previousStopmotionStore = null;
    this.homeGallery_stopmotion_PageSize = 3;
    this.homeGallery_stopmotion_CurrentPage = 1;
    this.homeGallery_stopmotion_TotalPages = 1;
    this.unsubscribe_stopmotion_GalleryStore = null;
    this.previousStopMotionStore = null;
  }

  init(data) {
    this.location = data.user_id;
  }

  async preload() {
    // set homeElement_Selected store to empty so there is nothing selected when we enter a home
    homeElement_Selected.set("");

    this.homeElements_Drawing_Group = this.add.group();
    this.homeElements_Stopmotion_Group = this.add.group();
    this.homeElements_Animal_Group = this.add.group();
    this.homeElements_Flower_Group = this.add.group();
    
    //! Check if this is home of player
    this.selfHome = await ServerCall.checkIfHomeSelf(this.location);
    console.log('selfHome defaultUserHome: ', this.selfHome);
    /* set homeIsOfSelf to true if this is the home of the player
      this is used to determine if the player can edit the homeElements
      we reference it also in topbar to show icons of the avatar and the home
    */
    homeIsOfSelf.set(this.selfHome);

    // //for some reason this has to happen in preload, in create this.selfHome is undefined
    // if (this.selfHome) {
    //   // for the drawing gallery 
    //   this.initialize_Gallery_Store(My_drawing_GalleryStore, 'drawing');
    //   // for the stopmotion gallery
    //   this.initialize_Gallery_Store(My_stopmotion_GalleryStore, 'stopmotion'); 
    // } else {
    //   this.initialize_Gallery_Store(Other_drawing_GalleryStore, 'drawing');
    //   this.initialize_Gallery_Store(Other_stopmotion_GalleryStore, 'stopmotion');
    // }
    this.drawingGalleryManager = new GalleryManager({
      scene: this,
      type: 'drawing',
      pageSize: 3,
      CurrentPage: 1, 
      selfHome: this.selfHome,
      location: this.location
    });

    this.stopmotionGalleryManager = new GalleryManager({
      scene: this,
      type: 'stopmotion',
      pageSize: 3,
      CurrentPage: 1, 
      selfHome: this.selfHome,
      location: this.location
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

    // get homeElements from server
    await HomeElements.getFromServer(this.location);

    this.unsubscribe_HomeElements = HomeElements.subscribe((value) => {
      if (value === undefined) return;

      dlog('UIScene reactivity HomeElements', value);
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

    // UI scene is subscribed to zoom changes and passes it on to the current scene via ManageSession.currentZoom
    this.gameCam.zoom = ManageSession.currentZoom;

    this.gameCam.startFollow(this.player);
    this.physics.world.setBounds(0, 0, this.worldSize.x, this.worldSize.y);
    // ......... end PLAYER VS WORLD .......................................................................

    Player.loadPlayerAvatar(this);

    this.loadAndPlaceHomeElements();
  } // end create

  async loadAndPlaceHomeElements(){
    const value = get(homeElements_Store);
    
    // check if there are no homeElements
    if (value.length === 0) {
      dlog('loadAndPlaceHomeElements no homeElements: ', value);
      return;
    }
    
    ServerCall.downloadAndPlaceHomeElements({
      value
    });
  }

  async update_Gallery_Store(store, type) {
    // 3. set the right pageSize on the store
    store.setHomeGalleryPageSize(this[`homeGallery_${type}_PageSize`]);
  
    // 4. set the current page of the gallery, on the store
    store.setHomeGalleryCurrentPage(this[`homeGallery_${type}_CurrentPage`]);
  
    // 5. get the total pages of the gallery, from the store
    this[`homeGallery_${type}_TotalPages`] = get(store.homeGalleryTotalPages);
  
    // Get the images we want to display
    // The .array is the page we want to load
    // ServerCall add some data to the *_ServerList (success of download).
    this[`${type}_ServerList`].array = get(store.homeGalleryPaginatedArt);
  }

  async initialize_Gallery_Store(store, type) {
    // 1. set the right Store
    this[`${type}_Store`] = store;
  
    // 2. load the artworks from the server on the store
    await store.loadArtworks(this.location);
  
    this.update_Gallery_Store(store, type);
  
    // Subscribe to the gallery store
    this[`unsubscribe_${type}_GalleryStore`] = this[`${type}_Store`].subscribe((value) => {
      // Check if the value has actually changed
      if (!this[`previous${type.charAt(0).toUpperCase() + type.slice(1)}Store`] || 
          JSON.stringify(this[`previous${type.charAt(0)
            .toUpperCase() + type.slice(1)}Store`]) !== JSON.stringify(value)) {
        this[`previous${type.charAt(0).toUpperCase() + type.slice(1)}Store`] = JSON.parse(JSON.stringify(value));
  
        this.update_Gallery_Store(store, type);
  
        this.downloadAndCreate_Gallery(type);
      } 
    });
  }

  async downloadAndCreate_Gallery(type) {
    const serverObjectsHandler = this[`${type}_ServerList`];
    serverObjectsHandler.array = get(this[`${type}_Store`].homeGalleryPaginatedArt);
    const userId = this.location;
    const artSize = ART_DISPLAY_SIZE_LARGE;
    const artMargin = artSize / 10;
  
    // Destroy existing members of the group if any
    if (this[`home${type.charAt(0).toUpperCase() + type.slice(1)}Group`]) {
      this[`home${type.charAt(0).toUpperCase() + type.slice(1)}Group`].clear(true, true);
    }
    this[`home${type.charAt(0).toUpperCase() + type.slice(1)}Group`] = this.add.group();
  
    const totalWidth = this[`homeGallery_${type}_PageSize`] * (artSize + artMargin);
  
    // Destroy existing children of the parent container if any
    if (this[`parentContainer_home${type.charAt(0).toUpperCase() + type.slice(1)}Group`]) {
      const children = this[`parentContainer_home${type.charAt(0).toUpperCase() + type.slice(1)}Group`].getAll();
      children.forEach(child => {
        this[`parentContainer_home${type.charAt(0).toUpperCase() + type.slice(1)}Group`].remove(child);
        child.destroy();
      });
    }
  
    // if the array is empty, don't create the gallery
    if (serverObjectsHandler.array.length === 0) {
      console.log(`userHome: loadAndPlace_${type}_Gallery: no artworks to display`);
      return;
    }
  
    // Check if there's a gallery object in the homeElements store
    const homeElements = get(homeElements_Store);
    let galleryElement = homeElements.find(element => element.value.collection === `gallery_${type}`);
  
    if (!galleryElement && this.selfHome) {
      // Create a new gallery homeElement
      const value = {
        collection: `gallery_${type}`,
        pageSize: this[`homeGallery_${type}_PageSize`],
        posX: 100,
        posY: type === 'drawing' ? 100 : 1200, // Adjust Y position based on type
        rotation: 0,
        scale: 1,
      }
  
      const key = `gallery_${type}_1`;
      await HomeElements.create(key, value);
      console.log(`userHome: loadAndPlace_${type}_Gallery: created new gallery_${type} element: `, value);
      // Refresh the homeElements after creating the new element
      galleryElement = get(homeElements_Store).find(element => element.value.collection === `gallery_${type}`);
    }
  
    // Use the position from the Gallery element if it exists, otherwise use default values
    const galleryX = galleryElement && galleryElement.value.posX !== undefined 
      ? galleryElement.value.posX 
      : artMargin/2;
    const galleryY = galleryElement && galleryElement.value.posY !== undefined 
      ? galleryElement.value.posY 
      : (type === 'drawing' ? artMargin/2 : 1200);
  
    this[`parentContainer_home${type.charAt(0)
      .toUpperCase() + type.slice(1)}Group`] = this.add.container(galleryX, galleryY)
      .setSize(totalWidth+(artMargin*2), artSize+(artMargin*4))
      .setName('ParentContainer');
  
    // create background graphics for ParentContainer
    const graphic = this.add.graphics();
    graphic.fillStyle(0xa9a9a9); //dark grey
    graphic.fillRect(0, 0, totalWidth+(artMargin), artSize+(artMargin*5)); 
    this[`parentContainer_home${type.charAt(0).toUpperCase() + type.slice(1)}Group`].add(graphic);
    
    const graphic2 = this.add.graphics();
    graphic2.fillStyle(0xf2f2f2); 
    graphic2.fillRect(0, 0, totalWidth+(artMargin), artSize+(artMargin*3)); 
    this[`parentContainer_home${type.charAt(0).toUpperCase() + type.slice(1)}Group`].add(graphic2);
  
    // Add page information text
    const pageInfoText = this.add.text(totalWidth/2 + 40, artSize + (artMargin*3) + 50, '', {
      font: '24px Arial',
      fill: '#000000'
    }).setOrigin(0.5);
    this[`parentContainer_home${type.charAt(0).toUpperCase() + type.slice(1)}Group`].add(pageInfoText);
  
    // Update page info text
    const updatePageInfo = () => {
      pageInfoText.setText(`${this[`homeGallery_${type}_CurrentPage`]} / ${this[`homeGallery_${type}_TotalPages`]}`);
      if (backButton && nextButton) {
        backButton.setVisible(this[`homeGallery_${type}_CurrentPage`] > 1);
        nextButton.setVisible(this[`homeGallery_${type}_CurrentPage`] < this[`homeGallery_${type}_TotalPages`]);
      }
    };
  
    // Add move button
    const moveIcon = this.add.image(totalWidth - artMargin*3, artSize + 235, 'moveIcon')
      .setOrigin(1, 1)
      .setScale(1)
      .setInteractive({ draggable: true })
      .setTint(0xf2f2f2);
  
    // Set up drag functionality for the move button
    this.setupMoveIconDrag(moveIcon, type);
  
    this[`parentContainer_home${type.charAt(0).toUpperCase() + type.slice(1)}Group`].add(moveIcon);
  
    // add navigation buttons
    const backButton = this.createNavigationButton(totalWidth/2 - 80, 
      artSize + (artMargin*3) + 50, 'back_button', -1, type, updatePageInfo);
    const nextButton = this.createNavigationButton(totalWidth/2 + (artMargin*3.2), 
    artSize + (artMargin * 3) + 50, 'back_button', 1, type, updatePageInfo);
  
    this[`parentContainer_home${type.charAt(0).toUpperCase() + type.slice(1)}Group`].add(backButton);
    this[`parentContainer_home${type.charAt(0).toUpperCase() + type.slice(1)}Group`].add(nextButton);
  
    updatePageInfo();
  
    this[`home${type.charAt(0).toUpperCase() + type.slice(1)}Group`]
    .add(this[`parentContainer_home${type.charAt(0).toUpperCase() + type.slice(1)}Group`]);
  
    ServerCall.handleServerArray({
      type: `download${type.charAt(0).toUpperCase() + type.slice(1)}DefaultUserHome`,
      userId,
      serverObjectsHandler,
      artSize,
      artMargin,
    });
  }
  
  // Helper methods for the galleries
  setupMoveIconDrag(moveIcon, type) {
    moveIcon.on('pointerdown', () => ManageSession.playerIsAllowedToMove = false);
    moveIcon.on('pointerup', () => ManageSession.playerIsAllowedToMove = true);
  
    moveIcon.on('drag', (pointer) => {
      ManageSession.playerIsAllowedToMove = false;
      const deltaX = pointer.x - pointer.prevPosition.x;
      const deltaY = pointer.y - pointer.prevPosition.y;
      this[`parentContainer_home${type.charAt(0).toUpperCase() + type.slice(1)}Group`].x += deltaX;
      this[`parentContainer_home${type.charAt(0).toUpperCase() + type.slice(1)}Group`].y += deltaY;
    });
  
    moveIcon.on('dragend', () => {
      this.updateGalleryPosition(type);
    });
  }
  
  updateGalleryPosition(type) {
    const homeElements = get(homeElements_Store);
    const galleryElement = homeElements.find(element => element.value.collection === `gallery_${type}`);
  
    if (galleryElement) {
      homeElement_Selected.set(galleryElement);
      const x = this[`parentContainer_home${type.charAt(0).toUpperCase() + type.slice(1)}Group`].x;
      const y = this[`parentContainer_home${type.charAt(0).toUpperCase() + type.slice(1)}Group`].y;
      const { rotation, width, height, scale } = this[`parentContainer_home${type
        .charAt(0).toUpperCase() + type.slice(1)}Group`];
      
      const newValue = {
        ...galleryElement.value,
        posX: x,
        posY: y,
        height,
        width,
        rotation,
        scale
      };
  
      if (JSON.stringify(galleryElement.value) !== JSON.stringify(newValue)) {
        HomeElements.updateStoreSilently(galleryElement.key, newValue);
        updateObject(galleryElement.collection, galleryElement.key, newValue, galleryElement.permission_read);
      }
    }
  }
  
  createNavigationButton(x, y, texture, direction, type, updatePageInfo) {
    const button = this.add.image(x, y, texture)
      .setDepth(500)
      .setVisible(true)
      .setName(direction === -1 ? 'backButton' : 'nextButton');
  
    if (direction === 1) {
      button.rotation = Math.PI;
    }
  
    button.displayWidth = 80;
    button.displayHeight = 80;
    button.setInteractive();
  
    button.on('pointerup', () => {
      const currentPage = this[`homeGallery_${type}_CurrentPage`];
      const totalPages = this[`homeGallery_${type}_TotalPages`];
  
      if ((direction === -1 && currentPage > 1) || (direction === 1 && currentPage < totalPages)) {
        this[`homeGallery_${type}_CurrentPage`] += direction;
  
        const children = this[`parentContainer_home${type.charAt(0)
          .toUpperCase() + type.slice(1)}Group`].getAll('type', 'Container');
        children.forEach(child => {
          this[`parentContainer_home${type.charAt(0).toUpperCase() + type.slice(1)}Group`].remove(child);
          child.destroy();
        });
  
        updatePageInfo();
        this.update_Gallery_Store(this[`${type}_Store`], type);
        this.downloadAndCreate_Gallery(type);
      }
    });
  
    return button;
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
    console.log('subscribe GameScene shutting down');
  
    // Unsubscribe from all events

    // Unsubscribe when the scene is shut down
    // Define an array of all gallery types
    const galleryTypes = ['drawing', 'stopmotion'];

    // Unsubscribe from all gallery stores
    galleryTypes.forEach(type => {
      const unsubscribeKey = `unsubscribe_${type}_GalleryStore`;
      if (this[unsubscribeKey]) {
        this[unsubscribeKey]();
        this[unsubscribeKey] = null;
      }
    });

    if (this.unsubscribe_HomeElements) {
      this.unsubscribe_HomeElements();
      this.unsubscribe_HomeElements = null;
    }

    // Remove the event listener
    this.events.off('shutdown', this.onShutdown, this);
}
} // class
