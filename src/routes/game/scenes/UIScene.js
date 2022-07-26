import i18next from 'i18next';
import { locale } from 'svelte-i18n';
import { element } from 'svelte/internal';
import ManageSession from '../ManageSession';

import nl from '../../../langauge/nl/ui.json';
import en from '../../../langauge/en/ui.json';
import ru from '../../../langauge/ru/ui.json';
import ar from '../../../langauge/ar/ui.json';
import HistoryTracker from '../class/HistoryTracker';
import DebugFuntions from '../class/DebugFuntions';
import CoordinatesTranslator from '../class/CoordinatesTranslator';
import ServerCall from '../class/ServerCall';

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
    this.currentZoom;
    this.location = 'test';

    // Debug Text mobile
    this.debugText = '';
    this.debugTextField;
  }

  preload() { }

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

    // dragging events caught for when in editMode

    // .......... end INPUT ................................................................................

    // ......... DEBUG FUNCTIONS ...........................................................................
    this.events.on('gameEditMode', this.gameEditModeSign, this); // show edit mode indicator
    this.events.on('gameEditMode', this.editElementsScene, this); // make elements editable

    // keyboard events caught for debug functions, edit mode
    DebugFuntions.keyboard(this);
    // ......... end DEBUG FUNCTIONS .......................................................................

    //  let displayText = `${this.sys.game.canvas.width} ${this.sys.game.canvas.height} ${window.devicePixelRatio}`
    //  this.add.text((this.sys.game.canvas.width / 2 ) - 100, this.sys.game.canvas.height / 2, displayText, { fontSize: 16,
    //   backgroundColor: '#000000',
    //   color: '#fff' })

    this.camUI = this.cameras.main
      .setSize(this.sys.game.canvas.width, this.sys.game.canvas.height)
      .setName('camMain');
    this.camUI.zoom = 1;

    this.scale.on('resize', this.resize, this);

    // to make the UI scene always on top of other scenes
    this.scene.bringToTop();
  } // create

  resize() {
    // console.log("resizing")
    const { width } = this.sys.game.canvas;
    const { height } = this.sys.game.canvas;

    // this.camUI.resize(width, height);
  }

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
    }
  }

  gameEditModeSign(arg) {
    const { width } = this.sys.game.canvas;
    // let height = this.sys.game.canvas.height
    this.gameEditModeSignGraphic;

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

  update(time, delta) {

  }
}
