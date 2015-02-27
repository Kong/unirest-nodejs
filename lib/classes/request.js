// var Authentication = require('./authentication');
// var Fields = require('./fields');
var Query = require('./query');
var HashMap = require('./hashmap');
var Headers = require('./headers');
// var Cookies = require('./cookies');
var Constants = require('../constants');
var utils = require('../utils');

/**
 * Defines an object to provide client request information to the underlying client library.
 *
 * @class
 * @type {Object}
 * @author Nijiko Yonskai
 * @param {Object} options Request options object
 * @param {String} options.method Request method verb
 */
function Request (options) {
  /**
   * The request method verb.
   *
   * @member
   * @private
   * @type {String}
   */
  this._method = null;

  /**
   * The request uri.
   *
   * @member
   * @private
   * @type {String}
   */
  this._uri = null;

  /**
   * The request query hashmap.
   *
   * @member
   * @private
   * @type {Query}
   */
  this._query = new Query();

  // this._cookies = new Cookies();
  // this._authentication = new Authentication();

  /**
   * The request headers hashmap.
   *
   * @member
   * @private
   * @type {Headers}
   */
  this._headers = new Headers();

  // this._fields = new Fields();

  this.method(options.method || Constants.METHODS[0]);
  this.uri(options.uri);
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
 * @return {this}
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
 * Associates the specified value as the `Content-Type` header in the {@link Request#_headers} mapping.
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
 * Associates the specified value as the `X-Mashape-Authorization` header in the {@link Request#_headers} mapping.
 *
 * @param {String} value Mashape Application Key
 * @return {this}
 */
Request.prototype.setMashapeKey = function (value) {
  this.header('X-Mashape-Authorization', value);
  return this;
};

/**
 * Alias for {@link Request#header}
 *
 * @method
 * @return {this}
 */
Request.prototype.headers = Request.prototype.header;

/**
 * Alias for {@link Request#header}
 *
 * @method
 * @return {this}
 */
Request.prototype.set = Request.prototype.header;

/**
 * Alias for {@link Request#query}
 *
 * @method
 * @return {this}
 */
Request.prototype.qs = Request.prototype.query;

/**
 * Alias for {@link Request#query}
 *
 * @method
 * @return {this}
 */
Request.prototype.queryString = Request.prototype.query;

/**
 * Returns a JSON representation of this object for the request library.
 *
 * @return {Object} JSON representation
 * @see {@link Request#end}
 */
Request.prototype.toRequestOptions = function toRequestOptions () {
  return {
    url: this._uri,
    timeout: this._timeout,
    qs: this._query.map,
    useQuerystring: this._useQuerystring,
    method: this._method,
    jar: this._cookies,
    headers: this._headers.map,
    body: this._body,
    form: this._form,
    formData: this._formData,
    multipart: this._multipart,
    gzip: this._gzip,
    json: this._json,
    encoding: this._encoding,
    jsonReviver: this._jsonReviver,
    preambleCRLF: this._preambleCRLF,
    postambleCRLF: this._postambleCRLF,
    followRedirect: this._followRedirect,
    followAllRedirects: this._followAllRedirects,
    maxRedirects: this._maxRedirects,
    pool: this._pool,
    proxy: this._proxy,
    tunnel: this._tunnel,
    localAddress: this._localAddress,
    proxyHeaderWhitelist: this._proxyHeaderWhitelist,
    proxyHeaderExclusiveList: this._proxyHeaderExclusivelist,
    auth: this._authentication,
    aws: this._aws,
    hawk: this._hawk,
    oauth: this._oauth,
    strictSSL: this._strictSSL,
    agentOptions: this._agentOptions,
    httpSignature: this._httpSignature
  }
};

// Generate aliased methods from the underlying request library.
Constants.OPTIONS.forEach(function (method, index) {
  var reference = method;

  if (method.indexOf(':') != -1) {
    method = method.split(':');
    reference = method[1];
    method = method[0];
  }

  Request.prototype[method] = function (value) {
    this['_' + reference] = value;
    return this;
  };
});

module.exports = Request;