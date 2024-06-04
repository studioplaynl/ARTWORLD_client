import { get } from 'svelte/store';
import ManageSession from '../ManageSession';
import { dlog, dwarn } from '../../../helpers/debugLog';
import { PlayerLocation } from '../playerState';
import { DEFAULT_HOME } from '../../../constants';
import { Error, ShowHomeEditBar } from '../../../session';
import { setLoader } from '../../../helpers/nakamaHelpers';

/** Keeps track of user locations, enables back button
 * In this file I switch phaser scenes and change the nakama stream subscription. There are a few cases:
* 1. go from phaser scene to phaser scene we leave first nakama stream and join the next this s
* stops the first phaser scene and start the next (.start does this)

* 2. go from phaser scene to app we leave first nakama stream 
* and join the next we pause the phaser scene and start an app

* 3. we go from app to phaser scene we leave first nakama stream 
* and join the next we resume phaser scene and leave the app
*/

class SceneSwitcher {
  constructor() {
    this.unsubscribeScene = PlayerLocation.subscribe(() => {
      // dlog('\u001b[31m PlayerLocation', get(PlayerLocation));
      // dlog('\u001b[31m playerStreamID', get(playerStreamID));
      // const history = get(PlayerHistory);
      this.doSwitchScene();
    });
    // this.unsubscribeHouse = PlayerLocationHouse.subscribe(() => {
    //   this.doSwitchScene();
    // });
  }

  pushLocation(scene) {
    dwarn('pushLocation is deprecated!');
    dlog(scene);
  }

  doSwitchScene() {
    // dlog('HistoryBug: doSwitchScene called');
    const scene = ManageSession.currentScene;
    const targetScene = get(PlayerLocation).scene;
    const targetHouse = get(PlayerLocation).house;

    // debugging
    let sceneKey;
    let targetSceneKey;

    if (targetScene === null) {
      dlog('PlayerLocation was null, we return');
      return;
    }
    // scene is null when the game has just booted, and there is not yet a currentScene in ManageSession
    if (scene != null) {
      if (scene.scene != null) {
        sceneKey = scene.scene.key;
      } else {
        sceneKey = scene;
      }

      if (targetScene.scene != null) {
        targetSceneKey = targetScene.scene.key;
      } else {
        targetSceneKey = targetScene;
      }
      dlog('\u001b[31m switchScene: ', sceneKey, ' , targetScene: ', targetSceneKey, ' targetHouse: ', targetHouse);
    }

    if (targetScene === 'logout') {
      // PlayerLocation.set({ scene: 'logout', house: null });
      return;
    }

    if (targetScene === DEFAULT_HOME && targetHouse === null) {
      return;
    }

    if (!scene || !scene?.player) return;

    // we can't go from the same scene to the same scene
    // except when it is a house
    if (scene.scene.key === targetScene && targetScene !== DEFAULT_HOME) {
      dlog('SceneSwitcher: same scene, do nothing');
      return;
    }

    // dlog('SceneSwitcher: continue with doSwitchScene');

    setLoader(true);

    // HERE WE FINALLY START AN OTHER SCENE, which stops the current scene
    if (targetHouse !== null && targetScene === DEFAULT_HOME) {
      this.unsubScribeSceneFromStores(scene);
      scene.scene.start(targetScene, { user_id: targetHouse });
      // later we join the house id channel
      targetSceneKey = targetHouse;
    } else if (targetScene) {
      // when we don't go to a home, set ShowHomeEditBar to false
      ShowHomeEditBar.set(false);

      if (targetScene.scene !== null) {
        this.unsubScribeSceneFromStores(scene);
        // dlog('start targetScene: ', targetScene);
        scene.scene.start(targetScene);
      }
    }

    this.switchStream(scene, targetScene);
  }

  unsubScribeSceneFromStores(scene) {
    // Emit an event that the scene can listen for
    scene.events.emit('unsubscribeStores');
  }

  async pauseSceneStartApp(scene, app) {
    // pause scene needs the 'real' scene object, not just the key
    if (scene) {
      //! check this
      scene.physics.pause();
      scene.scene.pause();

      // scene.scene.stop();
      this.switchStream(scene, app);
    }
  }

  async startSceneCloseApp(app, scene) {
    // we always get an App and a scene in the game
    if (!ManageSession.socket) return;

    //! check this
    dlog('start scene: ', scene);
    if (typeof scene.scene !== 'undefined') {
      scene.scene.start();
    } else {
      dlog('ManageSession.currentScene.scene.key: ', ManageSession.currentScene.scene.key);
      ManageSession.currentScene.scene.start(scene);
    }
    // setLoader(true);
    this.switchStream(app, scene);
  }

  async switchStream(scene, targetScene) {
    /** in case of startSceneCloseApp the scene is a Phaser Scene Object
     * in all other cases the scene is a scene key
     * below we make the data consistent  */

    // check the format of the arguments: either a scene or a key
    let sceneKey;
    let targetSceneKey;

    // making the data / arguments consistent
    if (scene === null) return;

    if (scene.scene != null) {
      sceneKey = scene.scene.key;
    } else {
      sceneKey = scene;
    }

    if (targetScene.scene != null) {
      targetSceneKey = targetScene.scene.key;
    } else {
      targetSceneKey = targetScene;
    }

    // dlog('switchScene: ', sceneKey, ' , targetScene: ', targetSceneKey);

    const targetHouse = get(PlayerLocation).house;
    // if we are leaving a home, we have to leave the home id stream
    //! targetHouse can also be a scene, is this unwanted? make it null when it is a scene?
    // dlog('targetHouse: ', targetHouse);
    if (sceneKey === DEFAULT_HOME) {
      // dlog('scene: ', scene);
      sceneKey = scene.location;
    }

    // if we are going to a house (sceneKey === DefaultUserHome)
    // then we have to leave the scene.location
    if (targetHouse !== null && targetScene === DEFAULT_HOME) {
      targetSceneKey = targetHouse;
    }

    // setLoader(true);
    ManageSession.socket
      .rpc('leave', sceneKey)
      .then((data) => {
        if (data.id === 'leave' && data.payload === 'Success') {
          dlog('leave socket succes: ', sceneKey);

          // empty the connected user array when we leave a stream
          ManageSession.allConnectedUsers.forEach((element) => {
            element.destroy();
          });
          ManageSession.allConnectedUsers.length = 0;
          dlog('ManageSession.allConnectedUsers', ManageSession.allConnectedUsers);
          // WE LEFT THE SCENE SUCCESFULLY
          // 1. we pause the leaving Scene
          // 2. start the new scene

          // dlog('targetScene', targetScene);
          if (targetScene) {
            //! 'join' wordt zonder target uitgevoerd
            //! de target wordt uit playerStreanID gehaald

            dlog('join targetScene: ', targetSceneKey);
            ManageSession.getStreamUsers('join', targetSceneKey).then(() => {
              dlog('join succes: targetScene', targetSceneKey);
              setLoader(false);
            });
          }
        }
      })
      .catch((...args) => {
        Error.set('Something went wrong with the Socket', args);
      });
  }
}

export default new SceneSwitcher();
