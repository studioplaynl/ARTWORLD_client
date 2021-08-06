import CONFIG from "../config.js";
import Nakama from "../nakama.js";
//import Phaser from "phaser";
import { client } from "../../../nakama.svelte";
import { Session, Profile, logout, storeSession } from "../../../store.js";



export default class MainMenu extends Phaser.Scene {
  constructor() {
    super("MainMenu");
  }

  create() {
    //Nakama.authenticate();
    console.log("client: ");
    console.log(client);

    console.log("Session: ");
    console.log(JSON.parse(localStorage.getItem("Session")));

    console.log("Profile: ");
    console.log(JSON.parse(localStorage.getItem("Account")));


    console.log("Session: ");
    console.log(Session);

    console.log("Profile: ");
    console.log(Profile);

    this.add
      .text(CONFIG.WIDTH / 2, 75, "Welcome to", {
        fontFamily: "Arial",
        fontSize: "24px",
      })
      .setOrigin(0.5);

    this.add
      .text(CONFIG.WIDTH / 2, 123, "ARTWORLD", {
        fontFamily: "Arial",
        fontSize: "60px",
      })
      .setOrigin(0.5);

    const playBtn = this.add
      .rectangle(CONFIG.WIDTH / 2, 225, 225, 70, 0xffca27)
      .setInteractive({ useHandCursor: true });

    const playBtnText = this.add
      .text(CONFIG.WIDTH / 2, 225, "Begin", {
        fontFamily: "Arial",
        fontSize: "36px",
      })
      .setOrigin(0.5);

    playBtn.on("pointerdown", () => {
      //Nakama.findMatch();
      this.scene.start("InGame");
    });

    playBtn.on("pointerover", () => {
      playBtn.setScale(1.1);
      playBtnText.setScale(1.1);
    });

    playBtn.on("pointerout", () => {
      playBtn.setScale(1);
      playBtnText.setScale(1);
    });
  } //create
}
