// eslint-disable-next-line import/prefer-default-export
export const APPS = [
  'game',
  'drawing',
  'stopmotion',
  'house',
  'avatar',
  'drawingchallenge',
  'dev_drawing',
  'dev_stopmotion',
  'dev_avatar',
  'dev_house',
];

export const DEFAULT_APP = 'game';

export function isValidApp(app) {
  return APPS.indexOf(app) > -1;
}
