/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
import { get } from 'svelte/store';
import { Profile } from '../../../session';
import ManageSession from '../ManageSession';
import { listObjects } from '../../../api';
import { VALID_USER_SCENES, DEFAULT_SCENE, DEFAULT_HOME } from '../../../constants';
import { parseQueryString } from '../helpers/UrlHelpers';
import { playerPosX, playerPosY, playerLocation } from '../playerState';

const { Phaser } = window;

const checkIfSceneIsAllowed = (location) => {
  const locationExists = VALID_USER_SCENES.includes(location);

  console.log('locationExists VALID_USER_SCENES', locationExists, location, VALID_USER_SCENES);

  return locationExists;
};

const checkIfLocationLooksLikeAHouse = (location) => location.split('-').length > 3;

export default class UrlParser extends Phaser.Scene {
  debug = false;

  constructor() {
    super('UrlParser');
    // this.fallBackLocation = 'Artworld';
  }

  async create() {
    // check if there is a url param, otherwise get last location serverside
    this.parsePlayerLocation();
  } // create


  // onBoard() {

  // 1. parseQueryString() --> haal data uit url
  // 2. $playerLocation === null? Haal uit data uit $Player.meta en zet in de stores
  // 3. -> Zet de positiedata om naar game (nu: randomiseNullPosition)
  //    -> Gebruik de location en laad de scene in

  // }


  async parsePlayerLocation() {
    //* check if the user profile is loaded, to be able to send the player to the right location
    //* check if there are params in the url, to send the player to that location instead

    // Parse the current query string
    parseQueryString();

    const profile = get(Profile);

    // If there is no location paramter in the url..
    if (get(playerLocation) === null) {
      if (profile.meta?.PosX) {
        playerPosX.set(profile.meta.PosX);
      }
      if (profile.meta?.PosY) {
        playerPosY.set(profile.meta.PosY);
      }
      if (profile.meta?.Location && checkIfSceneIsAllowed(profile.meta.Location)) {
        playerLocation.set(profile.meta.Location);
      }
    }

    // Set a default player location
    if (!get(playerLocation)) {
      console.log('Playerlocation does not seem valid, set default scene');
      playerLocation.set(DEFAULT_SCENE);
    }

    // If a position is null, randomise it..
    if (get(playerPosX) === null) {
      playerPosX.set(Math.floor((Math.random() * 300) - 150));
    }
    if (get(playerPosY) === null) {
      playerPosY.set(Math.floor((Math.random() * 300) - 150));
    }


    const targetLocation = get(playerLocation);
    console.log('targetLocation = ', targetLocation);

    if (checkIfLocationLooksLikeAHouse(targetLocation)) {
      // List Objects to see if this location is valid home

      console.log('Looks like a home!!', targetLocation);
      listObjects('home', targetLocation, 1).catch(() => {
        // No objects found for this ID, switch to default scene
        playerLocation.set(DEFAULT_SCENE);
        this.prepareLaunchSceneAndSwitch(DEFAULT_SCENE);
      }).then(() => {
        console.log('I found stuff for this home!', targetLocation);
        this.prepareLaunchSceneAndSwitch(DEFAULT_HOME, targetLocation);
      });
    } else if (checkIfSceneIsAllowed(targetLocation)) {
      // scene laden
      this.prepareLaunchSceneAndSwitch(targetLocation);
    }

    // }
  }

  // end parseLocation

  // location => scene naam
  // locationID => id van huisje van user
  prepareLaunchSceneAndSwitch(location, locationID) {
    if (this.debug) console.log('Launch: ', location, locationID);
    ManageSession.location = location; // scene key
    ManageSession.locationID = locationID; // in case of DefaultUserHome = user_id
    this.scene.stop('UrlParser');
    this.scene.start('NetworkBoot');
  }
}
