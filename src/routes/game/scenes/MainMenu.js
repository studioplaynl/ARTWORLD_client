import CONFIG from "../config.js";
import manageSession from "../manageSession.js";

import { locale } from 'svelte-i18n'
import nl from './../../../langauge/nl.json'
import en from './../../../langauge/en.json'

export default class MainMenu extends Phaser.Scene {
  constructor() {
    super("MainMenu");
  }
  preload() {
    this.load.atlas('flares', 'assets/particles/flares.png', 'assets/particles/flares.json');
    this.load.image('artworld', 'assets/artworld.png')

    // this.load.image("background1", "./assets/test_backgrounds/wp4676605-4k-pc-wallpapers.jpg")
    // this.load.image("background2", "./assets/test_backgrounds/desktop112157.jpg")
    // this.load.image("background3", "./assets/test_backgrounds/desktop251515.jpg")
    //this.load.image("background4", "./assets/art_styles/repetition/0affdae3101c87f72c071970623a6884.jpg")
    // this.load.image("background4", "./assets/art_styles/repetition/0ceff64b236482e515c344d254424da6.jpg")
    // this.load.image("background4", "./assets/art_styles/repetition/3fb6da9378545.560cd556c9413.jpg") 
    // this.load.image("background4", "./assets/art_styles/repetition/9a9cdf2c6c7a12e4bf572f34536861d3.jpg") 
    this.load.image("background4", "./assets/art_styles/repetition/3fb6da9378545.560cd556c9413.jpg") 

    // Received presence event for stream: 
    // this.load.image("background5", "./assets/test_backgrounds/desktop1121573.jpg")
  }
  async create() {
    // a tile sprite repeats background, should be done with small images
    this.bg = this.add.tileSprite(0, 0, this.sys.game.canvas.width, this.sys.game.canvas.height, 'background4').setOrigin(0);

    //test different background
    // this.add.image(0,0, "background1").setOrigin(0).setScale(0.5)
    // this.add.image(0,0, "background2").setOrigin(0).setScale(0.8)
    // this.add.image(0,-300, "background3").setOrigin(0).setScale(1)
    //this.bg = this.add.image(0,0, "background4").setOrigin(0.5).setScale(1.3)
    // this.add.image(0,-300, "background5").setOrigin(0).setScale(1)

    // this.camMain = this.cameras.main.setSize(this.sys.game.canvas.width, this.sys.game.canvas.height).setName('camMain')
    // this.camMain.zoom = 1;
    // this.camUI = this.cameras.add(0,0, this.sys.game.canvas.width, this.sys.game.canvas.height).setName('camUI');
    // this.camUI.zoom = 1;


    //...... SESSION .............................................................................................
    //console.log("Session: ");
    manageSession.sessionStored = JSON.parse(localStorage.getItem("Session"));
    //console.log(manageSession.sessionStored);
    

    console.log(manageSession.sessionStored.user_id);
    console.log(manageSession.sessionStored.username);

    console.log(manageSession.sessionStored);


    // manageSession.user_id = manageSession.sessionStored.user_id
    // manageSession.username = manageSession.sessionStored.username
    //.............................................................................................................

    //...... PARTICLES .............................................................................................
    // var particles = this.add.particles('flares');

    // //  Create an emitter by passing in a config object directly to the Particle Manager
    // var emitter = particles.createEmitter({
    //   frame: ['red', 'blue', 'green', 'yellow'],
    //   x: CONFIG.WIDTH / 2,
    //   y: CONFIG.HEIGHT / 2,
    //   speed: 100,
    //   lifespan: 3000,
    //   blendMode: 'MULTI'
    // });
    //..............................................................................................................

    //....... ENTER WORLD BUTTON ....................................................................................
    // this.add
    //   .text(CONFIG.WIDTH / 2, 175, "welcome to", {
    //     fontFamily: "Arial",
    //     fontSize: "24px",
    //   })
    //   .setOrigin(0.5);

    // this.add
    //   .text(CONFIG.WIDTH / 2, 223, "ARTWORLD", {
    //     fontFamily: "Arial",
    //     fontSize: "60px",
    //   })
    //   .setOrigin(0.5);

    this.playBtn = this.add.image(this.scale.width / 2, this.scale.height / 3, 'artworld')
      .setInteractive({ useHandCursor: true });

    this.playBtnScaler = (this.scale.width / this.playBtn.width) * 0.86

    this.playBtn.setScale(this.playBtnScaler);

    // const playBtn = this.add
    //   .image(CONFIG.WIDTH / 2, 275, 225, 70, 0xffca27)
    //   .setInteractive({ useHandCursor: true });

    // const playBtnText = this.add
    //   .text(CONFIG.WIDTH / 2, 275, "Begin", {
    //     fontFamily: "Arial",
    //     fontSize: "36px",
    //   })
    //   .setOrigin(0.5);

    this.playBtn.on("pointerdown", () => {
      if (manageSession.sessionStored.username != null){ // a way to check if the connection if working
        console.log(manageSession.userProfile)
        this.scene.start("networkBoot_Scene");
      }
      
    });

    this.playBtn.on("pointerover", () => {
      this.playBtn.setScale(this.playBtnScaler * 1.1);
    });

    this.playBtn.on("pointerout", () => {
      this.playBtn.setScale(this.playBtnScaler);
    });


    //this.zoomButtons(false)

    //......... INPUT ....................................................................................
    //......... DEBUG FUNCTIONS ............................................................................
    //this.debugFunctions();
    //this.createDebugText();
    //......... end DEBUG FUNCTIONS .........................................................................
    //.......... end INPUT ................................................................................


    //on resizing the window
    this.scale.on('resize', this.resize, this);

    // this.camMain.ignore([this.zoom, this.zoomIn, this.zoomOut]);
    // this.camUI.ignore([this.playBtn, this.bg])
  } //create

