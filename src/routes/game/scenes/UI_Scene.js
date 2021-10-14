import CONFIG from "../config.js";


import { locale } from 'svelte-i18n'
import nl from './../../../langauge/nl.json'
import en from './../../../langauge/en.json'

export default class UI_Scene extends Phaser.Scene {
  constructor() {
    super("UI_Scene");
    this.currentZoom = 2

  }


  preload() {

  }
  async create() {


    this.camUI = this.cameras.main.setSize(this.sys.game.canvas.width, this.sys.game.canvas.height).setName('camMain')
    this.camUI.zoom = 1;



    this.zoomButtons(false)
    this.scale.on('resize', this.resize, this);


  } //create

  zoomButtons(update) {

    let width = this.sys.game.canvas.width
    let height = this.sys.game.canvas.height - 60

    if (!update) {
      this.zoom = this.add.text(width / 10, height / 40, "zoom", { fontFamily: "Arial", fontSize: "22px" })
        .setOrigin(0)
        //.setScrollFactor(0) //fixed on screen
        .setShadow(1, 1, '#000000', 0)
        .setDepth(1000)
        .setScale(width / (width / this.camUI.zoom))

      this.zoomIn = this.add.text((width / 10) + 80, (height / 40), "IN", { fontFamily: "Arial", fontSize: "22px" })
        .setOrigin(0)
        //.setScrollFactor(0) //fixed on screen
        .setShadow(1, 1, '#000000', 0)
        .setDepth(1000)
        .setInteractive({ useHandCursor: true });

      this.zoomOut = this.add.text((width / 10) + 160, (height / 40), "OUT", { fontFamily: "Arial", fontSize: "22px" })
        .setOrigin(0)
        //.setScrollFactor(0) //fixed on screen
        .setShadow(1, 1, '#000000', 0)
        .setDepth(1000)
        .setInteractive({ useHandCursor: true });

      this.zoomIn.on("pointerup", () => {
        this.currentZoom += 0.2
        //this.scale.setZoom(currentZoom + 0.2);
        //console.log("this.scale.zoom")
        console.log(this.currentZoom)
      });

      this.zoomOut.on("pointerup", () => {
        this.currentZoom -= 0.2
        // this.scale.setZoom(currentZoom - 0.5);
        // console.log("this.scale.zoom")
        console.log(this.currentZoom)
      });


    } else {
      this.zoom.setPosition((width / 10) / this.camUI.zoom, (height / 10) / this.camUI.zoom).setScale(width / (width / this.camUI.zoom))
      this.zoomIn.setPosition((width / 10) / this.camUI.zoom, (height / 10) / this.camUI.zoom + (50 / this.camUI.zoom)).setScale(width / (width / this.camUI.zoom))
      this.zoomOut.setPosition((width / 10) / this.camUI.zoom, (height / 10) / this.camUI.zoom + (80 / this.camUI.zoom)).setScale(width / (width / this.camUI.zoom))
    }
  }
  resize() {
    //console.log("resizing")
    let width = this.sys.game.canvas.width
    let height = this.sys.game.canvas.height - 60

    //this.camUI.resize(width, height);


  }

  update(time, delta) {
  }

}
