import ManageSession from "../ManageSession.js"
import { getAccount, listObjects, setLoader } from '../../../api.js'

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

    setLoader(true)

    
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
  }

  update(time, delta) {
    if (ManageSession.locationExists) this.scene.start("NetworkBoot")
  } // end update
}
