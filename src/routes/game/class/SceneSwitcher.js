/* eslint-disable class-methods-use-this */
/* eslint-disable max-len */
import { get } from 'svelte/store';
import ManageSession from '../ManageSession';
import { dlog } from '../helpers/DebugLog';
import { PlayerLocation, playerStreamID, PlayerHistory } from '../playerState';
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
      dlog('\u001b[31m PlayerLocation', get(PlayerLocation));
      // check if we are going from the same world to the same world;
      // then don't switch scenes
      dlog('\u001b[31m playerStreamID', get(playerStreamID));
      const history = get(PlayerHistory);
      dlog('playerHistory: ', history);
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
    // this.doSwitchScene();
  }

  doSwitchScene() {
    const scene = ManageSession.currentScene;
    const targetScene = get(PlayerLocation).scene;
    const targetHouse = get(PlayerLocation).house;

    // debugging
    let sceneKey;
    let targetSceneKey;

    // cleaner console log
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
      dlog('\u001b[31m switchScene: scene: ', sceneKey, ' , targetScene: ', targetSceneKey, ' targetHouse: ', targetHouse);
    } else {
      dlog(' scene: ', scene, ' targetScene: ', targetScene, ' targetHouse: ', targetHouse);
    }

    if (targetScene === DEFAULT_HOME && targetHouse === null) {
      return;
    }

    if (!scene || !scene?.player) return;

    // we can't go from the same scene to the same scene
    if (scene.scene.key === targetScene) return;

    console.log('SceneSwitcher: continue with doSwitchScene');

    setLoader(true);

    //! testing off
    // scene.physics.pause();
    // scene.player.setTint(0xff0000);
    // scene.scene.pause();

    // if we are going inside a user house
    //! Bug: when going into a house, and pressing back button, we are first taken to the center of the house
    //! when two player to inside house, and one player goes back, the other player is also visible in the scene, while being still in the house
    if (targetHouse !== null && targetScene === DEFAULT_HOME) {
      scene.scene.start(targetScene, { user_id: targetHouse });
      // later we join the house id channel
      targetSceneKey = targetHouse;
    } else if (targetScene) {
      if (targetScene.scene !== null) {
        dlog('start targetScene: ', targetScene);
        dlog('scene starting the targetScene: ', scene);
        scene.scene.start(targetScene);
        // scene.scene.stop();
        // ManageSession.scene.launch(targetScene);
      }
    }

    this.switchStream(scene, targetScene);
  }

  async pauseSceneStartApp(scene, app) {
    //! pause scene needs the 'real' scene object, not just the key
    if (scene) {
      //! check this
      scene.physics.pause();
      scene.scene.pause();

      // scene.scene.stop();
      this.switchStream(scene, app);

      // await ManageSession.socket.rpc('leave', get(playerStreamID));
      // await ManageSession.socket.rpc('join', app);
    }
    // ManageSession.getStreamUsers("join", app)
    // open app
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

    this.switchStream(app, scene);
    // await ManageSession.socket.rpc('leave', app);
    // await ManageSession.getStreamUsers('join');

    // scene.scene.resume();
    // scene.physics.resume();
    // close app
  }

  async switchStream(scene, targetScene) {
    // in case of startSceneCloseApp the scene is a Phaser Scene Object
    // in all other cases the scene is a scene key
    // below we make the data consistent

    // check the format of the arguments: either a scene or a key
    let sceneKey;
    let targetSceneKey;

    // making the data / arguments consistent
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

    dlog('switchScene: scene: ', sceneKey, ' , targetScene: ', targetSceneKey);

    const targetHouse = get(PlayerLocation).house;
    // if we are leaving a home, we have to leave the home id stream
    //! targetHouse can also be a scene, is this unwanted? make it null when it is a scene?
    dlog('targetHouse: ', targetHouse);
    if (sceneKey === DEFAULT_HOME) {
      dlog('scene: ', scene);
      sceneKey = scene.location;
    }

    // if we are going to a house (sceneKey === DefaultUserHome)
    // then we have to leave the scene.location
    if (targetHouse !== null && targetScene === DEFAULT_HOME) {
      targetSceneKey = targetHouse;
    }

    ManageSession.socket.rpc('leave', sceneKey).then((data) => {
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

        //! check this
        // // check if it is a Phaser scene or app, apps are not stopped,they close
        // if (scene.scene !== null) {
        //   // check if it is a 'normal' scene or a user home
        //   if (scene.scene.key === scene.scene.location) {
        //     dlog(' pause scene: ', sceneKey);
        //     // scene.scene.stop(sceneKey);
        //     scene.scene.pause(sceneKey);
        //   } else {
        //     dlog(' pause scene: ', scene.scene.key);
        //     // scene.scene.stop(scene.scene.key);
        //     scene.scene.pause(scene.scene.key);
        //   }
        // }

        //! check this
        // if we are going inside a user house
        // if (targetHouse !== null && targetScene === DEFAULT_HOME) {
        //   //! we start the scene from the previous scene?
        //   //! do we close or pause the previous scene? - ALREADY DONE ABOVE
        //   scene.scene.start(targetScene, { user_id: targetHouse });
        //   // later we join the house id channel
        //   targetSceneKey = targetHouse;
        // } else if (targetScene) {
        //   if (targetScene.scene !== null) {
        //     dlog('start targetScene: ', targetScene);
        //     dlog('scene starting the targetScene: ', scene);
        //     scene.scene.start(targetScene);
        //     // scene.scene.stop();
        //     // ManageSession.scene.launch(targetScene);
        //   }
        // }

        dlog('targetScene', targetScene);
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
    }).catch((...args) => {
      Error.set('Something went wrong with the Socket', args);
    });
  }
}



export default new SceneSwitcher();
