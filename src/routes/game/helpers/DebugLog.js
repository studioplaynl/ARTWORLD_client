/** Log message when debug == true
   * @return null
   * @todo get logging from config
  */
// eslint-disable-next-line import/prefer-default-export
export function dlog(...args) {
  const debug = true;

  if (debug) {
    // eslint-disable-next-line no-console
    console.log(args);
  }
}
