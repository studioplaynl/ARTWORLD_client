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
        this.getLiked()
        this.getAddressBook()
      })
  }

  async getAddressBook() {
    Promise.all([listObjects("addressbook", ManageSession.userProfile.id, 10)])
      .then(response => {
        if (response[0].length > 0) {
          // ManageSession.addressbook = response[0].map((element) => element.value)
          // ManageSession.addressbook = response[0][0].value
          // console.log("response[0][0].value", response[0][0].value)

          console.log("address book response", response[0])
          // const firstFriend = { user_id: "123xc" }
          // const secondFriend = { user_id: "456xc" }
          // const addressbook = [
          //   firstFriend, secondFriend
          // ]

          const filteredResponse = response[0].filter(element => {
            return element.key == "addressbook_" + ManageSession.userProfile.id
          })
          // console.log("myVar", filteredResponse)

          ManageSession.addressbook = filteredResponse[0].value

          console.log("ManageSession.addressbook", ManageSession.addressbook)

          // ManageSession.addressbook = myVar[0].value 

          // console.log("myVar.value", myVar[0].value)

          // const type = "addressbook"
          // const name = type + "_" + ManageSession.userProfile.id
          // const pub = 2
          // const value = ManageSession.addressbook
          // updateObject(type, name, value, pub)

          // console.log("ManageSession.addressbook", ManageSession.addressbook)
        } else {
          console.log("address book empty")
          const addressbook = []
          ManageSession.addressbook = { addressbook }
          console.log(" ManageSession.addressbook empty", ManageSession.addressbook)
          const type = "addressbook"
          const name = type + "_" + ManageSession.userProfile.id
          const pub = 2
          const value = ManageSession.addressbook
          updateObject(type, name, value, pub)
          // console.log(ManageSession.allLiked)
        }
      })
  }

  async getLiked() {
    //*check if Liked list exists on server, otherwise create it
    console.log("checkLikeList")
    Promise.all([listObjects("liked", ManageSession.userProfile.id, 10)])
      .then((rec) => {

        // console.log(rec[0].length)
        if (rec[0].length > 0) {
          // console.log("checkLikeList1111")
          ManageSession.allLiked = rec[0][0].value
        } else {
          ManageSession.allLiked = {
            // "drawing/5264dc23-a339-40db-bb84-e0849ded4e68/4_blauwSpotlijster.png": "drawing/5264dc23-a339-40db-bb84-e0849ded4e68/4_blauwSpotlijster.png",
            // "drawing/5264dc23-a339-40db-bb84-e0849ded4e68/geelCoral.png": "drawing/5264dc23-a339-40db-bb84-e0849ded4e68/geelCoral.png"
          }

          const type = "liked"
          const name = type + "_" + ManageSession.userProfile.id
          const pub = 2
          const value = ManageSession.allLiked
          updateObject(type, name, value, pub)
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