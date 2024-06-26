/**
 * @file UrlHelpers
 * @author Eelke
 *
 *  What is this file for?
 *  ======================
 *  UrlHelpers is specifically made to cater to
 *  Svelte stores <=> Phaser game relationship via the URL
 *
 *  In general it works like this:
 *  - Selecting an App should be done by manipulating the URL directly
 *  - Any changes made to the Game state, should be made by directly manipulating these Svelte stores:
 *    - PlayerPos
 *    - PlayerLocation
 *    - PlayerZoom
 *  - The subscriptions to these stores, set-up at the bottom of UrlHelpers make sure the URL gets
 *    updated whenever these changes are registered
 *  - Whenever the game gets loaded (via direct load, refresh, or history event), the `parseURL` and `parseQueryString`
 *    methods rehydrate the stores with the information found in the window.location
 */

/* eslint-disable class-methods-use-this */
import { get } from 'svelte/store';
import { parse, stringify } from 'qs';
import {
  push, replace, location, querystring,
} from 'svelte-spa-router';
import {
  PlayerPos, PlayerLocation, PlayerHistory, PlayerZoom, PlayerUpdate,
} from '../playerState';
import { CurrentApp } from '../../../session';
import {
  DEFAULT_HOME, DEFAULT_ZOOM, SCENE_INFO, ZOOM_MAX, ZOOM_MIN, AVATAR_BASE_SIZE,
  DEFAULT_APP, isValidApp,
} from '../../../constants';
// eslint-disable-next-line no-unused-vars
import { dlog } from '../../../helpers/debugLog';
import SceneSwitcher from '../class/SceneSwitcher';
import ManageSession from '../ManageSession';

import * as Phaser from 'phaser';


let previousQuery = {};

/** Does this string exist as a scene name?
 * @return {boolean} Exists yes/no
 */
export const checkIfSceneIsAllowed = (loc) => {
  const lowercaseScenes = SCENE_INFO.map((obj) => obj.scene.toLowerCase());
  return loc && lowercaseScenes.indexOf(loc.toLowerCase()) > -1;
};

/** Does this string look like a house name name?
 * @return {boolean} yes/no
 */
export const checkIfLocationLooksLikeAHouse = (loc) => loc !== null && loc.split('-').length > 3;

export function returnPartsOfArtUrl(url) {
  const parts = url.split('/');
  if (parts.length > 2) {
    const artType = parts[0]; // assuming this is where the full artUrl is like "9_1659961342249_roodluipaard.png"
    const userId = parts[1];
    const fullArtUrl = parts[2];

    // Extracting artKey by removing X_ prefix and .png suffix
    const artKey = fullArtUrl.split('_').slice(1).join('_').replace('.png', '');

    return {
      userId, artType, fullArtUrl, artKey,
    };
  }
  dlog.log('String does not match the expected format.');
  return null;
}


/** Parse the URL and set currentApp accordingly */
export function parseURL() {
  const loc = get(location);
  // dlog('loc: ', loc)
  const parts = loc.split('/');

  // In case of error in url
  if (parts.length < 1) return;

  let appName = parts[1].toString().toLowerCase();
  const previousAppName = get(CurrentApp);
  // dlog("appName: ", appName, " previousAppName: ", previousAppName)

  // An empty appName is no longer supported, /game is default
  if (appName === '') {
    appName = DEFAULT_APP;
    replace(`/${appName}?${get(querystring)}`);
    PlayerHistory.replace(`/${appName}?${get(querystring)}`);
  }

  // Don't add login route to history
  if (`/${appName}` !== PlayerHistory.previous() && appName !== 'login') {
    PlayerHistory.push(`/${appName}`);
  }

  // Check if a valid app..
  if (isValidApp(appName)) {
    // game is also a valid app:
    // DEFAULT_APP === game
    // dlog('appName: ', appName);
    CurrentApp.set(appName);
    if (appName === DEFAULT_APP) {
      // when the app just launched ManageSession.currentScene is null
      if (ManageSession.currentScene === null) return;

      // only going to something else but game makes sense
      // going from game to game does not make sense
      if (previousAppName === 'game') return;

      SceneSwitcher.startSceneCloseApp(
        previousAppName,
        ManageSession.currentScene.scene.key,
      );
    } else {
      // when the app just launched ManageSession.currentScene is null
      if (typeof ManageSession.currentScene === 'undefined') return;

      SceneSwitcher.pauseSceneStartApp(
        ManageSession.currentScene,
        appName,
      );
    }
  }
}

/** Set-up subscription to svelte-spa-router location store */
location.subscribe(() => {
  // dlog('location.subscribe')
  parseURL();
});


