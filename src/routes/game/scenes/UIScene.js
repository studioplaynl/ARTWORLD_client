import i18next from 'i18next';
import { locale } from 'svelte-i18n';
import nl from '../../../language/nl/ui.json';
import en from '../../../language/en/ui.json';
import ru from '../../../language/ru/ui.json';
import ar from '../../../language/ar/ui.json';
import { get } from 'svelte/store';
import ManageSession from '../ManageSession';
import DebugFuntions from '../class/DebugFuntions';
// import ServerCall from '../class/ServerCall';
import { dlog } from '../../../helpers/debugLog';
import { myHomeStore, HomeElements, homeElement_Selected, Liked } from '../../../storage';
import ServerCall from '../class/ServerCall';
import { Profile, HomeEditBarExpanded } from '../../../session';
import { MINIMAP_MARGIN, MINIMAP_SIZE } from '../../../constants';

import { PlayerZoom, PlayerLocation, PlayerPos } from '../playerState';
import CoordinatesTranslator from '../class/CoordinatesTranslator';

import * as Phaser from 'phaser';

i18next.init({
  lng: 'nl',
  resources: {
    en: {
      translation: en,
    },
    nl: {
      translation: nl,
    },
    ru: {
      translation: ru,
    },
    ar: {
      translation: ar,
    },
  },
});

let latestValue = null;

export default class UIScene extends Phaser.Scene {
  // currentLanguage;

  constructor() {
    super('UIScene');
    this.currentZoom = 1;

    // Debug Text mobile
    this.debugText = '';
    this.debugTextField = {};
    this.gameEditModeSignGraphic = {};
    this.worldSize = new Phaser.Math.Vector2(0, 0);
  }

  async create() {
    const scene = ManageSession.currentScene;

    let countDisplay = 0;
    locale.subscribe((value) => {
      if (countDisplay === 0) {
        countDisplay++;
        return;
      }
      if (countDisplay > 0) {
        i18next.changeLanguage(value);
      }
      if (latestValue !== value) {
        scene.restart();
      }
      latestValue = value;
    });

    // ......... INPUT .....................................................................................
    // keyboard events caught for debug functions, edit mode
    this.input.keyboard.createCursorKeys();
    // .......... end INPUT ................................................................................

    // ......... DEBUG FUNCTIONS ...........................................................................
    this.events.on('gameEditMode', this.gameEditModeSign, this); // show edit mode indicator
    this.events.on('gameEditMode', this.editElementsScene, this); // make elements editable

    this.game.events.on('homeElements_reload', this.reloadHomeElements, this);

    // const eventNames = scene.load.eventNames();
    // dlog('eventNames', eventNames);
    // const isReady = scene.load.isReady();
    // dlog('loader isReady', isReady);
    // const isLoading = scene.load.isLoading();
    // dlog('loader isLoading', isLoading);

    // keyboard events caught for debug functions, edit mode
    DebugFuntions.keyboard(this);
    // ......... end DEBUG FUNCTIONS .......................................................................

    this.camUI = this.cameras.main.setSize(this.sys.game.canvas.width, this.sys.game.canvas.height).setName('UICam');
    // zoom has to be 1 for the UI to be correct (miniMap, etc)
    this.camUI.zoom = 1;

    //subscribe to zoom changes and pass it on the the current scene
    PlayerZoom.subscribe((zoom) => {
      if (!zoom) return;
      if (zoom === undefined) return;

      if (!ManageSession.currentScene) return;
      if (ManageSession.currentScene.gameCam === undefined) return;

      ManageSession.currentZoom = zoom;
      if (ManageSession.currentScene) {
        ManageSession.currentScene.gameCam.zoom = zoom;
        this.updateMinimapFrame();
      }
    });

    // to see the home location of the current user
    Profile.subscribe((value) => {
      if (!value) return;
      ManageSession.userHomeLocation = value.meta.Azc;
    });

    // Live update of the home image when we select an other homeImage in the UI
    myHomeStore.subscribe((value) => {
      if (!scene) return;
      if (ManageSession.userHomeLocation !== scene.scene.key) return;
      ServerCall.updateHomeImage(scene, value);
    });

    // Subscription and Event Emitter
    HomeEditBarExpanded.subscribe((value) => {
      if (!this.scene || value === undefined) return;
      
      this.game.events.emit('toggleHomeElement_Controls', value);
    });

    // reactivity on HomeElements, eg in DefaultUserHome
    // Store HomeElements in ManageSession for central access
    // ServerCall does a .get and then references ManageSession.homeElements
    HomeElements.subscribe((value) => {
      if (!ManageSession.currentScene) return;
      if (value === undefined) return;

      dlog('UIScene reactivity HomeElements', value);
      
      this.game.events.emit('homeElements_show');
    });

    // this is the selected homeElement in homeEdit svelte Menu
    // when an image is selected we highlight the container in the scene
    // and make the container draggable etc
    homeElement_Selected.subscribe((value) => {
      if (!ManageSession.currentScene) return;

      // we emit a phaser game event
      this.game.events.emit('homeElement_Selected', value);
    });

    // Central Phaser Liked subscription
    // stored in ManageSession.lkedStore for central access
    Liked.subscribe((value) => {
      ManageSession.likedStore = value;
    });
    Liked.get();

    PlayerLocation.subscribe((value) => {
      if (!value) return;
      if (!ManageSession.currentScene) return;

      console.log('PlayerLocation', value);
      console.log('create minimap PlayerLocation subscribe')
      this.createMinimap();
      // this.updatePlayerDotPosition();
      // this.updateMinimapFrame();

    });

    PlayerPos.subscribe(() => {
      this.updatePlayerDotPosition();
      this.updateMinimapFrame();
    });

    this.createMinimap();
    // to make the UI scene always on top of other scenes
    this.scene.bringToTop();
  } // create


