import ManageSession from "../ManageSession"
import ServerCall from "../class/ServerCall"
import { CurrentApp } from "../../../session"
import { Liked } from "../../../storage"

export default class NetworkBoot extends Phaser.Scene {
  constructor() {
    super("NetworkBoot")
  }

  async preload() {
    //console.log("NetworkBoot")
    //setLoader(true)
    this.scene.launch("UI_Scene")
    ManageSession.createPlayer = true

    //we launch the player last location when we have a socket with the server
    await ManageSession.createSocket()
      .then(async () => {

        //get server object so that the data is Initialized
        Liked.get()

        console.log("ManageSession.locationID", ManageSession.locationID)
        this.scene.launch(ManageSession.location, { user_id: ManageSession.locationID })
        CurrentApp.update(n => "game")
      })
  }
}