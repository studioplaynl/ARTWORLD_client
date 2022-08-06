import ManageSession from "../ManageSession"
import { getAccount, updateObject, listObjects, convertImage, listAllObjects } from '../../../api.js'
import GenerateLocation from "./GenerateLocation"
import CoordinatesTranslator from "./CoordinatesTranslator"
import { number } from "svelte-i18n"

class ServerCall {
  constructor() { }

  async getHomesFiltered(collection, filter, maxItems, scene) {
    //homes represented, to created homes in the scene
    scene.homesRepresented = []

    // when there is a loading error, the error gets thrown multiple times because I subscribe to the 'loaderror' event multiple times
    const eventNames = scene.load.eventNames()
    //if (ManageSession.debug) console.log("eventNames", eventNames)
    const isReady = scene.load.isReady()
    if (ManageSession.debug) console.log("isReady", isReady)
    const isLoading = scene.load.isLoading()
    if (ManageSession.debug) console.log("isLoading", isLoading)

    // subscribe to loaderror event
    scene.load.on(`loaderror`, (offendingFile) => {
      this.resolveLoadError(offendingFile)
    }, this)

    //get a list of all homes objects and then filter
    Promise.all([listObjects(collection, null, maxItems)])
      .then((rec) => {
        if (ManageSession.debug) console.log("rec homes: ", rec)
        scene.homes = rec[0]
        if (ManageSession.debug) console.log("scene.homes", scene.homes)
        // filter only amsterdam homes
        scene.homes = scene.homes.filter((obj) => obj.key == filter)

        // retreive how many artworks are in the home
        // let tempAllArtPerUser = []
        scene.homes.forEach((element, index) => {
          Promise.all([listAllObjects("drawing", element.user_id), listAllObjects("stopmotion", element.user_id)]).then((rec) => {

            rec.forEach((artElement) => {
              //if (ManageSession.debug) console.log("artElement", artElement)
              //add the array of art objects to the userHouse object
              element['artWorks'] = artElement
            })
            //if (ManageSession.debug) console.log("element", element)
          })

        })
        this.generateHomes(scene)

      })
  }

  async generateHomes(scene) {
    //check if server query is finished, then make the home from the list
    if (scene.homes != null) {
      console.log("generate homes!")
      //if (ManageSession.debug) console.log("scene.homes", scene.homes)
      scene.homes.forEach((element, index) => {
        //if (ManageSession.debug) console.log(element, index)
        //!to get the display name of the house we would have to get the user for each home
        //!it would be more effecient to that on boot: get all the exisiting users/ homes and store basic info about them 
        //!retreive that info locally (like display name)

        const homeImageKey = "homeKey_" + element.user_id
        // get a image url for each home
        // get converted image from AWS
        const url = element.value.url

        //check if homekey is already loaded
        if (scene.textures.exists(homeImageKey)) {
          //create the home
          //if (ManageSession.debug) console.log("element generateHomes textures.exists", element)
          this.createHome(element, index, homeImageKey, scene)

        } else {
          // get the image server side
          this.getHomeImages(url, element, index, homeImageKey, scene)
        }
      }) //end forEach
    }
  }

  async getHomeImages(url, element, index, homeImageKey, scene) {
    if (ManageSession.debug) console.log("getHomeImages")
    await convertImage(url, "128", "128", "png")
      .then((rec) => {
        //if (ManageSession.debug) console.log("rec", rec)
        // load all the images to phaser
        scene.load.image(homeImageKey, rec)
          .on(`filecomplete-image-${homeImageKey}`, (homeImageKey) => {
            //delete from ManageSession.resolveErrorObjectArray
            ManageSession.resolveErrorObjectArray = ManageSession.resolveErrorObjectArray.filter((obj) => obj.imageKey !== homeImageKey)
            // if (ManageSession.debug) console.log("ManageSession.resolveErrorObjectArray", ManageSession.resolveErrorObjectArray)
            //create the home
            this.createHome(element, index, homeImageKey, scene)
          }, this)
        // put the file in the loadErrorCache, in case it doesn't load, it get's removed when it is loaded successfully
        ManageSession.resolveErrorObjectArray.push({ loadFunction: "getHomeImage", element: element, index: index, imageKey: homeImageKey, scene: scene })
        scene.load.start() // start loading the image in memory
      })
  }

  createHome(element, index, homeImageKey, scene) {
    //if (ManageSession.debug) console.log(" createHome element.artWorks", element.artWorks)

    // home description
    const locationDescription = element.value.username
    //const homeImageKey = "homeKey_" + element.user_id
    // get a image url for each home
    // get converted image from AWS
    const url = element.value.url

    //let numberOfArtworks = element.artWorks.length
    // if (typeof element.artWorks == "undefined") {
    //   numberOfArtworks = 0
    // } else {
    //   numberOfArtworks = element.artWorks.length
    // }
    //if (ManageSession.debug) console.log("element.value.username, element.value.posX, element.value.posY", element.value.username, element.value.posX, element.value.posY)

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
      //numberOfArtworks: numberOfArtworks,
      locationText: locationDescription,
      locationImage: homeImageKey,
      referenceName: locationDescription,
      enterButtonImage: "enter_button",
      fontColor: 0x8dcb0e,
      color1: 0xffe31f,
      color2: 0xf2a022,
      color3: 0xf8d80b,
    })

    //make a home smaller when there is no art inside
    // if (typeof element.artWorks != "undefined" && element.artWorks.length < 1) {
    //   scene.homesRepresented[index].setScale(0.8)
    // }

    //set the house of SELF bigger
    if (element.user_id == ManageSession.userProfile.id) {
      scene.homesRepresented[index].setScale(1.6)
    }

    // add a bubble with the number of artworks in the house
    //scene.add.circle(CoordinatesTranslator.artworldToPhaser2DX(scene.worldSize.x,element.value.posX), CoordinatesTranslator.artworldToPhaser2DY(scene.worldSize.y, element.value.posY), 30, 0x7300ED).setOrigin(0.5, 0.5).setVisible(true).setDepth(499)

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

    //if (ManageSession.debug)  console.log("element, index, homeImageKey, offendingFile, scene", element, index, imageKey, scene)
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