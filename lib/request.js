// Third Party
var StringDecoder = require("string_decoder").StringDecoder
var request = require("request")
var FormData = require("form-data")
var Stream = require("stream")
var path = require("path")
var zlib = require("zlib")
var fs = require('fs')

// Interal
var Marshallers = require("./marshals")
var Constants = require('./constants')
var Helpers = require("./helpers")
var Unirest = require('./unirest')

/**
 * @module Request
 * @author Nijiko Yonskai
 */

/**
 * Request Class
 *
 * @class
 * @param {Object}   options  Request Options, supports all options in request
 */
function Request (options) {
  if (typeof options === "undefined") {
    throw new Error("Invalid usage, options is required.")
  }

  // Assign options to the instance
  this.options = options

  // Create lowercase header mapping
  if (this.options.headers) {
    this.lowercaseHeaders = Object
      .keys(this.options.headers)
      .map(function (key, index) {
        return key.toLowerCase()
      })
  }
}

/**
 * Basic Header Authentication Method
 *
 * Supports user being an Object to reflect Request
 * Supports user, password to reflect SuperAgent
 *
 * @param  {String|Object}  username
 * @param  {String}         password
 * @param  {Boolean}        immediate Send authentication details immediately
 *                                    Some services like Google require this option to be true.
 * @return {Object}
 */
Request.prototype.auth = function auth (username, password, immediate) {
  this.options.auth = Helpers.type(username) === "Object" ? username : {
    user: username,
    password: password,
    sendImmediately: immediate
  }

  return this
}

/**
 * Turn on multipart-form streaming
 *
 * @return {Object}
 */
Request.prototype.stream = function stream () {
  this.options.stream = true
  return this
}

/**
 * Add cookie to existing or internally created cookie jar.
 *
 * When no cookie jar exists, a cookie jar is created using
 * `Unirest.request.jar` with no storage options passed.
 *
 * @param  {String} name  Cookie name
 * @param  {String} value Cookie value
 * @param  {String} url   URL to be parsed for the domain
 * @return {Request}
 */
Request.prototype.cookie = function cookie (name, value, url) {
  if (!this.options.jar) {
    this.options.jar = Unirest.request.jar()
  }

  try {
    this.options.jar.setCookie(
      request.cookie(name + '=' + value),
      url
    )
  } catch (error) {
    throw new Error("Invalid cookie jar, please set cookies through your jar rather than unirest.")
  }

  return this
}

/**
 * Add querystring value to this requests url.
 *
 * Infers whether to append to existing querystring or
 * create querystring.
 *
 * API
 *
 * - `r.query -> value:Object -> r`: Marshals `value` to querystring representation
 *   before appending to url.
 * - `r.query -> value:String -> r`: Takes string value and appends to url.
 *
 * @param  {Object|String} value
 * @return {Request}
 */
Request.prototype.query = function query (value) {
  var ending

  if (Helpers.type(value) === "Object") {
    value = Marshallers.query.unmarshal(value)
  }

  if (!value || typeof value.length === "undefined") {
    return this
  }

  ending = this.options.url[this.options.url.length - 1]

  if (ending !== '&' || ending !== '?') {
    this.options.url += Helpers.contains(this.options.url, '?') ? '&' : '?'
  }

  this.options.url += value

  return this
}

/**
 * Add header to the request
 *
 * @param  {String} field Header field
 * @param  {String} value Header field value
 * @return {Request}
 */
Request.prototype.header =
Request.prototype.headers = function header (field, value) {
  var name
  var key

  if (Helpers.type(field) === "Object") {
    for (key in field) {
      if (field.hasOwnProperty(key)) {
        this.header(key, field[key])
      }
    }
  } else {
    name = this.hasHeader(field)

    if (!name) {
      this.lowercaseHeaders.push(field.toLowerCase())
      name = field
    }

    this.options.headers[name] = value
  }

  return this
}

/**
 * Sets the `X-Mashape-Key` header using {@link #header}
 *
 * @param  {String} value Mashape key
 * @return {Request}
 */
Request.prototype.mashape = function mashape (value) {
  return this.header('X-Mashape-Key', value)
}

/**
 * Tests whether some element in the array is the specified header name,
 * checks are case insensitive.
 *
 * @param  {String}  name Header name
 * @return {Boolean}
 */
Request.prototype.hasHeader = function has_header (name) {
  var query = name.toLowerCase()
  var index = this.lowercaseHeaders.length

  while(index--) {
    if (query === this.lowercaseHeaders[index]) {
      return this.lowercaseHeaders[index]
    }
  }

  return false
}

