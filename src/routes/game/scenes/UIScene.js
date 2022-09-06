import i18next from 'i18next';
import { locale } from 'svelte-i18n';
import { get } from 'svelte/store';
import nl from '../../../language/nl/ui.json';
import en from '../../../language/en/ui.json';
import ru from '../../../language/ru/ui.json';
import ar from '../../../language/ar/ui.json';

import ManageSession from '../ManageSession';
import DebugFuntions from '../class/DebugFuntions';
import {
  playerLocation,
} from '../playerState';

const { Phaser } = window;

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
  currentLanguage;

  constructor() {
    super('UIScene');
    this.currentZoom = 1;
    this.location = 'test';

    // Debug Text mobile
    this.debugText = '';
    this.debugTextField = {};
    this.gameEditModeSignGraphic = {};
    this.scene = null;
  }

  async create() {
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
        this.scene.restart();
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

    const scene = ManageSession.currentScene;
    console.log('scene', scene);
    scene.load.on('loaderror', (offendingFile) => {
      // this.resolveLoadError(offendingFile);
      console.log('offendingFile', offendingFile);
    });
    // keyboard events caught for debug functions, edit mode
    DebugFuntions.keyboard(this);
    // ......... end DEBUG FUNCTIONS .......................................................................

    this.camUI = this.cameras.main
      .setSize(this.sys.game.canvas.width, this.sys.game.canvas.height)
      .setName('camMain');
    this.camUI.zoom = 1;

    // to make the UI scene always on top of other scenes
    this.scene.bringToTop();
  } // create

  editElementsScene(arg) {
    const scene = ManageSession.currentScene;
    console.log('editElementsScene arg:', arg);

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
        console.log('gameEditMode received', arg);
        this.gameEditModeSignGraphic.destroy();
        this.gameEditModeSignText.destroy();
        break;

      default:

        break;
    }
  } // end gameEditModeSign

  update() {
    if (this.scene != ManageSession.currentScene) this.scene = ManageSession.currentScene;
  }
}