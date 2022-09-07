/* eslint-disable class-methods-use-this */
import { get } from 'svelte/store';
import { parse, stringify } from 'qs';
import {
  push, replace, location, querystring,
} from 'svelte-spa-router';
import {
  PlayerPos, PlayerLocation, playerHistory, PlayerZoom,
} from '../playerState';
import { CurrentApp } from '../../../session';
import {
  DEFAULT_HOME, DEFAULT_ZOOM, SCENE_INFO, ZOOM_MAX, ZOOM_MIN,
} from '../../../constants';
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
  const lowercaseScenes = SCENE_INFO.map((obj) => obj.scene.toLowerCase());
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
  const pos = get(PlayerPos);
  const newPlayerPosition = { x: pos.x, y: pos.y };
  const newPlayerLocation = {};

  if ('house' in query) {
    if (checkIfLocationLooksLikeAHouse(query.house) && get(PlayerLocation).house !== query.house) {
      newPlayerLocation.house = query.house;
    }
  }

  if ('location' in query) {
    if (checkIfSceneIsAllowed(query.location) && get(PlayerLocation).scene !== query.location) {
      newPlayerLocation.scene = query.location;
    }
  }

  if ('zoom' in query) {
    if (parseFloat(query.zoom) <= ZOOM_MAX && parseFloat(query.zoom) >= ZOOM_MIN) {
      PlayerZoom.set(parseFloat(query.zoom));
    } else {
      PlayerZoom.set(DEFAULT_ZOOM);
    }
  } else {
    PlayerZoom.set(DEFAULT_ZOOM);
  }

  // Update the PlayerLocation store if a scene was set
  if (newPlayerLocation?.scene) {
    PlayerLocation.set(newPlayerLocation);
  }

  if ('x' in query && 'y' in query) {
    // url gets parsed before scene is loaded, so there is no way of knowing the
    // scene size when onboarding the scene

    const currentLocation = get(PlayerLocation);

    // scene is not loaded, getting the info from SCENE_INFO
    const sceneInfo = SCENE_INFO.find((obj) => obj.scene === currentLocation.scene);

    // dlog ("currentScene, sceneInfo", currentScene, sceneInfo)
    const currentSceneSize = new Phaser.Math.Vector2(sceneInfo.sizeX, sceneInfo.sizeY);

    minX = -(currentSceneSize.x / 2) + (ManageSession.avatarSize / 2);
    maxX = (currentSceneSize.x / 2) - (ManageSession.avatarSize / 2);
    minY = -(currentSceneSize.y / 2) + (ManageSession.avatarSize / 2);
    maxY = (currentSceneSize.y / 2) - (ManageSession.avatarSize / 2);

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
    PlayerPos.set(newPlayerPosition);
  }

  if (stringify({ ...query }) !== stringify({ ...previousQuery })) {
    previousQuery = { ...query };
  }
}

/** Set up a subscription to the querystring (from svelte-spa-router)
 * (in other words: set up a listener to the current query string of the browser window)
 * Any changes to the querystring runs the parseQueryString function.
 * These changes set the PlayerPos & PlayerLocation stores */
querystring.subscribe(() => parseQueryString());


/* Set the query parameter after updating stores, because we have set up a subscription to these.
 * Any value changes on PlayerPos & PlayerLocation make this function run
* And subsequently update the query string in the URL of the browser */
export function updateQueryString() {
  const { x, y } = get(PlayerPos);
  const { scene, house } = get(PlayerLocation);
  const zoom = get(PlayerZoom);

  if (x !== null && y !== null && scene !== null) {
    const query = { ...parse(get(querystring)) };
    const locationChanged = 'location' in previousQuery && scene !== previousQuery?.location;
    const method = locationChanged ? 'push' : 'replace';

    // Set variables (as string)
    query.x = Math.round(x).toString();
    query.y = Math.round(y).toString();
    query.location = scene;
    query.zoom = zoom;

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
 *  In other words: any changes to PlayerPos and PlayerLocation stores
 *  should become part of the browser location
*/
PlayerPos.subscribe(() => updateQueryString());
PlayerZoom.subscribe(() => updateQueryString());
PlayerLocation.subscribe(() => updateQueryString());



