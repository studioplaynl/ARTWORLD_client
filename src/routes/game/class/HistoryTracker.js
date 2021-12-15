import ManageSession from "../ManageSession";

class HistoryTracker {
  constructor() {}

  push(scene) {
    if (ManageSession.locationHistory[ManageSession.locationHistory.length - 1] == scene.location) {
      return
    } else {
      ManageSession.locationHistory.push(scene.location);
    }
  }

}

export default new HistoryTracker()