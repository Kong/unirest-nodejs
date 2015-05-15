var Json = require('./json')
var Query = require('./query')
var Helpers = require("../helpers")

/**
 * @module marshals/body
 * @author Nijiko Yonskai
 */

/**
 * Associates mimetypes to a data marshaller.
 *
 * @member
 * @type {Object}
 */
exports.map = {
  'application/x-www-form-urlencoded': Query,
  'application/json': Json,
  'text/javascript': Json,
  '+json': Json
}

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
exports.marshal = function MarshalBody (mimetype, data) {
  var marshaller = Helpers.firstMatch(mimetype, exports.map)
  return marshaller ? marshaller.marshal(data) : data
}

/**
 * Converts specified data using specified mimetype against {@link module:marshals/body.map} to determine
 * the marshal module to be used to unmarshal output.
 *
 * @method
 * @param  {String} mimetype Body mimemimetype
 * @param  {Object} data Data to be marshalled
 * @return {Object}
 * @see {@link module:marshals/body.map}
 */
exports.unmarshal = function UnmarshalBody (mimetype, data) {
  var marshaller = Helpers.firstMatch(mimetype, exports.map)
  return marshaller ? marshaller.unmarshal(data) : data
}
