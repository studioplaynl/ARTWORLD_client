/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
import { get } from 'svelte/store';
import { querystring, location } from 'svelte-spa-router';
import { Profile, CurrentApp } from '../../../session';
import ManageSession from '../ManageSession';
import { listObjects } from '../../../api';
import { VALID_USER_SCENES, DEFAULT_SCENE, DEFAULT_HOME } from '../../../constants';
import {
  playerPosX, playerPosY, playerLocation, playerHistory,
} from '../playerState';
import { Addressbook, Liked } from '../../../storage';
import { dlog } from '../helpers/DebugLog';
import { parseQueryString } from '../helpers/UrlHelpers';

const { Phaser } = window;

const checkIfSceneIsAllowed = (loc) => {
  const locationExists = VALID_USER_SCENES.includes(loc);
  return locationExists;
};

const checkIfLocationLooksLikeAHouse = (loc) => loc !== null && loc.split('-').length > 3;

export default class UrlParser extends Phaser.Scene {
  debug = false;

  constructor() {
    super('UrlParser');
    // this.fallBackLocation = 'Artworld';
  }

  async create() {
    // check if there is a url param, otherwise get last location serverside
    await this.parsePlayerLocation();

    // Put the first page into history
    if (get(playerHistory).length === 0) {
      playerHistory.push(`${get(location)}?${get(querystring)}`);
    }


    // TODO add subscription op scene en house en dan run de parser
  } // create




  async parsePlayerLocation() {
    //* check if the user profile is loaded, to be able to send the player to the right location
    //* check if there are params in the url, to send the player to that location instead

    // Parse the current query string
    parseQueryString();

    const profile = get(Profile);

    // If there is no location parameter in the url..
    if (get(playerLocation).scene === null) {
      if (profile.meta?.PosX) {
        playerPosX.set(Math.round(profile.meta.PosX));
      }
      if (profile.meta?.PosY) {
        playerPosY.set(Math.round(profile.meta.PosY));
      }
      if (profile.meta?.Location && checkIfSceneIsAllowed(profile.meta.Location)
      ) {
        playerLocation.set({
          scene: profile.meta.Location,
          house: null,
        });
      } else if (profile.meta?.Location
        && checkIfLocationLooksLikeAHouse(profile.meta.Location)) {
        playerLocation.set({
          scene: DEFAULT_HOME,
          house: profile.meta.Location,
        });
      }

      console.log('meta', profile.meta);
    }

    // Set a default player location
    if (!get(playerLocation).scene) {
      console.log('playerLocation.scene does not seem valid, set default scene');
      playerLocation.set({
        scene: DEFAULT_SCENE,
        house: null,
      });
    }

    // If a position is null, randomise it..
    if (get(playerPosX) === null) {
      playerPosX.set(Math.floor((Math.random() * 300) - 150));
    }
    if (get(playerPosY) === null) {
      playerPosY.set(Math.floor((Math.random() * 300) - 150));
    }


    const targetScene = get(playerLocation).scene;
    const targetHouse = get(playerLocation).house;
    // console.log('targetScene = ', targetScene, 'targetHouse = ', targetHouse);

    if (targetScene && checkIfSceneIsAllowed(targetScene)) {
      if (targetHouse && checkIfLocationLooksLikeAHouse(targetHouse)) {
        console.log('Looks like a home!!', targetHouse);
        listObjects('home', targetHouse, 1).catch(() => {
          // No objects found for this ID, switch to default scene
          playerLocation.set({
            scene: DEFAULT_SCENE,
            house: null,
          });
        }).then(() => {
          this.launchGame(DEFAULT_HOME, targetHouse);
        });
      } else {
        this.launchGame(targetScene);
      }
    }



    // }
  }

  // end parseLocation

  // location => scene naam
  // locationID => id van huisje van user
  async launchGame(loc, locationID) {
    if (this.debug) console.log('Launch: ', loc, locationID);

    this.scene.stop('UrlParser');
    this.scene.launch('UIScene');

    // we launch the player last location when we have a socket with the server
    await ManageSession.createSocket()
      .then(async () => {
        // get server object so that the data is Initialized
        Liked.get();
        Addressbook.get();

        dlog('locationID', locationID);
        this.scene.launch(loc, { user_id: locationID });

        CurrentApp.update(() => 'game');
      });
  }
}
