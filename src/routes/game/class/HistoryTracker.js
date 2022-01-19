import ManageSession from "../ManageSession";

class HistoryTracker {
  constructor() {}

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
        ManageSession.locationHistory.push({locationName: "DefaultUserHome", homeID: scene.location});
    }
  }

}

export default new HistoryTracker()