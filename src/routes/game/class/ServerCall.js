import ManageSession from "../ManageSession"
import { getAccount, updateObject, listObjects, convertImage } from '../../../api.js'
import GenerateLocation from "./GenerateLocation"
import CoordinatesTranslator from "./CoordinatesTranslator"

class ServerCall {
  constructor() { }

  async getServerArrayObject(collection, userID, maxItems) {
    Promise.all([listObjects(collection, userID, maxItems)])
      .then(response => {
        //console.log("collection", collection)
        //console.log("response", response)

        //check if the object exists
        if (response[0].length > 0) {
          //the object exists: addressbook

          // check if the right object exists: addressbook_user_id
          let filteredResponse = response[0].filter(element => {
            //console.log(collection + "_" + ManageSession.userProfile.id, typeof collection)
            //console.log("element", element)
            return element.key == collection + "_" + ManageSession.userProfile.id
          }
          )
          //console.log("filteredResponse", filteredResponse)

          if (filteredResponse.length > 0) {
            //the right collection object exists, but check if there is data in de object, in the expected format

            if (typeof filteredResponse[0].value[collection] != "undefined") {
              //the object is in the right format (object.value.object), we assign our local copy
              ManageSession[collection] = filteredResponse[0].value
              //console.log("ManageSession." + collection, ManageSession[collection])
              return
            } else {
              //when the right addressbook does not exist: make an empty one
              //addressbook_userid.value exists but .addressbook  
              this.createEmptyServerArrayObject(collection)
            }

          } else {
            //when the right addressbook does not exist: make an empty one
            this.createEmptyServerArrayObject(collection)

          }
          //console.log("ManageSession." + collection, ManageSession[collection])

        } else {
          //the addressbook does not exist: make an empty one
          this.createEmptyServerArrayObject(collection)
        }
      })
  }

  async createEmptyServerArrayObject(collection) {
    //general method of creating an array inside an object with the argument of the method
    console.log("createEmptyServerObject")
    console.log(collection)

    //pass data locally: 
    // - ManageSession

    ManageSession[collection] = { [collection]: [] }

    const type = collection
    const name = type + "_" + ManageSession.userProfile.id
    const pub = 2
    const value = ManageSession[type]
    console.log(" ManageSession. empty", ManageSession[type])
    updateObject(type, name, value, pub)
  }

  async getServerSingleObject(collection, userID, maxItems) {
    Promise.all([listObjects(collection, userID, maxItems)])
      .then(response => {
        //console.log("collection", collection)
        //console.log("response", response)

        //check if the object exists
        if (response[0].length > 0) {
          //the object exists: addressbook

          // check if the right object exists: addressbook_user_id
          let filteredResponse = response[0].filter(element => {
            //console.log(collection + "_" + ManageSession.userProfile.id, typeof collection)
            //console.log("element", element)
            return element.key == collection + "_" + ManageSession.userProfile.id
          }
          )
          //console.log("filteredResponse", filteredResponse)

          if (filteredResponse.length > 0) {
            //the right collection object exists, but check if there is data in de object, in the expected format

            if (typeof filteredResponse[0].value[collection] != "undefined") {
              //the object is in the right format (object.value.object), we assign our local copy
              ManageSession[collection] = filteredResponse[0].value
              //console.log("ManageSession." + collection, ManageSession[collection])
              return
            } else {
              //when the right addressbook does not exist: make an empty one
              //addressbook_userid.value exists but .addressbook  
              this.createEmptyServerObject(collection)
            }

          } else {
            //when the right addressbook does not exist: make an empty one
            this.createEmptyServerObject(collection)

          }
          //console.log("ManageSession." + collection, ManageSession[collection])

        } else {
          //the addressbook does not exist: make an empty one
          this.createEmptyServerObject(collection)
        }
      })
  }

  async getServerCollectionUrls(collection, array, filter, maxItems, scene) {
    let gameObjectRepresentation = collection + '_gameObjectRepresentation'
    scene[gameObjectRepresentation] = []

    // subscribe to loaderror event
    scene.load.on(`loaderror`, (offendingFile) => {
      this.resolveLoadError(offendingFile)
    }, this)

    //get a list of all collection objects and then filter
    Promise.all([listObjects(collection, null, maxItems)])
      .then((rec) => {
        //console.log("rec: ", rec)
        scene[collection] = rec[0]

        if (typeof filter != "undefined") {

          // filter only amsterdam homes
          scene[collection] = scene[collection].filter((obj) => obj.key == filter)
          this.generateHomes(scene)
        }
      })

  }// end getServerCollectionUrls


