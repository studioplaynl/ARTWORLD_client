import ManageSession from "../ManageSession"
import { getAccount, updateObject, listObjects } from '../../../api.js'

export default class NetworkBoot extends Phaser.Scene {
  constructor() {
    super("NetworkBoot")
    this.phaser = this

  }

  async preload() {
    //console.log("NetworkBoot")
    ManageSession.createPlayer = true

    await ManageSession.createSocket()
      .then(rec => {
        //console.log(ManageSession.launchLocation)
        this.scene.launch(ManageSession.launchLocation)
      })
  }

  async getAddressbook() {
    console.log("this is a function!")
    // await listObjects("addressbook", ManageSession.userProfile.id, 10).then((rec) => {
    //   console.log(rec)

    // })
  }

}