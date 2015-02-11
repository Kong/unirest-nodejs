var qs = require('qs');

/**
 * Converts form encoded string into JavaScript object
 *
 * @param  {String} string String to be marshalled to JSON object
 * @return {Object}
 */
exports.marshal = function (string) {
  return qs.parse(string);
};

/**
 * Converts JavaScript object into a form-encoded string
 *
 * @param  {Object} obj JavaScript object to unmarshalled to a form-encoded string
 * @return {String}
 */
exports.unmarshal = function (obj) {
  return qs.stringify(obj);
};