  async getHomesFiltered(collection, filter, maxItems, scene) {
    //homes represented, to created homes in the scene
    scene.homesRepresented = []

    // when there is a loading error, the error gets thrown multiple times because I subscribe to the 'loaderror' event multiple times
    const eventNames = scene.load.eventNames()
    //console.log("eventNames", eventNames)
    const isReady = scene.load.isReady()
    console.log("isReady", isReady)
    const isLoading = scene.load.isLoading()
    console.log("isLoading", isLoading)

    // subscribe to loaderror event
    scene.load.on(`loaderror`, (offendingFile) => {
      this.resolveLoadError(offendingFile)
    }, this)

    //get a list of all homes objects and then filter
    Promise.all([listObjects(collection, null, maxItems)])
      .then((rec) => {
        console.log("rec: ", rec)
        scene.homes = rec[0]

        // filter only amsterdam homes
        scene.homes = scene.homes.filter((obj) => obj.key == filter)
        this.generateHomes(scene)
      })
  }


  async generateHomes(scene) {
    //check if server query is finished, then make the home from the list
    if (scene.homes != null) {
      console.log("generate homes!")
      scene.homes.forEach((element, index) => {
        //console.log(element, index)
        const homeImageKey = "homeKey_" + element.user_id
        // get a image url for each home
        // get converted image from AWS
        const url = element.value.url

        //check if homekey is already loaded
        if (scene.textures.exists(homeImageKey)) {
          //create the home
          this.createHome(element, index, homeImageKey, scene)
          
        } else {
          // get the image server side
          this.getHomeImages(url, element, index, homeImageKey, scene)
        }
      }) //end forEach
    }
  }

  async getHomeImages(url, element, index, homeImageKey, scene) {
    console.log("getHomeImages")
    await convertImage(url, "128", "128", "png")
      .then((rec) => {
        //console.log("rec", rec)
        // load all the images to phaser
        scene.load.image(homeImageKey, rec)
          .on(`filecomplete-image-${homeImageKey}`, (homeImageKey) => {
            //delete from ManageSession.resolveErrorObjectArray
            ManageSession.resolveErrorObjectArray = ManageSession.resolveErrorObjectArray.filter((obj) => obj.imageKey !== homeImageKey)
            // console.log("ManageSession.resolveErrorObjectArray", ManageSession.resolveErrorObjectArray)
            //create the home
            this.createHome(element, index, homeImageKey, scene)
          }, this)
        // put the file in the loadErrorCache, in case it doesn't load, it get's removed when it is loaded successfully
        ManageSession.resolveErrorObjectArray.push({ loadFunction: "getHomeImage", element: element, index: index, imageKey: homeImageKey, scene: scene })
        scene.load.start() // start loading the image in memory
      })
  }

  createHome(element, index, homeImageKey, scene) {
    // home description
    //console.log(element)
    const locationDescription = element.value.username
    //const homeImageKey = "homeKey_" + element.user_id
    // get a image url for each home
    // get converted image from AWS
    const url = element.value.url

    //console.log("element.value.username, element.value.posX, element.value.posY", element.value.username, element.value.posX, element.value.posY)
    scene.homesRepresented[index] = new GenerateLocation({
      scene: scene,
      size: 140,
      userHome: element.user_id,
      draggable: ManageSession.gameEditMode,
      type: "image",
      x: CoordinatesTranslator.artworldToPhaser2DX(
        scene.worldSize.x,
        element.value.posX
      ),
      y: CoordinatesTranslator.artworldToPhaser2DY(
        scene.worldSize.y,
        element.value.posY
      ),
      locationDestination: "DefaultUserHome",
      locationText: locationDescription,
      locationImage: homeImageKey,
      referenceName: locationDescription,
      enterButtonImage: "enter_button",
      fontColor: 0x8dcb0e,
      color1: 0xffe31f,
      color2: 0xf2a022,
      color3: 0xf8d80b,
    })

    scene.homesRepresented[index].setDepth(30)
  }

  resolveLoadError(offendingFile) {
    // element, index, homeImageKey, offendingFile, scene
    ManageSession.resolveErrorObjectArray //all loading images

    let resolveErrorObject = ManageSession.resolveErrorObjectArray.find(o => o.imageKey == offendingFile.key)

    let loadFunction = resolveErrorObject.loadFunction
    let element = resolveErrorObject.element
    let index = resolveErrorObject.index
    let imageKey = offendingFile.key
    let scene = resolveErrorObject.scene

    // console.log("element, index, homeImageKey, offendingFile, scene", element, index, imageKey, scene)
    switch (loadFunction) {
      case ("getHomeImage"):
        console.log("load offendingFile again", imageKey)

        scene.load.image(imageKey, './assets/ball_grey.png')
          .on(`filecomplete-image-${imageKey}`, (imageKey) => {
            //delete from ManageSession.resolveErrorObjectArray
            ManageSession.resolveErrorObjectArray = ManageSession.resolveErrorObjectArray.filter((obj) => obj.imageKey !== imageKey)
            console.log("ManageSession.resolveErrorObjectArray", ManageSession.resolveErrorObjectArray)

            //create the home
            this.createHome(element, index, imageKey, scene);
          }, this)
        scene.load.start()
        break

      default:
        console.log("please state fom which function the loaderror occured!")
    }
  }

} //end ServerCall

export default new ServerCall()