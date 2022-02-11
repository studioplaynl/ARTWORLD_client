import ManageSession from "../ManageSession"
import ServerCall from "../class/ServerCall"

export default class NetworkBoot extends Phaser.Scene {
  constructor() {
    super("NetworkBoot")
    this.phaser = this
  }

  async preload() {
    //console.log("NetworkBoot")
    ManageSession.createPlayer = true

    //we launch the player last location when we have a socket with the server
    await ManageSession.createSocket()
      .then(() => {
        ServerCall.getServerObject("liked", ManageSession.userProfile.id, 10)
        ServerCall.getServerObject("addressbook", ManageSession.userProfile.id, 10)
        this.scene.launch(ManageSession.launchLocation)
      })
  }
}