/**
 * Unirest for Node
 *
 * @author Nijko Yonskai
 * @copyright 2013
 * @license MIsT
 */

/**
 * Module Dependencies
 */

var StringDecoder = require('string_decoder').StringDecoder;
var QueryString = require('querystring');
var FormData = require('form-data');
var Stream = require('stream');
var mime = require('mime');
var zlib = require('zlib');
var path = require('path');
var URL = require('url');
var fs = require('fs');
var Promise = require('bluebird');

/**
 * Define form mime type
 */

mime.define({
  'application/x-www-form-urlencoded': ['form', 'urlencoded', 'form-data']
});

/**
 * Initialize our Rest Container
 *
 * @type {Object}
 */
var Unirest = function (method, uri, headers, body, callback) {
  var unirest = function (uri, headers, body, callback) {
    var $this = {
      /**
       * Stream Multipart form-data request
       *
       * @type {Boolean}
       */
      _stream: false,

      /**
       * Container to hold multipart form data for processing upon request.
       *
       * @type {Array}
       * @private
       */
      _multipart: [],

      /**
       * Container to hold form data for processing upon request.
       *
       * @type {Array}
       * @private
       */
      _form: [],

      /**
       * Request option container for details about the request.
       *
       * @type {Object}
       */
      options: {
        /**
         * Url obtained from request method arguments.
         *
         * @type {String}
         */
        url: uri,

        /**
         * Method obtained from request method arguments.
         *
         * @type {String}
         */
        method: method,

        /**
         * List of headers with case-sensitive fields.
         *
         * @type {Object}
         */
        headers: {}
      },

      hasHeader: function (name) {
        var headers;
        var lowercaseHeaders;

        name = name.toLowerCase();
        headers = Object.keys($this.options.headers);
        lowercaseHeaders = headers.map(function (header) {
          return header.toLowerCase();
        });

        for (var i = 0; i < lowercaseHeaders.length; i++) {
          if (lowercaseHeaders[i] === name) {
            return headers[i];
          }
        }

        return false;
      },

      /**
       * Turn on multipart-form streaming
       *
       * @return {Object}
       */
      stream: function () {
        $this._stream = true;

        return this;
      },

      /**
       * Attaches a field to the multipart-form request, with pre-processing.
       *
       * @param  {String} name
       * @param  {String} value
       * @return {Object}
       */
      field: function (name, value, options) {
        return handleField(name, value, options);
      },

      /**
       * Attaches a file to the multipart-form request.
       *
       * @param  {String} name
       * @param  {String|Object} path
       * @return {Object}
       */
      attach: function (name, path, options) {
        options = options || {};
        options.attachment = true;
        return handleField(name, path, options);
      },

      /**
       * Attaches field to the multipart-form request, with no pre-processing.
       *
       * @param  {String} name
       * @param  {String|Object} path
       * @param  {Object} options
       * @return {Object}
       */
      rawField: function (name, value, options) {
        $this._multipart.push({
          name: name,
          value: value,
          options: options,
          attachment: options.attachment || false
        });
      },

      /**
       * Basic Header Authentication Method
       *
       * Supports user being an Object to reflect Request
       * Supports user, password to reflect SuperAgent
       *
       * @param  {String|Object} user
       * @param  {String} password
       * @param  {Boolean} sendImmediately
       * @return {Object}
       */
      auth: function (user, password, sendImmediately) {
        $this.options.auth = (is(user).a(Object)) ? user : {
          user: user,
          password: password,
          sendImmediately: sendImmediately
        };

        return $this;
      },

      /**
       * Sets header field to value
       *
       * @param  {String} field Header field
       * @param  {String} value Header field value
       * @return {Object}
       */
      header: function (field, value) {
        if (is(field).a(Object)) {
          for (var key in field) {
            if (field.hasOwnProperty(key)) {
              $this.header(key, field[key]);
            }
          }

          return $this;
        }

        var existingHeaderName = $this.hasHeader(field);
        $this.options.headers[existingHeaderName || field] = value;

        return $this;
      },

      /**
       * Serialize value as querystring representation, and append or set on `Request.options.url`
       *
       * @param  {String|Object} value
       * @return {Object}
       */
      query: function (value) {
        if (is(value).a(Object)) value = Unirest.serializers.form(value);
        if (!value.length) return $this;
        $this.options.url += (does($this.options.url).contain('?') ? '&' : '?') + value;
        return $this;
      },

      /**
       * Set _content-type_ header with type passed through `mime.lookup()` when necessary.
       *
       * @param  {String} type
       * @return {Object}
       */
      type: function (type) {
        $this.header('Content-Type', does(type).contain('/')
          ? type
          : mime.lookup(type));
        return $this;
      },

      /**
       * Data marshalling for HTTP request body data
       *
       * Determines whether type is `form` or `json`.
       * For irregular mime-types the `.type()` method is used to infer the `content-type` header.
       *
       * When mime-type is `application/x-www-form-urlencoded` data is appended rather than overwritten.
       *
       * @param  {Mixed} data
       * @return {Object}
       */
      send: function (data) {
        var type = $this.options.headers[$this.hasHeader('content-type')];

        if (is(data).a(Object) && !Buffer.isBuffer(data)) {
          if (!type || type != 'application/json') {
            $this.type('form');
            type = $this.options.headers[$this.hasHeader('content-type')];
            $this.options.body = Unirest.serializers.form(data);
          } else if (type == 'application/json') {
            $this.options.json = true;

            if ($this.options.body && is($this.options.body).a(Object)) {
              for (var key in data) {
                if (data.hasOwnProperty(key)) {
                  $this.options.body[key] = data[key];
                }
              }
            } else {
              $this.options.body = data;
            }
          }
        } else if (is(data).a(String)) {
          if (!type) {
            $this.type('form');
            type = $this.options.headers[$this.hasHeader('content-type')];
          }

          if ('application/x-www-form-urlencoded' == type) {
            $this.options.body = $this.options.body
              ? $this.options.body + '&' + data
              : data;
          } else {
            $this.options.body = ($this.options.body || '') + data;
          }
        } else {
          $this.options.body = data;
        }

        return $this;
      },

      /**
       * Takes multipart options and places them on `options.multipart` array.
       * Transforms body when an `Object` or _content-type_ is present.
       *
       * Example:
       *
       *      Unirest.get('http://google.com').part({
       *        'content-type': 'application/json',
       *        body: {
       *          phrase: 'Hello'
       *        }
       *      }).part({
       *        'content-type': 'application/json',
       *        body: {
       *          phrase: 'World'
       *        }
       *      }).end(function (response) {});
       *
       * @param  {Object|String} options When an Object, headers should be placed directly on the object,
       *                                 not under a child property.
       * @return {Object}
       */
      part: function (options) {
        if (!$this._multipart)
          $this.options.multipart = [];

        if (is(options).a(Object)) {
          if (options['content-type']) {
            var type = Unirest.type(options['content-type'], true);
            if (type) options.body = Unirest.Response.parse(options.body);
          } else {
            if (is(options.body).a(Object))
              options.body = Request.serializers.json(options.body);
          }

          $this.options.multipart.push(options);
        } else {
          $this.options.multipart.push({
            body: options
          });
        }

        return $this;
      },

      /**
       * Sends HTTP Request and awaits Response finalization. Request compression and Response decompression occurs here.
       * Upon HTTP Response post-processing occurs and invokes `callback` with a single argument, the `[Response](#response)` object.
       *
       * @param  {Function} callback
       * @return {Object}
       */
      end: function (callback) {
        var Request;
        var header;
        var parts;
        var form;

        function handleRequestResponse (error, response, body) {
          var result = {};
          var status;
          var data;
          var type;

          // Handle pure error
          if (error && !response) {
            result.error = error;

            (callback) && callback(result);
            return;
          }

          // Handle No Response...
          // This is weird.
          if (!response) {
            console.log('This is odd, report this action / request to: http://github.com/mashape/unirest-nodejs');

            result.error = {
              message: 'No response found.'
            };

            (callback) && callback(result);
            return;
          }

          // Handle References
          result = response;

          // Handle Status
          status = response.statusCode;
          type = status / 100 | 0;

          result.code = status;
          result.status = status;
          result.statusType = type;
          result.info = 1 == type;
          result.ok = 2 == type;
          result.clientError = 4 == type;
          result.serverError = 5 == type;
          result.accepted = 202 == status;
          result.noContent = 204 == status || 1223 == status;
          result.badRequest = 400 == status;
          result.unauthorized = 401 == status;
          result.notAcceptable = 406 == status;
          result.notFound = 404 == status;
          result.forbidden = 403 == status;
          result.error = (4 == type || 5 == type)
            ? function () {
                var msg = 'got ' + result.status + ' response';
                var err = new Error(msg);
                    err.status = result.status;
                return err;
              }()
            : false;

          // Cookie Holder
          result.cookies = {};

          // Cookie Sugar Method
          result.cookie = function (name) {
            return result.cookies[name];
          };

          function setCookie (cookie) {
            var crumbs = Unirest.trim(cookie).split('=');
            var key = Unirest.trim(crumbs[0]);
            var value = Unirest.trim(crumbs.slice(1).join('='));

            if (crumbs[0] && crumbs[0] != '') {
              result.cookies[key] = value === ''
                ? true
                : value;
            }
          }

          if (response.cookies && is(response.cookies).a(Object) && Object.keys(response.cookies).length > 0) {
            result.cookies = response.cookies;
          } else {
            // Set-Cookie Parsing
            var cookies = response.headers['set-cookie'];

            if (cookies && is(cookies).a(Array)) {
              for (var index = 0; index < cookies.length; index++) {
                var entry = cookies[index];

                if (is(entry).a(String) && does(entry).contain(';')) {
                  entry.split(';').forEach(setCookie);
                }
              }
            }

            // Sometimes you get this header.
            cookies = response.headers.cookie;

            if (cookies && is(cookies).a(String)) {
              cookies.split(';').forEach(setCookie);
            }
          }

          // Response

          body = body || response.body;
          result.raw_body = body;
          result.headers = response.headers;

          // Handle Response Body

          if (body) {
            type = Unirest.type(result.headers['content-type'], true);
            if (type) data = Unirest.Response.parse(body, type);
            else data = body;
          }

          result.body = data;

          (callback) && callback(result);
        }

        function handleGZIPResponse (response) {
          if (/^(deflate|gzip)$/.test(response.headers['content-encoding'])) {
            var unzip = zlib.createUnzip();
            var stream = new Stream();
            var decoder, _on = response.on;

            // Keeping node happy
            stream.req = response.req;

            // Make sure we emit prior to processing
            unzip.on('error', function (error) {
              stream.emit('error', error);
            });

            // Start the processing
            response.pipe(unzip);

            // Ensure encoding is captured
            response.setEncoding = function (type) {
              decoder = new StringDecoder(type);
            };

            // Capture decompression and decode with captured encoding
            unzip.on('data', function (buffer) {
              if (!decoder) return stream.emit('data', buffer);
              var string = decoder.write(buffer);
              if (string.length) stream.emit('data', string);
            });

            // Emit yoself
            unzip.on('end', function () {
              stream.emit('end');
            });

            response.on = function (type, next) {
              if ('data' == type || 'end' == type) {
                stream.on(type, next);
              } else if ('error' == type) {
                _on.call(response, type, next);
              } else {
                _on.call(response, type, next);
              }
            };
          }
        }

        function handleFormData (form) {
          for (var i = 0; i < $this._multipart.length; i++) {
            var item = $this._multipart[i];

            if (item.attachment && is(item.value).a(String)) {
              if (does(item.value).contain('http://') || does(item.value).contain('https://')) {
                item.value = Unirest.request(item.value);
              } else {
                item.value = fs.createReadStream(path.resolve(item.value));
              }
            }

            form.append(item.name, item.value, item.options);
          }

          return form;
        }

        if ($this._multipart.length && !$this._stream) {
          parts = URL.parse($this.options.url);
          form = new FormData();

          if (header = $this.options.headers[$this.hasHeader('content-type')]) {
            $this.options.headers['content-type'] = header.split(';')[0] + '; boundary=' + form.getBoundary();
          } else {
            $this.options.headers['content-type'] = 'multipart/form-data; boundary=' + form.getBoundary();
          }

          return handleFormData(form).submit({
            protocol: parts.protocol,
            port: parts.port,
            // Formdata doesn't expect port to be included with host
            // so we use hostname rather than host
            host: parts.hostname,
            path: parts.path,
            method: $this.options.method,
            headers: $this.options.headers,
            auth: $this.options.auth || parts.auth
          }, function (error, response) {
            var decoder = new StringDecoder('utf8');

            if (error) {
              return handleRequestResponse(error, response);
            }

            if (!response.body) {
              response.body = "";
            }

            // Node 10+
            response.resume();

            // GZIP, Feel me?
            handleGZIPResponse(response);

            // Fallback
            response.on('data', function (chunk) {
              if (typeof chunk === 'string') response.body += chunk;
              else response.body += decoder.write(chunk);
            });

            // After all, we end up here
            response.on('end', function () {
              return handleRequestResponse(error, response);
            });
          });
        }

        Request = Unirest.request($this.options, handleRequestResponse);
        Request.on('response', handleGZIPResponse);

        if ($this._multipart.length && $this._stream)
          handleFormData(Request.form());

        return Request;
      },


      /**
       * Alternative to using `end`. Sends HTTP Request and returns a promise for the response.
       *
       * @param  {Function} successHandler
       * @return {Promise}
       */
      then: function then() {
        //Create a promise containing the response.
        var promise = new Promise($this.end.bind($this));
        //Call `then` on the promise with the arguments we were passed.
        return promise.then.apply(promise, arguments);
      }
    };

    /**
     * Add alternative promise methods to `then` to start of the promise chain.
     */
    var PROMISE_METHODS = ['bind', 'catch', 'spread', 'otherwise', 'map', 'reduce', 'tap', 'thenReturn', 'return',
      'yield', 'ensure', 'nodeify', 'exec'];
    PROMISE_METHODS.forEach(function addPromiseMethod(promiseMethod) {
      $this[promiseMethod] = function returnPromise() {
        //First, get a promise containing the response by calling `then`.
        var then = $this.then();
        //Now, apply the promise method to the promise with the arguments we were passed.
        return then[promiseMethod].apply(then, arguments);
      };
    });

    /**
     * Alias for _.header_
     * @type {Function}
     */
    $this.headers = $this.header;

    /**
     * Alias for _.header_
     *
     * @type {Function}
     */
    $this.set = $this.header;

    /**
     * Alias for _.end_
     *
     * @type {Function}
     */
    $this.complete = $this.end;

    /**
     * Aliases for _.end_
     *
     * @type {Object}
     */

    $this.as = {
      json: $this.end,
      binary: $this.end,
      string: $this.end
    };

    /**
     * Handles Multipart Field Processing
     *
     * @param {String} name
     * @param {Mixed} value
     * @param {Object} options
     */
    function handleField (name, value, options) {
      var serialized;
      var length;
      var key;
      var i;

      options = options || {
        attachment: false
      };

      if (is(name).a(Object)) {
        for (key in name) {
          if (name.hasOwnProperty(key)) {
            handleField(key, name[key], options);
          }
        }
      } else {
        if (is(value).a(Array)) {
          for (i = 0, length = value.length; i < length; i++) {
            if (serialized = handleFieldValue(value[i])) {
              $this.rawField(name, serialized, options);
            }
          }
        } else if (value != null) {
          $this.rawField(name, handleFieldValue(value), options);
        }
      }

      return $this;
    }

    /**
     * Handles Multipart Value Processing
     *
     * @param {Mixed} value
     */
    function handleFieldValue (value) {
      if (!(value instanceof Buffer || typeof value === 'string')) {
        if (is(value).a(Object)) {
          if (value instanceof fs.FileReadStream) {
            return value;
          } else {
            return Unirest.serializers.json(value)
          }
        } else {
          return value.toString();
        }
      } else return value;
    }

    function setupOption (name, ref) {
      $this[name] = function (arg) {
        $this.options[ref || name] = arg;
        return $this;
      };
    }

    // Iterates over a list of option methods to generate the chaining
    // style of use you see in Superagent and jQuery.
    for (var x in Unirest.enum.options) {
      if (Unirest.enum.options.hasOwnProperty(x)) {
        var option = Unirest.enum.options[x];
        var reference = null;

        if (option.indexOf(':') != -1) {
          option = option.split(':');
          reference = option[1];
          option = option[0];
        }

        setupOption(option, reference);
      }
    }

    if (headers && typeof headers === 'function')
      callback = headers, headers = null;
    else if (body && typeof body === 'function')
      callback = body, body = null;

    if (headers) $this.set(headers);
    if (body) $this.send(body);

    return callback ? $this.end(callback) : $this;
  };

  return uri ? unirest(uri, headers, body, callback) : unirest;
};

