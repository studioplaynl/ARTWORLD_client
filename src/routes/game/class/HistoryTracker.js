import ManageSession from "../ManageSession"
import CoordinatesTranslator from "./CoordinatesTranslator"
import { history } from "../../../session"
//import { onDestroy, get } from "svelte" // cant get it to work


class HistoryTracker {
  constructor() {
    this.tempHistoryArray
  }

  pushLocation(scene) {
    console.log("this.pushLocation")
    //store the current scene in ManageSession for reference outside of Phaser (html ui)
    ManageSession.currentScene = scene
    //console.log("scene", scene)
    //console.log("ManageSession.currentScene", ManageSession.currentScene)

    history.subscribe((value) => {
      //console.log("history value", value)
      this.tempHistoryArray = value
      //console.log("history this.tempHistoryArray", this.tempHistoryArray)
    })

    // const tempArray = get(history) //can't get it to work
    // console.log("tempArray", tempArray)

    //the current scene does not exist yet in history
    if (this.tempHistoryArray[this.tempHistoryArray.length - 1]?.locationID != scene.location) {
      if (ManageSession.debug) console.log("store scene in history tracker")
      // set ManageSession.playerPosX Y to player.x and y
      let playerPosX
      let playerPosY

      if (!!scene.player) {
        playerPosX = CoordinatesTranslator.Phaser2DToArtworldX(scene.worldSize.x, scene.player.x)
        playerPosY = CoordinatesTranslator.Phaser2DToArtworldY(scene.worldSize.y, scene.player.y)
        //console.log(" ManageSession.locationHistory.push playerPosX playerPosY", playerPosX, playerPosY)
      }
      this.tempHistoryArray.push({ locationName: scene.scene.key, locationID: scene.location, playerPosX: playerPosX, playerPosY: playerPosY })

      // if (this.tempHistoryArray.length > 1) {
      //   console.log("add to history array")
      //   //history.update({ locationName: scene.scene.key, locationID: scene.location, playerPosX: playerPosX, playerPosY: playerPosY })
      //   // history.update((value)=>{value.push("test"); return value})
      history.set(this.tempHistoryArray)
      // } else {
      //   console.log("add to history for the first time")
      // history.set({ locationName: scene.scene.key, locationID: scene.location, playerPosX: playerPosX, playerPosY: playerPosY })
      // }

    }
  }

  updatePositionCurrentScene(playerPosX, playerPosY) {
    this.tempHistoryArray[this.tempHistoryArray.length - 1].playerPosX = playerPosX
    this.tempHistoryArray[this.tempHistoryArray.length - 1].playerPosY = playerPosY
    // console.log("ManageSession.locationHistory[ManageSession.locationHistory.length - 1].playerPosX", ManageSession.locationHistory[ManageSession.locationHistory.length - 1].playerPosX)
    // console.log("ManageSession.locationHistory[ManageSession.locationHistory.length - 1].playerPosY", ManageSession.locationHistory[ManageSession.locationHistory.length - 1].playerPosY)
  }

  activateBackButton(scene) {
    // remove the current scene from the history
    const currentLocationKey = this.tempHistoryArray.pop()
    history.set(this.tempHistoryArray)
    //console.log("currentLocationKey", currentLocationKey)
    // console.log("currentLocationKey", currentLocationKey)
    // and getting access to it through its key
    const currentLocation = ManageSession.currentScene
    // console.log("currentLocation", currentLocation)
    // getting access to the previous scene through locationHistory
    const previousLocation = this.tempHistoryArray[this.tempHistoryArray.length - 1]

    //set up the player position in ManageSession to place the player in last known position when it is created
    ManageSession.playerPosX = previousLocation.playerPosX
    ManageSession.playerPosY = previousLocation.playerPosY
    if (ManageSession.debug) console.log("ManageSession.playerPosX , ManageSession.playerPosY", ManageSession.playerPosX, ManageSession.playerPosY)
    // switching scenes
    this.switchScene(currentLocation, previousLocation.locationName, previousLocation.locationID)
  }

  switchScene(scene, goToScene, locationID) {
    scene.physics.pause()
    scene.player.setTint(0xff0000)
    //if (ManageSession.debug) console.log("switchScene leave scene.location", scene.location)
    ManageSession.socket.rpc("leave", scene.location)

    //console.log("switchScene goToScene", goToScene)
    scene.player.location = goToScene

    scene.time.addEvent({
      delay: 700,
      callback: () => {
        ManageSession.location = goToScene
        ManageSession.createPlayer = true
        // if (ManageSession.debug) console.log("scene.scene.stop(scene.scene.key)", scene.scene.key)
        scene.scene.stop(scene.scene.key)
        // if (ManageSession.debug) console.log("scene.scene.start(goToScene, { user_id: locationID })", goToScene, locationID)


        scene.scene.start(goToScene, { user_id: locationID })
        //if (ManageSession.debug) console.log("switchScene locationID", locationID)
        ManageSession.location = locationID
        // if (ManageSession.debug) console.log("ManageSession.getStreamUsers('join', locationID)", locationID)
        ManageSession.getStreamUsers("join", locationID)
      },
      callbackScope: scene,
      loop: false,
    })

  }
  async pauseSceneStartApp(scene, app) {
    // scene.physics.pause()
    // scene.scene.pause()

    //!changed from pausing to stopping the scene to save resources
    //! also reloading the scene updates houses etc
    scene.scene.stop()
    if (ManageSession.debug) console.log("scene.scene.stop()")
    await ManageSession.socket.rpc("leave", scene.location)
    await ManageSession.socket.rpc("join", app)
    //ManageSession.getStreamUsers("join", app)
    // open app
  }

  async startSceneCloseApp(scene, app) {
    if (!!!ManageSession.socket) return
    await ManageSession.socket.rpc("leave", app)

    await ManageSession.getStreamUsers("join", ManageSession.location)

    if (ManageSession.debug) console.log(scene)
    // scene.physics.resume()
    // scene.scene.resume()

    //!changed from pausing to stopping the scene to save resources
    //! also reloading the scene updates houses etc
    if (ManageSession.debug) console.log("scene.scene.restart()")
    scene.scene.start()
    
    //close app
  }

  
}

export default new HistoryTracker()