  editElementsScene(arg) {
    const scene = ManageSession.currentScene;
    dlog('editElementsScene arg:', arg);

    switch (arg) {
      case 'on':
        // ManageSession.gameEditMode is already set in Debugkeys
        // we restart the scene with the new flag
        scene.scene.restart();
        break;

      case 'off':
        // ManageSession.gameEditMode is already set in Debugkeys
        // we restart the scene with the new flag
        scene.scene.restart();
        break;

      default:
        break;
    }
  }

  reloadHomeElements(){
    // const value = get(homeElements_Store);

   this.game.events.emit('homeElements_show');
  }

  createMinimap() {
    const checkAndCreateMinimap = () => {
      if (ManageSession.currentScene && ManageSession.currentScene.cameras && ManageSession.currentScene.scale) {
        console.log('Creating minimap');
        
        const removeOldMinimap = () => {
          return new Promise((resolve) => {
            const checkRemoval = () => {
              if (this.minimapCamera) {
                console.log('Attempting to remove old minimap camera');
                console.log('this.minimapCamera', this.minimapCamera);
                if (ManageSession.currentScene.cameras && ManageSession.currentScene.cameras.remove) {
                console.log('REMOVING old minimap camera');
                  ManageSession.currentScene.cameras.remove(this.minimapCamera, true);
                  this.minimapCamera = null;
                }
                // Check again after a short delay
                setTimeout(checkRemoval, 100);
              } else {
                console.log('Old minimap camera removed successfully');
                resolve();
              }
            };
            checkRemoval();
          });
        };
  
        removeOldMinimap().then(() => {
          try {
            // Clean up other related objects
            if (this.minimap_ReferenceFrame) {
              this.minimap_ReferenceFrame.destroy();
              this.minimap_ReferenceFrame = null;
            }
            if (this.minimapFrame) {
              this.minimapFrame.destroy();
              this.minimapFrame = null;
            }
            if (this.playerDot) {
              this.playerDot.destroy();
              this.playerDot = null;
            }
          this.worldSize = ManageSession.currentScene.worldSize;

          const topRight = new Phaser.Math.Vector2(
            ManageSession.currentScene.scale.width - MINIMAP_SIZE - MINIMAP_MARGIN, 
            MINIMAP_MARGIN);
          // Create a new camera for the minimap
          if (this.minimapCamera) {
            console.log('Removing old minimap camera');
            if (ManageSession.currentScene.cameras && ManageSession.currentScene.cameras.remove) {
              ManageSession.currentScene.cameras.remove(this.minimapCamera);
              console.log('this.minimapCamera destroyed: ', this.minimapCamera);
            }
          }


          this.minimapCamera = ManageSession.currentScene.cameras.add(
            topRight.x, topRight.y, MINIMAP_SIZE, MINIMAP_SIZE).setName('minimap');

          const worldView = ManageSession.currentScene.cameras.main.worldView;
          console.log('worldView', worldView);
          console.log('this.minimapCamera', this.minimapCamera);
          // Calculate zoom to fit the entire world
          const zoomX = MINIMAP_SIZE / ManageSession.currentScene.worldSize.x;
          const zoomY = MINIMAP_SIZE / ManageSession.currentScene.worldSize.y;
          const zoom = Math.min(zoomX, zoomY);
          console.log('zoom', zoom);
          
          this.minimapCamera.setZoom(zoom);
          this.minimapCamera.setScroll(0, 0);
          this.minimapCamera.setBackgroundColor(0x00);
          this.minimapCamera.setBounds(0, 0,
            ManageSession.currentScene.worldSize.x, ManageSession.currentScene.worldSize.y);
        
          const windowSize = this.scene.scene.scale.displaySize;
          // Create a rectangle to represent the current view
          this.minimap_ReferenceFrame = this.add.rectangle(windowSize.width - (MINIMAP_SIZE / 2) - MINIMAP_MARGIN,
             + (MINIMAP_SIZE / 2) + MINIMAP_MARGIN, MINIMAP_SIZE, MINIMAP_SIZE, 0xff0000, 1)
             .setVisible(false);
          this.minimapFrame = this.add.rectangle(windowSize.width - (MINIMAP_SIZE / 2) - MINIMAP_MARGIN,
             + (MINIMAP_SIZE / 2) + MINIMAP_MARGIN, MINIMAP_SIZE, MINIMAP_SIZE, 0xff0000, 0);
          this.minimapFrame.setStrokeStyle(2, 0xff0000);
          this.minimapFrame.setScrollFactor(0);
          this.minimapFrame.setDepth(1001);

          // Create a small circle to represent the player
          this.playerDot = this.add.circle(MINIMAP_MARGIN, MINIMAP_MARGIN, 4, 0xff0000);
          this.playerDot.setScrollFactor(0);
          this.playerDot.setDepth(1002); // Ensure it's above the minimap frame

          // Create a tween for the pulsating effect
          this.tweens.add({
            targets: this.playerDot,
            scale: { from: 0.2, to: 1 },
            duration: 1000,
            yoyo: true,
            repeat: -1
          });
          // Update the player dot position initially
          this.updatePlayerDotPosition();
          
          // Update minimap frame
          this.updateMinimapFrame();

          // Add resize event listener
          this.scale.on('resize', this.positionMinimap, this);

          console.log('Minimap created successfully');
        } catch (error) {
          console.error('Error creating minimap:', error);
          // If there's an error, we'll try again after a delay
          this.minimapTimeout = setTimeout(checkAndCreateMinimap, 100);
        }

        // now we can also set the zoom of the child scene 
        ManageSession.currentScene.gameCam.zoom = get(PlayerZoom);
      });
      } else {
        dlog('Waiting for ManageSession.currentScene to be fully initialized...');
        // If currentScene or its properties are not available, try again after a delay
        this.minimapTimeout = setTimeout(checkAndCreateMinimap, 100);
      }
    };
  
    // Start the process
    checkAndCreateMinimap();
  }

