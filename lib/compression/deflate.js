var zlib = require('zlib')

/**
 * @module compression/deflate
 * @author Nijiko Yonskai
 */

/**
 * Converts specified data using specified mimetype against {@link module:marshals/body.map} to determine
 * the marshal module to be used to marshal output.
 *
 * @method
 * @param  {String} mimetype Body mimemimetype
 * @param  {Object} data Data to be marshalled
 * @return {Object}
 * @see {@link module:marshals/body.map}
 */
exports.reader = function Reader (opts) {
  return zlib.createInflate(opts || {})
}