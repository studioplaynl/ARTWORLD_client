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
    console.log("checkLikeList")
    Promise.all([listObjects("Liked", ManageSession.userProfile.id, 10)])
      .then((rec) => {
        console.log(rec)
        // console.log(rec[0].length)
        if (rec[0].length > 0) {
          // console.log("checkLikeList1111")
          ManageSession.allLiked = rec[0][0].value
        } else {
          // console.log("checkLikeList22222")
          ManageSession.allLiked = {
            "drawing/5264dc23-a339-40db-bb84-e0849ded4e68/4_blauwSpotlijster.png": "drawing/5264dc23-a339-40db-bb84-e0849ded4e68/4_blauwSpotlijster.png",
            "drawing/5264dc23-a339-40db-bb84-e0849ded4e68/geelCoral.png": "drawing/5264dc23-a339-40db-bb84-e0849ded4e68/geelCoral.png"
          }
          // console.log(ManageSession.allLiked)
        }
      })

    // if (typeof  !== "undefined") {
    //   const myCurrent = Promise.all(JSON.parse(updateObject("Liked", "all", '{}', 2)))
    //   console.log("CURRENT DATA", myCurrent)
    // } else {

    // }
  }

}