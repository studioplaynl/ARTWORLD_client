import ManageSession from "../ManageSession";

class HistoryTracker {
  constructor() { }

  // for track of locations switch
  locationPush(scene) {
    // don't push the location to the history if it is already in the array as the last index
    if (ManageSession.locationHistory[ManageSession.locationHistory.length - 1] != scene.location) {
      ManageSession.locationHistory.push(scene.location);
    }
  }

  // for track of homes switch
  homePush(scene) {
    // don't push the home to the history if it is already in the array as the last index
    if (ManageSession.locationHistory[ManageSession.locationHistory.length - 1].homeID != scene.location) {
      ManageSession.locationHistory.push({ locationName: "DefaultUserHome", homeID: scene.location });
    }
  }

  switchScene(scene, goToScene, userID) {
    scene.physics.pause();
    scene.player.setTint(0xff0000);

    ManageSession.socket.rpc("leave", scene.location);

    scene.player.location = goToScene;

    scene.time.addEvent({
      delay: 500,
      callback: () => {
        ManageSession.location = goToScene;
        ManageSession.createPlayer = true;
        ManageSession.getStreamUsers("join", goToScene);
        scene.scene.stop(scene.scene.key);
        if (userID) {
          scene.scene.start(goToScene, {
            user_id: userID,
          });
        } else {
          scene.scene.start(goToScene);
        }
      },
      callbackScope: scene,
      loop: false,
    });
  }

}

export default new HistoryTracker()