  positionMinimap() {
    if (!this.minimapCamera || !this.minimap_ReferenceFrame || !this.minimapFrame) return;

    const topRight = new Phaser.Math.Vector2(
      this.scale.width - MINIMAP_SIZE - MINIMAP_MARGIN, 
      MINIMAP_MARGIN
    );

    // Update minimap camera position
    this.minimapCamera.setPosition(topRight.x, topRight.y);

    // Update reference frame position
    this.minimap_ReferenceFrame.setPosition(
      this.scale.width - (MINIMAP_SIZE / 2) - MINIMAP_MARGIN,
      (MINIMAP_SIZE / 2) + MINIMAP_MARGIN
    );

    // Update frame position
    this.minimapFrame.setPosition(
      this.scale.width - (MINIMAP_SIZE / 2) - MINIMAP_MARGIN,
      (MINIMAP_SIZE / 2) + MINIMAP_MARGIN
    );

    // Update player dot position
    this.updatePlayerDotPosition();
    this.updateMinimapFrame();
  }

  updatePlayerDotPosition() {
    if (!this.playerDot || !ManageSession.currentScene ) return;
  
    const playerPos = get(PlayerPos);
    const worldSize = ManageSession.currentScene.worldSize;
  
    // Scale the player's position to the minimap size
    const scaledX = (CoordinatesTranslator.artworldToPhaser2DX(worldSize.x, playerPos.x) / worldSize.x) * MINIMAP_SIZE;
    const scaledY = (CoordinatesTranslator.artworldToPhaser2DY(worldSize.y, playerPos.y)  / worldSize.y) * MINIMAP_SIZE;
  
    // Position the dot on the minimap
    this.playerDot.setPosition(
      (this.minimap_ReferenceFrame.x - MINIMAP_SIZE / 2) + scaledX,
      (this.minimap_ReferenceFrame.y - MINIMAP_SIZE / 2) + scaledY
    );
  }

