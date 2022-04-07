import i18next from "i18next"
import { locale } from "svelte-i18n"
import ManageSession from "../ManageSession"

import nl from "../../../langauge/nl/ui.json"
import en from "../../../langauge/en/ui.json"
import ru from "../../../langauge/ru/ui.json"
import ar from "../../../langauge/ar/ui.json"
import HistoryTracker from "../class/HistoryTracker"
import DebugFuntions from "../class/DebugFuntions"
import { element } from "svelte/internal"

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

    //......... INPUT .....................................................................................
    this.input.keyboard.createCursorKeys()
    //.......... end INPUT ................................................................................
    //......... DEBUG FUNCTIONS ...........................................................................
    this.events.on('gameEditMode', this.gameEditModeSign, this) // show edit mode indicator
    this.events.on('gameEditMode', this.editElementsScene, this) // make elements editable

    DebugFuntions.keyboard(this)
    //......... end DEBUG FUNCTIONS .......................................................................


    //  let displayText = `${this.sys.game.canvas.width} ${this.sys.game.canvas.height} ${window.devicePixelRatio}`
    //  this.add.text((this.sys.game.canvas.width / 2 ) - 100, this.sys.game.canvas.height / 2, displayText, { fontSize: 16, 
    //   backgroundColor: '#000000', 
    //   color: '#fff' })

    this.camUI = this.cameras.main
      .setSize(this.sys.game.canvas.width, this.sys.game.canvas.height)
      .setName("camMain")
    this.camUI.zoom = 1

    this.scale.on("resize", this.resize, this)

    // to make the UI scene always on top of other scenes
    this.scene.bringToTop()

  } //create


  resize() {
    //console.log("resizing")
    let width = this.sys.game.canvas.width
    let height = this.sys.game.canvas.height

    //this.camUI.resize(width, height);
  }
  editElementsScene(arg) {
    let scene = ManageSession.currentScene
    switch (arg) {
      case 'on':
        if (typeof scene.editElementsScene == "undefined"){
          break
        }

        if (scene.editModeElements.length > 0){

          scene.editModeElements.forEach((element) => {
            element.setInteractive({ draggable: true })
  
          })

        }

        break

      case 'off':
        
        if (typeof scene.editElementsScene == "undefined"){
          break
        }

        if (scene.editModeElements.length > 0){

        scene.editModeElements.forEach((element) => {
          element.disableInteractive()
          console.log("element", element)
        })
        
      }
        break
    }
  }

  gameEditModeSign(arg) {
    console.log("gameEditMode received", arg)
    switch (arg) {
      case 'on':
        let width = this.sys.game.canvas.width
        //let height = this.sys.game.canvas.height


        this.gameEditModeSignGraphic = this.add.graphics()
        this.gameEditModeSignGraphic.fillStyle(0xff0000, 1)

        //  32px radius on the corners
        this.gameEditModeSignGraphic.fillRoundedRect(width / 2, 20, 100, 40, 8)

        this.gameEditModeSignText = this.add.text(width / 2 + 50, 20 + 20, "edit mode").setOrigin(0.5)

        break

      case 'off':
        this.gameEditModeSignGraphic.destroy()
        this.gameEditModeSignText.destroy()
        break

      default:

        break
    }



  }

  update(time, delta) {

  }
}
