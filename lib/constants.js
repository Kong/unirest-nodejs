/**
 * @module constants
 * @author Nijiko Yonskai
 */

/**
 * HTTP method verbage in uppercase.
 *
 * @constant
 * @type {Array}
 */
exports.METHODS = [
  'GET',
  'HEAD',
  'PUT',
  'POST',
  'PATCH',
  'DELETE',
  'OPTIONS'
]

/**
 * Request option method names
 * Alias names are deliminated by colon (:), original name is last.
 *
 * @constant
 * @type {Array}
 */
exports.REQUEST_OPTIONS = [
  'uri:url',
  'redirects:maxRedirects',
  'redirect:followRedirect',
  'url',
  'method',
  'form',
  'formData',
  'json',
  'jsonReviver',
  'multipart',
  'preambleCRLF',
  'postambleCRLF',
  'followRedirect',
  'followAllRedirects',
  'maxRedirects',
  'encoding',
  'pool',
  'timeout',
  'proxy',
  'proxyHeaderWhitelist',
  'proxyHeaderExclusiveList',
  'tunnel',
  'oauth',
  'hawk',
  'ssl:strictSSL',
  'strictSSL',
  'jar',
  'cookies:jar',
  'aws',
  'httpSignature',
  'localAddress',
  'ip:localAddress',
  'secureProtocol',
  'forever'
]
