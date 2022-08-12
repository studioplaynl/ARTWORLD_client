import { writable, derived } from 'svelte/store';


export const playerPosX = writable(null);
export const playerPosY = writable(null);
export const playerLocationScene = writable(null);
export const playerLocationHouse = writable(null);

export const playerStreamID = derived(
  [
    playerLocationScene,
    playerLocationHouse,
  ],
  ([$scene, $house], set) => {
    if ($house) set($house);
    else set($scene);
  },
);



//  getRPCStreamID() {
//     const streamID = get(playerLocationHouse) || get(playerLocationScene);
//     return streamID;
//   }

