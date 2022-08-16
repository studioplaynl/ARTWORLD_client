/* eslint-disable class-methods-use-this */
/* eslint-disable max-len */
import { get } from 'svelte/store';
import ManageSession from '../ManageSession';
import { dlog } from '../helpers/DebugLog';
import { playerLocationScene, playerLocationHouse, playerStreamID } from '../playerState';
import { DEFAULT_HOME } from '../../../constants';
import { Error } from '../../../session';
import { setLoader } from '../../../api';
// import { push, querystring} from "svelte-spa-router";


/** Keeps track of user locations, enables back button
 * @todo Refactor?
 */
class SceneSwitcher {
  constructor() {
    this.tempHistoryArray = [];

    this.unsubscribeScene = playerLocationScene.subscribe(() => {
      this.doSwitchScene();
    });
    this.unsubscribeHouse = playerLocationHouse.subscribe(() => {
      this.doSwitchScene();
    });
  }

  pushLocation(scene) {
    dlog('this.pushLocation');
    // store the current scene in ManageSession for reference outside of Phaser (html ui)
    ManageSession.currentScene = scene;
    dlog('scene.location', scene.location);
  }

  updatePositionCurrentScene(playerPosX, playerPosY) {
    if (this.tempHistoryArray.length > 0) {
      this.tempHistoryArray[this.tempHistoryArray.length - 1].playerPosX = playerPosX;
      this.tempHistoryArray[this.tempHistoryArray.length - 1].playerPosY = playerPosY;
    }
  }

  switchScene(targetScene, targetHouse) {
    playerLocationScene.set(targetScene);
    playerLocationHouse.set(targetHouse);
  }

  doSwitchScene() {
    const scene = ManageSession.currentScene;
    const targetLocation = get(playerLocationScene);
    const targetHouse = get(playerLocationHouse);

    if (targetLocation === DEFAULT_HOME && targetHouse === null) {
      return;
    }

    if (!scene || !scene?.player) return;

    // console.log('doSwitchScene, set loader to true, leaving', scene.location);
    setLoader(true);

    // console.log('SWITCH: ', targetLocation, targetHouse);

    scene.physics.pause();
    scene.player.setTint(0xff0000);

    ManageSession.socket.rpc('leave', scene.location).then((data) => {
      if (data.id === 'leave' && data.payload === 'Success') {
        scene.scene.stop(scene.scene.key);

        if (targetHouse !== null && targetLocation === DEFAULT_HOME) {
          scene.scene.start(targetLocation, { user_id: targetHouse });
          ManageSession.getStreamUsers('join').then(() => {
            // console.log('doSwitchScene resolved, set loader to false');
            setLoader(false);
          });
        } else if (targetLocation) {
          playerLocationHouse.set(null);
          scene.scene.start(targetLocation);
          ManageSession.getStreamUsers('join').then(() => {
            // console.log('doSwitchScene resolved, set loader to false');
            setLoader(false);
          });
        }
      }
    }).catch((...args) => {
      Error.set('Something went wrong with the Socket', args);
    });
  }

  async pauseSceneStartApp(scene, app) {
    if (scene) {
      scene.physics.pause();
      scene.scene.pause();

      await ManageSession.socket.rpc('leave', get(playerStreamID));
      await ManageSession.socket.rpc('join', app);
    }
    // ManageSession.getStreamUsers("join", app)
    // open app
  }

  async startSceneCloseApp(scene, app) {
    if (!ManageSession.socket) return;
    await ManageSession.socket.rpc('leave', app);
    await ManageSession.getStreamUsers('join');

    dlog(scene);
    scene.physics.resume();
    scene.scene.resume();
    // close app
  }
}

export default new SceneSwitcher();
