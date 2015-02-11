var HeadersMarshal = require('../marshals/header');
var HashMap = require('./hashmap');
var utils = require('../utils');

/**
 * An object that maps case insensitive keys to values. A map cannot contain duplicate keys;
 * each key can map to at most one value.
 *
 * @class
 * @augments HashMap
 * @author Nijiko Yonskai
 * @param  {Object} collection The map whose mappings are to be placed in this map
 * @return {Headers}
 */
function Headers (collection) {
  /**
   * The mapping table.
   *
   * @private
   * @member
   * @type {Object}
   */
  this.map = {};

  /**
   * The marshal mechanism for converting String to Headers.
   *
   * @private
   * @member
   * @type {Function}
   * @see HeadersMarshal#marshal
   */
  this.marshal = HeadersMarshal.marshal;

  /**
   * The marshal mechanism for converting Headers to String.
   *
   * @private
   * @member
   * @type {Function}
   * @see HeadersMarshal#unmarshal
   */
  this.unmarshal = HeadersMarshal.unmarshal;

  if (collection) {
    this.putAll(collection);
  }
};

Headers.prototype = Object.create(HashMap.prototype);
Headers.prototype.constructor = Headers;

/**
 * Returns original key if this map contains a mapping for the specified key with a case insensitive check,
 * otherwise returns false.
 *
 * @method
 * @override
 * @param  {String} key Specified key to evaluate existance of.
 * @return {String|Boolean}
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
 * @member
 * @override
 * @param  {String} value Specified value to evaluate existance of.
 * @return {String|Boolean}
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

/**
 * Retrieves value of the specified key.
 *
 * @member
 * @override
 * @param {Object} key
 * @return {Object}
 */
Headers.prototype.get = function get (key) {
  var exists = this.containsKey(key);
  return exists ? this.map[exists] : undefined;
};

/**
 * Copies all of the mappings from the specified map to this map. These mappings will replace any
 * mappings that this map had.
 *
 * @member
 * @override
 * @param  {Object|Header|HashMap} collection
 * @return {void}
 * @see HeadersMarshal#marshal
 */
Headers.prototype.putAll = function putAll (collection) {
  var key;

  // Marshal self
  if (collection instanceof Headers || collection instanceof HashMap) {
    collection = collection.map;
  }

  // Marshal collection from string representation
  if (utils.is(collection).a(String)) {
    collection = this.marshal(collection);
  }

  for (key in collection) {
    if (collection.hasOwnProperty(key)) {
      this.put(key, collection[key]);
    }
  }
};

/**
 * Returns a string representation of this map.
 *
 * @member
 * @override
 * @return {String}
 * @see HeadersMarshal#unmarshal
 */
Headers.prototype.toString = function toString () {
  return this.unmarshal(this.map);
};

// Export
module.exports = Headers;