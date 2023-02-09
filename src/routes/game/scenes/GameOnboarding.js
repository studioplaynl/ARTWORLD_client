/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
import { get } from 'svelte/store';
import { Profile } from '../../../session';
import ManageSession from '../ManageSession';
import { listObjects } from '../../../api';
import { DEFAULT_SCENE, DEFAULT_HOME } from '../../../constants';
import {
  PlayerPos, PlayerLocation, PlayerHistory,
} from '../playerState';
import { Addressbook, Liked, Achievements } from '../../../storage';
import { dlog } from '../helpers/DebugLog';
import { parseQueryString, checkIfSceneIsAllowed, checkIfLocationLooksLikeAHouse } from '../helpers/UrlHelpers';

const { Phaser } = window;


export default class GameOnboarding extends Phaser.Scene {
  debug = false;

  constructor() {
    super('GameOnboarding');
    // this.fallBackLocation = 'Artworld';
  }

  async create() {
    //* check if the user profile is loaded, to be able to send the player to the right location
    //* check if there are params in the url, to send the player to that location instead

    // Parse the current query string
    parseQueryString();

    const profile = get(Profile);
    // dlog('profile: ', profile);

    // If there is no location parameter in the url..
    if (get(PlayerLocation).scene === null) {
      if (profile.meta?.PosX && profile.meta?.PosY) {
        PlayerPos.set({
          x: Math.round(profile.meta.PosX),
          y: Math.round(profile.meta.PosY),
        });
      }
      if (profile.meta?.Location
        && checkIfLocationLooksLikeAHouse(profile.meta.Location)) {
        PlayerLocation.set({
          scene: DEFAULT_HOME,
          house: profile.meta.Location,
        });
      } else if (profile.meta?.Location
        && checkIfSceneIsAllowed(profile.meta.Location)
      ) {
        PlayerLocation.set({
          scene: profile.meta.Location,
          house: null,
        });
      }

      dlog('meta', profile.meta);
    }

    // If a position is null, randomise it..
    if (get(PlayerPos).x === null && get(PlayerPos).y === null) {
      PlayerPos.set({
        x: Math.floor((Math.random() * 300) - 150),
        y: Math.floor((Math.random() * 300) - 150),
      });
    }

    const targetScene = get(PlayerLocation).scene;
    const targetHouse = get(PlayerLocation).house;

    // Check if scene exists and is valid, if not: set DEFAULT_SCENE
    if (!targetScene || !checkIfSceneIsAllowed(targetScene)) {
      PlayerLocation.set({
        scene: DEFAULT_SCENE,
        house: null,
      });
      // Don't store this change in scene in the history..
      PlayerHistory.pop();
    }

    if (targetHouse && checkIfLocationLooksLikeAHouse(targetHouse)) {
      listObjects('home', targetHouse, 1).catch(() => {
        // No objects found for this ID, switch to default scene
        dlog(`This ID (${targetHouse}) has no objects, switching to default scene`);
        PlayerLocation.set({
          scene: DEFAULT_SCENE,
          house: null,
        });
        // Don't store this change in scene in the history..
        PlayerHistory.pop();
        this.launchGame();
      }).then(() => {
        // Objects were found, so we continue to launch
        this.launchGame();
      });
    } else {
      // Launch in DEFAULT_SCENE
      this.launchGame();
    }
  }

  async launchGame() {
    const targetScene = get(PlayerLocation).scene;
    const targetHouse = get(PlayerLocation).house;


    if (this.debug) console.log('Launch: ', targetScene, targetHouse);

    this.scene.stop('GameOnboarding');


    // we launch the player last location when we have a socket with the server
    await ManageSession.createSocket()
      .then(async () => {
        // get server object so that the data is Initialized
        Liked.get();
        Addressbook.get();
        Achievements.get();

        this.scene.launch(targetScene, { user_id: targetHouse });
        this.scene.launch('UIScene');
      });
  }
}
