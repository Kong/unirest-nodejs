var utils = require('../utils');

/**
 * An object that maps case insensitive keys to values. A map cannot contain duplicate keys;
 * each key can map to at most one value.
 *
 * @param  {Object} collection The map whose mappings are to be placed in this map
 * @return {Headers}
 */
module.exports = function Headers (collection) {
  this.map = {};

  // Ensure collection is an object
  if (utils.is(collection).a(Object)) {
    this.putAll(collection);
  }
};

/**
 * Headers extends HashMap
 * @type {Prototype}
 */
Headers.prototype = Object.create(HashMap.prototype);

/**
 * Returns original key if this map contains a mapping for the specified key with a case insensitive check,
 * otherwise returns false.
 *
 * @param  {String} key Specified key to evaluate existance of.
 * @return {String,Boolean}
 */
Headers.prototype.containsKey = function containsKey (key) {
  var i = 0;
  var caseSensitiveMap;
  var caseSensitiveMapLength;

  key = key.toLowerCase();
  caseSensitiveMap = Object.keys(this.map);
  caseSensitiveMapLength = caseSensitiveMap.length;

  for (; i < caseSensitiveMapLength; i++) {
    if (caseSensitiveMap[i].toLowerCase() === key) {
      return caseSensitiveMap[i];
    }
  }

  return false;
};

/**
 * Returns original value if this map contains a mapping for the specified value with a case insensitive check,
 * otherwise returns false.
 *
 * @param  {String} value Specified value to evaluate existance of.
 * @return {String,Boolean}
 */
Headers.prototype.containsValue = function containsValue (value) {
  var key;

  value = value.toLowerCase();

  for (key in this.map) {
    if (this.map.hasOwnProperty(key) && this.map[key].toLowerCase() === value) {
      return this.map[key];
    }
  }

  return false;
};