/**
 * Associates content type header with specified value. Should the specified
 * value not be a mimetype (e.g. does not contain a foreward slash: json, html, xml)
 * a mimetype lookup is performed.
 *
 * @param  {String} type
 * @return {Request}
 */
Request.prototype.type = function type (value) {
  this.header("Content-Type", Helpers.contains(value, '/') ?
    value :
    mime.lookup(value)
  )

  return this
}

/**
 * Attaches a field or file to the multipart-form request
 *
 * @param  {String} name
 * @param  {String} value
 * @param  {Object} options
 * @return {Request}
 */
Request.prototype.field = function field (name, value, options) {
  var serialized
  var length
  var index
  var key

  // Initialize form-data instance for later
  // submission instead of requests library
  if (!this.options.formData) {
    this.options.formData = new FormData()
  }

  options = options || {
    attachment: false
  }

  // r.field -> name:Object -> r
  if (Helpers.type(name) === "Object") {
    for (key in name) {
      if (name.hasOwnProperty(key)) {
        this.field(key, name[key], options)
      }
    }

    return this
  }

  // r.field -> name:String -> value:Array -> ?options:Object -> r
  if (Helpers.type(value) === "Array") {
    options.marshalled = true

    for (index = 0, length = value.length; index < length; i++) {
      if (serialized = Request._marshalFieldValue(value[i])) {
        this.field(name, serialized, options)
      }
    }

    return this
  }

  // r.field -> name:String -> value:Mixed -> ?options:Object -> r
  if (value != null) {
    if (options.attachment) {
      // Fetch only when contains http like pathway
      if (Helpers.contains(value, "http://") || Helpers.contains(value, "https://")) {
        value = request(item.value)
      // Only create streams when non-buffer
      } else if (!(value instanceof fs.FileReadStream || value instanceof Buffer)) {
        value = fs.createReadStream(path.resolve(value))
      }
    } else if (!options.marshalled) {
      value = Request._marshalFieldValue(value)
    }

    this.options.formData.append(name, value, options)
  }

  return this
}

/**
 * Takes multipart options and places them on `options.multipart` array.
 * Transforms body when an `Object` or _content-type_ is present.
 *
 * Example:
 *
 *      Unirest
 *        .get('http://google.com')
 *        .part({
 *          'content-type': 'application/json',
 *          body: {
 *            phrase: 'Hello'
 *          }
 *        })
 *        .part({
 *           body: {
 *             phrase: 'World'
 *           }
 *        })
 *        .part('Attachment')
 *        .end(function (response) {});
 *
 * @param  {Object|String} options When an Object, headers should be placed directly on the object,
 *                                 not under a child property.
 * @return {Request}
 */
Request.prototype.part = function part (data) {
  var options = {}
  var type

  if (!this.options.multipart) {
    this.options.multipart = []
  }

  if (Helpers.type(data) === "Object" && (data.body && (data.type || data["content-type"]))) {
    type = Helpers.type(data.type || data["content-type"])

    if (type) {
      data.body = Marshallers.body.unmarshal(type, data.body)
    } else if (typeof data.body === "object") {
      data.type = "application/json"
      data.body = Marshallers.body.unmarshal("application/json", data.body)
    }
  } else {
    data = {
      body: data
    }
  }

  this.options.multipart.push(data)
  return this
}

/**
 * Attach a file for a multipart-form request
 *
 * @param  {String} name
 * @param  {String} value
 * @return {Request}
 */
Request.prototype.attach = function attach (name, value, options) {
  options = options || {}
  options.attachment = true
  return this.field(name, value, options)
}

/**
 * Data marshalling for HTTP request body data
 *
 * Determines whether data type is `form` or `json`.
 * For irregular mime-types the `.type()` method is used to infer the `content-type` header.
 *
 * When mime-type contains `application/x-www-form-urlencoded`, data is appended
 * to existing payload rather than overwritten.
 *
 * @param  {Mixed} data
 * @return {Request}
 */
Request.prototype.send =
Request.prototype.body =
Request.prototype.payload = function send (data) {
  var type = this.options.headers[this.hasHeader("content-type")]
  var isJSON = type ? type.indexOf("json") === -1 : false
  var dataType = Helpers.type(data)
  var key

  if (dataType === "Object" && !Buffer.isBuffer(data)) {
    if (!type || !isJSON) {
      this.type("form")
      type = this.options.headers[this.hasHeader("content-type")]
      this.options.body = Marshallers.body.unmarshal(type, data)
    } else if (isJSON) {
      this.options.json = true

      // Merge objects should body already exists and is an Object
      if (this.options.body && Helpers.type(this.options.body) === "Object") {
        for (key in data) {
          if (data.hasOwnProperty(key)) {
            this.options.body[key] = data[key]
          }
        }
      } else {
        this.options.body = data
      }
    }
  } else if (dataType === "String") {
    if (!type) {
      this.type("form")
      type = this.options.headers[this.hasHeader("content-type")]
    }

    if (type.indexOf("application/x-www-form-urlencoded") !== -1) {
      this.options.body = this.options.body
        ? this.options.body + '&' + data
        : data
    } else {
      this.options.body = (this.options.body || '') + data
    }
  } else {
    this.options.body = data
  }

  return this
}

