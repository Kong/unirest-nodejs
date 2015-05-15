/**
 * @module errors/StatusError
 * @author Nijiko Yonskai
 */

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

// Extend with Error prototype
StatusError.prototype = Object.create(Error.prototype)

// Export
module.exports = StatusError