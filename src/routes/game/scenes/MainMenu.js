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

    //setLoader(true)


    //on resizing the window
    this.scale.on("resize", this.resize, this)

    //* check if the user profile is loaded, to be able to send the player to the right location
    //* check if there are params in the url, to send the player to that location instead
    let urlParams = ManageSession.getUrl()

    console.log("urlParams", urlParams)

    // if the location in the url exists as a scene
    if (ManageSession.checkIfSceneExists(urlParams.location)) {
      //ManageSession.launchLocation = urlParams.location
      console.log("lauch urlParam scene")
      this.scene.stop("MainMenu")
      this.scene.start("NetworkBoot")
    } else if (!!ManageSession.userProfile) {
      // if there is a location in the url
      if (ManageSession.checkIfSceneExists(ManageSession.userProfile.meta.location)) {
        //ManageSession.launchLocation = ManageSession.userProfile.meta.location
        console.log
        this.scene.stop("MainMenu")
        this.scene.start("NetworkBoot")
         
      } else {
        //if the scene does not exists, launch default scene
        ManageSession.launchLocation = "ArtworldAmsterdam"
        this.scene.stop("MainMenu")
        this.scene.start("NetworkBoot")
      }


      //console.log(ManageSession.launchLocation)

    } else {
      getAccount("", true)
        .then(rec => {
          ManageSession.userProfile = rec
          //* only set the menu button visible if the user data is downloaded!
          if (ManageSession.checkIfSceneExists(rec.meta.location)) {
            //ManageSession.launchLocation = rec.meta.location
            this.scene.start("NetworkBoot")
          } else {
            //if the scene does not exists, launch default scene
            ManageSession.launchLocation = "ArtworldAmsterdam"
            this.scene.stop("MainMenu")
            this.scene.start("NetworkBoot")
          }
        })
    }
  } //create

  resize() {
    let width = this.sys.game.canvas.width;
    let height = this.sys.game.canvas.height;

    this.bg.setSize(width, height);
  }

  update(time, delta) {

  } // end update
}
