// var Authentication = require('./authentication');
// var Fields = require('./fields');
var Query = require('./query');
var HashMap = require('./hashmap');
var Headers = require('./headers');
// var Cookies = require('./cookies');

/**
 * Defines an object to provide client request information to the underlying client library.
 *
 * @class
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
 * Associates the specified value with the specified key in the Request#_query mapping.
 *
 * When an arity of one argument is passed, the specified argument is treated as a collection and passed
 * to #putAll().
 *
 * @member
 * @param  {Object|HeaderString|Query|HashMap} key
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
 * Associates the specified value with the specified key in the Request#_header mapping.
 *
 * When an arity of one argument is passed, the specified argument is treated as a collection and passed
 * to #putAll().
 *
 * @member
 * @param  {Object|HeaderString|Header|HashMap} key
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

module.exports = Request;