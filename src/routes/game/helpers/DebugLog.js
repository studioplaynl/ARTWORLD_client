/* eslint-disable import/prefer-default-export, no-console */
const debug = false;

/** Log message when debug == true
 * @return null
 * @todo get debug from config
 */
export const dlog = debug ? console.log.bind(window.console) : () => {};


