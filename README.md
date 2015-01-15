# Unirest for Node.js [![Build Status](http://img.shields.io/travis/Mashape/unirest-nodejs/master.svg?style=flat)](https://travis-ci.org/Mashape/unirest-nodejs) [![NPM Version](https://badge.fury.io/js/unirest.svg)](https://www.npmjs.com/package/unirest)

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/Mashape/unirest-nodejs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://raw.githubusercontent.com/Mashape/unirest-nodejs/master/LICENSE)
[![Downloads](https://img.shields.io/npm/dm/unirest.svg?style=flat)](https://www.npmjs.com/package/unirest)
![David](https://img.shields.io/david/mashape/unirest-nodejs.svg?style=flat)
[![Gitter](https://img.shields.io/badge/%E2%8A%AA%20GITTER%20-JOIN%20CHAT%20%E2%86%92-brightgreen.svg?style=flat)](https://gitter.im/Mashape/unirest-nodejs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

Unirest is a set of lightweight HTTP clients available in multiple languages.

Developed with love by [nijikokun](http://github.com/nijikokun) @ [mashape.com](http://mashape.com)

## Installing

To utilize unirest for node.js install the the `npm` module:

```bash
$ npm install unirest
```

After installing the `npm` package you can now start simplifying requests like so:

```js
var unirest = require('unirest');
```

## Creating Requests

You're probably wondering how by using **Unirest** makes creating requests easier. Besides automatically supporting gzip, and parsing responses, lets start with a basic working example:

```js
unirest.post('http://httpbin.org/post')
.header('Accept': 'application/json')
.send({ "parameter": 23, "foo": "bar" })
.end(function (response) {
  console.log(response.body);
});
```

## Uploading Files

Transferring file data has been simplified:

```js
unirest.post('http://httpbin.org/post')
.headers('Accept': 'application/json')
.field('parameter', 'value') // Form field
.attach('file', '/tmp/file') // Attachment
.end(function (response) {
  console.log(response.body);
});
```

## Custom Entity Body

```js
unirest.post('http://httpbin.org/post')
.headers('Accept': 'application/json')
.send(new Buffer([1,2,3]))
.end(function (response) {
  console.log(response.body);
});
```

# Unirest

A request can be initiated by invoking the appropriate method on the unirest object, then calling `.end()` to send the request. Alternatively you can send the request directly by providing a callback along with the url.

## unirest(method [, uri, headers, body, callback])

- `method` - Request type (GET, PUT, POST, etc...)
- `uri` - _Optional_; When passed will return a [Request](#request) object. Otherwise returns generated function with `method` pre-defined (e.g. `unirest.get`)
- `headers` (`Object`) - _Optional_; HTTP Request headers
- `body` (`Mixed`) - _Optional_; HTTP Request body
- `callback` (`Function`) - _Optional_; Invoked when Request has finalized with the argument [Response](#response)

## unirest\[method](url [, headers, body, callback])

- `method` - Request type, pre-defined methods, see below.
- `url` - Request location.
- `headers` (`Object` | `Function`) - _Optional_; When `Object` headers are passed along to the [`Request.header`](#requestheaderobject-or-field-value) method,
   when `Function` this argument is used as the `callback`.
- `body` (`Mixed` | `Function`) - _Optional_; When `body` is not a `Function` it will be passed along to `Request.send()` method,
   otherwise when a `Function` it will be used as the `callback`.
- `callback` (`Function`) - _Optional_; Calls end with given argument, otherwise `Request` is returned.

All arguments above, with the exclusion of `url`, will accept a `Function` as the `callback`.
When no `callback` is present, the [Request](#request) object will be returned.

### get

Returns a [Request](#request) object with the `method` option set to `GET`

```js
var Request = unirest.get('http://httpbin.org/get');
```

### head
Returns a [Request](#request) object with the `method` option set to `HEAD`

```js
var Request = unirest.head('http://httpbin.org/get');
```

### post
Returns a [Request](#request) object with the `method` option set to `POST`

```js
var Request = unirest.post('http://httpbin.org/post');
```

### patch

Returns a [Request](#request) object with the `method` option set to `PATCH`

```js
var Request = unirest.patch('http://httpbin.org/patch');
```

### delete
Returns a [Request](#request) object with the `method` option set to `DELETE`

```js
var Request = unirest.delete('http://httpbin.org/delete');
```

## unirest.jar()

Creates a container to store multiple cookies, i.e. a cookie jar.

```js
var CookieJar = unirest.jar();
CookieJar.add('key=value', '/'); // Cookie string, pathname / url
unirest.get('http://httpbin.org/get').jar(CookieJar);
```

## unirest.cookie(String)

Creates a cookie, see above for example.

## unirest.request

`mikeal/request` library (the underlying layer of unirest) for direct use.

# Request

Provides simple and easy to use methods for manipulating the request prior to being sent. This object is created when a
Unirest Method is invoked. This object contains methods that are chainable like other libraries such as jQuery and popular
request module Superagent (which this library is modeled after slightly).

**Example**

```js
var Request = unirest.post('http://httpbin.org/post');

Request.header('Accepts': 'application/json').end(function (response) {
  ...
});
```

## Request Methods

Request Methods differ from Option Methods (See Below) in that these methods transform, or handle the data in a sugared way, where as Option Methods require a more _hands on_ approach.

#### Request.auth(Object) or (user, pass, sendImmediately)

Accepts either an `Object` containing `user`, `pass`, and optionally `sendImmediately`.

- `user` (`String`) - Authentication Username
- `pass` (`String`) - Authentication Password
- `sendImmediately` (`String`) - _Optional_; Defaults to `true`; Flag to determine whether Request should send the basic authentication header along with the request. Upon being _false_, Request will retry with a _proper_ authentication header after receiving a `401` response from the server (which must contain a `WWW-Authenticate` header indicating the required authentication method)

**Object**

```js
Request.auth({
  user: 'Nijiko',
  pass: 'insecure',
  sendImmediately: true
});
```

**Arguments**

```js
Request.auth('Nijiko', 'insecure', true);
```

#### Request.header(Object) or (field, value)

**Suggested Method for setting Headers**

Accepts either an `Object` containing `header-name: value` entries,
or `field` and `value` arguments. Each entry is then stored in a two locations, one in the case-sensitive `Request.options.headers` and the other on a private `_headers` object that is case-insensitive for internal header lookup.

- `field` (`String`) - Header name, such as `Accepts`
- `value` (`String`) - Header value, such as `application/json`

**Object**

```js
Request.headers({
  'Accepts': 'application/json',
  'User-Agent': 'Unirest Node.js'
})
```

Note the usage of [`Request.headers`](#requestheaders) which is simply an alias to the `Request.header` method, you can also use [`Request.set`](#requestset) to set headers.

**Arguments**

```js
Request.header('Accepts', 'application/json');
```

#### Request.part(Object)

**Experimental**

Similiar to `Request.multipart()` except it only allows one object to be passed at a time and does the pre-processing on necessary `body` values for you.

Each object is then appended to the `Request.options.multipart` array.

```js
Request.part({
  'content-type': 'application/json',
  body: { foo: 'bar' }
}).part({
  'content-type': 'text/html',
  body: '<strong>Hello World!</strong>'
});
```

#### Request.query(Object) or (String)

Serializes argument passed to a querystring representation.

Should `url` already contain a querystring, the representation will be appended to the `url`.

```js
unirest.post('http://httpbin.org/get')
.query('name=nijiko')
.query({
  pet: 'spot'
})
.end(function (response) {
  console.log(response);
});
```

#### Request.send(Object | String)

Data marshalling for HTTP request body data

Determines whether data mime-type is `form` or `json`.
For irregular mime-types the `.type()` method is used to infer the `content-type` header.

When mime-type is `application/x-www-form-urlencoded` data is appended rather than overwritten.

**JSON**

```js
unirest.post('http://httpbin.org/post')
.type('json')
.send({
  foo: 'bar',
  hello: 3
})
.end(function (response) {
  console.log(response.body);
})
```

**FORM Encoded**

```js
// Body would be:
// name=nijiko&pet=turtle
unirest.post('http://httpbin.org/post')
.send('name=nijiko')
.send('pet=spot')
.end(function (response) {
  console.log(response.body);
});
```

**HTML / Other**

```js
unirest.post('http://httpbin.org/post')
.set('Content-Type', 'text/html')
.send('<strong>Hello World!</strong>')
.end(function (response) {
  console.log(response.body);
});
```

#### Request.type(String)

Sets the header `Content-Type` through either lookup for extensions (`xml`, `png`, `json`, etc...) using `mime` or using the full value such as `application/json`.

Uses [`Request.header`](#requestheaderobject-or-field-value) to set header value.

```js
Request.type('application/json') // Content-Type: application/json
Request.type('json') // Content-Type: application/json
Request.type('html') // Content-Type: text/html
…
```

## Request Form Methods

The following methods are sugar methods for attaching files, and form fields. Instead of handling files and processing them yourself Unirest can do that for you.

#### Request.attach(Object) or (name, path)

`Object` should consist of `name: 'path'` otherwise use `name` and `path`.

- `name` (`String`) - File field name
- `path` (`String` | `Object`) - File value, A `String` will be parsed based on its value. If `path` contains `http` or `https` Request will handle it as a `remote file`.  If `path` does not contain `http` or `https` then unirest will assume that it is the path to a local file and attempt to find it using `path.resolve`. An `Object` is directly set, so you can do pre-processing if you want without worrying about the string value.

**Object**

```js
unirest.post('http://httpbin.org/post')
.header('Accept': 'application/json')
.field({
  'parameter': 'value'
})
.attach({
  'file': 'dog.png',
  'relative file': fs.createReadStream(path.join(__dirname, 'dog.png')),
  'remote file': unirest.request('http://google.com/doodle.png')
})
.end(function (response) {
  console.log(response.body);
})
```

**Arguments**

```js
unirest.post('http://httpbin.org/post')
.header('Accept': 'application/json')
.field('parameter', 'value') // Form field
.attach('file', 'dog.png') // Attachment
.attach('remote file', fs.createReadStream(path.join(__dirname, 'dog.png')))  // Same as above.
.attach('remote file', unirest.request('http://google.com/doodle.png'))
.end(function (response) {
  console.log(response.body);
});
```

#### Request.field(Object) or (name, value)

`Object` should consist of `name: 'value'` otherwise use `name` and `value`

See `Request.attach` for usage.

#### Request.stream()

Sets `_stream` flag to use `request` streaming instead of direct `form-data` usage.
This seemingly appears to only work for node servers, use streaming only if you are a hundred percent sure it will work.
Tread carefully.

## Request.options

The _options_ `object` is where almost all of the request settings live. Each option method sugars to a field on this object to allow for chaining and ease of use. If
you have trouble with an option method and wish to directly access the _options_ object
you are free to do so.

This object is modeled after the `request` libraries options that are passed along through its constructor.

* `url` (`String` | `Object`) - Url, or object parsed from `url.parse()`
* `qs` (`Object`) - Object consisting of `querystring` values to append to `url` upon request.
* `method` (`String`) - Default `GET`; HTTP Method.
* `headers` (`Object`) - Default `{}`; HTTP Headers.
* `body` (`String` | `Object`) - Entity body for certain requests.
* `form` (`Object`) - Form data.
* `auth` (`Object`) - See `Request.auth()` below.
* `multipart` (`Object`) - _Experimental_; See documentation below.
* `followRedirect` (`Boolean`) - Default `true`; Follow HTTP `3xx` responses as redirects.
* `followAllRedirects` (`Boolean`) - Default `false`; Follow **Non**-GET HTTP `3xx` responses as redirects.
* `maxRedirects` (`Number`) - Default `10`; Maximum number of redirects before aborting.
* `encoding` (`String`) - Encoding to be used on `setEncoding` of response data.
* `timeout` (`Number`) - Number of milliseconds to wait before aborting.
* `proxy` (`String`) - See `Request.proxy()` below.
* `oauth` (`Object`) - See `Request.oauth()` below.
* `hawk` (`Object`) - See `Request.hawk()` below
* `strictSSL` (`Boolean`) - Default `true`; See `Request.strictSSL()` below.
* `secureProtocol` (`String`) - See `Request.secureProtocol()` below.
* `jar` (`Boolean` | `Jar`) - See `Request.jar()` below.
* `aws` (`Object`) - See `Request.aws()` below.
* `httpSignature` (`Object`) - See `Request.httpSignature()` Below.
* `localAddress` (`String`) - See `Request.localAddress()` Below.
* `pool` (`Object`) - See `Reuqest.pool()` Below.
* `forever` (`Boolean`) - Default `undefined`; See `Request.forever()` Below

## Request Option Methods

#### Request.url(String)

Sets `url` location of the current request on `Request.options` to the given `String`

```js
Request.url('http://httpbin.org/get');
```

#### Request.method(String)

Sets `method` value on `Request.options` to the given value.

```js
Request.method('HEAD');
```

#### Request.form(Object)

Sets `form` object on `Request.options` to the given object.

When used `body` is set to the object passed as a `querystring` representation and the `Content-Type` header to `application/x-www-form-urlencoded; charset=utf-8`

```js
Request.form({
  key: 'value'
});
```

#### Request.multipart(Array)

**Experimental**

Sets `multipart` array containing multipart-form objects on `Request.options` to be sent along with the Request.

Each objects property with the exclusion of `body` is treated as a header value. Each `body` value must be pre-processed if necessary when using this method.

```js
Request.multipart([{
  'content-type': 'application/json',
  body: JSON.stringify({
    foo: 'bar'
  })
}, {
  'content-type': 'text/html',
  body: '<strong>Hello World!</strong>'
}]);
```

#### Request.maxRedirects(Number)

Sets `maxRedirects`, the number of redirects the current Request will follow, on `Request.options` based on the given value.

```js
Request.maxRedirects(6)
```

#### Request.followRedirect(Boolean)

Sets `followRedirect` flag on `Request.options` for whether the current Request should follow HTTP redirects based on the given value.

```js
Request.followRedirect(true);
```

#### Request.timeout(Number)

Sets `timeout`, number of milliseconds Request should wait for a response before aborting, on `Request.options` based on the given value.

```js
Request.timeout(2000)
```

#### Request.encoding(String)

Sets `encoding`, encoding to be used on setEncoding of response data if set to null, the body is returned as a Buffer, on `Request.options` based on given value.

```js
Request.encoding('utf-8')
```

#### Request.strictSSL(Boolean)

Sets `strictSSL` flag to require that SSL certificates be valid on `Request.options` based on given value.

```js
Request.strictSSL(true);
```

#### Request.httpSignature(Object)

Sets `httpSignature`

#### Request.proxy(String)

Sets `proxy`, HTTP Proxy to be set on `Request.options` based on value.

```js
Request.proxy('http://localproxy.com');
```

#### Request.secureProtocol(String)

Sets the secure protocol to use:

```js
Request.secureProtocol('SSLv2_method');
// or
Request.secureProtocol('SSLv3_client_method');
```

See [openssl.org](https://www.openssl.org/docs/ssl/SSL_CTX_new.html) for all possible values.

#### Request.aws(Object)

Sets `aws`, AWS Signing Credentials, on `Request.options`

```js
Request.aws({
  key: 'AWS_S3_KEY',
  secret: 'AWS_S3_SECRET',
  bucket: 'BUCKET NAME'
});
```

#### Request.oauth(Object)

Sets `oauth`, list of oauth credentials, on `Request.options` based on given object.

```js
var Request = unirest.get('https://api.twitter.com/oauth/request_token');

Request.oauth({
  callback: 'http://mysite.com/callback/',
  consumer_key: 'CONSUMER_KEY',
  consumer_secret: 'CONSUMER_SECRET'
}).end(function (response) {
  var access_token = response.body;

  Request = unirest.post('https://api.twitter.com/oauth/access_token');
  Request.oauth({
    consumer_key: 'CONSUMER_KEY',
    consumer_secret: 'CONSUMER_SECRET',
    token: access_token.oauth_token,
    verifier: token: access_token.oauth_verifier
  }).end(function (response) {
    var token = response.body;

    Request = unirest.get('https://api.twitter.com/1/users/show.json');
    Request.oauth({
      consumer_key: 'CONSUMER_KEY',
      consumer_secret: 'CONSUMER_SECRET',
      token: token.oauth_token,
      token_secret: token.oauth_token_secret
    }).query({
      screen_name: token.screen_name,
      user_id: token.user_id
    }).end(function (response) {
      console.log(response.body);
    });
  })
});
```

#### Request.hawk(Object)

Sets `hawk` object on `Request.options` to the given object.

Hawk requires a field `credentials` as seen in their [documentation](https://github.com/hueniverse/hawk#usage-example), and below.

```js
Request.hawk({
  credentials: {
    key: 'werxhqb98rpaxn39848xrunpaw3489ruxnpa98w4rxn',
    algorithm: 'sha256',
    user: 'Steve'
  }
});
```

#### Request.localAddress(String)

Sets `localAddress`, local interface to bind for network connections, on `Request.options`

```js
Request.localAddress('127.0.0.1');
Request.localAddress('1.2.3.4');
```

#### Request.jar(Boolean) or Request.jar(Jar)

Sets `jar`, cookie container, on `Request.options`. When set to `true` it stores cookies for future usage.

See `unirest.jar` for more information on how to use `Jar` argument.

#### Request.pool(Object)

Sets `pool` object on `Request.options` to the given object.

A maxSockets property can also be provided on the pool object to set the max number of sockets for all agents created.

Note that if you are sending multiple requests in a loop and creating multiple new pool objects, maxSockets will not work as intended. To work around this, create the pool object with the maxSockets property outside of the loop.

```js
poolOption = { maxSockets: 100 }

Request.pool poolOption
```

#### Request.forever(Boolean)

Sets `forever` flag to use `forever-agent` module. When set to `true`,  default http agent will be replaced by `forever-agent`, which keeps socket connections alive between keep-alive requests.

```js
Request.forever(true);
```

#### Request.end(Function callback)

Sends HTTP Request and awaits Response finalization. Request compression and Response decompression occurs here.
Upon HTTP Response post-processing occurs and invokes `callback` with a single argument, the `[Response](#response)` object.

```js
unirest.get('http://httpbin.org/get').end(function (response) {
  ...
});
```

## Request Aliases

#### Request.set

**Alias** for [`Request.header()`](#requestheaderobject-or-field-value)

#### Request.headers

**Alias** for [`Request.header()`](#requestheaderobject-or-field-value)

#### Request.redirects

**Alias** for [`Request.maxRedirects()`](#requestmaxredirectsnumber)

#### Request.redirect

**Alias** for [`Request.followRedirect()`](#requestfollowredirectboolean)

#### Request.ssl

**Alias** for [`Request.strictSSL()`](#requeststrictsslboolean)

#### Request.ip

**Alias** for [`Request.localAddress()`](#requestlocaladdressstring)

#### Request.complete

**Alias** for [`Request.end()`](#requestlocaladdressstring)

#### Request.as.json

**Alias** for [`Request.end()`](#requestendfunction-callback)

#### Request.as.binary

**Alias** for [`Request.end()`](#requestendfunction-callback)

#### Request.as.string

**Alias** for [`Request.end()`](#requestendfunction-callback)

# Response

Upon ending a request, and recieving a Response the object that is returned contains a number of helpful properties to ease coding pains.

## General


- `body` (`Mixed`) - Processed body data
- `raw_body` (`Mixed`) - Unprocessed body data
- `headers` (`Object`) - Header details
- `cookies` (`Object`) - Cookies from `set-cookies`, and `cookie` headers.
- `httpVersion` (`String`) - Server http version. (e.g. 1.1)
- `httpVersionMajor` (`Number`) - Major number (e.g. 1)
- `httpVersionMinor` (`Number`) - Minor number (e.g. 1)
- `url` (`String`) - Dependant on input, can be empty.
- `domain` (`String` | `null`) - Dependant on input, can be empty.
- `method` (`String` | `null`) - Method used, dependant on input.
- `client` (`Object`) - Client Object. Detailed information regarding the Connection and Byte throughput.
- `connection` (`Object`) - Client Object. Specific connection object, useful for events such as errors. **Advanced**
- `socket` (`Object`) Client Object. Socket specific object and information. Most throughput is same across all three client objects.
- `request` (`Object`) - Initial request object.
- `setEncoding` (`Function`) - Set encoding type.

## Status Information

- `code` (`Number`) - Status Code, i.e. `200`
- `status` (`Number`) - Status Code, same as above.
- `statusType` (`Number`) - Status Code Range Type
  - `1` - Info
  - `2` - Ok
  - `3` - Miscellaneous
  - `4` - Client Error
  - `5` - Server Error
- `info` (`Boolean`) - Status Range Info?
- `ok` (`Boolean`) - Status Range Ok?
- `clientError` (`Boolean`) - Status Range Client Error?
- `serverError` (`Boolean`) - Status Range Server Error?
- `accepted` (`Boolean`) - Status Code `202`?
- `noContent` (`Boolean`) - Status Code `204` or `1223`?
- `badRequest` (`Boolean`) - Status Code `400`?
- `unauthorized` (`Boolean`) - Status Code `401`?
- `notAcceptable` (`Boolean`) - Status Code `406`?
- `notFound` (`Boolean`) - Status Code `404`?
- `forbidden` (`Boolean`) - Status Code `403`?
- `error` (`Boolean` | `Object`) - Dependant on status code range.

## response.cookie(name)

Sugar method for retrieving a cookie from the `response.cookies` object.


```js
var CookieJar = unirest.jar();
CookieJar.add(unirest.cookie('another cookie=23'));

unirest.get('http://google.com').jar(CookieJar).end(function (response) {
  // Except google trims the value passed :/
  console.log(response.cookie('another cookie'));
});
```

## License

Licensed under the MIT license.

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
