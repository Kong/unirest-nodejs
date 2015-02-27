var JsonMarshal = require('../marshals/json')
var utils = require('../utils')

/**
 * An object that maps keys to values. A map cannot contain duplicate keys. Each key can map to at most
 * one value.
 *
 * @class
 * @type {Object}
 * @author Nijiko Yonskai
 * @param  {Object} collection The map whose mappings are to be placed in this map
 * @return {HashMap}
 */
function HashMap (collection) {
  /**
   * The mapping table.
   *
   * @private
   * @member
   * @type {Object}
   */
  this.map = {}

  /**
   * The marshal mechanism for converting String to Headers.
   *
   * @private
   * @member
   * @type {Function}
   * @see {@link module:marshals/json.marshal}
   */
  this.marshal = JsonMarshal.marshal

  /**
   * The marshal mechanism for converting Headers to String.
   *
   * @private
   * @member
   * @type {Function}
   * @see {@link module:marshals/json.unmarshal}
   */
  this.unmarshal = JsonMarshal.unmarshal

  if (collection) {
    this.putAll(collection)
  }
}

/**
 * Returns original key if this map contains a mapping for the specified key with a case sensitive check,
 * otherwise returns false.
 *
 * @param  {String} key Specified key to evaluate existance of.
 * @return {String|Boolean}
 */
HashMap.prototype.containsKey = function containsKey (key) {
  return typeof this.map[key] === 'undefined' ? false : key
}

/**
 * Returns original value if this map contains a mapping for the specified value with a case sensitive check,
 * otherwise returns false.
 *
 * @param  {String} value Specified value to evaluate existance of.
 * @return {String|Boolean}
 */
HashMap.prototype.containsValue = function containsValue (value) {
  var key

  for (key in this.map) {
    if (this.map.hasOwnProperty(key) && this.map[key] === value) {
      return this.map[key]
    }
  }

  return false
}

/**
 * Associates the specified value with the specified key in this map. If the map previously contained a
 * mapping for the key, the old value is replaced.
 *
 * When an arity of one argument is passed, the specified argument is treated as a collection and passed
 * to {@link HashMap#putAll()}.
 *
 * @param  {Object} key
 * @param  {Object} value
 * @return {void}
 */
HashMap.prototype.put = function put (key, value) {
  // Ensure user sent a single argument.
  if (arguments.length === 1) {
    return this.putAll(key)
  }

  this.map[this.containsKey(key) || key] = value
}

/**
 * Copies all of the mappings from the specified map to this map. These mappings will replace any
 * mappings that this map had.
 *
 * @param  {Object|HashMap} collection
 * @return {void}
 */
HashMap.prototype.putAll = function putAll (collection) {
  var key

  // Marshal self
  if (collection instanceof HashMap) {
    collection = collection.map
  }

  // Marshal collection from string representation
  if (utils.is(collection).a(String)) {
    collection = this.marshal(collection)
  }

  for (key in collection) {
    if (collection.hasOwnProperty(key)) {
      this.put(key, collection[key])
    }
  }
}

/**
 * Retrieves value of the specified key.
 *
 * @param {Object} key
 * @return {Object}
 */
HashMap.prototype.get = function get (key) {
  return this.map[key]
}

/**
 * Removes all mappings from this map. The map will be empty after this call returns.
 *
 * @return {void}
 */
HashMap.prototype.clear = function clear () {
  // Ensure garbage collection
  this.map = null

  // Instantiate a new object
  this.map = {}
}

/**
 * Removes the mapping for the specified key from this map if present.
 *
 * @param  {Object} key
 * @return {Null|Object} Returns the previous value or null should no value exist prior to removing.
 */
HashMap.prototype.remove = function remove (key) {
  var exists = this.containsKey(key)
  var originalValue = null

  if (exists) {
    originalValue = this.map[exists]
    delete this.map[exists]
  }

  return originalValue
}

/**
 * Returns true if this map contains no key-value mappings.
 *
 * @return {Boolean}
 */
HashMap.prototype.isEmpty = function isEmpty () {
  return this.size() === 0
}

/**
 * Returns the number of key-value mappings in this map.
 *
 * @return {Number}
 */
HashMap.prototype.size = function size () {
  return Object.keys(this.map).length
}

/**
 * Returns a JSON string representation of this map.
 *
 * @return {String}
 */
HashMap.prototype.toString = function toString () {
  return this.unmarshal(this.map)
}

// Export
module.exports = HashMap