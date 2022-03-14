import ManageSession from "../ManageSession"
import { getAccount, updateObject, convertImage, listObjects } from '../../../api.js'
import GenerateLocation from "./GenerateLocation"
import CoordinatesTranslator from "./CoordinatesTranslator"

class Homes {
    constructor() {

    }

    async getHomesFiltered(collection, filter, maxItems, scene) {
        //get a list of all homes objects and then filter
        Promise.all([listObjects(collection, null, maxItems)])
          .then((rec) => {
            //console.log("rec: ", rec)
            scene.homes = rec[0]
    
            // filter only amsterdam homes
            scene.homes = scene.homes.filter((obj) => obj.key == filter)
    
            console.log("scene.homes", scene.homes)
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
              this.createHome(element, index, scene)
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
                //create the home
                this.createHome(element, index, homeImageKey, scene)
              }, this)
              .on(`loaderror`, (offendingFile) => { this.resolveLoadError(element, index, homeImageKey, offendingFile, scene) }, this)
            scene.load.start() // start loading the image in memory
          })
      }
    
      resolveLoadError(element, index, homeImageKey, offendingFile, scene) {
        //console.log("element, index, homeImageKey, offendingFile", element, index, homeImageKey, offendingFile)
        //console.log("offendingFile", offendingFile)
        const tempKey = 'homeKey_' + element.user_id
        if (tempKey == offendingFile.key) {
          let cachObject = { element: element, index: index, homeImageKey: homeImageKey, offendingFile: offendingFile }
          scene.resolveLoadErrorCache.push(cachObject)
    
          console.log("load offendingFile again", homeImageKey)
          scene.load.image(homeImageKey, './assets/ball_grey.png')
            .on(`filecomplete-image-${homeImageKey}`, (homeImageKey) => {
              //create the home
              this.createHome(element, index, homeImageKey, scene)
            }, this)
          scene.load.start()
        }
        //Phaser.Loader.File.resetXHR()
        //console.log("Phaser.Loader", Phaser.Loader.File)
      }
    
      createHome(element, index, homeImageKey, scene) {
        // home description
        //console.log(element)
        const locationDescription = element.value.username
        //const homeImageKey = "homeKey_" + element.user_id
        // get a image url for each home
        // get converted image from AWS
        const url = element.value.url
    
        scene.homesRepreseneted[index] = new GenerateLocation({
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
    
        scene.homesRepreseneted[index].setDepth(30)
      }

}

export default new Homes()