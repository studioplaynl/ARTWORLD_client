/* eslint-disable class-methods-use-this */
/* eslint-disable max-len */
import { get } from 'svelte/store';
import ManageSession from '../ManageSession';
import { dlog } from '../helpers/DebugLog';
import { PlayerLocation, playerStreamID } from '../playerState';
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

    this.unsubscribeScene = PlayerLocation.subscribe(() => {
      dlog('player location changed, SceneSwitcher reacts');
      this.doSwitchScene();
    });
    // this.unsubscribeHouse = PlayerLocationHouse.subscribe(() => {
    //   this.doSwitchScene();
    // });
  }

  pushLocation(scene) {
    ManageSession.currentScene = scene;
  }

  switchScene(targetScene, targetHouse) {
    PlayerLocation.set({
      house: targetHouse,
      scene: targetScene,
    });
    this.doSwitchScene();
  }

  doSwitchScene() {
    const scene = ManageSession.currentScene;
    const targetScene = get(PlayerLocation).scene;
    const targetHouse = get(PlayerLocation).house;

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

    this.switchStream(scene, targetScene);
    // ManageSession.socket.rpc('leave', scene.scene.key).then((data) => {
    //   if (data.id === 'leave' && data.payload === 'Success') {
    //     dlog('leave socket succes', scene.scene.key);
    //     scene.scene.stop(scene.scene.key);

    //     if (targetHouse !== null && targetScene === DEFAULT_HOME) {
    //       scene.scene.start(targetScene, { user_id: targetHouse });
    //     } else if (targetScene) {
    //       scene.scene.start(targetScene);
    //     }
    //     if (targetScene) {
    //       ManageSession.getStreamUsers('join').then(() => {
    //         setLoader(false);
    //       });
    //     }
    //   }
    // }).catch((...args) => {
    //   Error.set('Something went wrong with the Socket', args);
    // });
  }

  async pauseSceneStartApp(scene, app) {
    if (scene) {
      scene.physics.pause();
      scene.scene.pause();

      this.switchStream(scene, app);

      // await ManageSession.socket.rpc('leave', get(playerStreamID));
      // await ManageSession.socket.rpc('join', app);
    }
    // ManageSession.getStreamUsers("join", app)
    // open app
  }

  async startSceneCloseApp(scene, app) {
    if (!ManageSession.socket) return;

    this.switchStream(scene, app);
    // await ManageSession.socket.rpc('leave', app);
    // await ManageSession.getStreamUsers('join');

    dlog(scene.scene.key);

    scene.scene.resume();
    // scene.physics.resume();
    // close app
  }

  async switchStream(scene, targetScene) {
    const targetHouse = get(PlayerLocation).house;
    ManageSession.socket.rpc('leave', scene.scene.key).then((data) => {
      if (data.id === 'leave' && data.payload === 'Success') {
        dlog('leave socket succes', scene.scene.key);
        scene.scene.stop(scene.scene.key);

        if (targetHouse !== null && targetScene === DEFAULT_HOME) {
          scene.scene.start(targetScene, { user_id: targetHouse });
        } else if (targetScene) {
          scene.scene.start(targetScene);
        }
        if (targetScene) {
          ManageSession.getStreamUsers('join').then(() => {
            setLoader(false);
          });
        }
      }
    }).catch((...args) => {
      Error.set('Something went wrong with the Socket', args);
    });
  }
}



export default new SceneSwitcher();