/**
 * Mime-type lookup / parser.
 *
 * @param  {String} type
 * @param  {Boolean} parse Should we parse?
 * @return {String}
 */
Unirest.type = function (type, parse) {
  if (typeof type !== "string") return false;
  return parse ? type.split(/ *; */).shift() : (Unirest.types[type] || type);
};

/**
 * Parse header parameters.
 *
 * @param  {String} str
 * @return {Object}
 */
Unirest.params = function (str) {
  return reduce(str.split(/ *; */), function (obj, str) {
    var parts = str.split(/ *= */)
      , key = parts.shift()
      , val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Utility method to trim strings.
 *
 * @type {String}
 */
Unirest.trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Parser methods for different data types.
 *
 * @type {Object}
 */
Unirest.parsers = {
  string: function (data) {
    var obj = {};
    var pairs = data.split('&');
    var parts;
    var pair;

    for (var i = 0, len = pairs.length; i < len; ++i) {
      pair = pairs[i];
      parts = pair.split('=');
      obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
    }

    return obj;
  },

  json: function (data) {
    try {
      data = JSON.parse(data);
    } catch (e) {}

    return data;
  }
};

/**
 * Serialization methods for different data types.
 *
 * @type {Object}
 */
Unirest.serializers = {
  form: function (obj) {
    return QueryString.stringify(obj);
  },

  json: function (obj) {
    return JSON.stringify(obj);
  }
};

/**
 * Unirest Request Utility Methods
 *
 * @type {Object}
 */
Unirest.Request = {
  serialize: function (string, type) {
    var serializer = Unirest.enum.serialize[type];
    return serializer ? serializer(string) : string;
  },

  uid: function (len) {
    var output = '';
    var chars = 'abcdefghijklmnopqrstuvwxyz123456789';
    var nchars = chars.length;
    while (len--) output += chars[Math.random() * nchars | 0];
    return output;
  }
};

/**
 * Unirest Response Utility Methods
 *
 * @type {Object}
 */
Unirest.Response = {
  parse: function (string, type) {
    var parser = Unirest.enum.parse[type];
    return parser ? parser(string) : string;
  },

  parseHeader: function (str) {
    var lines = str.split(/\r?\n/)
      , fields = {}
      , index
      , line
      , field
      , val;

    // Trailing CLRF
    lines.pop();

    for (var i = 0, len = lines.length; i < len; ++i) {
      line = lines[i];
      index = line.indexOf(':');
      field = line.slice(0, index).toLowerCase();
      val = trim(line.slice(index + 1));
      fields[field] = val;
    }

    return fields;
  }
};

/**
 * Expose the underlying layer.
 */

Unirest.request = require('request');
Unirest.cookie = Unirest.request.cookie;
Unirest.pipe = Unirest.request.pipe;

/**
 * Expose cookie store (tough-cookie)
 *
 * @return {Function} Cookie Store
 */
Unirest.jar = function (options) {
  options = options || {};

  var jar = Unirest.request.jar();

  // Because Requests aliases toughcookie rather than returning.
  if (options.store) {
    jar._jar.store = options.store;
  }

  if (options.rejectPublicSuffixes) {
    jar._jar.rejectPublicSuffixes = options.rejectPublicSuffixes;
  }

  jar.add = jar.setCookie;
  jar.toString = jar.getCookieString;

  return jar;
};

/**
 * Enum Structures
 *
 * @type {Object}
 */
Unirest.enum = {
  serialize: {
    'application/x-www-form-urlencoded': Unirest.serializers.form,
    'application/json': Unirest.serializers.json
  },

  parse: {
    'application/x-www-form-urlencoded': Unirest.parsers.string,
    'application/json': Unirest.parsers.json
  },

  methods: [
    'GET',
    'HEAD',
    'PUT',
    'POST',
    'PATCH',
    'DELETE',
    'OPTIONS'
  ],

  options: [
    'uri:url', 'redirects:maxRedirects', 'redirect:followRedirect', 'url', 'method', 'qs', 'form', 'json', 'multipart',
    'followRedirect', 'followAllRedirects', 'maxRedirects', 'encoding', 'pool', 'timeout', 'proxy', 'oauth', 'hawk',
    'ssl:strictSSL', 'strictSSL', 'jar', 'cookies:jar', 'aws', 'httpSignature', 'localAddress', 'ip:localAddress', 'secureProtocol', 'forever'
  ]
};

/**
 * Generate sugar for request library.
 *
 * This allows us to mock super-agent chaining style while using request library under the hood.
 */
function setupMethod (method) {
  Unirest[method] = Unirest(method);
}

for (var i = 0; i < Unirest.enum.methods.length; i++) {
  var method = Unirest.enum.methods[i].toLowerCase();
  setupMethod(method);
}

/**
 * Simple Utility Methods for checking information about a value.
 *
 * @param  {Mixed}  value  Could be anything.
 * @return {Object}
 */
function is (value) {
  return {
    a: function (check) {
      if (check.prototype) check = check.prototype.constructor.name;
      var type = Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
      return value != null && type === check.toLowerCase();
    },
  };
}

/**
 * Simple Utility Methods for checking information about a value.
 *
 * @param  {Mixed}  value  Could be anything.
 * @return {Object}
 */
function does (value) {
  var arrayIndexOf = (Array.indexOf ? function (arr, obj, from) {
    return arr.indexOf(obj, from);
  } : function (arr, obj, from) {
    var l = arr.length, i = from ? parseInt((1*from) + (from<0 ? l:0), 10) : 0; i = i<0 ? 0 : i;
    for (; i<l; i++) if (i in arr  &&  arr[i] === obj) return i;
    return -1;
  });

  return {
    startWith: function (string) {
      if (is(value).a(String)) return value.slice(0, string.length) == string;
      if (is(value).a(Array)) return value[0] == string;
      return false;
    },

    endWith: function (string) {
      if (is(value).a(String)) return value.slice(-string.length) == string;
      if (is(value).a(Array)) return value[value.length - 1] == string;
      return false;
    },

    contain: function (field) {
      if (is(value).a(String)) return value.indexOf(field) != -1;
      if (is(value).a(Object)) return value.hasOwnProperty(field);
      if (is(value).a(Array)) return !!~arrayIndexOf(value, field);
      return false;
    }
  };
}

/**
 * Expose the Unirest Container
 */

module.exports = exports = Unirest;
