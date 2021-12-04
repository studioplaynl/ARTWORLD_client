import ManageSession from "../ManageSession"

export default class NetworkBoot_Scene extends Phaser.Scene {
  constructor() {
    super("networkBoot_Scene")
    this.phaser = this

  }

  async preload() {
    
    ManageSession.createPlayer = true
    
    await ManageSession.createSocket()
      .then(rec => {
        console.log(ManageSession.launchLocation)
        this.scene.launch(ManageSession.launchLocation)
      })
  }

}