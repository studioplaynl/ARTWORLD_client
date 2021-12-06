import ManageSession from "../ManageSession"

export default class NetworkBoot_Scene extends Phaser.Scene {
  constructor() {
    super("NetworkBoot_Scene")
    this.phaser = this

  }

  async preload() {
    console.log("NetworkBoot_Scene")
    ManageSession.createPlayer = true
    
    await ManageSession.createSocket()
      .then(rec => {
        console.log(ManageSession.launchLocation)
        this.scene.launch(ManageSession.launchLocation)
      })
  }

}