  updateMinimapFrame() {
    if (!this.minimapFrame || !this.playerDot || !ManageSession.currentScene) return;
    
    const mainCamera = ManageSession.currentScene.cameras.main;
    const worldSize = ManageSession.currentScene.worldSize;
    const zoom = get(PlayerZoom);
  
    if (mainCamera) {
  
      // Calculate the visible area in the world coordinates
      const visibleWorldWidth = mainCamera.width / zoom;
      const visibleWorldHeight = mainCamera.height / zoom;
  
      // Calculate the size of the frame on the minimap
      const frameWidth = (visibleWorldWidth / worldSize.x) * MINIMAP_SIZE;
      const frameHeight = (visibleWorldHeight / worldSize.y) * MINIMAP_SIZE;
  
     
      // there I want to delete the this.minimapFrame and create a new one
      this.minimapFrame.destroy();
      this.minimapFrame = this.add.rectangle(this.playerDot.x, 
        this.playerDot.y, frameWidth, frameHeight, 0xff0000, 0);
      this.minimapFrame.setStrokeStyle(2, 0xff0000);
      this.minimapFrame.setScrollFactor(0);
      this.minimapFrame.setDepth(1001);

    }
  }

  gameEditModeSign(arg) {
    const { width } = this.sys.game.canvas;
    // let height = this.sys.game.canvas.height

    switch (arg) {
      case 'on':
        this.gameEditModeSignGraphic = this.add.graphics();
        this.gameEditModeSignGraphic.fillStyle(0xff0000, 1);
        //  32px radius on the corners
        this.gameEditModeSignGraphic.fillRoundedRect(width / 2, 20, 100, 40, 8);
        this.gameEditModeSignText = this.add.text(width / 2 + 50, 20 + 20, 'edit mode').setOrigin(0.5);
        break;

      case 'off':
        dlog('gameEditMode received', arg);
        this.gameEditModeSignGraphic.destroy();
        this.gameEditModeSignText.destroy();
        break;

      default:
        break;
    }
  } // end gameEditModeSign
}
