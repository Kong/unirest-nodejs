var HashMapMarshal = require('../marshals/json');
var utils = require('../utils');

/**
 * An object that maps keys to values. A map cannot contain duplicate keys; each key can map to at most
 * one value.
 *
 * @param  {Object} collection The map whose mappings are to be placed in this map
 * @return {HashMap}
 */
function HashMap (collection) {
  this.map = {};

  // Ensure collection is an object
  if (utils.is(collection).a(Object)) {
    this.putAll(collection);
  }

  // Unmarshal collection from string representation
  if (utils.is(collection).a(String)) {
    this.putAll(HashMapMarshal.marshal(collection));
  }
};

/**
 * Returns original key if this map contains a mapping for the specified key with a case sensitive check,
 * otherwise returns false.
 *
 * @param  {String} key Specified key to evaluate existance of.
 * @return {String,Boolean}
 */
HashMap.prototype.containsKey = function containsKey (key) {
  var i = 0;
  var caseSensitiveMap;
  var caseSensitiveMapLength;

  caseSensitiveMap = Object.keys(this.map);
  caseSensitiveMapLength = caseSensitiveMap.length;

  for (; i < caseSensitiveMapLength; i++) {
    if (caseSensitiveMap[i] === key) {
      return caseSensitiveMap[i];
    }
  }

  return false;
};

/**
 * Returns original value if this map contains a mapping for the specified value with a case sensitive check,
 * otherwise returns false.
 *
 * @param  {String} value Specified value to evaluate existance of.
 * @return {String,Boolean}
 */
HashMap.prototype.containsValue = function containsValue (value) {
  var key;

  for (key in this.map) {
    if (this.map.hasOwnProperty(key) && this.map[key] === value) {
      return this.map[key];
    }
  }

  return false;
};

/**
 * Associates the specified value with the specified key in this map. If the map previously contained a
 * mapping for the key, the old value is replaced.
 *
 * @param  {Object}
 * @param  {Object}
 * @return {void}
 */
HashMap.prototype.put = function put (key, value) {
  this.map[this.containsKey(key) || key] = value;
};

/**
 * Copies all of the mappings from the specified map to this map. These mappings will replace any
 * mappings that this map had
 * @param  {[type]}
 * @return {[type]}
 */
HashMap.prototype.putAll = function putAll (collection) {
  var key;

  for (key in collection) {
    if (collection.hasOwnProperty(key)) {
      this.put(key, collection[key]);
    }
  }
};

/**
 * Removes all mappings from this map. The map will be empty after this call returns.
 *
 * @return {void}
 */
HashMap.prototype.clear = function clear () {
  // Ensure garbage collection
  this.map = null;

  // Instantiate a new object
  this.map = {};
};

/**
 * Removes the mapping for the specified key from this map if present.
 *
 * @param  {Object}
 * @return {Null,Object} Returns the previous value or null should no value exist prior to removing.
 */
HashMap.prototype.remove = function remove (key) {
  var exists = this.containsKey(key);
  var originalValue = null;

  if (exists) {
    originalValue = this.map[exists];
    delete this.map[exists];
  }

  return originalValue;
};

/**
 * Returns true if this map contains no key-value mappings.
 *
 * @return {Boolean}
 * @see #size
 */
HashMap.prototype.isEmpty = function isEmpty () {
  return this.size() === 0;
};

/**
 * Returns the number of key-value mappings in this map.
 *
 * @return {Number}
 * @see #isEmpty
 */
HashMap.prototype.size = function size () {
  return Object.keys(this.map).length;
};

/**
 * Returns a JSON string representation of this map.
 *
 * @return {String}
 * @see ./lib/marshals/json#marshal
 */
HashMap.prototype.toString = function toString () {
  return HashMapMarshal.unmarshal(this.map);
};

// Export
module.exports = HashMap;