/** Parse the Querystring and rehydrate Stores */
export function parseQueryString() {
  // console.time('parseQueryString');

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
  // add scene: DefaultUseHome in case of a house
  if (newPlayerLocation?.scene) {
    // dlog('newPlayerLocation: ', newPlayerLocation)
    PlayerLocation.set(newPlayerLocation);
  } else if (newPlayerLocation?.house) {
    newPlayerLocation.scene = DEFAULT_HOME;
    // dlog('newPlayerLocation: ', newPlayerLocation)
    PlayerLocation.set(newPlayerLocation);
  }


  if ('x' in query && 'y' in query) {
    // url gets parsed before scene is loaded, so there is no way of knowing the
    // scene size when onboarding the scene
    const currentLocation = get(PlayerLocation);

    // scene is not loaded, getting the info from SCENE_INFO
    const sceneInfo = SCENE_INFO.find((obj) => obj.scene === currentLocation.scene);

    if (sceneInfo) {
      // dlog ("currentScene, sceneInfo", currentScene, sceneInfo)
      const currentSceneSize = new Phaser.Math.Vector2(sceneInfo.sizeX, sceneInfo.sizeY);

      const avatarHalfSize = AVATAR_BASE_SIZE / 2;
      const minX = -(currentSceneSize.x / 2) + avatarHalfSize;
      const maxX = (currentSceneSize.x / 2) - avatarHalfSize;
      const minY = -(currentSceneSize.y / 2) + avatarHalfSize;
      const maxY = (currentSceneSize.y / 2) - avatarHalfSize;

      const queryX = parseInt(query.x, 10);
      const queryY = parseInt(query.y, 10);

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

      // dlog('setting position to', newPlayerPosition);
      if (newPlayerPosition.x !== pos.x || newPlayerPosition.y !== pos.y) {
        PlayerPos.set(newPlayerPosition);
      }
    } else {
      dlog('No sceneInfo found, not setting PlayerPos');
    }
  }

  if (stringify({ ...query }) !== stringify({ ...previousQuery })) {
    previousQuery = { ...query };
    // dlog('previousQuery: ', previousQuery);
  }
  // console.timeEnd('parseQueryString');
}

/** Set up a subscription to the querystring (from svelte-spa-router)
 * (in other words: set up a listener to the current query string of the browser window)
 * Any changes to the querystring runs the parseQueryString function.
 * These changes set the PlayerPos, PlayerLocation & PlayerZoom stores
 * Eg the in game back button works with this subscription
 * */
querystring.subscribe(() => {
  parseQueryString();
});



/* Set the query parameter after updating stores, because we have set up a subscription to these.
* Any value changes on PlayerPos & PlayerLocation make this function run
* And subsequently update the query string in the URL of the browser */
export function updateQueryString() {
  const { forceHistoryReplace } = get(PlayerUpdate);
  // dlog('forceHistoryReplace: ', forceHistoryReplace);

  // console.time(`updateQueryString for ${reason}`);

  const { x, y } = get(PlayerPos);
  const { scene, house } = get(PlayerLocation);
  const zoom = get(PlayerZoom);

  if (x !== null && y !== null && scene !== null) {
    const query = { ...parse(get(querystring)) };

    const locationChanged = 'location' in previousQuery && scene !== previousQuery?.location;
    const houseChanged = 'house' in previousQuery && house !== previousQuery?.house;
    // dlog('houseChanged: ', houseChanged)

    let method = (locationChanged || houseChanged) ? 'push' : 'replace';
    // dlog('method: ', method)
    if (!forceHistoryReplace) {
      PlayerUpdate.set({ forceHistoryReplace: true });
      // dlog('forceHistoryReplace: ', forceHistoryReplace);
      method = 'replace';
    }
    // dlog('method: ', method);

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
        // dlog('push: ', newLocation);
        push(newLocation);
        PlayerHistory.push(newLocation);
        // dlog(`%cquerystring result: ${method}: ${newLocation}`, 'color: #00FF00');
      } else {
        // Location changes should just update the querystring..
        // ..so the location remains available on deeplinks and reloads
        // dlog('replace: ', newLocation);
        replace(newLocation);
        PlayerHistory.replace(newLocation);
        // dlog(`%cquerystring result: ${method}: ${newLocation}`, 'color: #FF0000');
      }
    }
  }
  // console.timeEnd(`updateQueryString for ${reason}`);
}

/** Set up the subscriptions to stores that should update the querystring
 *  In other words: any changes to PlayerPos and PlayerLocation stores
 *  should become part of the browser location
*/
PlayerPos.subscribe(() => updateQueryString());
PlayerZoom.subscribe(() => updateQueryString());
PlayerLocation.subscribe(() => updateQueryString());



