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
import { HomeElements, homeElements_Store } from '../../../storage';

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

    this.homeElements_show_listener = this.game.events
    .on('drawing_homeGallery_show', this.loadAndPlaceGalleries, this);

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
    const sceneInfo = getSceneInfo(SCENE_INFO, this.scene.key);

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
    // this.userHomeStopmotionServerList = [];
    serverObjectsHandler = this.userHomeStopmotionServerList;
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
    this.loadAndPlaceGalleries();

    // check if there are no homeElements
    if (value.length === 0) {
      dlog('loadAndPlaceHomeElements no homeElements: ', value);
      return;
    }
    
    ServerCall.downloadAndPlaceHomeElements({
      value
    });
  }

  async loadAndPlaceGalleries(){
    let type = 'downloadDrawingDefaultUserHome';
    let serverObjectsHandler = this.userHomeDrawingServerList;
    const userId = this.location;
    const artSize = this.artDisplaySize;
    const artMargin = artSize / 10;
    this.artMargin = artMargin;
    this.homeDrawingGroup = this.add.group();

    // initial values for the homeGallery
    this.homeGallery_drawing_CurrentPage = 1;
    this.homeGallery_drawing_PageSize = 3;
    this.homeGallery_drawing_TotalPages = 1;
    this.homeGallery_drawing_ArtOnCurrentPage = {};

    const totalWidth = this.homeGallery_drawing_PageSize * (artSize + artMargin);
    this.parentContainer_homeDrawingGroup = this.add.container(artMargin/2, artMargin/2)
    .setSize(totalWidth+(artMargin*2), artSize+(artMargin*4))
    .setName('ParentContainer');

    // create background graphics for ParentContainer
    const graphic = this.add.graphics();
    graphic.fillStyle(0xa9a9a9); //dark grey
    graphic.fillRect(0, 0, totalWidth+(artMargin), artSize+(artMargin*5)); 
    this.parentContainer_homeDrawingGroup.add(graphic);
    
    const graphic2 = this.add.graphics();
    graphic2.fillStyle(0xf2f2f2); 
    graphic2.fillRect(0, 0, totalWidth+(artMargin), artSize+(artMargin*3)); 
    this.parentContainer_homeDrawingGroup.add(graphic2);

    // add button to ParentContainer
    const backButton = this.add.image(totalWidth/2, artSize + (artMargin*3) + 50, 'back_button').setDepth(500);
    backButton.displayWidth = 60;
    backButton.displayHeight = 60;
    // make button interactive
    backButton.setInteractive();
    // add event listener to button
    backButton.on('pointerup', () => {
      const currentPage = this.homeGallery_drawing_CurrentPage;
      const totalPages = this.homeGallery_drawing_TotalPages;
      
      if (currentPage > 1 && currentPage <= totalPages) {
        this.homeGallery_drawing_CurrentPage -= 1;

        const children = this.parentContainer_homeDrawingGroup.getAll('type', 'Container');
        console.log('back button clicked');
        
        // Filter for containers and remove them
        children.forEach(child => {
          console.log('child: ', child);
          this.parentContainer_homeDrawingGroup.remove(child);
          child.destroy(); // This will also destroy all of the container's children
      });

        this.loadAndPlaceGalleries_Again();
      }
    });
    this.parentContainer_homeDrawingGroup.add(backButton);

    const nextButton = this.add.image(totalWidth/2 + (artMargin*2) , artSize + (artMargin*3) + 50, 'back_button')
    .setDepth(500);
    //rotate button 180 degrees
    nextButton.rotation = 3.14159;
    nextButton.displayWidth = 60;
    nextButton.displayHeight = 60;
    // make button interactive
    nextButton.setInteractive();
    // add event listener to button
    nextButton.on('pointerup', () => {
      console.log('nextButton button clicked');
      // get current page
      // get total pages
      const currentPage = this.homeGallery_drawing_CurrentPage;
      const totalPages = this.homeGallery_drawing_TotalPages;

      if (currentPage < totalPages) {
        this.homeGallery_drawing_CurrentPage += 1;
        // delete all containers in parent container
        // Get all children of the parentContainer
        const children = this.parentContainer_homeDrawingGroup.getAll('type', 'Container');

        // Filter for containers and remove them
        children.forEach(child => {
          console.log('child: ', child);
          this.parentContainer_homeDrawingGroup.remove(child);
          child.destroy(); // This will also destroy all of the container's children
      });

        this.loadAndPlaceGalleries_Again();
      }

    });
    this.parentContainer_homeDrawingGroup.add(nextButton);

    this.homeDrawingGroup.add(this.parentContainer_homeDrawingGroup);

    ServerCall.downloadAndPlaceArtByType({
      type,
      userId,
      serverObjectsHandler,
      artSize,
      artMargin,
    });
    
    // ---------------------------------- STOPMOTION GALLERY ------------------------------- //
    type = 'downloadStopmotionDefaultUserHome';
    serverObjectsHandler = this.userHomeStopmotionServerList;
    
    // initial values for the homeGallery
    this.homeGallery_stopmotion_CurrentPage = 1;
    this.homeGallery_stopmotion_PageSize = 3;
    this.homeGallery_stopmotion_TotalPages = 1;
    this.homeGallery_stopmotion_ArtOnCurrentPage = {};
    this.homeStopmotionGroup = this.add.group();


    const totalWidth_stopmotion = this.homeGallery_stopmotion_PageSize * (artSize + artMargin);
    this.parentContainer_homeStopmotionGroup = this.add.container(artMargin/2, artMargin/2)
    .setSize(totalWidth_stopmotion+(artMargin*2), artSize+(artMargin*4))
    .setName('ParentContainer');

    // create background graphics for ParentContainer
    const graphic_stopmotion = this.add.graphics();
    graphic_stopmotion.fillStyle(0xa9a9a9); //dark grey
    graphic_stopmotion.fillRect(0, 0, totalWidth_stopmotion+(artMargin), artSize+(artMargin*5)); 
    this.parentContainer_homeStopmotionGroup.add(graphic_stopmotion);
    
    const graphic2_stopmotion = this.add.graphics();
    graphic2_stopmotion.fillStyle(0xf2f2f2); 
    graphic2_stopmotion.fillRect(0, 0, totalWidth_stopmotion+(artMargin), artSize+(artMargin*3)); 
    this.parentContainer_homeStopmotionGroup.add(graphic2_stopmotion);

    // add button to ParentContainer
    const backButton_stopmotion = this.add.image(totalWidth/2, 
      artSize + (artMargin*3) + 50, 'back_button').setDepth(500);
    backButton_stopmotion.displayWidth = 60;
    backButton_stopmotion.displayHeight = 60;
    // make button interactive
    backButton_stopmotion.setInteractive();
    // add eve-nt listener to button
    backButton_stopmotion.on('pointerup', () => {
      const currentPage = this.homeGallery_stopmotion_CurrentPage;
      const totalPages = this.homeGallery_stopmotion_TotalPages;
      
      if (currentPage > 1 && currentPage <= totalPages) {
        this.homeGallery_stopmotion_CurrentPage -= 1;

        const children = this.parentContainer_homeStopmotionGroup.getAll('type', 'Container');
        console.log('back button stopmotion clicked');
        
        // Filter for containers and remove them
        children.forEach(child => {
          console.log('child: ', child);
          this.parentContainer_homeStopmotionGroup.remove(child);
          child.destroy(); // This will also destroy all of the container's children
      });

        this.loadAndPlaceGalleries_Again();
      }
    });
    this.parentContainer_homeStopmotionGroup.add(backButton_stopmotion);

    const nextButton_stopmotion = this.add.image(totalWidth/2 + (artMargin*2),
      artSize + (artMargin*3) + 50, 'back_button')
    .setDepth(500);
    //rotate button 180 degrees
    nextButton_stopmotion.rotation = 3.14159;
    nextButton_stopmotion.displayWidth = 60;
    nextButton_stopmotion.displayHeight = 60;
    // make button interactive
    nextButton_stopmotion.setInteractive();
    // add event listener to button
    nextButton_stopmotion.on('pointerup', () => {
      console.log('nextButton button clicked');
      // get current page
      // get total pages
      const currentPage = this.homeGallery_stopmotion_CurrentPage;
      const totalPages = this.homeGallery_stopmotion_TotalPages;

      if (currentPage < totalPages) {
        this.homeGallery_stopmotion_CurrentPage += 1;
        // delete all containers in parent container
        // Get all children of the parentContainer
        const children = this.parentContainer_homeStopmotionGroup.getAll('type', 'Container');

        // Filter for containers and remove them
        children.forEach(child => {
          console.log('child: ', child);
          this.parentContainer_homeStopmotionGroup.remove(child);
          child.destroy(); // This will also destroy all of the container's children
      });

        this.loadAndPlaceGalleries_Again();
      }

    });
    this.parentContainer_homeStopmotionGroup.add(nextButton_stopmotion);

    this.parentContainer_homeStopmotionGroup.setPosition(artMargin, 1200);


    this.homeStopmotionGroup.add(this.parentContainer_homeStopmotionGroup);

    console.log('userHome: loadAndPlaceGalleries');
    ServerCall.downloadAndPlaceArtByType({
      type,
      userId,
      serverObjectsHandler,
      artSize,
      artMargin,
    });
    
  }

  async loadAndPlaceGalleries_Again(){
    let type = 'downloadDrawingDefaultUserHome';
    let serverObjectsHandler = this.userHomeDrawingServerList;
    const userId = this.location;
    const artSize = this.artDisplaySize;
    const artMargin = artSize / 10;
    this.artMargin = artMargin;

    // initial values are set in loadAndPlaceGalleries
    console.log('userHome: loadAndPlaceGalleries');
    ServerCall.downloadAndPlaceArtByType({
      type,
      userId,
      serverObjectsHandler,
      artSize,
      artMargin,
    });

     type = 'downloadStopmotionDefaultUserHome';
     serverObjectsHandler = this.userHomeStopmotionServerList;

     // initial values are set in loadAndPlaceGalleries
    ServerCall.downloadAndPlaceArtByType({
      type,
      userId,
      serverObjectsHandler,
      artSize,
      artMargin,
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
