import ManageSession from "../ManageSession"

class HistoryTracker {
  constructor() { }

  pushLocation(scene) {
    //store the current scene in ManageSession for reference outside of Phaser (html ui)
    ManageSession.currentScene = scene
    //console.log("ManageSession.currentScene", ManageSession.currentScene)

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

    //console.log("switchScene leave scene.location", scene.location)
    ManageSession.socket.rpc("leave", scene.location)

    //console.log("switchScene goToScene", goToScene)
    scene.player.location = goToScene

    scene.time.addEvent({
      delay: 700,
      callback: () => {
        ManageSession.location = goToScene
        ManageSession.createPlayer = true
        console.log("scene.scene.stop(scene.scene.key)", scene.scene.key)
        scene.scene.stop(scene.scene.key)
        console.log("scene.scene.start(goToScene, { user_id: locationID })", goToScene, locationID)
        scene.scene.start(goToScene, { user_id: locationID })
        //console.log("switchScene locationID", locationID)
        ManageSession.location = locationID
        console.log("ManageSession.getStreamUsers('join', locationID)", locationID)
        ManageSession.getStreamUsers("join", locationID)
      },
      callbackScope: scene,
      loop: false,
    })
  }

}

export default new HistoryTracker()