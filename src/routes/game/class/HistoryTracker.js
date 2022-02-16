import ManageSession from "../ManageSession";

class HistoryTracker {
  constructor() { }

  pushLocation(scene) {
    // if (scene.scene.key == "DefaultUserHome") { // if the player entering a house, push a house id
    //   if (ManageSession.locationHistory[ManageSession.locationHistory.length - 1].homeID != scene.location) {
    //     ManageSession.locationHistory.push({ locationName: "DefaultUserHome", homeID: scene.location });
    //   }
    // } else { // otherwise, push location name only
    //   if (ManageSession.locationHistory[ManageSession.locationHistory.length - 1] != scene.location) {
    //     ManageSession.locationHistory.push(scene.location);
    //   }
    // }

    if (ManageSession.locationHistory[ManageSession.locationHistory.length - 1]?.locationID != scene.location) {
      ManageSession.locationHistory.push({ locationName: scene.scene.key, locationID: scene.location })
    }
  }

  switchScene(scene, goToScene, locationID) {
    scene.physics.pause();
    scene.player.setTint(0xff0000);

    ManageSession.socket.rpc("leave", scene.location);

    scene.player.location = goToScene;

    scene.time.addEvent({
      delay: 1000,
      callback: () => {
        ManageSession.location = goToScene;
        ManageSession.createPlayer = true;
        scene.scene.stop(scene.scene.key);
        scene.scene.start(goToScene, { user_id: locationID })
        ManageSession.getStreamUsers("join", locationID);
      },
      callbackScope: scene,
      loop: false,
    });
  }

}

export default new HistoryTracker()