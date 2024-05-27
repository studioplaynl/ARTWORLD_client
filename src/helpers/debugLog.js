/* eslint-disable import/prefer-default-export, no-console */
const debug = true;
const warn = true;
const info = true;

/** Log message when debug == true
 * @return null
 */
export const dlog = debug ? console.log.bind(window.console) : () => {};

/** Log warning when warn == true
 * @return null
 */
export const dwarn = warn ? console.warn.bind(window.console) : () => {};

/** Log warning when warn == true
 * @return null
 */
export const dinfo = info ? console.info.bind(window.console) : () => {};
