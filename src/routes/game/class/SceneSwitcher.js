import { get } from 'svelte/store';
import ManageSession from '../ManageSession';
import { dlog } from '../../../helpers/debugLog';
import { PlayerLocation, PlayerPos } from '../playerState';
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
    this.isTransitioning = false;
    this.lastTransition = null;
    this.unsubscribeScene = PlayerLocation.subscribe(() => {
      const currentLocation = get(PlayerLocation);
      
      // Prevent duplicate transitions
      if (this.lastTransition && 
          this.lastTransition.scene === currentLocation.scene && 
          this.lastTransition.house === currentLocation.house) {
        return;
      }
      
      this.lastTransition = currentLocation;
      this.doSwitchScene();
    });
    // this.unsubscribeHouse = PlayerLocationHouse.subscribe(() => {
    //   this.doSwitchScene();
    // });
    this.pausedSceneKey = null;
    this.pausedScene = null;
  }

  // pushLocation(scene) {
  //   dwarn('pushLocation is deprecated!');
  //   dlog(scene);
  // }

  async doSwitchScene() {
    if (this.isTransitioning) {
      console.log('Scene transition already in progress');
      return;
    }

    try {
      this.isTransitioning = true;
      const scene = ManageSession.currentScene;
      
      if (!scene) {
        console.log('No current scene found');
        return;
      }

      scene.isTransitioning = true;  // Add flag to scene instance
      
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
      // except when it is a house with a different user_id
      if (scene.scene.key === targetScene) {
        if (targetScene === DEFAULT_HOME) {
          if (scene.location !== targetHouse) {
            dlog('SceneSwitcher: going to a different house in a home scene: ', scene.location, targetHouse);
            // Continue with scene switch
          } else {
            dlog('SceneSwitcher: same home, do nothing');
            return;
          }
        } else {
          dlog('SceneSwitcher: same non-home scene, do nothing');
          return;
        }
      }

      // dlog('SceneSwitcher: continue with doSwitchScene');

      setLoader(true);

      // HERE WE FINALLY START AN OTHER SCENE, which stops the current scene
      if (targetHouse !== null && targetScene === DEFAULT_HOME) {
        scene.scene.start(targetScene, { user_id: targetHouse });
        // later we join the house id channel
        targetSceneKey = targetHouse;
      } else if (targetScene) {
        // when we don't go to a home, set ShowHomeEditBar to false
        ShowHomeEditBar.set(false);

        if (targetScene.scene !== null) {
          dlog('start targetScene: ', targetScene);
          // const pastScene = scene;
          // console.log('subscribed start targetScene: ', targetScene);

          // stop the current scene
          scene.scene.start(targetScene);
          // console.log('subscribed start targetScene: ', pastScene.scene.key);

          // pastScene.scene.stop();
        }
      }

      this.switchStream(scene, targetScene);
    } catch (error) {
      console.error('Scene switch failed:', error);
    } finally {
      this.isTransitioning = false;
      if (ManageSession.currentScene) {
        ManageSession.currentScene.isTransitioning = false;
      }
    }
  }

  async pauseSceneStartApp(scene, app) {
    if (!scene) return;

    // Store both scene key and scene instance
    this.pausedSceneKey = scene.scene.key;
    this.pausedScene = scene;
    
    dlog('Pausing scene:', this.pausedSceneKey);
    
    // Pause all systems
    scene.game.loop.sleep();
    scene.physics.pause();
    scene.scene.pause();
    
    await this.switchStream(scene, app);
  }

  async startSceneCloseApp(app) {
    if (!ManageSession.socket) return;

    dlog('Attempting to resume scene. Stored key:', this.pausedSceneKey);
    
    // Try multiple ways to get the scene
    let sceneToResume = this.pausedScene || 
                        ManageSession.currentScene || 
                        (this.pausedSceneKey && ManageSession.game.scene.getScene(this.pausedSceneKey));

    if (!sceneToResume) {
      console.error('Failed to find scene to resume', {
        storedScene: this.pausedScene,
        currentScene: ManageSession.currentScene,
        pausedKey: this.pausedSceneKey
      });
      return;
    }

    dlog('Resuming scene:', sceneToResume.scene.key);

    // Resume the game loop first
    sceneToResume.game.loop.wake();
    
    // If scene is paused, resume it
    if (sceneToResume.scene.isPaused()) {
      sceneToResume.scene.resume();
    } else {
      // If not paused, might need to restart
      sceneToResume.scene.restart();
    }
    
    // Resume physics and input after scene is active
    sceneToResume.physics.resume();
    sceneToResume.input.enabled = true;

    await this.switchStream(app, sceneToResume);
    
    // Clear stored references
    this.pausedScene = null;
    this.pausedSceneKey = null;
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
          // dlog('ManageSession.allConnectedUsers', ManageSession.allConnectedUsers);
          // WE LEFT THE SCENE SUCCESFULLY

          // dlog('targetScene', targetScene);
          if (targetScene) {
            //! if 'join' gets called without target
            //! then the target will be read from Profile

            dlog('join targetScene: ', targetSceneKey);
            ManageSession.getStreamUsers('join', targetSceneKey).then(() => {
              dlog('join succes: targetScene', targetSceneKey);
              // setLoader(false);
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
