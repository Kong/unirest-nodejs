var QueryMarshal = require('../marshals/query')
var HashMap = require('./hashmap')
var utils = require('../utils')

/**
 * An object that maps case insensitive keys to values. A map cannot contain duplicate keys
 * each key can map to at most one value.
 *
 * @class
 * @type {Query}
 * @augments HashMap
 * @author Nijiko Yonskai
 * @param  {Object} collection The map whose mappings are to be placed in this map
 * @return {Query}
 */
function Query (collection) {
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
   * @see QueryMarshal#marshal
   */
  this.marshal = QueryMarshal.marshal

  /**
   * The marshal mechanism for converting Headers to String.
   *
   * @private
   * @member
   * @type {Function}
   * @see QueryMarshal#unmarshal
   */
  this.unmarshal = QueryMarshal.unmarshal

  if (collection) {
    this.putAll(collection)
  }
}

Query.prototype = Object.create(HashMap.prototype)
Query.prototype.constructor = Query

/**
 * Copies all of the mappings from the specified map to this map. These mappings will replace any
 * mappings that this map had.
 *
 * @method
 * @override
 * @param  {Object|Query|HashMap} collection
 * @return {void}
 */
Query.prototype.putAll = function putAll (collection) {
  var key

  // Marshal self and hashmaps
  if (collection instanceof Query || collection instanceof HashMap) {
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

// Export
module.exports = Query