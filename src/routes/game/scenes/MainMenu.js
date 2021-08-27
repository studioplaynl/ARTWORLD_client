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
  }
  create() {
    //...... SESSION ..................................................................................
    //console.log("Session: ");
    manageSession.sessionStored = JSON.parse(localStorage.getItem("Session"));
    //console.log(manageSession.sessionStored);

    console.log(manageSession.sessionStored.user_id);
    console.log(manageSession.sessionStored.username);

    manageSession.user_id = manageSession.sessionStored.user_id
    manageSession.username = manageSession.sessionStored.username
    //...................................................................................................

    //...... PARTICLES .................................................................................
    var textures = this.textures;

    var particles = this.add.particles('flares');

    //  Create an emitter by passing in a config object directly to the Particle Manager

    var emitter = particles.createEmitter({
      frame: ['red', 'blue', 'green', 'yellow'],
      x: CONFIG.WIDTH /2,
      y: CONFIG.HEIGHT /2,
      speed: 200,
      lifespan: 3000,
      blendMode: 'ADD'
    });
    //...................................................................................................

    //...... TRANSLATION .............................................................................................
    locale.subscribe(value => {
      console.log("current lang=" + value)
    });
    //...................................................................................................

    //...................................................................................................
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

    const playBtn = this.add.image(CONFIG.WIDTH /2, CONFIG.HEIGHT /2, 'artworld')
    .setScale(0.5)
    .setInteractive({ useHandCursor: true });

    // const playBtn = this.add
    //   .image(CONFIG.WIDTH / 2, 275, 225, 70, 0xffca27)
    //   .setInteractive({ useHandCursor: true });

    // const playBtnText = this.add
    //   .text(CONFIG.WIDTH / 2, 275, "Begin", {
    //     fontFamily: "Arial",
    //     fontSize: "36px",
    //   })
    //   .setOrigin(0.5);

    playBtn.on("pointerdown", () => {
      this.scene.start("AZC1_Scene");
    });

    playBtn.on("pointerover", () => {
      playBtn.setScale(0.6);
    });

    playBtn.on("pointerout", () => {
      playBtn.setScale(0.5);
    });

  } //create
}
