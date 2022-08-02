/** Log message when debug == true
   * @return null
   * @todo get logging from config
  */
// eslint-disable-next-line import/prefer-default-export
export function dlog(...args) {
  const debug = true;

  if (debug) {
    // eslint-disable-next-line no-console
    const err = new Error();
    const line = err.stack;
    const lines = line.split('\n');
    console.log(...args, `${lines[2].substring(lines[2].indexOf('('), lines[2].lastIndexOf(')') + 1)}`);
  }
}


