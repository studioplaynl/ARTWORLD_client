/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
import { get } from 'svelte/store';
import { Profile } from '../../../session';
import ManageSession from '../ManageSession';
import { listObjects } from '../../../api';
import { DEFAULT_SCENE, DEFAULT_HOME } from '../../../constants';
import {
  playerPos, playerLocation, playerHistory,
} from '../playerState';
import { Addressbook, Liked, Achievements } from '../../../storage';
import { dlog } from '../helpers/DebugLog';
import { parseQueryString, checkIfSceneIsAllowed, checkIfLocationLooksLikeAHouse } from '../helpers/UrlHelpers';

const { Phaser } = window;


export default class UrlParser extends Phaser.Scene {
  debug = false;

  constructor() {
    super('UrlParser');
    // this.fallBackLocation = 'Artworld';
  }

  async create() {
    //* check if the user profile is loaded, to be able to send the player to the right location
    //* check if there are params in the url, to send the player to that location instead

    // Parse the current query string
    parseQueryString();

    const profile = get(Profile);

    // If there is no location parameter in the url..
    if (get(playerLocation).scene === null) {
      if (profile.meta?.PosX && profile.meta?.PosY) {
        playerPos.set({
          x: Math.round(profile.meta.PosX),
          y: Math.round(profile.meta.PosY),
        });
      }
      if (profile.meta?.Location
        && checkIfLocationLooksLikeAHouse(profile.meta.Location)) {
        playerLocation.set({
          scene: DEFAULT_HOME,
          house: profile.meta.Location,
        });
      } else if (profile.meta?.Location
        && checkIfSceneIsAllowed(profile.meta.Location)
      ) {
        playerLocation.set({
          scene: profile.meta.Location,
          house: null,
        });
      }

      dlog('meta', profile.meta);
    }

    // If a position is null, randomise it..
    if (get(playerPos).x === null && get(playerPos).y === null) {
      playerPos.set({
        x: Math.floor((Math.random() * 300) - 150),
        y: Math.floor((Math.random() * 300) - 150),
      });
    }

    const targetScene = get(playerLocation).scene;
    const targetHouse = get(playerLocation).house;

    // Check if scene exists and is valid, if not: set DEFAULT_SCENE
    if (!targetScene || !checkIfSceneIsAllowed(targetScene)) {
      playerLocation.set({
        scene: DEFAULT_SCENE,
        house: null,
      });
      // Don't store this change in scene in the history..
      playerHistory.pop();
    }

    if (targetHouse && checkIfLocationLooksLikeAHouse(targetHouse)) {
      listObjects('home', targetHouse, 1).catch(() => {
        // No objects found for this ID, switch to default scene
        dlog(`This ID (${targetHouse}) has no objects, switching to default scene`);
        playerLocation.set({
          scene: DEFAULT_SCENE,
          house: null,
        });
        // Don't store this change in scene in the history..
        playerHistory.pop();
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
    const targetScene = get(playerLocation).scene;
    const targetHouse = get(playerLocation).house;


    if (this.debug) console.log('Launch: ', targetScene, targetHouse);

    this.scene.stop('UrlParser');


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