import ManageSession from "../ManageSession"
import ServerCall from "../class/ServerCall"
import { setLoader } from "../../../api.js"

export default class NetworkBoot extends Phaser.Scene {
  constructor() {
    super("NetworkBoot")
    this.phaser = this
  }

  async preload() {
    //console.log("NetworkBoot")
    //setLoader(true)
    ManageSession.createPlayer = true

    //we launch the player last location when we have a socket with the server
    await ManageSession.createSocket()
      .then(() => {
        ServerCall.getServerObject("liked", ManageSession.userProfile.id, 10)
        ServerCall.getServerObject("addressbook", ManageSession.userProfile.id, 10)
        console.log("ManageSession.launchLocation", ManageSession.launchLocation)
        this.scene.launch(ManageSession.launchLocation)
      })
  }
}