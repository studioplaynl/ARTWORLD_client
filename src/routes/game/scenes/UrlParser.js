/* eslint-disable no-console */
import { get } from 'svelte/store';
import { Profile } from '../../../session';
import ManageSession from '../ManageSession';
import { getAccount, listObjects } from '../../../api';
import { SCENE_NAMES } from '../config';
import { getUrl } from '../helpers/UrlHelpers';
import { playerPosX, playerPosY } from '../playerState';

const { Phaser } = window;

const checkIfSceneExists = (location) => {
  const locationExists = SCENE_NAMES.includes(location);

  console.log('locationExists SCENE_NAMES', locationExists, location, SCENE_NAMES);

  return locationExists;
};

export default class UrlParser extends Phaser.Scene {
  debug = false;

  constructor() {
    super('UrlParser');
    this.fallBackLocation = 'Artworld';
  }

  async create() {
    // check if there is a url param, otherwise get last location serverside
    this.parsePlayerLocation();
  } // create

  parsePlayerLocation() {
    //* check if the user profile is loaded, to be able to send the player to the right location
    //* check if there are params in the url, to send the player to that location instead
    let urlParams = getUrl();
    let profile = get(Profile);
    // if (this.debug) console.log('urlParams', urlParams);

    // if there is no location paramter in the url
    if (typeof urlParams.location === 'undefined') {
      if (typeof profile === 'undefined') {
        // get the location stored serverside
        const { PosX, PosY, Location } = profile.meta;
        // const { playerPosX, playerPosY } = ManageSession;

        this.parsePlayerPosition(PosX, PosY);
        urlParams = { posX: get(playerPosX), posY: get(playerPosY), Location };
        this.parseLocation(urlParams);
      } else {
        // if the account is empty, get it
        getAccount('', true)
          .then(() => {
            profile = get(Profile);
            const { PosX, PosY, Location } = profile.meta;
            // const { playerPosX, playerPosY } = ManageSession;
            this.parsePlayerPosition(PosX, PosY);
            urlParams = { posX: get(playerPosX), posY: get(playerPosY), Location };
            this.parseLocation(urlParams);
          });
      }
    } else {
      // if there is a location parameter in the url
      this.parseLocation(urlParams);
    }
  }

  parseLocation(urlParams) {
    const { posX, posY, Location } = urlParams;
    console.log('location', Location);
    const locationName = Location || this.fallBackLocation;
    // if (this.debug) console.log('urlParams, locationName', urlParams, locationName);
    // check if location is of DefaultUserHome_user_ID format
    let splitString = locationName.split('_');

    // if true then location is DefaultUserHome_user_ID
    if (splitString.length > 1) {
      // if (this.debug) console.log("splitString.length > 1 '_' locationName: ", locationName);
      // check if first part is DefaultUserHome
      if (checkIfSceneExists(splitString[0])) {
        this.parsePlayerPosition(posX, posY);
        this.prepareLaunchSceneAndSwitch(splitString[0], splitString[1]);
      } else {
        // send to default position
        this.parsePlayerPosition(null, null);
        // goto default location
        this.prepareLaunchSceneAndSwitch(this.fallBackLocation, this.fallBackLocation);
      }
    } else {
      // if location is of _user_ID format
      splitString = locationName.split('-');
      if (this.debug) console.log("locationName.split('-') locationName: ", locationName);
      if (splitString.length > 3) { // user id dus
        Promise.all([listObjects('home', locationName, 10)])
          .catch(() => {
            if (this.debug) console.log('error getting the home object');
            this.parsePlayerPosition(null, null);
            this.prepareLaunchSceneAndSwitch(this.fallBackLocation, this.fallBackLocation);
          })
          .then((rec) => {
            if (this.debug) console.log('rec: ', rec);

            if (rec) {
              // filter only amsterdam homes
              // scene.homes = scene.homes.filter((obj) => obj.key == filter)
              if (this.debug) console.log("splitString.length > 3 ('-') locationName: ", locationName);
              // locationName is user_id format
              this.parsePlayerPosition(posX, posY);
              this.prepareLaunchSceneAndSwitch('DefaultUserHome', locationName);
            } else {
              // if rec is empty, user does not exists
              if (this.debug) console.log('userID does not return home');
              this.parsePlayerPosition(null, null);
              this.prepareLaunchSceneAndSwitch(this.fallBackLocation, this.fallBackLocation);
            }
          });
      } else if (locationName === 'DefaultUserHome') {
        // send to default location
        this.parsePlayerPosition(null, null);
        this.prepareLaunchSceneAndSwitch(this.fallBackLocation, this.fallBackLocation);
      } else if (checkIfSceneExists(locationName)) {
        this.parsePlayerPosition(posX, posY);
        this.prepareLaunchSceneAndSwitch(locationName, locationName);
      } else {
        // if the sceneName doesn't exist, send to default location
        this.parsePlayerPosition(null, null);
        this.prepareLaunchSceneAndSwitch(this.fallBackLocation, this.fallBackLocation);
      }
    }
  }
  // end parseLocation

  prepareLaunchSceneAndSwitch(location, locationID) {
    if (this.debug) console.log('Launch: ', location, locationID);
    ManageSession.location = location; // scene key
    ManageSession.locationID = locationID; // in case of DefaultUserHome = user_id
    this.scene.stop('UrlParser');
    this.scene.start('NetworkBoot');
  }

  // eslint-disable-next-line class-methods-use-this
  parsePlayerPosition(posX, posY) {
    if (typeof posX !== 'undefined') {
      // if it exists and isn't null
      const tempInt = parseInt(posX, 10);
      if (this.debug) console.log('tempInt:', tempInt);
      if (!Number.isNaN(tempInt)) {
        if (this.debug) console.log('parsed posX:', posX);
        playerPosX.set(tempInt);// expected artworldCoordinates
      } else {
        // a random number between -150 and 150
        playerPosX.set(Math.floor((Math.random() * 300) - 150));
        if (this.debug) console.log('no known posX, created...', get(playerPosX));
      }
    } else {
      // a random number between -150 and 150
      playerPosX.set(Math.floor((Math.random() * 300) - 150));
      if (this.debug) console.log('no known posX, created...', get(playerPosX));
    }

    if (typeof posY !== 'undefined') {
      // if it exists and isn't null
      if (this.debug) console.log('parsed posY:', posY);
      const tempInt = parseInt(posY, 10);
      if (this.debug) console.log('tempInt:', tempInt);
      if (!Number.isNaN(tempInt)) {
        playerPosY.set(tempInt);// expected artworldCoordinates
      } else {
        // a random number between -150 and 150
        playerPosY.set(Math.floor((Math.random() * 300) - 150));
        if (this.debug) console.log('no known posY, created...', get(playerPosY));
      }
    } else {
      // a random number between -150 and 150
      playerPosY.set(Math.floor((Math.random() * 300) - 150));
      if (this.debug) console.log('no known posY, created...', get(playerPosY));
    }
  }
}
