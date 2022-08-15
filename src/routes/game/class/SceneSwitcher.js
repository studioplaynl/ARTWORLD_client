/* eslint-disable class-methods-use-this */
/* eslint-disable max-len */
import { get } from 'svelte/store';
import ManageSession from '../ManageSession';
import { dlog } from '../helpers/DebugLog';
import { playerLocation, playerStreamID } from '../playerState';
import { DEFAULT_HOME } from '../../../constants';
import { Error } from '../../../session';
import { setLoader } from '../../../api';
// import { ListFormat } from 'typescript';
// import { push, querystring} from "svelte-spa-router";


/** Keeps track of user locations, enables back button
 * @todo Refactor?
 */
class SceneSwitcher {
  constructor() {
    // this.tempHistoryArray = [];

    this.unsubscribeScene = playerLocation.subscribe(() => {
      this.doSwitchScene();
    });
    // this.unsubscribeHouse = playerLocationHouse.subscribe(() => {
    //   this.doSwitchScene();
    // });
  }

  pushLocation(scene) {
    ManageSession.currentScene = scene;
  }

  switchScene(targetScene, targetHouse) {
    playerLocation.set({
      house: targetHouse,
      scene: targetScene,
    });
    // playerLocationHouse.set(targetHouse);
  }

  doSwitchScene() {
    const scene = ManageSession.currentScene;
    const targetScene = get(playerLocation).scene;
    const targetHouse = get(playerLocation).house;

    if (targetScene === DEFAULT_HOME && targetHouse === null) {
      return;
    }

    if (!scene || !scene?.player) return;

    // console.log('SceneSwitcher: continue with doSwitchScene', scene, targetScene, targetHouse);

    // console.log('doSwitchScene, set loader to true, leaving', scene.location);
    setLoader(true);

    // console.log('SWITCH: ', targetScene, targetHouse);

    scene.physics.pause();
    scene.player.setTint(0xff0000);

    ManageSession.socket.rpc('leave', scene.location).then((data) => {
      if (data.id === 'leave' && data.payload === 'Success') {
        scene.scene.stop(scene.scene.key);

        if (targetHouse !== null && targetScene === DEFAULT_HOME) {
          scene.scene.start(targetScene, { user_id: targetHouse });
          ManageSession.getStreamUsers('join').then(() => {
            // console.log('doSwitchScene resolved, set loader to false');
            setLoader(false);
          });
        } else if (targetScene) {
          // playerLocationHouse.set(null);
          scene.scene.start(targetScene);
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
