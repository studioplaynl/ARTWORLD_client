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

    // this.load.image("background1", "./assets/test_backgrounds/wp4676605-4k-pc-wallpapers.jpg")
    // this.load.image("background2", "./assets/test_backgrounds/desktop112157.jpg")
    // this.load.image("background3", "./assets/test_backgrounds/desktop251515.jpg")
    this.load.image("background4", "./assets/test_backgrounds/desktop512758.jpg")
    // this.load.image("background5", "./assets/test_backgrounds/desktop1121573.jpg")
  }
  async create() {
    // a tile sprite repeats background, should be done with small images
    this.bg = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'background4').setOrigin(0.5);

    //test different background
    // this.add.image(0,0, "background1").setOrigin(0,0).setScale(0.5)
    // this.add.image(0,0, "background2").setOrigin(0,0).setScale(0.8)
    // this.add.image(0,-300, "background3").setOrigin(0,0).setScale(1)
    // this.add.image(0,0, "background4").setOrigin(0,0).setScale(1.3)
    // this.add.image(0,-300, "background5").setOrigin(0,0).setScale(1)

    this.camMain = this.cameras.main.setSize(this.sys.game.canvas.width, this.sys.game.canvas.height).setName('camMain')
    this.camMain.zoom = 1;
    this.camUI = this.cameras.add(0,0, this.sys.game.canvas.width, this.sys.game.canvas.height).setName('camUI');
    this.camUI.zoom = 1;
    // let cursors = this.input.keyboard.createCursorKeys();

    // let controlConfig = {
    //     camera: this.cameras.main,
    //     left: cursors.left,
    //     right: cursors.right,
    //     up: cursors.up,
    //     down: cursors.down,
    //     zoomIn: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
    //     zoomOut: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
    //     acceleration: 0.06,
    //     drag: 0.0005,
    //     maxSpeed: 1.0
    // };

    // this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);
    //...... SESSION .............................................................................................
    //console.log("Session: ");
    manageSession.sessionStored = JSON.parse(localStorage.getItem("Session"));
    //console.log(manageSession.sessionStored);

    console.log(manageSession.sessionStored.user_id);
    console.log(manageSession.sessionStored.username);

    manageSession.user_id = manageSession.sessionStored.user_id
    manageSession.username = manageSession.sessionStored.username

    //get account info of Self
    //console.log("get account info of self")
    //console.log(JSON.parse(localStorage.getItem("profile")))
    //this.getAccount()


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

    this.playBtn = this.add.image(this.scale.width / 2, this.scale.height / 2, 'artworld')
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
      this.scene.start("AZC1_Scene");
    });

    this.playBtn.on("pointerover", () => {
      this.playBtn.setScale(this.playBtnScaler * 1.1);
    });

    this.playBtn.on("pointerout", () => {
      this.playBtn.setScale(this.playBtnScaler);
    });


    this.zoomButtons(false)

    //......... INPUT ....................................................................................
    //......... DEBUG FUNCTIONS ............................................................................
    //this.debugFunctions();
    //this.createDebugText();
    //......... end DEBUG FUNCTIONS .........................................................................
    //.......... end INPUT ................................................................................


    //on resizing the window
    this.scale.on('resize', this.resize, this);

    this.camMain.ignore([this.zoom, this.zoomIn, this.zoomOut]);
    this.camUI.ignore([this.playBtn, this.bg])
  } //create

  zoomButtons(update) {

    let width = this.sys.game.canvas.width
    let height = this.sys.game.canvas.height - 60
    if (!update) {
      this.zoom = this.add.text(width / 10, height / 11, "zoom", { fontFamily: "Arial", fontSize: "22px" })
        .setOrigin(0)
        //.setScrollFactor(0) //fixed on screen
        .setShadow(1, 1, '#000000', 0)
        .setDepth(300)
        .setScale(width / (width / this.camMain.zoom))

      this.zoomIn = this.add.text(width / 10, (height / 11) + 50, "IN", { fontFamily: "Arial", fontSize: "22px" })
        .setOrigin(0)
        //.setScrollFactor(0) //fixed on screen
        .setShadow(1, 1, '#000000', 0)
        .setDepth(300)
        .setInteractive()

      this.zoomOut = this.add.text(width / 10, (height / 11) + 80, "OUT", { fontFamily: "Arial", fontSize: "22px" })
        .setOrigin(0)
        //.setScrollFactor(0) //fixed on screen
        .setShadow(1, 1, '#000000', 0)
        .setDepth(300)
        .setInteractive()

      this.zoomIn.on("pointerup", () => {
        this.cameras.main.zoom += 0.2;
        console.log("this.camMain.zoom")
        console.log(this.camMain.zoom)
        this.resize()
      });

      this.zoomOut.on("pointerup", () => {
        this.camMain.zoom -= 0.2;
        console.log("this.camMain.zoom")
        console.log(this.camMain.zoom)
        this.resize()
      });
    } else {
      this.zoom.setPosition((width / 10) / this.camMain.zoom, (height / 10) / this.camMain.zoom).setScale(width / (width / this.camMain.zoom))
      this.zoomIn.setPosition((width / 10) / this.camMain.zoom, (height / 10) / this.camMain.zoom + (50 / this.camMain.zoom)).setScale(width / (width / this.camMain.zoom))
      this.zoomOut.setPosition((width / 10) / this.camMain.zoom, (height / 10) / this.camMain.zoom + (80 / this.camMain.zoom)).setScale(width / (width / this.camMain.zoom))
    }
  }
  resize() {
    //console.log("resizing")
    let width = this.sys.game.canvas.width
    let height = this.sys.game.canvas.height - 60

    console.log(width, height)
    //this.camMain.resize(width, height);

    this.bg.setSize(width / this.camMain.zoom, height / this.camMain.zoom).setPosition(width / 2, height / 2);

    this.playBtn.setPosition(width / 2, height / 2);
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


  // async getAccount() {
  //   manageSession.playerObjectSelf = await getAccount();
  //   console.log("manageSession.playerObjectSelf")
  //   console.log(manageSession.playerObjectSelf)
  //   manageSession.createPlayer = true
  //   console.log("manageSession.createPlayer: ")
  //   console.log(manageSession.createPlayer)
  // }

  // debugFunctions() {

  //   this.input.keyboard.on('keyup-A', function (event) {
  //     //get online player group

  //   }, this);

  //   this.input.keyboard.on('keyup-ONE', function (event) {

  //     console.log('1 key');



  //   }, this);

  //   this.input.keyboard.on('keyup-S', function (event) {

  //     console.log('S key');

  //   }, this);

  //   this.input.keyboard.on('keyup-Q', function (event) {

  //     console.log('Q key');
  //     getAccount();

  //   }, this);

  //   this.input.keyboard.on('keyup-W', function (event) {

  //     console.log('W key');
  //     manageSession.playerObjectSelf.url = url;
  //     console.log("this.playerObjectSelf")
  //     console.log(url)

  //   }, this);

  //   //  Receives every single key down event, regardless of type

  //   this.input.keyboard.on('keydown', function (event) {

  //     console.dir(event);

  //   }, this);
  // }

  update(time, delta) {
    // this.controls.update(delta);
  }

}
