/* eslint-disable class-methods-use-this */
import { get } from 'svelte/store';
import { parse, stringify } from 'qs';
import {
  push, replace, location, querystring,
} from 'svelte-spa-router';
import {
  playerPosX, playerPosY, playerLocation, playerHistory,
} from '../playerState';
import { DEFAULT_HOME, VALID_USER_SCENES } from '../../../constants';
import { dlog } from './DebugLog';

const MIN_X = -5000;
const MIN_Y = -5000;
const MAX_X = 5000;
const MAX_Y = 5000;

let previousQuery = {};

/** Parse the Querystring and rehydrate Stores */
export function parseQueryString() {
  const query = parse(get(querystring));

  // TODO: These boundries must be drawn from the current scene
  if ('x' in query) {
    const queryX = parseInt(query.x, 10);
    if (get(playerPosX) !== queryX) {
      playerPosX.set(Math.max(MIN_X, Math.min(queryX, MAX_X)));
    }
  }

  if ('y' in query) {
    const queryY = parseInt(query.y, 10);
    if (get(playerPosY) !== queryY) {
      playerPosY.set(Math.max(MIN_Y, Math.min(queryY, MAX_Y)));
    }
  }

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
}
/** Set up a subscription to the querystring (from svelte-spa-router)
 * (in other words: set up a listener to the current query string of the browser window)
 * Any changes to the querystring runs the parseQueryString function.
 * These changes set the playerPos & playerLocation stores */
querystring.subscribe(() => parseQueryString());


/* Set the query parameter after updating stores, because we have set up a subscription to these.
 * Any value changes on playerPosX, playerPosY, playerLocation make this function run
* And subsequently update the query string in the URL of the browser */
export function updateQueryString() {
  const x = get(playerPosX);
  const y = get(playerPosY);
  const l = get(playerLocation).scene;
  const h = get(playerLocation).house;

  if (x !== null && y !== null && l !== null) {
    const query = { ...parse(get(querystring)) };

    let method = 'replace';

    const locationChanged = l !== previousQuery?.location;
    // const locationIsDefaultHome = l === DEFAULT_HOME;
    // const houseChanged = h !== previousQuery?.house;
    // const houseIsNull = h === null;

    // const pushLocation = (locationChanged && !locationIsDefaultHome && houseIsNull);
    // const pushHouse = (locationIsDefaultHome && houseChanged && !houseIsNull);


    // if (pushLocation || pushHouse) {
    //   method = 'push';
    // }

    if (locationChanged) method = 'push';

    // Set variables (as string)
    query.x = Math.round(x).toString();
    query.y = Math.round(y).toString();
    query.location = l;

    // House can be optional, and should be removed from querystring if null or empty
    if (l !== DEFAULT_HOME || h === null) {
      delete query.house;
    } else {
      query.house = h;
    }

    if (stringify(previousQuery) !== stringify(query)) {
    //   console.log(
    //     'Query: ',
    //     query,
    //     '\nPrevious Query',
    //     previousQuery,
    //     '\n',
    //     {
    //       locationChanged, locationIsDefaultHome, houseChanged, houseWasUndefined, houseIsNull,
    //     },
    //     { pushLocation, pushHouse },
    //   );

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
playerPosX.subscribe(() => updateQueryString());
playerPosY.subscribe(() => updateQueryString());
playerLocation.subscribe(() => updateQueryString());



