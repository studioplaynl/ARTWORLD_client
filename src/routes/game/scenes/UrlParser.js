/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
import { get } from 'svelte/store';
import { Profile, CurrentApp } from '../../../session';
import ManageSession from '../ManageSession';
import { listObjects } from '../../../api';
import { VALID_USER_SCENES, DEFAULT_SCENE, DEFAULT_HOME } from '../../../constants';
import {
  playerPosX, playerPosY, playerLocationScene, playerLocationHouse,
} from '../playerState';
import { Addressbook, Liked } from '../../../storage';
import { dlog } from '../helpers/DebugLog';

const { Phaser } = window;

const checkIfSceneIsAllowed = (location) => {
  const locationExists = VALID_USER_SCENES.includes(location);
  return locationExists;
};

const checkIfLocationLooksLikeAHouse = (location) => location !== null && location.split('-').length > 3;

export default class UrlParser extends Phaser.Scene {
  debug = false;

  constructor() {
    super('UrlParser');
    // this.fallBackLocation = 'Artworld';
  }

  async create() {
    // check if there is a url param, otherwise get last location serverside
    this.parseplayerLocationScene();


    // TODO add subscription op scene en house en dan run de parser
  } // create


  // onBoard() {

  // 1. parseQueryString() --> haal data uit url
  // 2. $playerLocationScene === null? Haal uit data uit $Player.meta en zet in de stores
  // 3. -> Zet de positiedata om naar game (nu: randomiseNullPosition)
  //    -> Gebruik de location en laad de scene in

  // }


  async parseplayerLocationScene() {
    //* check if the user profile is loaded, to be able to send the player to the right location
    //* check if there are params in the url, to send the player to that location instead

    // Parse the current query string
    // parseQueryString();

    const profile = get(Profile);

    // If there is no location paramter in the url..
    if (get(playerLocationScene) === null) {
      if (profile.meta?.PosX) {
        playerPosX.set(Math.round(profile.meta.PosX));
      }
      if (profile.meta?.PosY) {
        playerPosY.set(Math.round(profile.meta.PosY));
      }
      if (profile.meta?.Location && checkIfSceneIsAllowed(profile.meta.Location)
      ) {
        playerLocationScene.set(profile.meta.Location);
      } else if (profile.meta?.Location
        && checkIfLocationLooksLikeAHouse(profile.meta.Location)) {
        playerLocationScene.set(DEFAULT_HOME);
        playerLocationHouse.set(profile.meta.Location);
      }

      console.log('meta', profile.meta);
    }

    // Set a default player location
    if (!get(playerLocationScene)) {
      console.log('playerLocationScene does not seem valid, set default scene');
      playerLocationScene.set(DEFAULT_SCENE);
      playerLocationHouse.set(null);
    }

    // If a position is null, randomise it..
    if (get(playerPosX) === null) {
      playerPosX.set(Math.floor((Math.random() * 300) - 150));
    }
    if (get(playerPosY) === null) {
      playerPosY.set(Math.floor((Math.random() * 300) - 150));
    }


    const targetLocation = get(playerLocationScene);
    const targetHouse = get(playerLocationHouse);
    // console.log('targetLocation = ', targetLocation, 'targetHouse = ', targetHouse);

    if (checkIfSceneIsAllowed(targetLocation)) {
      if (checkIfLocationLooksLikeAHouse(targetHouse)) {
        console.log('Looks like a home!!', targetHouse);
        listObjects('home', targetHouse, 1).catch(() => {
          // No objects found for this ID, switch to default scene
          playerLocationScene.set(DEFAULT_SCENE);
          playerLocationHouse.set(targetHouse);
        }).then(() => {
          this.launchGame(DEFAULT_HOME, targetHouse);
        });
      } else {
        this.launchGame(targetLocation);
      }
    }

    // }
  }

  // end parseLocation

  // location => scene naam
  // locationID => id van huisje van user
  async launchGame(location, locationID) {
    if (this.debug) console.log('Launch: ', location, locationID);

    this.scene.stop('UrlParser');
    this.scene.launch('UIScene');

    // we launch the player last location when we have a socket with the server
    await ManageSession.createSocket()
      .then(async () => {
        // get server object so that the data is Initialized
        Liked.get();
        Addressbook.get();

        dlog('locationID', locationID);
        this.scene.launch(location, { user_id: locationID });

        CurrentApp.update(() => 'game');
      });
  }
}
