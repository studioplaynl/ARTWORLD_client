/* eslint-disable import/prefer-default-export, no-console */
const debug = true;
const warn = true;
const info = true;

/** Log message when debug == true
 * @return null
 * @todo get debug from config
 */
export const dlog = debug ? console.log.bind(window.console) : () => { };

/** Log warning when warn == true
 * @return null
 * @todo get debug from config
 */
export const dwarn = warn ? console.warn.bind(window.console) : () => { };

/** Log warning when warn == true
 * @return null
 * @todo get debug from config
 */
export const dinfo = info ? console.info.bind(window.console) : () => { };
