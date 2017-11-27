let debug = () => {}

if (__DEV__) {
  debug = require('debug')
  // Heads Up!
  // https://github.com/visionmedia/debug/pull/331
  //
  // debug now clears storage on load, grab the debug settings before require('debug').
  // We try/catch here as Safari throws on localStorage access in private mode or with cookies disabled.
  let DEBUG
  try {
    DEBUG = window.localStorage.debug
  } catch (e) {
    /* eslint-disable no-console */
    console.error('Could not enable debug.')
    console.error(e)
    /* eslint-enable no-console */
  }

  // enable what ever settings we got from storage
  debug.enable(DEBUG)
}

/**
 * Create a namespaced debug function.
 *
 * @param {String} namespace Usually a component name.
 *
 * @example
 * import { makeDebugger } from 'common/lib'
 * const debug = makeDebugger('namespace')
 *
 * debug('Some message')
 *
 * @returns {Function}
 */
const makeDebugger = namespace => debug(`ap:${namespace}`)

export default makeDebugger
