// var Authentication = require('./authentication');
// var Fields = require('./fields');
var Query = require('./query');
var HashMap = require('./hashmap');
var Headers = require('./headers');
// var Cookies = require('./cookies');
var utils = require('../utils');

/**
 * Defines an object to provide client request information to the underlying client library.
 *
 * @class
 * @type {Object}
 * @author Nijiko Yonskai
 */
function Request () {
  this._method = null;
  this._uri = null;
  this._query = new Query();
  // this._cookies = new Cookies();
  // this._authentication = new Authentication();
  this._headers = new Headers();
  // this._fields = new Fields();
}

/**
 * Associates the specified value with the specified key in the {@link Request#_query} mapping.
 *
 * When an arity of one argument is passed, the specified argument is treated as a collection and passed
 * to {@link Query#putAll()}.
 *
 * @method
 * @param  {(Object|HeaderString|Query|HashMap)} key
 * @param  {Object} value
 * @return {this}
 */
Request.prototype.query = function query (key, value) {
  if (arguments.length === 0) {
    return this._query;
  }

  this._query.put.apply(this._query, arguments);
  return this;
};

/**
 * Returns original key if this map contains a mapping for the specified key with a case insensitive check,
 * otherwise returns false.
 *
 * @method
 * @override
 * @see Query#containsKey
 * @param  {String} key Specified key to evaluate existance of.
 * @return {String|Boolean}
 */
Request.prototype.hasQueryParameter = function hasQueryParameter (key) {
  return this._query.containsKey(key);
};

/**
 * Associates the specified value with the specified key in the {@link Request#_headers} mapping.
 *
 * When an arity of one argument is passed, the specified argument is treated as a collection and passed
 * to {@link Header#putAll()}.
 *
 * @method
 * @param  {(Object|HeaderString|Header|HashMap)} key
 * @param  {Object} value
 * @return {void}
 */
Request.prototype.header = function header (key, value) {
  if (arguments.length === 0) {
    return this._headers;
  }

  this._headers.put.apply(this._headers, arguments);
  return this;
};

/**
 * Returns original key if this map contains a mapping for the specified key with a case insensitive check,
 * otherwise returns false.
 *
 * @method
 * @override
 * @see Headers#containsKey
 * @param  {String} key Specified key to evaluate existance of.
 * @return {(String|Boolean)}
 */
Request.prototype.hasHeader = function hasHeader (key) {
  return this._headers.containsKey(key);
};

/**
 * Associates the specified value as the Content-Type header on the {@link Request#_headers} mapping.
 *
 * When type value does not contain a forward slash a mimetype lookup is done to get the appropriate
 * mimetype string using the mime module.
 *
 * @method
 * @param  {String} value Specified content type value
 * @return {this}
 */
Request.prototype.type = function type (value) {
  this.header('Content-Type', utils.does(type).contain('/') ? value : mime.lookup(value));
  return this;
};

/**
 * @alias Request#header
 */
Request.prototype.headers = Request.prototype.header;

/**
 * @alias Request#header
 */
Request.prototype.set = Request.prototype.header;


module.exports = Request;