/**
 * Invokes the request library to start the request. Any callback passed
 * is invoked after the request has finalized.
 *
 * @param  {Function} callback
 * @return {Object}
 */
Request.prototype.end = function (callback) {
  this.callback = callback
  this.request = request(this.options, this._onRequestResponse.bind(this))
  this.request.on("response", this._onDataResponse.bind(this))

  return this.request
}

/**
 * Promise alias, invokes {@link #end}
 *
 * @param {Function} callback Success Handler
 * @return {Promise}
 */
Request.prototype.then = function () {
  var promise = new Promise(this.end.bind(this))
  return promise.then.apply(promise, arguments)
}

/**
 * Handles final response from request library
 *
 * @param  {Object} error    Request Error
 * @param  {Object} response Request response object
 * @param  {Mixed} body      Request payload
 */
Request.prototype._onRequestResponse = function (error, response, body) {
  if (error && !response) {
    return this._createError(error)
  }

  // Handle empty request object edge-case
  if (!response) {
    console.trace('Request returned empty response object without error. Please report to: http://github.com/mashape/unirest-nodejs')
    return callback(new Error("Request returned empty response object"))
  }

  return this._createResponse(response, body)
}

/**
 * Handle decoding response
 *
 * @param  {Object} response request object
 */
Request.prototype._onDataResponse = function (response) {
  var _on
  var unzip
  var stream
  var decoder

  if (/^(deflate|gzip)$/.test(response.headers['content-encoding'])) {
    unzip = zlib.createUnzip()
    stream = new Stream()
    _on = response.on

    // Ensure no error from missing request
    stream.req = response.req

    // Map unzip errors to stream errors
    unzip.on('error', function (error) {
      stream.emit('error', error)
    })

    // Start unzipping process
    response.pipe(unzip)

    // Ensure encoding is captured
    response.setEncoding = function (type) {
      decoder = new StringDecoder(type)
    }

    // Capture decompression and decode with captured encoding
    unzip.on('data', function (buffer) {
      var string

      if (!decoder) {
        return stream.emit('data', buffer)
      }

      if (string = decoder.write(buffer) && string.length) {
        stream.emit('data', string)
      }
    })

    // Map unzip ending
    unzip.on('end', function () {
      stream.emit('end')
    })

    // Replace response on emitter with a custom emitter
    response.on = function (type, next) {
      if ('data' == type || 'end' == type) {
        stream.on(type, next)
      } else if ('error' == type) {
        _on.call(response, type, next)
      } else {
        _on.call(response, type, next)
      }
    }
  }
}

/**
 * Handle request errors
 *
 * @param  {Object} error
 */
Request.prototype._createError = function (error) {
  this.callback(error)
}

/**
 * Handle building response object from request response
 *
 * @param  {Object} response Response object from request
 * @param  {Mixed} body      Response body
 */
