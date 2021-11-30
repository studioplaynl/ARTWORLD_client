import i18next from "i18next";
import { locale } from "svelte-i18n";

import nl from "../../../langauge/nl/ui.json";
import en from "../../../langauge/en/ui.json";
import ru from "../../../langauge/ru/ui.json";
import ar from "../../../langauge/ar/ui.json";

i18next.init({
  lng: "nl",
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

export default class UI_Scene extends Phaser.Scene {
  currentLanguage;

  constructor() {
    super("UI_Scene");
    this.currentZoom = 1;
    this.location = "test";
  }

  preload() {}

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

    this.camUI = this.cameras.main
      .setSize(this.sys.game.canvas.width, this.sys.game.canvas.height)
      .setName("camMain");
    this.camUI.zoom = 1;
    this.zoomButtons(false);
    this.scale.on("resize", this.resize, this);
  } //create

  zoomButtons(update) {
    let width = this.sys.game.canvas.width;
    let height = this.sys.game.canvas.height;

    if (!update) {
      //text to show the location (for debugging) > will change to breadcrum UI for user
      this.locationText = this.add
        .text(width / 3.5, height / 40, this.location, {
          fontFamily: "Arial",
          fontSize: "22px",
        })
        .setOrigin(0)
        //.setScrollFactor(0) //fixed on screen
        .setShadow(1, 1, "#000000", 0)
        .setDepth(1000);

      //zoom buttons
      this.zoom = this.add
        .image(width / 10 + 40, height / 50, "ui_eye")
        .setOrigin(0)
        .setDepth(1000)
        .setScale(width / (width / this.camUI.zoom) / 8);

      this.zoomIn = this.add
        .image(width / 10 + 120, height / 40, "ui_magnifier_plus")
        .setOrigin(0)
        .setDepth(1000)
        .setScale(width / (width / this.camUI.zoom) / 6)
        .setInteractive({ useHandCursor: true });

      this.zoomOut = this.add
        .image(width / 10, height / 40, "ui_magnifier_minus")
        .setOrigin(0)
        .setDepth(1000)
        .setScale(width / (width / this.camUI.zoom) / 6)
        .setInteractive({ useHandCursor: true });

      this.zoomIn.on("pointerup", () => {
        this.currentZoom += 0.2;
        //console.log(this.currentZoom);
      });

      this.zoomOut.on("pointerup", () => {
        this.currentZoom -= 0.2;
        if ( this.currentZoom < 0.2 ) {
          this.currentZoom = 0.2
        }
        //console.log(this.currentZoom);
      });
    } else {
      this.zoomIn
        .setPosition(
          width / 10 / this.camUI.zoom,
          height / 10 / this.camUI.zoom + 50 / this.camUI.zoom
        )
        .setScale(width / (width / this.camUI.zoom));
      this.zoomOut
        .setPosition(
          width / 10 / this.camUI.zoom,
          height / 10 / this.camUI.zoom + 80 / this.camUI.zoom
        )
        .setScale(width / (width / this.camUI.zoom));
    }
  }
  resize() {
    //console.log("resizing")
    let width = this.sys.game.canvas.width;
    let height = this.sys.game.canvas.height - 60;

    //this.camUI.resize(width, height);
  }

  update(time, delta) {}
}
