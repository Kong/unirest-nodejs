var json = require('./json');
var query = require('./query');

/**
 * Map of content-type to data marshal
 *
 * @type {Object}
 */
exports.map = {
  'application/x-www-form-urlencoded': query,
  'application/json': json
};

/**
 * Convert body data of content type, to its respective output
 *
 * @param  {String} type Body content-type
 * @param  {Mixed} data Data to be marshalled
 * @return {Mixed} Marshaller output based on content-type
 * @see #map for more content-type mapping
 */
exports.marshal = function MarshalBody (type, data) {
  return exports.map[type] ? exports.map[type].marshal(data) : data;
};

/**
 * Convert body data of content type, to its respective output
 *
 * @param  {String} type Body content-type
 * @param  {Mixed} data Data to be marshalled
 * @return {Mixed} Marshaller output based on content-type
 * @see #map for more content-type mapping
 */
exports.unmarshal = function UnmarshalBody (type, data) {
  return exports.map[type] ? exports.map[type].unmarshal(data) : data;
};
