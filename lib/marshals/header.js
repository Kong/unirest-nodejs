var utils = require('../utils');

/**
 * Convert JavaScript object to headers string, omitting request line
 *
 * @param  {Object} obj Object map containing key value data
 * @return {String}
 */
exports.marshal = function (obj) {
  var headers = "";

  for (var key in obj) {
    headers += utils.normalizeHeaderName(key) + ': ' + obj[key] + '\r\n';
  }

  return headers + '\r\n';
};

/**
 * Convert headers string into JavaScript object with lowercase header names
 *
 * @param  {String} string Headers string to be marshalled to JavaScript object
 * @return {Object}
 */
exports.unmarshal = function (string) {
  var lines = string.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  // Remove Trailing CLRF
  lines.pop();

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
};
