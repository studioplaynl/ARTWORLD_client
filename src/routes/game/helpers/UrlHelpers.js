/* eslint-disable class-methods-use-this */
import { get } from 'svelte/store';
import { location } from 'svelte-spa-router';

export const getUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const posX = params.get('posX');
  const posY = params.get('posY');
  const Location = params.get('location');
  const object = { posX, posY, Location };
  // console.log("object", object)
  return object;
};

// export const setAndGoUrl = (loc, posX, posY) => {
//   const searchParams = new URLSearchParams(window.location.search);
//   if (loc) searchParams.set('location', loc);
//   if (posX) searchParams.set('posX', posX);
//   if (posY) searchParams.set('posY', posY);
//   window.location.search = searchParams.toString();
// };

export const setUrl = (local, posX, posY) => {
  window.history.pushState(
    '',
    'Artworld',
    `/?location=${local}&posX=${Math.round(posX)}&posY=${Math.round(posY)}#${get(location)}`,
  );
};
