// eslint-disable-next-line import/prefer-default-export
// Should be lowerCase!
// export const APPS = [
//   'game',
//   'house',
//   'avatar',
//   'drawingchallenge',
//   'drawing',
//   'stopmotion',
//   'animalchallenge',
//   'flowerchallenge',
//   'mariosound',
// ];

export const APPS = [
  { app: 'game', appType: '', multiFrameDraw: false },
  { app: 'house', appType: 'draw', multiFrameDraw: false },
  { app: 'avatar', appType: 'draw', multiFrameDraw: true },
  { app: 'drawing', appType: 'draw', multiFrameDraw: false },
  { app: 'stopmotion', appType: 'draw', multiFrameDraw: true },
  { app: 'animalchallenge', appType: 'draw', multiFrameDraw: true },
  { app: 'flowerchallenge', appType: 'draw', multiFrameDraw: false },
  { app: 'mariosound', appType: 'sound', multiFrameDraw: false },
];

export function isValidApp(app) {
  return APPS.some((entry) => entry.app === app);
}

export const DEFAULT_APP = 'game';

