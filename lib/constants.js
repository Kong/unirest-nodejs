/**
 * HTTP Methods
 *
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
];

/**
 * Request option method names
 *
 * Alias names are deliminated by colon (:), original name is last.
 *
 * @type {Array}
 */
exports.OPTION_METHODS = [
  'uri:url',
  'redirects:maxRedirects',
  'redirect:followRedirect',
  'url',
  'method',
  'qs',
  'form',
  'json',
  'multipart',
  'followRedirect',
  'followAllRedirects',
  'maxRedirects',
  'encoding',
  'pool',
  'timeout',
  'proxy',
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
];
