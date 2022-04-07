import ManageSession from "../ManageSession"
import ServerCall from "../class/ServerCall"
import {CurrentApp} from "../../../session"


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
        //await ServerCall.getServerArrayObject("achievements", ManageSession.userProfile.id, 3)

        ServerCall.getServerArrayObject("liked", ManageSession.userProfile.id, 100)
        ServerCall.getServerArrayObject("addressbook", ManageSession.userProfile.id, 100)
        
        console.log("ManageSession.locationID", ManageSession.locationID)
        this.scene.launch(ManageSession.location, { user_id: ManageSession.locationID })
        CurrentApp.update(n => "game");
      })
  }
}