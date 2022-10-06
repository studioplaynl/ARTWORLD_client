// eslint-disable-next-line import/prefer-default-export
export const APPS = [
  'game',
  'house',
  'avatar',
  'drawingchallenge',
  'drawing',
  'stopmotion',
  'avatar',
  'house',
  'mariosound',
];

export const DEFAULT_APP = 'game';

export function isValidApp(app) {
  return APPS.indexOf(app) > -1;
}
