import ManageSession from "../ManageSession.js"
import { getAccount, listObjects, setLoader, url } from '../../../api.js'

export default class MainMenu extends Phaser.Scene {
  constructor() {
    super("MainMenu")

  }

  preload() {
  }

  async create() {
    // a tile sprite repeats background, should be done with small images
    // this.bg = this.add
    //   .tileSprite(
    //     0,
    //     0,
    //     this.sys.game.canvas.width,
    //     this.sys.game.canvas.height,
    //     "background4"
    //   )
    //   .setOrigin(0)

    //setLoader(true)


    //on resizing the window
    // this.scale.on("resize", this.resize, this)

    //* check if the user profile is loaded, to be able to send the player to the right location
    //* check if there are params in the url, to send the player to that location instead
    let urlParams = ManageSession.getUrl()
    console.log("urlParams", urlParams)

    // if there is a location parameter in the url
    if (!!urlParams.location) { // if there is a .location but it is invalid, the url should also not be parsed!
      this.parseLocation(urlParams)
    } else if (!!ManageSession.userProfile) { // otherwise get the location stored serverside 
      this.parsePlayerPosition(ManageSession.userProfile.meta.posX, ManageSession.userProfile.meta.posY)
      const urlParams = { posX: ManageSession.playerPosX, posY: ManageSession.playerPosY, location: ManageSession.userProfile.meta.location }
      this.parseLocation(urlParams)
    } else { //if the account is empty, get it 
      getAccount("", true)
        .then(rec => {
          ManageSession.userProfile = rec
          this.parsePlayerPosition(ManageSession.userProfile.meta.posX, ManageSession.userProfile.meta.posY)
          const urlParams = { posX: ManageSession.playerPosX, posY: ManageSession.playerPosY, location: ManageSession.userProfile.meta.location }
          this.parseLocation(urlParams)
        })
    }
  } //create

  parseLocation(urlParams) {
    const locationName = urlParams.location
    console.log("urlParams, locationName", urlParams, locationName)
    // check if location is of DefaultUserHome_user_ID format
    let splitString = locationName.split('_')

    // if true then location is DefaultUserHome_user_ID
    if (splitString.length > 1) {
      console.log("splitString.length > 1 '_' locationName: ", locationName)
      //check if first part is DefaultUserHome
      if (ManageSession.checkIfSceneExists(splitString[0])) {
        this.parsePlayerPosition(urlParams.posX, urlParams.posY)
        this.prepareLaunchSceneAndSwitch(splitString[0], splitString[1])
      } else {
        // send to default position
        this.parsePlayerPosition(null, null)
        //goto default location
        this.prepareLaunchSceneAndSwitch("ArtworldAmsterdam", "ArtworldAmsterdam")
      }
    } else {
      // if location is of _user_ID format 
      splitString = locationName.split('-')
      console.log("locationName.split('-') locationName: ", locationName)
      if (splitString.length > 3) {
        Promise.all([listObjects("home", locationName, 10)])
          .catch((rec) => {
            console.log("error getting the home object")
            this.parsePlayerPosition(null, null)
            this.prepareLaunchSceneAndSwitch("ArtworldAmsterdam", "ArtworldAmsterdam")
          })
          .then((rec) => {
            console.log("rec: ", rec)

            if (!!rec) {
              // filter only amsterdam homes
              //scene.homes = scene.homes.filter((obj) => obj.key == filter)
              console.log("splitString.length > 3 ('-') locationName: ", locationName)
              // locationName is user_id format
              this.parsePlayerPosition(urlParams.posX, urlParams.posY)
              this.prepareLaunchSceneAndSwitch("DefaultUserHome", locationName)
            } else {
              // if rec is empty, user does not exists
              console.log("userID does not return home")
              this.parsePlayerPosition(null, null)
              this.prepareLaunchSceneAndSwitch("ArtworldAmsterdam", "ArtworldAmsterdam")
            }

          })

      } else {
        // format is a single String: check if sceneName exists, except when it is DefaultUserHome: we can't send players there, as it is a template scene
        if (locationName == "DefaultUserHome") {
          // send to default location
          this.parsePlayerPosition(null, null)
          this.prepareLaunchSceneAndSwitch("ArtworldAmsterdam", "ArtworldAmsterdam")
        } else if (ManageSession.checkIfSceneExists(locationName)) {
          this.parsePlayerPosition(urlParams.posX, urlParams.posY)
          this.prepareLaunchSceneAndSwitch(locationName, locationName)
        } else {
          // if the sceneName doesn't exist, send to default location
          this.parsePlayerPosition(null, null)
          this.prepareLaunchSceneAndSwitch("ArtworldAmsterdam", "ArtworldAmsterdam")
        }
      }
    }
  } // end parseLocation

  prepareLaunchSceneAndSwitch(location, locationID) {
    console.log("Launch: ", location, locationID)
    ManageSession.location = location // scene key
    ManageSession.locationID = locationID // in case of DefaultUserHome = user_id
    this.scene.stop("MainMenu")
    this.scene.start("NetworkBoot")
  }

  parsePlayerPosition(posX, posY) {
    if (!!posX) {
      //if it exists and isn't null
      console.log("parsed posX:", posX)
      ManageSession.playerPosX = parseInt(posX) //expected artworldCoordinates
    } else {
      // a random number between -150 and 150
      ManageSession.playerPosX = Math.floor((Math.random() * 300) - 150)
      console.log("no known posX, created...", ManageSession.playerPosX)
    }

    if (!!posY) {
      //if it exists and isn't null
      console.log("parsed posY:", posY)
      ManageSession.playerPosY = parseInt(posY) //expected artworldCoordinates
    } else {
      // a random number between -150 and 150
      ManageSession.playerPosY = Math.floor((Math.random() * 300) - 150)
      console.log("no known posY, created...", ManageSession.playerPosY)
    }
  }

  resize() {
    let width = this.sys.game.canvas.width;
    let height = this.sys.game.canvas.height;

    this.bg.setSize(width, height);
  }

  update() {

  } // end update
}
