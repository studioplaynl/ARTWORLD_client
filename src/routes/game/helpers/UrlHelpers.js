/* eslint-disable class-methods-use-this */
import { get } from 'svelte/store';
import { parse, stringify } from 'qs';
import {
  push, replace, location, querystring,
} from 'svelte-spa-router';
import {
  playerPos, playerLocation, playerHistory,
} from '../playerState';
import { DEFAULT_HOME, VALID_USER_SCENES, SCENE_INFO } from '../../../constants';
import { dlog } from './DebugLog';
import ManageSession from '../ManageSession';

const { Phaser } = window;

let minX = -5000;
let minY = -5000;
let maxX = 5000;
let maxY = 5000;

let previousQuery = {};

/** Parse the Querystring and rehydrate Stores */
export function parseQueryString() {
  const query = parse(get(querystring));
  const pos = get(playerPos);
  const newPlayerPosition = { x: pos.x, y: pos.y };



  const newPlayerLocation = {};

  if ('house' in query) {
    const looksLikeHouse = query.house.split('-').length > 3;
    if (looksLikeHouse && get(playerLocation).house !== query.house) {
      newPlayerLocation.house = query.house;
    }
  }

  if ('location' in query) {
    const lowercaseScenes = VALID_USER_SCENES.map((scene) => scene.toLowerCase());
    const validSceneName = lowercaseScenes.indexOf(query.location.toLowerCase()) > -1;
    if (validSceneName && get(playerLocation).scene !== query.location) {
      newPlayerLocation.scene = query.location;
    }
  }

  // Update the playerLocation store if a scene was set
  if (newPlayerLocation?.scene) {
    playerLocation.set(newPlayerLocation);
  }

  if (stringify({ ...query }) !== stringify({ ...previousQuery })) {
    // console.log('query diff!', { ...query }, { ...previousQuery });
    previousQuery = { ...query };
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

    let method = 'replace';

    const locationChanged = scene !== previousQuery?.location;


    if (locationChanged) method = 'push';

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



