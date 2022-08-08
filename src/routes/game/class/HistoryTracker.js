/* eslint-disable class-methods-use-this */
/* eslint-disable max-len */
import ManageSession from '../ManageSession';
import CoordinatesTranslator from './CoordinatesTranslator';
import { History } from '../../../session';
import { dlog } from '../helpers/DebugLog';

/** Keeps track of user locations, enables back button
 * @todo Refactor?
 */
class HistoryTracker {
  constructor() {
    this.tempHistoryArray = [];
  }

  pushLocation(scene) {
    dlog('this.pushLocation');
    // store the current scene in ManageSession for reference outside of Phaser (html ui)
    ManageSession.currentScene = scene;
    dlog('scene', scene);

    History.subscribe((value) => {
      this.tempHistoryArray = value;
    });

    // the current scene does not exist yet in History

    // if (this.tempHistoryArray.length > 0) {
    if (this.tempHistoryArray[this.tempHistoryArray.length - 1]?.locationID !== scene.location) {
      dlog('store scene in History tracker');
      // set ManageSession.playerPosX Y to player.x and y
      let playerPosX;
      let playerPosY;

      if (scene.player) {
        playerPosX = CoordinatesTranslator.Phaser2DToArtworldX(scene.worldSize.x, scene.player.x);
        playerPosY = CoordinatesTranslator.Phaser2DToArtworldY(scene.worldSize.y, scene.player.y);
        // dlog(" ManageSession.locationHistory.push playerPosX playerPosY", playerPosX, playerPosY)
      }
      this.tempHistoryArray.push({
        locationName: scene.scene.key, locationID: scene.location, playerPosX, playerPosY,
      });

      // if (this.tempHistoryArray.length > 1) {
      //   dlog("add to History array")
      //   //History.update({ locationName: scene.scene.key, locationID: scene.location, playerPosX: playerPosX, playerPosY: playerPosY })
      //   // History.update((value)=>{value.push("test"); return value})
      History.set(this.tempHistoryArray);
      // } else {
      //   dlog("add to History for the first time")
      // History.set({ locationName: scene.scene.key, locationID: scene.location, playerPosX: playerPosX, playerPosY: playerPosY })
      // }
    }
    // }
  }

  updatePositionCurrentScene(playerPosX, playerPosY) {
    if (this.tempHistoryArray.length > 0) {
      this.tempHistoryArray[this.tempHistoryArray.length - 1].playerPosX = playerPosX;
      this.tempHistoryArray[this.tempHistoryArray.length - 1].playerPosY = playerPosY;
    }
    // dlog("ManageSession.locationHistory[ManageSession.locationHistory.length - 1].playerPosX", ManageSession.locationHistory[ManageSession.locationHistory.length - 1].playerPosX)
    // dlog("ManageSession.locationHistory[ManageSession.locationHistory.length - 1].playerPosY", ManageSession.locationHistory[ManageSession.locationHistory.length - 1].playerPosY)
  }

  // eslint-disable-next-line no-unused-vars
  activateBackButton(scene) {
    // remove the current scene from the History
    this.tempHistoryArray.pop();
    History.set(this.tempHistoryArray);

    // and get access to it through its key
    const currentLocation = ManageSession.currentScene;
    // dlog("currentLocation", currentLocation)
    // getting access to the previous scene through locationHistory
    if (this.tempHistoryArray.length > 0) {
      const previousLocation = this.tempHistoryArray[this.tempHistoryArray.length - 1];
      // set up the player position in ManageSession to place the player in last known position when it is created
      ManageSession.playerPosX = previousLocation.playerPosX;
      ManageSession.playerPosY = previousLocation.playerPosY;
      dlog('ManageSession.playerPosX , ManageSession.playerPosY', ManageSession.playerPosX, ManageSession.playerPosY);
      // switching scenes
      this.switchScene(currentLocation, previousLocation.locationName, previousLocation.locationID);
    }
  }

  switchScene(scene, goToScene, locationID) {
    scene.physics.pause();
    scene.player.setTint(0xff0000);
    // dlog("switchScene leave scene.location", scene.location)
    ManageSession.socket.rpc('leave', scene.location);

    // dlog("switchScene goToScene", goToScene)
    // TODO: Figure out if scene.player has any setter functions instead of directly setting property
    scene.player.location = goToScene;

    scene.time.addEvent({
      delay: 700,
      callback: () => {
        ManageSession.location = goToScene;
        // ManageSession.createPlayer = true;
        console.log('scene.scene.stop(scene.scene.key)', scene.scene.key);
        scene.scene.stop(scene.scene.key);
        // dlog("scene.scene.start(goToScene, { user_id: locationID })", goToScene, locationID)

        scene.scene.start(goToScene, { user_id: locationID });
        console.log('switchScene locationID', locationID);
        ManageSession.location = locationID;
        console.log("ManageSession.getStreamUsers('join', locationID)", locationID);
        ManageSession.getStreamUsers('join', locationID);
      },
      callbackScope: scene,
      loop: false,
    });
  }

  async pauseSceneStartApp(scene, app) {
    scene.physics.pause();
    scene.scene.pause();

    await ManageSession.socket.rpc('leave', scene.location);
    await ManageSession.socket.rpc('join', app);
    // ManageSession.getStreamUsers("join", app)
    // open app
  }

  async startSceneCloseApp(scene, app) {
    if (!ManageSession.socket) return;
    await ManageSession.socket.rpc('leave', app);
    await ManageSession.getStreamUsers('join', ManageSession.location);

    dlog(scene);
    scene.physics.resume();
    scene.scene.resume();
    // close app
  }
}

export default new HistoryTracker();
