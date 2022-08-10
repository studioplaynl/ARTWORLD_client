/* eslint-disable class-methods-use-this */
import { get } from 'svelte/store';
import { parse, stringify } from 'qs';
import { push, location, querystring } from 'svelte-spa-router';
import { playerPosX, playerPosY, playerLocation } from '../playerState';
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
    playerPosX.set(Math.max(MIN_X, Math.min(queryX, MAX_X)));
  }

  if (query?.y) {
    const queryY = parseInt(query.y, 10);
    playerPosY.set(Math.max(MIN_Y, Math.min(queryY, MAX_Y)));
  }

  if (query?.location) {
    const lowercaseScenes = VALID_USER_SCENES.map((scene) => scene.toLowerCase());
    const looksLikeHouse = query.location.split('-').length > 3;
    const validSceneName = lowercaseScenes.indexOf(query.location.toLowerCase()) > -1;
    if (looksLikeHouse || validSceneName) {
      playerLocation.set(query.location);
    }
  }
}

/* Set the query parameter after updating stores */
export function updateQueryString() {
  const x = get(playerPosX);
  const y = get(playerPosY);
  const l = get(playerLocation);

  // console.log('updateQueryString', x, y, l, get(querystring));

  if (x !== null && y !== null && l !== null) {
    // console.log('updateQueryString called, querystring = ', get(querystring), x, y, l);

    const newQuery = { ...parse(get(querystring)) };
    newQuery.x = Math.round(x);
    newQuery.y = Math.round(y);
    newQuery.location = l;

    // console.log('updateQueryString called, newQuery = ', newQuery);

    push(`${get(location)}?${stringify(newQuery)}`);
  }
}

// TODO: Check if this runs just once..
console.log('Set up subscriptions');
playerPosX.subscribe(() => updateQueryString());
playerPosY.subscribe(() => updateQueryString());
playerLocation.subscribe(() => updateQueryString());


