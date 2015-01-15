var querystring = require('querystring');

/**
 * Converts form encoded string into JavaScript object
 *
 * @param  {String} string String to be marshalled to JSON object
 * @return {Object}
 */
exports.marshal = function (string) {
  var obj = {};
  var pairs = string.split('&');
  var parts;
  var pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    parts = pair.split('=');
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return obj;
};

/**
 * Converts JavaScript object into a form-encoded string
 *
 * @param  {Object} obj JavaScript object to unmarshalled to a form-encoded string
 * @return {String}
 */
exports.unmarshal = function (obj) {
  return querystring.stringify(obj);
};
