// eslint-disable-next-line import/prefer-default-export
export const APPS = [
  null,
  'drawing',
  'stopmotion',
  'house',
  'avatar',
  'drawingchallenge',
];

export function isValidApp(app) {
  return APPS.indexOf(app) > -1;
}
