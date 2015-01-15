/**
 * Converts JSON string into JavaScript object
 *
 * @param  {String} string String to be marshalled to JSON object
 * @return {Object}
 */
exports.marshal = function (string) {
  var obj;

  try {
    obj = JSON.parse(string);
  } catch (e) {
    // TODO: Debug Log
  }

  return obj;
};

/**
 * Converts JavaScript object to a JSON string
 *
 * @param  {Object} obj Object to be unmarshalled into a JSON string
 * @return {String}
 */
exports.unmarshal = function (obj) {
  return JSON.stringify(obj);
};
