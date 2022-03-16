import ManageSession from "../ManageSession"
import CoordinatesTranslator from "./CoordinatesTranslator"

class HistoryTracker {
  constructor() { }

  pushLocation(scene) {
    //store the current scene in ManageSession for reference outside of Phaser (html ui)
    ManageSession.currentScene = scene
    //console.log("ManageSession.currentScene", ManageSession.currentScene)

    if (ManageSession.locationHistory[ManageSession.locationHistory.length - 1]?.locationID != scene.location) {
      // set ManageSession.playerPosX Y to player.x and y
      let playerPosX
      let playerPosY

      if (!!scene.player) {
        // ManageSession.playerPosX = scene.player.x
        // ManageSession.playerPosY = scene.player.y
        // playerPosX = CoordinatesTranslator.Phaser2DToArtworldX(scene.worldSize.x, scene.player.x)
        // playerPosY = CoordinatesTranslator.Phaser2DToArtworldY(scene.worldSize.y, scene.player.y)
        playerPosX = CoordinatesTranslator.Phaser2DToArtworldX(scene.worldSize.x, scene.player.x)
        playerPosY = CoordinatesTranslator.Phaser2DToArtworldY(scene.worldSize.y, scene.player.y)
        console.log("playerPosX playerPosY", playerPosX, playerPosY)
      }
      ManageSession.locationHistory.push({ locationName: scene.scene.key, locationID: scene.location, playerPosX: playerPosX, playerPosY: playerPosY })
    }
  }

  activateBackButton(scene) {
    // removing the current last scene from the history
    const currentLocationKey = ManageSession.locationHistory.pop()
    // console.log("currentLocationKey", currentLocationKey)
    // and getting access to it through its key
    const currentLocation = scene.get(currentLocationKey.locationName)
    // console.log("currentLocation", currentLocation)
    // getting access to the previous scene through locationHistory
    const previousLocation = ManageSession.locationHistory[ManageSession.locationHistory.length - 1]

    //set up the player position in ManageSession to place the player in last known position when it is created
    ManageSession.playerPosX = previousLocation.playerPosX
    ManageSession.playerPosY = previousLocation.playerPosY
    console.log("ManageSession.playerPosX , previousLocation.playerPosX", ManageSession.playerPosX, previousLocation.playerPosX)
    // switching scenes
    this.switchScene(currentLocation, previousLocation.locationName, previousLocation.locationID)
  }

  switchScene(scene, goToScene, locationID) {
    scene.physics.pause()
    scene.player.setTint(0xff0000)
    console.log()
    //console.log("switchScene leave scene.location", scene.location)
    ManageSession.socket.rpc("leave", scene.location)

    //console.log("switchScene goToScene", goToScene)
    scene.player.location = goToScene

    scene.time.addEvent({
      delay: 700,
      callback: () => {
        ManageSession.location = goToScene
        ManageSession.createPlayer = true
        // console.log("scene.scene.stop(scene.scene.key)", scene.scene.key)
        scene.scene.stop(scene.scene.key)
        // console.log("scene.scene.start(goToScene, { user_id: locationID })", goToScene, locationID)

        scene.scene.start(goToScene, { user_id: locationID })
        //console.log("switchScene locationID", locationID)
        ManageSession.location = locationID
        // console.log("ManageSession.getStreamUsers('join', locationID)", locationID)
        ManageSession.getStreamUsers("join", locationID)
      },
      callbackScope: scene,
      loop: false,
    })
  }

}

export default new HistoryTracker()