Request.prototype._createResponse = function (response, body) {
  /**
   * The Response
   *
   * @type {Object}
   */
  var Response = response

  /**
   * The raw Response body.
   *
   * @member
   * @type {Object|String}
   */
  Response.rawBody = body || response.body

  /**
   * The Response headers collection.
   *
   * @member
   * @type {Headers}
   */
  Response.headers = response.headers

  /**
   * The parsed Response type
   *
   * @type {String}
   */
  Response.type = Helpers.type(Response.headers['content-type'], true) || "application/octet-stream"

  /**
   * The Response cookie collection.
   *
   * @member
   * @type {Collection}
   */
  Response.cookies = Marshallers.cookie.marshal(Response.headers['cookie'])

  /**
   * The Response body, marshalled by content type should a matching type be
   * found.
   *
   * @member
   * @type {Object}
   */
  Response.body = BodyMarshal.marshal(Response.type, body || response.body)

  /**
   * @member
   * @alias {@link .statuscode}
   * @type {Number}
   */
  Response.code = response.statusCode

  /**
   * @member
   * @alias {@link .statuscode}
   * @type {Number}
   */
  Response.status = response.statusCode

  /**
   * Status code range
   *
   * @member
   * @type {Number}
   */
  Response.statusRange = (Response.status / 100 | 0)

  /**
   * Flagescribing whether Response was within the INFO
   * status code range, (1xx).
   *
   * @member
   * @type {Boolean}
   */
  Response.info = (1 === Response.statusRange)

  /**
   * Flag describing whether Response was within the OK
   * status code range, (2xx).
   *
   * @member
   * @type {Boolean}
   */
  Response.ok = (2 === Response.statusRange)

  /**
   * Flag describing whether Response was within the Redirect
   * status code range, (3xx).
   *
   * @member
   * @type {Boolean}
   */
  Response.redirection = (3 === Response.statusRange)

  /**
   * Flag describing whether Response was within the Client Error
   * status code range, (4xx).
   *
   * @member
   * @type {Boolean}
   */
  Response.clientError = (4 === Response.statusRange)

  /**
   * Flag describing whether Response was within the Server Error
   * status code range, (4xx).
   *
   * @member
   * @type {Boolean}
   */
  Response.serverError = (5 === Response.statusRange)

  /**
   * Flag describing whether Response contains the Accepted
   * status code (202).
   *
   * @member
   * @type {Boolean}
   */
  Response.accepted = (202 === Response.status)

  /**
   * Flag describing whether Response contains the NO CONTENT
   * status code (204).
   *
   * @member
   * @type {Boolean}
   */
  Response.noContent = (204 === Response.status || 1223 === Response.status)

  /**
   * Flag describing whether Response contains the BAD REQUEST
   * status code (400).
   *
   * @member
   * @type {Boolean}
   */
  Response.badRequest = (400 === Response.status)

  /**
   * Flag describing whether Response has the UNAUTHORIZED
   * status code (401).
   *
   * @member
   * @type {Boolean}
   */
  Response.unauthorized = (401 === Response.status)

  /**
   * Flag describing whether Response has the NOT ACCEPTABLE
   * status code (406).
   *
   * @member
   * @type {Boolean}
   */
  Response.notAcceptable = (406 === Response.status)

  /**
   * Flag describing whether Response has the NOT FOUND
   * status code (404).
   *
   * @member
   * @type {Boolean}
   */
  Response.notFound = (404 === Response.status)

  /**
   * Flag describing whether Response has the FORBIDDEN
   * status code (403).
   *
   * @member
   * @type {Boolean}
   */
  Response.forbidden = (403 === Response.status)

  /**
   * Flag describing whether Response within an ERROR
   * status code range (4xx - 5xx).
   *
   * @member
   * @type {Boolean|StatusError}
   */
  Response.error = (4 === Response.statusRange || 5 === Response.statusRange) ?
    new StatusError(Response.status, Response.body) :
    false

  // Append Set-Cookies to list of Cookies
  Helpers.extend(Response.cookies, Marshallers.cookie.marshal(Response.headers["set-cookie"]))

  // Invoke callback
  this.callback(null, Response);
}

/**
 * Marshals multipart field values according to the type of value.
 *
 * Ignores `Streams`, `Buffers`, and `String` values. `Objects` are `JSON` stringified.
 * Everything else is converted to `String`.
 *
 * @param {Object} value
 */
Request._marshalFieldValue = function marshal_field_value (value) {
  if (value instanceof fs.FileReadStream || value instanceof Buffer || typeof value === "string") {
    return value
  }

  if (Helpers.type(value) === "Object") {
    return Marshallers.json.unmarshal(value)
  }

  return value.toString()
}

/**
 * Request library
 *
 * @type {Object}
 */
Request.request = request

/**
 * Add request option to Request method list
 *
 * @param {String} name      Option name
 * @param {String} reference Original method for aliases
 * @private
 */
function addRequestSugarMethod (name, reference) {
  Request.prototype[name] = reference ? Request.prototype[reference] : function (value) {
    this.options[name] = value
  }
}

/**
 * Implements additional promise(ify) methods that
 *
 * @param {String} name Promise method name
 * @private
 */
function addRequestPromiseMethod (name) {
  Request.prototype[name] = function () {
    var then = this.then()
    return then[name].apply(then, arguments)
  }
}

// Setup methods from request options
for (var index = 0; index < Constants.REQUEST_OPTIONS.length; index++) {
  var option = Constants.REQUEST_OPTIONS[index]
  var reference = null

  if (option.indexOf(':') !== -1) {
    option = option.split(':')
    reference = option[1]
    option = option[0]
  }

  addRequestSugarMethod(option, reference)
}

// Setup methods from promise options
for (var index = 0; index < Constants.PROMISE_METHODS.length; index++) {
  addRequestPromiseMethod(Constants.PROMISE_METHODS[index])
}

// Export
module.exports = Request