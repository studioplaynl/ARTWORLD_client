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

        this.getServerObject("liked", ManageSession.userProfile.id, 10)
        //this.getAddressBook()
        this.getServerObject("addressbook", ManageSession.userProfile.id, 10)
        this.scene.launch(ManageSession.launchLocation)
      })
  }

  async getServerObject(collection, userID, maxItems) {
    Promise.all([listObjects(collection, userID, maxItems)])
      .then(response => {
        console.log("collection", collection)
        console.log("response", response)

        //check if the object exists
        if (response[0].length > 0) {
          //the object exists: addressbook

          // check if the right object exists: addressbook_user_id
          let filteredResponse = response[0].filter(element => {
            console.log(collection + "_" + ManageSession.userProfile.id, typeof collection)
            console.log("element", element)
            return element.key == collection + "_" + ManageSession.userProfile.id
          }
          )
          console.log("filteredResponse", filteredResponse)

          if (filteredResponse.length > 0) {
            //the right object exists, but check if there is data in de object, in the expected format

            if (typeof filteredResponse[0].value[collection] != "undefined") {
              //the addressbook is in the right format, we assign our local copy
              ManageSession[collection] = filteredResponse[0].value
              console.log("ManageSession." + collection, ManageSession[collection])
            } else {
              //when the right addressbook does not exist: make an empty one
              //addressbook_userid.value exists but .addressbook  
              this.createEmptyServerObject(collection)
            }

          } else {
            //when the right addressbook does not exist: make an empty one
            this.createEmptyServerObject(collection)

          }
          console.log("ManageSession." + collection, ManageSession[collection])

        } else {
          //the addressbook does not exist: make an empty one
          this.createEmptyServerObject(collection)
        }
      })
  }

  async createEmptyServerObject(collection) {
    //general method of creating an array inside an object with the argument of the method
    console.log("createEmptyServerObject")
    console.log(collection)

    ManageSession[collection] = { [collection]:[] }

    const type = collection
    const name = type + "_" + ManageSession.userProfile.id
    const pub = 2
    const value = ManageSession[collection]
    console.log(" ManageSession. empty", ManageSession[collection])
    updateObject(type, name, value, pub)
  }

  
}