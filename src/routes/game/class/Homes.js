import { getAccount, updateObject, convertImage, listObjects } from '../../../api.js'
import GenerateLocation from "./GenerateLocation"
import CoordinatesTranslator from "./CoordinatesTranslator"
import ManageSession from '../ManageSession.js'

class Homes {
    constructor() {

        this.resolveErrorObjectArray = []
    }

    async getHomesFiltered(collection, filter, maxItems, scene) {
        //homes represented, to created homes in the scene
        scene.homesRepresented = []

        // when there is a loading error, the error gets thrown multiple times because I subscribe to the 'loaderror' event multiple times
        const eventNames = scene.load.eventNames()
        console.log("eventNames", eventNames)
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
                //console.log("rec: ", rec)
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
        await convertImage(url, "128", "png")
            .then((rec) => {
                //console.log("rec", rec)
                // load all the images to phaser
                scene.load.image(homeImageKey, rec)
                    .on(`filecomplete-image-${homeImageKey}`, (homeImageKey) => {
                        //delete from this.resolveErrorObjectArray
                        this.resolveErrorObjectArray = this.resolveErrorObjectArray.filter((obj) => obj.imageKey !== homeImageKey)
                       // console.log("this.resolveErrorObjectArray", this.resolveErrorObjectArray)
                        //create the home
                        this.createHome(element, index, homeImageKey, scene)
                    }, this)
                // put the file in the loadErrorCache, incase it doesn't load
                this.resolveErrorObjectArray.push({ loadFunction: "getHomeImage", element: element, index: index, imageKey: homeImageKey, scene: scene })
                scene.load.start() // start loading the image in memory
            })
    }

    resolveLoadError(offendingFile) {
        // element, index, homeImageKey, offendingFile, scene
        this.resolveErrorObjectArray //all loading images

        let resolveErrorObject = this.resolveErrorObjectArray.find(o => o.imageKey == offendingFile.key)

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
                        //delete from this.resolveErrorObjectArray
                        this.resolveErrorObjectArray = this.resolveErrorObjectArray.filter((obj) => obj.imageKey !== imageKey)
                        console.log("this.resolveErrorObjectArray", this.resolveErrorObjectArray)

                        //create the home
                        this.createHome(element, index, imageKey, scene);
                    }, this)
                scene.load.start()
                break

            default:
                console.log("please state fom which function the loaderror occured!")
        }
    }

    createHome(element, index, homeImageKey, scene) {
        // home description
        //console.log(element)
        const locationDescription = element.value.username
        //const homeImageKey = "homeKey_" + element.user_id
        // get a image url for each home
        // get converted image from AWS
        const url = element.value.url

        scene.homesRepresented[index] = new GenerateLocation({
            scene: scene,
            size: 140,
            userHome: element.user_id,
            draggable: false,
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
            enterButtonImage: "enter_button",
            fontColor: 0x8dcb0e,
            color1: 0xffe31f,
            color2: 0xf2a022,
            color3: 0xf8d80b,
        })

        scene.homesRepresented[index].setDepth(30)
    }

}

export default new Homes()