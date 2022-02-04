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

    //we launch the player last location when we have a socket with the server
    await ManageSession.createSocket()
      .then(rec => {
        //console.log(ManageSession.launchLocation)

        this.getLiked()
        this.getAddressBook()
        this.scene.launch(ManageSession.launchLocation)
      })
  }

  async getAddressBook() {
    Promise.all([listObjects("addressbook", ManageSession.userProfile.id, 10)])
      .then(response => {
        //check if the object exists
        if (response[0].length > 0) {
          //the object exists: addressbook

          // check if the right object exists: addressbook_user_id
          let filteredResponse = response[0].filter(element =>
            element.key == "addressbook_" + ManageSession.userProfile.id
          )
          console.log("filteredResponse", filteredResponse)

          if (filteredResponse.length > 0) {
            //the right object exists, but check if there is data in de object, in the expected format
            
            if (typeof filteredResponse[0].value.addressbook != "undefined"){
              //the addressbook is in the right format, we assign our local copy
              ManageSession.addressbook = filteredResponse[0].value
              console.log("ManageSession.addressbook", ManageSession.addressbook)
            } else {
              //when the right addressbook does not exist: make an empty one
              //addressbook_userid.value exists but .addressbook  
              this.makeEmptyAddressbook()
            }
              
          } else {
            //when the right addressbook does not exist: make an empty one
            this.makeEmptyAddressbook()

          }
          console.log("ManageSession.addressbook", ManageSession.addressbook)

        } else {
          //the addressbook does not exist: make an empty one
          this.makeEmptyAddressbook()
        }
      })
  }

  async makeEmptyAddressbook(){
    console.log("create empty address book")
    const addressbook = []
    ManageSession.addressbook = { addressbook }
    
    const type = "addressbook"
    const name = type + "_" + ManageSession.userProfile.id
    const pub = 2
    const value = ManageSession.addressbook
    console.log(" ManageSession.addressbook empty", ManageSession.addressbook)
    updateObject(type, name, value, pub)
  }

  async getLiked() {
    //*check if Liked list exists on server, otherwise create it
    console.log("checkLikeList")
    Promise.all([listObjects("liked", ManageSession.userProfile.id, 10)])
      .then((rec) => {

        // console.log(rec[0].length)
        if (rec[0].length > 0) {
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
        }
      })
  }
}