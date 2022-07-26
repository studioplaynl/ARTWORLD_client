import { writable } from 'svelte/store';

const itembar = writable({
  playerClicked: false,
  onlinePlayerClicked: false,
});

export default itembar;
