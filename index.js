/**
 * Unirest for Node
 *
 * @author Nijko Yonskai
 * @copyright 2013
 * @license MIT
 */

/**
 * Module Dependencies
 */

var StringDecoder = require('string_decoder').StringDecoder;
var Stream = require('stream');
var mime = require('mime');
var zlib = require('zlib');
var path = require('path');
var fs = require('fs');

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
Unirest = function (method, uri, headers, body, callback) {
  var unirest = function (uri, headers, body, callback) {
    var $this = {
      /**
       * Container to hold headers with lowercased field-names.
       * 
       * @type {Object}
       * @private
       */
      _headers: {},

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

      /**
       * Attaches a field to the multipart-form request.
       *
       * Behaves much like form fields in HTML.
       * 
       * @param  {String} name 
       * @param  {String} value
       * @return {Object}
       */
      field: function (name, value) {
        if (is(name).a(Object)) {
          for (var key in name) 
            $this.attach(key, name[key]);
        } else {
          $this._multipart.push({
            name: name,
            value: value,
            attachment: false
          });
        }

        return $this;
      },

      /**
       * Attaches a file to the multipart-form request.
       * 
       * @param  {String} name
       * @param  {String|Object} path
       * @return {Object}
       */
      attach: function (name, path) {
        if (is(name).a(Object)) {
          for (var key in name) 
            $this.attach(key, name[key]);
        } else {
          $this._multipart.push({
            name: name,
            value: path,
            attachment: true
          });
        }

        return $this;
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
          for (var key in field)
            $this.header(key, field[key]);

          return $this;
        }

        $this.options.headers[field] = value;
        $this._headers[field.toLowerCase()] = value;
        return $this;
      },

      /**
       * Append query string to request uri.
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
       * Set body and do some pre-sending transformations...
       *
       * Determines type whether `form` or `json`. 
       * For other types use `.type()` to set the _content-type_.
       *
       * If type is _application/x-www-form-urlencoded_ data will be appended to the 
       * previously set body data.
       * 
       * @param  {Mixed} data
       * @return {Object}
       */
      send: function (data) {
        var type = $this._headers['content-type'];

        if (is(data).a(Object)) {
          if (!type || type != 'application/json') {
            $this.type('form');

            type = $this._headers['content-type'];

            $this.options.body = Unirest.serializers.form(data);
          } else if (type == 'application/json') {
            $this.options.json = true;

            if ($this.options.body && is($this.options.body).a(Object)) {
              for (var key in data) $this.options.body[key] = data[key];
            } else {
              $this.options.body = data;
            }
          }
        } else if (is(data).a(String)) {
          if (!type) {
            $this.type('form');

            type = $this._headers['content-type'];
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
        if (!$this.options.multipart) 
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
       * Finalize and send the request, after a response has been recieved do some additional post-processing
       * that request fails to do (this section mimics superagent style response).
       * 
       * @param  {Function} callback 
       * @return {Object}
       */
      end: function (callback) {
        var Request = Unirest.request($this.options, function (error, response, body) {
          var data, type, result = {};

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
          var status = response.statusCode;
          var type = status / 100 | 0;

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

          if (response.cookies && is(response.cookies).a(Object) && Object.keys(response.cookies).length > 0) {
            result.cookies = response.cookies;
          } else {
            // Set-Cookie Parsing
            var cookies = response.headers['set-cookie'];

            if (cookies && is(cookies).a(Array)) {
              for (var index in cookies) {
                var entry = cookies[index];

                if (is(entry).a(String) && does(entry).contain(';')) {
                  entry.split(';').forEach(function (cookie) {
                    var crumbs = cookie.split('=');
                    result.cookies[Unirest.trim(crumbs[0])] = Unirest.trim(crumbs[1] || '');
                  });
                }
              }
            }

            // Cookie header parser... for some reason there are two...?
            cookies = response.headers['cookie'];

            if (cookies && is(cookies).a(String)) {
              cookies.split(';').forEach(function (cookie) {
                var crumbs = cookie.split('=');
                result.cookies[Unirest.trim(crumbs[0])] = Unirest.trim(crumbs[1] || '');
              });
            }
          }

          // Response
          
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
        });

        if ($this._multipart.length) {
          var form = Request.form();

          for (var i = 0; i < $this._multipart.length; i++) {
            var item = $this._multipart[i];

            if (item.attachment && is(item.value).a(String)) {
              if (does(item.value).contain('http://') || does(item.value).contain('https://')) {
                item.value = Unirest.require(item.value);
              } else if (does(item.value).contain('://')) {
                item.value = fs.createReadStream(item.value);
              } else {
                item.value = fs.createReadStream(path.join(__dirname, item.value));
              }
            }

            form.append(item.name, item.value);
          }
        }

        Request.on('response', function (response) {
          if (/^(deflate|gzip)$/.test(response.headers['content-encoding'])) {
            var unzip = zlib.createUnzip();
            var stream = new Stream;
            var decoder, _on = response.on;

            // Keeping node happy
            stream.req = Request.req;

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
        });

        return Request;
      }
    };

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
    
    // Iterates over a list of option methods to generate the chaining
    // style of use you see in Superagent and jQuery.
    for (var x in Unirest.enum.options) {
      var option = Unirest.enum.options[x];
      var reference = null;
      
      if (option.indexOf(':') != -1) {
        option = option.split(':');
        reference = option[1];
        option = option[0];
      }
      
      (function (name, ref) {
        $this[name] = function (arg) {
          $this.options[ref || name] = arg;
          return $this;
        }
      })(option, reference);
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
  form: function (obj, parent) {
    if (!is(obj).a(Object) && !is(obj).a(Array)) 
      return obj;

    var str = [];
    for (var index in obj) {
      var key = parent ? parent : index
        , value = obj[index];

      str.push(typeof value == "object" ? Unirest.serializers.form(value, key) : encodeURIComponent(key) + "=" + encodeURIComponent(value));
    }

    return str.join("&");
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
    return seralizer ? serializer(string) : string;
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
  var jar = Unirest.request.jar();

  // Because Requests aliases toughcookie rather than returning.
  
  if (options.store) {
    jar._jar.store = options.store;
  }

  if (options.rejectPublicSuffixes) {
    jar._jar.rejectPublicSuffixes = options.rejectPublicSuffixes
  };

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
    'ssl:strictSSL', 'strictSSL', 'jar', 'cookies:jar', 'aws', 'httpSignature', 'localAddress', 'ip:localAddress', 'secureProtocol'
  ]
};

/**
 * Generate sugar for request library.
 *
 * This allows us to mock super-agent chaining style while using request library under the hood.
 */

for (var i in Unirest.enum.methods) {
  var method = Unirest.enum.methods[i].toLowerCase();
  (function (type) { Unirest[type] = Unirest(type); })(method);
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
      return value !== undefined && value !== null && type === check.toLowerCase();
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
  }
};

/**
 * Expose the Unirest Container
 */

module.exports = exports = Unirest;
