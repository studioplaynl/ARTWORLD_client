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
import { myHomeStore, HomeElements, homeElements_Store, homeElement_Selected, Liked } from '../../../storage';
import ServerCall from '../class/ServerCall';
import { Profile, ShowHomeEditBar, HomeEditBarExpanded } from '../../../session';

// import { IMAGE_BASE_SIZE } from '../../../constants';

import { PlayerZoom } from '../playerState';

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

    this.camUI = this.cameras.main.setSize(this.sys.game.canvas.width, this.sys.game.canvas.height).setName('camMain');
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

    // //subscribe to event system
    // this.events.on('toggleHomeElement_Controls', (value) => {
    //   console.log('toggleHomeElement_Controls event received in UIScene with value:', value);
    // }, this);

    // //! see if ShowHomeEditBar is open
    // HomeEditBarExpanded.subscribe((value) => {
    //   console.log('ShowHomeEditBar subscribe', value);
    //   if (!scene) return;
    //   if (value === undefined) return;
    //   // const toggleHomeElementControlsEvent = new CustomEvent('toggleHomeElementControls', { detail: value });
    //   // window.dispatchEvent(toggleHomeElementControlsEvent);

    //   this.events.emit('toggleHomeElement_Controls', value);
    // });

    // Event Listener
    this.game.events.on('toggleHomeElement_Controls', (value) => {
      console.log('toggleHomeElement_Controls event received in UIScene with value:', value);
    }, this);

    // Subscription and Event Emitter
    HomeEditBarExpanded.subscribe((value) => {
      console.log('HomeEditBarExpanded changed:', value);
      if (!this.scene || value === undefined) return;
      
      console.log('Emitting toggleHomeElement_Controls event with value:', value);
      this.game.events.emit('toggleHomeElement_Controls', value);
    });


    // reactivity on MomeElements, eg in DefaultUserHome
    // Store HomeElements in ManageSession for central access
    // ServerCall does a .get and then references ManageSession.homeElements
    HomeElements.subscribe((value) => {
      if (!scene) return;
      if (value === undefined) return;

      dlog('UIScene reactivity HomeElements', value);
      dlog('UIScene reactivity value.length', value.length);

      // if there are no homeElements, load default imageGallery and stopmotionGallery in DefaultUserHome
      // if (value.length === 0) {
      //   this.game.events.emit('homeElements_show');
      //   return
      // }

      // dlog('UIScene emit homeElements_show');

      this.game.events.emit('homeElements_show');
      // check each value key if it already exists in homeElement_Group

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
    console.log('reload homeElements')
    // const value = get(homeElements_Store);

   this.game.events.emit('homeElements_show');
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
