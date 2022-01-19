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
        this.checkLikeList()
      })
  }

  async getAddressbook() {
    // console.log("this is a function!")
    // await listObjects("addressbook", ManageSession.userProfile.id, 10).then((rec) => {
    //   console.log(rec)

    // })
  }

  async checkLikeList() {
    //*check if Liked list exists on server, otherwise create it
    Promise.all([listObjects("Liked", ManageSession.userProfile.id, 10)])
      .then((values) => {
        ManageSession.allLiked = values[0]
        //console.log("!!!?!!?!?!?!?", ManageSession.allLiked)
      })
 
    // if (typeof  !== "undefined") {
    //   const myCurrent = Promise.all(JSON.parse(updateObject("Liked", "all", '{}', 2)))
    //   console.log("CURRENT DATA", myCurrent)
    // } else {

    // }
  }

}