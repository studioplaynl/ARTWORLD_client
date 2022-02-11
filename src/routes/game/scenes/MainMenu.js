import ManageSession from "../ManageSession.js"
import { getAccount, listObjects } from '../../../api.js'

export default class MainMenu extends Phaser.Scene {
  constructor() {
    super("MainMenu")

  }

  preload() {
  }

  async create() {
    // a tile sprite repeats background, should be done with small images
    this.bg = this.add
      .tileSprite(
        0,
        0,
        this.sys.game.canvas.width,
        this.sys.game.canvas.height,
        "background4"
      )
      .setOrigin(0)

    this.playBtn = this.add
      .image(this.scale.width / 2, this.scale.height / 3, "artworld")
      .setInteractive({ useHandCursor: true })
      .setVisible(false)

    this.playBtnScaler = (this.scale.width / this.playBtn.width) * 0.86

    this.playBtn.setScale(this.playBtnScaler)

    this.playBtn.on("pointerdown", () => {
      console.log("MainMenu.playBtn.on(pointerdown ")
      this.scene.start("NetworkBoot")
    })

    this.playBtn.on("pointerover", () => {
      this.playBtn.setScale(this.playBtnScaler * 1.1)
    })

    this.playBtn.on("pointerout", () => {
      this.playBtn.setScale(this.playBtnScaler)
    })

    //on resizing the window
    this.scale.on("resize", this.resize, this)

    //* check if the user profile is loaded, to be able to send the player to the right location
    if (!!ManageSession.userProfile) {
      ManageSession.launchLocation = ManageSession.userProfile.meta.location
      
      //console.log(ManageSession.launchLocation)
      ManageSession.checkSceneExistence()
    } else {
      getAccount("", true)
        .then(rec => {
          ManageSession.userProfile = rec
          //* only set the menu button visible if the user data is downloaded!
          ManageSession.launchLocation = rec.meta.location
          ManageSession.checkSceneExistence()
        })
    }
  } //create

  resize() {
    let width = this.sys.game.canvas.width;
    let height = this.sys.game.canvas.height;

    this.bg.setSize(width, height);

    this.playBtn.setPosition(width / 2, height / 3);
    this.playBtnScaler = (width / this.playBtn.width) * 0.86;
    this.playBtn.setScale(this.playBtnScaler);

    this.playBtn.on("pointerover", () => {
      this.playBtn.setScale(this.playBtnScaler * 1.1);
    })

    this.playBtn.on("pointerout", () => {
      this.playBtn.setScale(this.playBtnScaler);
    })
  }

  update(time, delta) {
    this.playBtn.setVisible(ManageSession.locationExists)
  } // end update
}