  // zoomButtons(update) {

  //   let width = this.sys.game.canvas.width
  //   let height = this.sys.game.canvas.height - 60
  //   if (!update) {
  //     this.zoom = this.add.text(width / 10, height / 40, "zoom", { fontFamily: "Arial", fontSize: "22px" })
  //       .setOrigin(0)
  //       //.setScrollFactor(0) //fixed on screen
  //       .setShadow(1, 1, '#000000', 0)
  //       .setDepth(300)
  //       .setScale(width / (width / this.camMain.zoom))

  //     this.zoomIn = this.add.text((width / 10) + 80, (height / 40) , "IN", { fontFamily: "Arial", fontSize: "22px" })
  //       .setOrigin(0)
  //       //.setScrollFactor(0) //fixed on screen
  //       .setShadow(1, 1, '#000000', 0)
  //       .setDepth(300)
  //       .setInteractive()

  //     this.zoomOut = this.add.text((width / 10) + 160, (height / 40) , "OUT", { fontFamily: "Arial", fontSize: "22px" })
  //       .setOrigin(0)
  //       //.setScrollFactor(0) //fixed on screen
  //       .setShadow(1, 1, '#000000', 0)
  //       .setDepth(300)
  //       .setInteractive()

  //     this.zoomIn.on("pointerup", () => {
  //       this.cameras.main.zoom += 0.2;
  //       console.log("this.camMain.zoom")
  //       console.log(this.camMain.zoom)
  //       this.resize()
  //     });

  //     this.zoomOut.on("pointerup", () => {
  //       this.camMain.zoom -= 0.2;
  //       console.log("this.camMain.zoom")
  //       console.log(this.camMain.zoom)
  //       this.resize()
  //     });
  //   } else {
  //     this.zoom.setPosition((width / 10) / this.camMain.zoom, (height / 10) / this.camMain.zoom).setScale(width / (width / this.camMain.zoom))
  //     this.zoomIn.setPosition((width / 10) / this.camMain.zoom, (height / 10) / this.camMain.zoom + (50 / this.camMain.zoom)).setScale(width / (width / this.camMain.zoom))
  //     this.zoomOut.setPosition((width / 10) / this.camMain.zoom, (height / 10) / this.camMain.zoom + (80 / this.camMain.zoom)).setScale(width / (width / this.camMain.zoom))
  //   }
  // }

  resize() {
    //console.log("resizing")
    let width = this.sys.game.canvas.width
    let height = this.sys.game.canvas.height

    //console.log(width, height)
    //this.camMain.resize(width, height);

    this.bg.setSize(width , height )

    this.playBtn.setPosition(width / 2, height / 3);
    this.playBtnScaler = (width / this.playBtn.width) * 0.86
    this.playBtn.setScale(this.playBtnScaler);

    this.playBtn.on("pointerover", () => {
      this.playBtn.setScale(this.playBtnScaler * 1.1);
    });

    this.playBtn.on("pointerout", () => {
      this.playBtn.setScale(this.playBtnScaler);
    });

    //this.zoomButtons(true)
    //this.scale.updateBounds();
  }

  update(time, delta) {
    // if (manageSession.sessionStored.username != null){ // a way to check if the connection if working
    //   this.scene.start("networkBoot_Scene");
    // }
  } // end update

}
