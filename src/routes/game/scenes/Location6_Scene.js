import Phaser from "phaser";
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

export default class Location6Scene extends Phaser.Scene {
  currentLanguage;
  mainText;

  constructor() {
    super("location6_Scene");
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

    this.mainText = this.add
      .text(200, 200, `${i18next.t("mainText")}`, {
        fontFamily: "Arial",
        fontSize: "22px",
      })
      .setShadow(1, 1, "#000000", 0);
  }

  update() {}
}
