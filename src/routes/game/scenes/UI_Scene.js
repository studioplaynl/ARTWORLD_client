import i18next from "i18next"
import { locale } from "svelte-i18n"
import ManageSession from "../ManageSession"

import nl from "../../../langauge/nl/ui.json"
import en from "../../../langauge/en/ui.json"
import ru from "../../../langauge/ru/ui.json"
import ar from "../../../langauge/ar/ui.json"
import HistoryTracker from "../class/HistoryTracker"

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
})

let latestValue = null

export default class UI_Scene extends Phaser.Scene {
  currentLanguage;

  constructor() {
    super("UI_Scene")
    this.currentZoom = 1
    this.location = "test"

    //Debug Text mobile
    this.debugText = ''
    this.debugTextField
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
        i18next.changeLanguage(value)
      }
      if (latestValue !== value) {
        this.scene.restart()
      }
      latestValue = value
    })

   let displayText = `${this.sys.game.canvas.width} ${this.sys.game.canvas.height} ${window.devicePixelRatio}`
   this.add.text((this.sys.game.canvas.width / 2 ) - 100, this.sys.game.canvas.height / 2, displayText, { fontSize: 16, 
    backgroundColor: '#000000', 
    color: '#fff' })
  
    this.camUI = this.cameras.main
      .setSize(this.sys.game.canvas.width, this.sys.game.canvas.height)
      .setName("camMain")
    this.camUI.zoom = 1
    this.createNavigationButtons(false)
    this.scale.on("resize", this.resize, this)

    // to make the UI scene always on top of other scenes
    this.scene.bringToTop()

  } //create

  // zoom buttons and back button
  async createNavigationButtons(update) {
    let width = this.sys.game.canvas.width
    let height = this.sys.game.canvas.height

    if (!update) {
      //text to show the location (for debugging) > will change to breadcrum UI for user
      // this.locationText = this.add
      //   .text(width / 3.5, height / 40, this.location, {
      //     fontFamily: "Arial",
      //     fontSize: "22px",
      //   })
      //   .setOrigin(0)
      //   //.setScrollFactor(0) //fixed on screen
      //   .setShadow(1, 1, "#000000", 0)
      //   .setDepth(1000)

      // mobile debug text field
      this.debugTextField = this.add.text(50, 80, this.debugText, {
        fontFamily: "Arial",
        fontSize: "18px",
      }).setShadow(2, 2, '#000000', 0)

      // back button
      this.backButton = this.add.image(40, 40, "back_button")
        .setOrigin(0, 0.5)
        .setDepth(1000)
        .setInteractive({ useHandCursor: true })

      // back button background color white
      this.backButtonCircle = this.add.circle(40, 40, 15, 0xffffff).setOrigin(0, 0.5)

      // if the current scene is artworld, the back button is hidden 
      if (ManageSession.locationHistory.length <= 1) {
        this.backButton.destroy()
        this.backButtonCircle.destroy()
      }

      this.backButton.on("pointerup", () => {
        HistoryTracker.activateBackButton(this.scene)
      })

      //zoom buttons
      this.zoomOut = this.add
        .image(60 + 40, 40, "ui_magnifier_minus")
        .setOrigin(0, 0.5)
        .setDepth(1000)
        .setScale(width / (width / this.camUI.zoom) / 6)
        .setInteractive({ useHandCursor: true });

      this.zoom = this.add
        .image(60 + 100, 40, "ui_eye")
        .setOrigin(0, 0.5)
        .setDepth(1000)
        .setScale(width / (width / this.camUI.zoom) / 8)
        .setInteractive({ useHandCursor: true });

      this.zoomIn = this.add
        .image(60 + 160, 40, "ui_magnifier_plus")
        .setOrigin(0, 0.5)
        .setDepth(1000)
        .setScale(width / (width / this.camUI.zoom) / 6)
        .setInteractive({ useHandCursor: true });

      this.zoomIn.on("pointerup", () => {
        this.currentZoom += 0.2
        //console.log(this.currentZoom);
      });

      this.zoomOut.on("pointerup", () => {
        this.currentZoom -= 0.2
        if (this.currentZoom < 0.2) {
          this.currentZoom = 0.2
        }
        //console.log(this.currentZoom);
      });

      this.zoom.on("pointerup", () => {
        this.currentZoom = 1
      })


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
    let height = this.sys.game.canvas.height;

    //this.camUI.resize(width, height);
  }

  update(time, delta) {

  }
}
