var json = require('./json');
var query = require('./query');

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
  'application/x-www-form-urlencoded': query,
  'application/json': json
};

/**
 * Converts specified data using specified mimetype against {@link module:marshals/body.map} to determine
 * the marshal module to be used to marshal output.
 *
 * @member
 * @param  {String} mimetype Body mimemimetype
 * @param  {Object} data Data to be marshalled
 * @return {Object}
 * @see {@link module:marshals/body.map}
 */
exports.marshal = function MarshalBody (mimetype, data) {
  return exports.map[mimetype] ? exports.map[mimetype].marshal(data) : data;
};

/**
 * Converts specified data using specified mimetype against {@link module:marshals/body.map} to determine
 * the marshal module to be used to unmarshal output.
 *
 * @member
 * @param  {String} mimetype Body mimemimetype
 * @param  {Object} data Data to be marshalled
 * @return {Object}
 * @see {@link module:marshals/body.map}
 */
exports.unmarshal = function UnmarshalBody (mimetype, data) {
  return exports.map[mimetype] ? exports.map[mimetype].unmarshal(data) : data;
};
