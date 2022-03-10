import ManageSession from "../ManageSession"

class HistoryTracker {
  constructor() { }

  pushLocation(scene) {
    if (ManageSession.locationHistory[ManageSession.locationHistory.length - 1]?.locationID != scene.location) {
      // set ManageSession.playerPosX Y to player.x and y
      if (!!scene.player){
        // ManageSession.playerPosX = scene.player.x
        // ManageSession.playerPosY = scene.player.y
      }
      ManageSession.locationHistory.push({ locationName: scene.scene.key, locationID: scene.location })
    }
  }

  switchScene(scene, goToScene, locationID) {
    scene.physics.pause()
    scene.player.setTint(0xff0000)

    console.log("switchScene leave scene.location", scene.location)
    ManageSession.socket.rpc("leave", scene.location)

    console.log("switchScene goToScene", goToScene)
    scene.player.location = goToScene

    scene.time.addEvent({
      delay: 500,
      callback: () => {
        ManageSession.location = goToScene
        ManageSession.createPlayer = true
        scene.scene.stop(scene.scene.key)
        scene.scene.start(goToScene, { user_id: locationID })
        console.log("switchScene locationID", locationID)
        ManageSession.location = locationID
        ManageSession.getStreamUsers("join", locationID)
      },
      callbackScope: scene,
      loop: false,
    })
  }

}

export default new HistoryTracker()