/* eslint-disable class-methods-use-this */
import { get } from 'svelte/store';
import { parse, stringify } from 'qs';
import {
  push, replace, location, querystring,
} from 'svelte-spa-router';
import {
  playerPosX, playerPosY, playerLocationScene, playerLocationHouse,
} from '../playerState';
import { VALID_USER_SCENES } from '../../../constants';

const MIN_X = -5000;
const MIN_Y = -5000;
const MAX_X = 5000;
const MAX_Y = 5000;

/** Parse the Querystring and rehydrate Stores */
export function parseQueryString() {
  const query = parse(get(querystring));

  // TODO: These boundries must be drawn from the current scene
  if (query?.x) {
    const queryX = parseInt(query.x, 10);
    if (get(playerPosX) !== queryX) {
      playerPosX.set(Math.max(MIN_X, Math.min(queryX, MAX_X)));
    }
  }

  if (query?.y) {
    const queryY = parseInt(query.y, 10);
    if (get(playerPosY) !== queryY) {
      playerPosY.set(Math.max(MIN_Y, Math.min(queryY, MAX_Y)));
    }
  }

  if (query?.house) {
    const looksLikeHouse = query.house.split('-').length > 3;
    if (looksLikeHouse && get(playerLocationHouse) !== query.house) {
      playerLocationHouse.set(query.house);
    }
  }

  if (query?.location) {
    const lowercaseScenes = VALID_USER_SCENES.map((scene) => scene.toLowerCase());
    const validSceneName = lowercaseScenes.indexOf(query.location.toLowerCase()) > -1;
    if (validSceneName && get(playerLocationScene) !== query.location) {
      playerLocationScene.set(query.location);
    }
  }
}

/* Set the query parameter after updating stores */
export function updateQueryString() {
  const x = get(playerPosX);
  const y = get(playerPosY);
  const l = get(playerLocationScene);
  const h = get(playerLocationHouse);

  // console.log('updateQueryString', x, y, l, get(querystring));

  if (x !== null && y !== null && l !== null && h !== null) {
    // console.log('updateQueryString called, querystring = ', get(querystring), x, y, l);

    const newQuery = { ...parse(get(querystring)) };

    // document.title = `ArtWorld — I am at ${newQuery.x} ${newQuery.y} - ${newQuery.location}`;

    let method = 'replace';
    if (newQuery.location !== l || newQuery.house !== h) {
      method = 'push';
    }

    newQuery.x = Math.round(x);
    newQuery.y = Math.round(y);
    newQuery.location = l;
    newQuery.house = h;

    if (method === 'push') {
      push(`${get(location)}?${stringify(newQuery)}`);
    } else {
      replace(`${get(location)}?${stringify(newQuery)}`);
    }
  }
}

// TODO: Check if this runs just once..
// console.log('Set up subscriptions');

querystring.subscribe(() => parseQueryString());
playerPosX.subscribe(() => updateQueryString());
playerPosY.subscribe(() => updateQueryString());
playerLocationScene.subscribe(() => updateQueryString());
playerLocationHouse.subscribe(() => updateQueryString());


