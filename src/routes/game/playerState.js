import { writable, derived, get } from 'svelte/store';
// eslint-disable-next-line no-unused-vars
import { dlog } from '../../helpers/debugLog';
import {
  DEFAULT_ZOOM, ZOOM_MIN, ZOOM_MAX, ZOOM_STEP,
} from '../../constants';

/**
 * @var {Writable} PlayerPos A store to store player current X/Y position in Phaser game
*/
export const PlayerPos = writable({
  x: null,
  y: null,
});

/**
 * @var {Writable} PlayerLocation A store to control which scene / house gets loaded
 * SceneSwitcher subscribes to any changes here.
*/
export const PlayerLocation = writable({
  scene: null,
  house: null,
});

/**
 * @var {Writable} PlayerUpdate A store to explicitly enable replacing a history entry
 * Created to deal with out-of-sync issue, where scenes were not finished loading,
 * while PlayerPos would already be set, resulting in incorrect (mixed) history entries.
*/
export const PlayerUpdate = writable({
  forceHistoryReplace: true,
});

const playerZoom = writable(null);

/**
 * @var {Writable} PlayerZoom A store to control current zoom level in Phaser
*/
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
    const targetZoom = Math.round((zoom + ZOOM_STEP) * 100) / 100;
    if (targetZoom <= ZOOM_MAX) {
      playerZoom.set(targetZoom);
    }
  },
  out: () => {
    const zoom = get(playerZoom);
    const targetZoom = Math.round((zoom - ZOOM_STEP) * 100) / 100;
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
  PlayerLocation,
  ($pl, set) => {
    if ($pl.house) set($pl.house);
    else set($pl.scene);
  },
);


function createHistory() {
  const PlayerHistoryStore = writable([]);

  return {
    subscribe: PlayerHistoryStore.subscribe,
    set: PlayerHistoryStore.set,
    update: PlayerHistoryStore.update,

    push: (path) => {
      PlayerHistoryStore.update((hist) => [
        ...hist,
        path,
      ]);
      // dlog('push history =', get(PlayerHistoryStore));
    },

    replace: (path) => {
      PlayerHistoryStore.update((hist) => {
        const updatedHistory = [...hist];
        if (updatedHistory.length) {
          updatedHistory[updatedHistory.length - 1] = path;
        }
        return updatedHistory;
      });
      // dlog('replace history =', get(PlayerHistoryStore));
    },

    pop: () => {
      PlayerHistoryStore.update((hist) => hist.slice(0, -1));
      // dlog('pop history =', get(PlayerHistoryStore));
    },


    previous: () => {
      const hist = get(PlayerHistoryStore);
      const historyLength = hist.length;
      if (historyLength > 0) {
        return hist[historyLength - 1];
      }
      return null;
    },

    // Search for most recent visit to page (by string, for instance: getAt('Artworld'))
    getAt: (page) => {
      const filtered = get(PlayerHistoryStore).reverse().filter((el) => (el.indexOf(page) > -1));
      if (filtered.length > 0) return filtered[0];
      return null;
    },

  };
}


/**
 * @var {Writable} PlayerHistory Store to give us access to a bit more information
 * than simply pushing/popping on window.history */
export const PlayerHistory = createHistory();


window.getPlayerHistory = () => {
  dlog('history', get(PlayerHistory));
};
