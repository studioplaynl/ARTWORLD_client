import CONFIG from "../config.js";
import manageSession from "../manageSession.js";
import { client, SSL } from "../../../nakama.svelte";
import { url, user, getAccount } from '../../../api.js';

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
  async create() {
    //...... SESSION .............................................................................................
    //console.log("Session: ");
    manageSession.sessionStored = JSON.parse(localStorage.getItem("Session"));
    //console.log(manageSession.sessionStored);

    console.log(manageSession.sessionStored.user_id);
    console.log(manageSession.sessionStored.username);

    manageSession.user_id = manageSession.sessionStored.user_id
    manageSession.username = manageSession.sessionStored.username

    // //get account info of Self
    console.log("get account info of self")
    this.getAccount()


    // manageSession.AccountObject = await client.getAccount(manageSession.session);
    // manageSession.playerObjectSelf = manageSession.AccountObject.user;
    // console.log(manageSession.AccountObject.user)

    // const payload = { "url": manageSession.playerObjectSelf.avatar_url };
    // const rpcid = "download_file";
    // const fileurl = await client.rpc(manageSession.session, rpcid, payload);
    // manageSession.playerObjectSelf.url = fileurl.payload.url
    // console.log(manageSession.playerObjectSelf.url)
    //.............................................................................................................

    //...... PARTICLES .............................................................................................
    var particles = this.add.particles('flares');

    //  Create an emitter by passing in a config object directly to the Particle Manager
    var emitter = particles.createEmitter({
      frame: ['red', 'blue', 'green', 'yellow'],
      x: CONFIG.WIDTH / 2,
      y: CONFIG.HEIGHT / 2,
      speed: 100,
      lifespan: 3000,
      blendMode: 'ADD'
    });
    //..............................................................................................................

    //...... TRANSLATION ...........................................................................................
    locale.subscribe(value => {
      console.log("current lang=" + value)
    });
    //...............................................................................................................

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

    const playBtn = this.add.image(CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2, 'artworld')
      .setInteractive({ useHandCursor: true });

    const playBtnScaler = (CONFIG.WIDTH / playBtn.width) * 0.86

    playBtn.setScale(playBtnScaler);

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
      playBtn.setScale(playBtnScaler * 1.1);
    });

    playBtn.on("pointerout", () => {
      playBtn.setScale(playBtnScaler);
    });
    //......... INPUT ....................................................................................
    //......... DEBUG FUNCTIONS ............................................................................
    this.debugFunctions();
   //w this.createDebugText();
    //......... end DEBUG FUNCTIONS .........................................................................
    //.......... end INPUT ................................................................................

  } //create

  async getAccount() {
    manageSession.playerObjectSelf = getAccount();
    console.log("this.playerObjectSelf")
    console.log(this.playerObjectSelf)
  }

  debugFunctions() {

    this.input.keyboard.on('keyup-A', function (event) {
      //get online player group
      
    }, this);

    this.input.keyboard.on('keyup-ONE', function (event) {

      console.log('1 key');

     

    }, this);

    this.input.keyboard.on('keyup-S', function (event) {

      console.log('S key');

    }, this);

    this.input.keyboard.on('keyup-Q', function (event) {

      console.log('Q key');
      getAccount();

    }, this);

    this.input.keyboard.on('keyup-W', function (event) {

      console.log('W key');
      manageSession.playerObjectSelf.url = url;
      console.log("this.playerObjectSelf")
      console.log(manageSession.playerObjectSelf)

    }, this);

    //  Receives every single key down event, regardless of type

    this.input.keyboard.on('keydown', function (event) {

      console.dir(event);

    }, this);
  }

}
