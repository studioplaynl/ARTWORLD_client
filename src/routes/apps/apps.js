// eslint-disable-next-line import/prefer-default-export
export const APPS = [
  'game',
  'drawing',
  'stopmotion',
  'house',
  'avatar',
  'drawingchallenge',
];

export const DEFAULT_APP = 'game';

export function isValidApp(app) {
  return APPS.indexOf(app) > -1;
}
