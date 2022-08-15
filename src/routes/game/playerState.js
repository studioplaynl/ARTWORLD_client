import { writable, derived, get } from 'svelte/store';
import { dlog } from './helpers/DebugLog';


export const playerPosX = writable(null);
export const playerPosY = writable(null);
export const playerLocation = writable({
  scene: null,
  house: null,
});

/** @var {string} playerStreamID Name of current Nakama stream to get events from/to. Either a House ID or a Scene */
export const playerStreamID = derived(
  playerLocation,
  ($pl, set) => {
    if ($pl.house !== null) set($pl.house);
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

    // Search for most recent visit to page (by string, for instance: getAt('Artworld'))
    getAt: (page) => {
      const filtered = get(playerHistoryStore).reverse().filter((el) => (el.indexOf(page) > -1));
      if (filtered.length > 0) return filtered[0];
      return null;
    },

  };
}

export const playerHistory = createHistory();

window.getPlayerHistory = () => {
  console.log('history', get(playerHistory));
};
