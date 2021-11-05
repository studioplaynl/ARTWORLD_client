import manageSession from "../manageSession"

export default class networkBoot_Scene extends Phaser.Scene {
  constructor() {
    super("networkBoot_Scene")
    this.phaser = this
  }

  async preload() {
    manageSession.createPlayer = true
    
    await manageSession.createSocket()
      .then(rec => {
        this.scene.launch(manageSession.location)
      })
  }

}