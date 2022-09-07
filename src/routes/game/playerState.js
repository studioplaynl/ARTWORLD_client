import { writable, derived, get } from 'svelte/store';
import { dlog } from './helpers/DebugLog';
import {
  DEFAULT_ZOOM, ZOOM_MIN, ZOOM_MAX, ZOOM_STEP,
} from '../../constants';

export const playerPos = writable({
  x: null,
  y: null,
});
export const playerLocation = writable({
  scene: null,
  house: null,
});

const playerZoom = writable(null);
export const PlayerZoom = {

  subscribe: playerZoom.subscribe,
  set: playerZoom.set,
  update: playerZoom.update,

  pinch: (factor) => {
    if (get(playerZoom) * factor >= ZOOM_MAX) return;
    if (get(playerZoom) * factor <= ZOOM_MIN) return;
    playerZoom.update((zoom) => zoom * factor);
  },
  in: () => {
    const zoom = get(playerZoom);
    const targetZoom = Math.round((zoom + ZOOM_STEP) * 100, 10) / 100;
    if (targetZoom <= ZOOM_MAX) {
      playerZoom.set(targetZoom);
    }
  },
  out: () => {
    const zoom = get(playerZoom);
    const targetZoom = Math.round((zoom - ZOOM_STEP) * 100, 10) / 100;
    if (targetZoom >= ZOOM_MIN) {
      playerZoom.set(targetZoom);
    }
  },
  reset: () => {
    playerZoom.set(DEFAULT_ZOOM);
  },
};


/** @var {string} playerStreamID Name of current Nakama stream to get events from/to. Either a House ID or a Scene */
export const playerStreamID = derived(
  playerLocation,
  ($pl, set) => {
    if ($pl.house) set($pl.house);
    else set($pl.scene);
  },
);


function createHistory() {
  const playerHistoryStore = writable([]);

  return {
    subscribe: playerHistoryStore.subscribe,
    set: playerHistoryStore.set,
    update: playerHistoryStore.update,

    push: (path) => {
      playerHistoryStore.update((hist) => [
        ...hist,
        path,
      ]);
      dlog('push history =', get(playerHistoryStore));
    },

    replace: (path) => {
      playerHistoryStore.update((hist) => {
        const updatedHistory = [...hist];
        if (updatedHistory.length) {
          updatedHistory[updatedHistory.length - 1] = path;
        }
        return updatedHistory;
      });
      dlog('replace history =', get(playerHistoryStore));
    },

    pop: () => {
      playerHistoryStore.update((hist) => hist.slice(0, -1));
      dlog('pop history =', get(playerHistoryStore));
    },


    previous: () => {
      const hist = get(playerHistoryStore);
      const historyLength = hist.length;
      if (historyLength > 0) {
        return hist[historyLength - 1];
      }
      return null;
    },

    // Search for most recent visit to page (by string, for instance: getAt('Artworld'))
    getAt: (page) => {
      const filtered = get(playerHistoryStore).reverse().filter((el) => (el.indexOf(page) > -1));
      if (filtered.length > 0) return filtered[0];
      return null;
    },

  };
}


/** playerHistory gives us access to a bit more information than just pushing/popping on window.history */
export const playerHistory = createHistory();

window.getPlayerHistory = () => {
  console.log('history', get(playerHistory));
};
