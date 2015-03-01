var CookiesMarshal = require('../marshals/cookies')
var BodyMarshal = require('../marshals/body')
var HashMap = require('./hashmap')
var Headers = require('./headers')

/**
 * Status code error
 *
 * @param {Number} code Response status code
 * @param {String} body Response body
 */
function StatusError (code, body) {
  var message = body
  var error = new Error(message)

  this.name = 'StatusError'
  this.message = message || ''
  this.stack = error.stack

  error.status = code
  error.name = this.name
}

StatusError.prototype = Object.create(Error.prototype)

/**
 * A representation of the request response object.
 *
 * @class
 * @type {Object}
 * @author Nijiko Yonskai
 * @param {Object} response Response object from Request
 */
function Response (response) {
  for (var property in response) {
    this[property] = response[property]
  }

  /**
   * The raw response body.
   *
   * @member
   * @type {Object|String}
   */
  this.rawBody = this.body

  /**
   * The response headers hashmap.
   *
   * @member
   * @type {Headers}
   */
  this.headers = new Headers(this.headers)

  /**
   * The response cookie hashmap.
   *
   * @member
   * @type {HashMap}
   */
  this.cookies = new HashMap(CookiesMarshal.marshal(this.headers.get('cookie')))
  this.cookies.putAll(CookiesMarshal.marshal(this.headers.get('set-cookie')))

  /**
   * The response body, marshalled by content type
   *
   * @member
   * @type {Object}
   */
  this.body = BodyMarshal.marshal(this.type(true), this.body)

  /**
   * @member
   * @alias {@link .statuscode}
   * @type {Number}
   */
  this.code = this.statusCode

  /**
   * @member
   * @alias {@link .statuscode}
   * @type {Number}
   */
  this.status = this.statusCode

  /**
   * Status code range
   *
   * @member
   * @type {Number}
   */
  this.statusRange = (this.statusCode / 100 | 0)

  /**
   * Flagescribing whether response was within the INFO
   * status code range, (1xx).
   *
   * @member
   * @type {Boolean}
   */
  this.info = (1 === this.statusRange)

  /**
   * Flag describing whether response was within the OK
   * status code range, (2xx).
   *
   * @member
   * @type {Boolean}
   */
  this.ok = (2 === this.statusRange)

  /**
   * Flag describing whether response was within the Redirect
   * status code range, (3xx).
   *
   * @member
   * @type {Boolean}
   */
  this.redirection = (3 === this.statusRange)

  /**
   * Flag describing whether response was within the Client Error
   * status code range, (4xx).
   *
   * @member
   * @type {Boolean}
   */
  this.clientError = (4 === this.statusRange)

  /**
   * Flag describing whether response was within the Server Error
   * status code range, (4xx).
   *
   * @member
   * @type {Boolean}
   */
  this.serverError = (5 === this.statusRange)

  /**
   * Flag describing whether response contains the Accepted
   * status code (202).
   *
   * @member
   * @type {Boolean}
   */
  this.accepted = (202 === this.status)

  /**
   * Flag describing whether response contains the NO CONTENT
   * status code (204).
   *
   * @member
   * @type {Boolean}
   */
  this.noContent = (204 === this.status || 1223 === this.status)

  /**
   * Flag describing whether response contains the BAD REQUEST
   * status code (400).
   *
   * @member
   * @type {Boolean}
   */
  this.badRequest = (400 === this.status)

  /**
   * Flag describing whether response has the UNAUTHORIZED
   * status code (401).
   *
   * @member
   * @type {Boolean}
   */
  this.unauthorized = (401 === this.status)

  /**
   * Flag describing whether response has the NOT ACCEPTABLE
   * status code (406).
   *
   * @member
   * @type {Boolean}
   */
  this.notAcceptable = (406 === this.status)

  /**
   * Flag describing whether response has the NOT FOUND
   * status code (404).
   *
   * @member
   * @type {Boolean}
   */
  this.notFound = (404 === this.status)

  /**
   * Flag describing whether response has the FORBIDDEN
   * status code (403).
   *
   * @member
   * @type {Boolean}
   */
  this.forbidden = (403 === this.status)

  /**
   * Flag describing whether response within an ERROR
   * status code range (4xx - 5xx).
   *
   * @member
   * @type {Boolean|StatusError}
   */
  this.error = (4 === this.statusRange || 5 === this.statusRange) ?
    new StatusError(this.code, this.body) :
    false
}

/**
 * Returns the Content-Type header as specified in the response headers, by specifying the
 * parse flag only the value before the first semicolon is returned.
 *
 * Should the content-type header be unavailable 'application/octet-stream' is returneded as per
 * the HTTP Spec: http://www.w3.org/Protocols/rfc2616/rfc2616-sec7.html#sec7.2.1
 *
 * @method
 * @param  {Boolean} parse Mime type parsing flag
 * @return {String}
 */
Response.prototype.type = function (parse) {
  var contentType = this.headers.get('content-type')

  if (typeof contentType !== "string") {
    return 'application/octet-stream';
  }

  return parse ? contentType.split(/ *; */).shift() : contentType;
}

/**
 * Retrieves value of the specified key from cookies hashmap.
 *
 * @method
 * @param  {String} key
 * @return {Object}
 */
Response.prototype.cookie = function (key) {
  return this.cookies.get(key)
}