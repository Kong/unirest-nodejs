// Third-Party
var Promise = require("bluebird")

// Internal
var Constants = require("./constants")
var Request = require("./request")
var Helpers = require("./helpers")

/**
 * @module Unirest
 * @author Nijiko Yonskai
 */

/**
 * Unirest Constructor
 *
 * @param {String}   method   Request method
 * @param {Object}   options  Request library options
 * @param {Function} callback Optional callback for immediate invoke
 */
function Unirest (method) {
  function main (url, options, callback) {
    var request

    if (Helpers.type(url) === "Object") {
      callback = options
      options = url
    }

    if (Helpers.type(options) !== "Object") {
      options = {}
      options = Helpers.extend(options, Unirest.defaults)
    }

    if (typeof url === "String") {
      options.url = url
    }

    // Set method on the options object
    options.method = method || "GET"

    // Initialize request
    request = new Request(options)

    // Immediate invocation
    if (typeof callback === "function") {
      return request.end(callback)
    }

    return request
  }

  if (arguments.length === 1) {
    return main
  }

  return main(arguments[1], arguments[2], arguments[3])
}

/**
 * Default option values for each request
 *
 * @type {Object}
 */
Unirest.defaults = {}

/**
 * @alias
 * @see {@link Request#request}
 * @type {Function}
 */
Unirest.request = Request.request

/**
 * @alias request library cookie method
 * @type {Function}
 */
Unirest.cookie = Unirest.request.cookie

/**
 * @alias request library pipe method
 * @type {Function}
 */
Unirest.pipe = Unirest.request.pipe

/**
 * Expose tough-cookie cookie store
 * @return {Function}
 */
Unirest.jar = function (options) {
  var jar = Unirest.request.jar()
  options = options || {}

  // Because Requests aliases toughcookie rather than returning.
  if (options.store) {
    jar._jar.store = options.store
  }

  if (options.rejectPublicSuffixes) {
    jar._jar.rejectPublicSuffixes = options.rejectPublicSuffixes
  }

  // Alias helper methods
  jar.add = jar.setCookie
  jar.toString = jar.getCookieString

  // Export
  return jar
}

/**
 * Add sugar method such as #get to Unirest Class
 *
 * @param {String} method HTTP Method
 * @private
 */
function addUnirestMethod (method) {
  Unirest[method] = Unirest(method)
}

// Setup methods from promise options
for (var index = 0; index < Constants.METHODS.length; index++) {
  addUnirestMethod(Constants.METHODS[index])
}

// Export
module.exports = Unirest