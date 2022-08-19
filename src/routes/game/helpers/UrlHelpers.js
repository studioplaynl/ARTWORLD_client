/* eslint-disable class-methods-use-this */
import { get } from 'svelte/store';
import { parse, stringify } from 'qs';
import {
  push, replace, location, querystring,
} from 'svelte-spa-router';
import {
  playerPos, playerLocation, playerHistory,
} from '../playerState';
import { CurrentApp } from '../../../session';
import { DEFAULT_HOME, VALID_USER_SCENES, SCENE_INFO } from '../../../constants';
import { dlog } from './DebugLog';
import { DEFAULT_APP, isValidApp } from '../../apps/apps';
import SceneSwitcher from '../class/SceneSwitcher';
import ManageSession from '../ManageSession';


const { Phaser } = window;

let minX = -5000;
let minY = -5000;
let maxX = 5000;
let maxY = 5000;

let previousQuery = {};

export const checkIfSceneIsAllowed = (loc) => {
  const lowercaseScenes = VALID_USER_SCENES.map((scene) => scene.toLowerCase());
  return loc && lowercaseScenes.indexOf(loc.toLowerCase()) > -1;
};

export const checkIfLocationLooksLikeAHouse = (loc) => loc !== null && loc.split('-').length > 3;


/** Parse the URL and set currentApp accordingly */
export function parseURL() {
  const loc = get(location);
  const parts = loc.split('/');

  // In case of error in url
  if (parts.length < 1) return;

  let appName = parts[1].toString().toLowerCase();
  const previousAppName = get(CurrentApp);

  // An empty appName is no longer supported, /game is default
  if (appName === '') {
    appName = DEFAULT_APP;
    replace(`/${appName}?${get(querystring)}`);
    playerHistory.replace(`/${appName}?${get(querystring)}`);
  }

  if (`/${appName}` !== playerHistory.previous()) {
    playerHistory.push(`/${appName}`);
  }

  // Check if a valid app..
  if (isValidApp(appName)) {
    CurrentApp.set(appName);
    if (appName === DEFAULT_APP) {
      SceneSwitcher.startSceneCloseApp(
        ManageSession.currentScene,
        previousAppName,
      );
    } else {
      SceneSwitcher.pauseSceneStartApp(
        ManageSession.currentScene,
        appName,
      );
    }
  }
}

location.subscribe(() => parseURL());



/** Parse the Querystring and rehydrate Stores */
export function parseQueryString() {
  const query = parse(get(querystring));
  const pos = get(playerPos);
  const newPlayerPosition = { x: pos.x, y: pos.y };



  const newPlayerLocation = {};

  if ('house' in query) {
    if (checkIfLocationLooksLikeAHouse(query.house) && get(playerLocation).house !== query.house) {
      newPlayerLocation.house = query.house;
    }
  }

  if ('location' in query) {
    if (checkIfSceneIsAllowed(query.location) && get(playerLocation).scene !== query.location) {
      newPlayerLocation.scene = query.location;
    }
  }

  // Update the playerLocation store if a scene was set
  if (newPlayerLocation?.scene) {
    playerLocation.set(newPlayerLocation);
  }



  // TODO: These boundries must be drawn from the current scene

  if ('x' in query && 'y' in query) {
    // TODO SOLUTION:
    // url gets parsed before scene is loaded, so there is no way of knowing the
    // scene size when onboarding the scene
    // solution: set the sceneSize in a file, both scene and urlHelpers can read from it?
    // but then we need to parse first the location?

    const currentLocation = get(playerLocation);

    // scene is not loaded, getting the info from SCENE_INFO
    const sceneInfo = SCENE_INFO.find((obj) => obj.scene === currentLocation.scene);

    // dlog ("currentScene, sceneInfo", currentScene, sceneInfo)
    const currentSceneSize = new Phaser.Math.Vector2(sceneInfo.sizeX, sceneInfo.sizeY);

    minX = -(currentSceneSize.x / 2) + (ManageSession.avatarSize / 2);
    maxX = (currentSceneSize.x / 2) - (ManageSession.avatarSize / 2);
    minY = -(currentSceneSize.y / 2) + (ManageSession.avatarSize / 2);
    maxY = (currentSceneSize.y / 2) - (ManageSession.avatarSize / 2);

    // TODO SOLUTION end

    const queryX = parseInt(query.x, 10);
    const queryY = parseInt(query.y, 10);
    // dlog(pos, queryX, queryY);
    if (pos.x !== queryX) {
      if (Number.isNaN(queryX)) {
        // set it to prev player pos
        newPlayerPosition.x = Math.max(minX, Math.min(pos.x, maxX));
      } else {
        newPlayerPosition.x = Math.max(minX, Math.min(queryX, maxX));
      }
    }
    if (pos.y !== queryY) {
      if (Number.isNaN(queryY)) {
        // set it to prev player pos
        newPlayerPosition.y = Math.max(minX, Math.min(pos.y, maxX));
      } else {
        newPlayerPosition.y = Math.max(minY, Math.min(queryY, maxY));
      }
    }

    dlog('setting position to', newPlayerPosition);
    playerPos.set(newPlayerPosition);
  }

  if (stringify({ ...query }) !== stringify({ ...previousQuery })) {
    previousQuery = { ...query };
  }
}

/** Set up a subscription to the querystring (from svelte-spa-router)
 * (in other words: set up a listener to the current query string of the browser window)
 * Any changes to the querystring runs the parseQueryString function.
 * These changes set the playerPos & playerLocation stores */
querystring.subscribe(() => parseQueryString());


/* Set the query parameter after updating stores, because we have set up a subscription to these.
 * Any value changes on playerPos & playerLocation make this function run
* And subsequently update the query string in the URL of the browser */
export function updateQueryString() {
  const { x, y } = get(playerPos);
  const { scene, house } = get(playerLocation);


  if (x !== null && y !== null && scene !== null) {
    const query = { ...parse(get(querystring)) };
    const locationChanged = 'location' in previousQuery && scene !== previousQuery?.location;
    const method = locationChanged ? 'push' : 'replace';

    // Set variables (as string)
    query.x = Math.round(x).toString();
    query.y = Math.round(y).toString();
    query.location = scene;

    // House can be optional, and should be removed from querystring if null or empty
    if (scene !== DEFAULT_HOME || house === null) {
      delete query.house;
    } else {
      query.house = house;
    }

    if (stringify(previousQuery) !== stringify(query)) {
      const newLocation = `${get(location)}?${stringify(query)}`;
      // Only scene or app changes should be added to the browser history
      if (method === 'push') {
        push(newLocation);
        playerHistory.push(newLocation);
        dlog(`%cquerystring result: ${method}: ${newLocation}`, 'color: #00FF00');
      } else {
        // Location changes should just update the querystring..
        // ..so the location remains available on deeplinks and reloads
        replace(newLocation);
        playerHistory.replace(newLocation);
        dlog(`%cquerystring result: ${method}: ${newLocation}`, 'color: #FF0000');
      }
    }
  }
}

/** Set up the subscriptions to stores that should update the querystring
 *  In other words: any changes to playerPos and playerLocation stores
 *  should become part of the browser location
*/
playerPos.subscribe(() => updateQueryString());
playerLocation.subscribe(() => updateQueryString());



