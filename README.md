# Unirest for Node.js

Unirest is a set of lightweight HTTP libraries available in multiple languages.

## Installing

To utilize unirest for node.js install the the `npm` module:

```js
npm install unirest-nodejs
```

After installing the `npm` package you can now start simplifying requests like so:

```js
var unirest = require('unirest');
```

## Creating Requests

You're probably wondering how by using **Unirest** makes creating requests easier. Besides automatically supporting gzip, and parsing responses, lets start with a basic working example:

```js
unirest.post('http://httpbin.org/post')
.headers({ 'Accept': 'application/json' })
.send({ "parameter": 23, "foo": "bar" })
.end(function (response) {
  console.log(response.body);
});
```

## Uploading Files

Transferring file data has been simplified:

```js
unirest.post('http://httpbin.org/post')
.headers({ 'Accept': 'application/json' })
.field('parameter', 'value') // Form field
.attach('file', '/tmp/file') // Attachment
.end(function (response) {
  console.log(response.body);
});
```

## Custom Entity Body

```js
unirest.post('http://httpbin.org/post')
.headers({ 'Accept': 'application/json' })
.send(new Buffer([1,2,3]))
.end(function (response) {
  console.log(response.body);
});
```

# Unirest

A request can be initiated by invoking the appropriate method on the unirest object, then calling `.end()` to send the request. Alternatively you can send the request directly by providing a callback along with the url.

## unirest(method [, uri])

- `method` - Request type (GET, PUT, POST, etc...)
- `uri` - _Optional_; When declared the method will return a [Request](#request) object. 
          Otherwise it will return the method below with `method` set to the method given.

## unirest\[method](url [, callback])

- `method` - Request type, pre-defined methods, see below.
- `url` - Request location.
- `callback` - _Optional_; 


### get

Returns a [Request](#Request) object with the `method` option set to `GET`

```js
var Request = unirest.get('http://httpbin.org/get');
```

### head
Returns a [Request](#Request) object with the `method` option set to `HEAD`

```js
var Request = unirest.head('http://httpbin.org/get');
```

### post
Returns a [Request](#Request) object with the `method` option set to `POST`

```js
var Request = unirest.post('http://httpbin.org/post');
```

### patch

Returns a [Request](#Request) object with the `method` option set to `PATCH`

```js
var Request = unirest.patch('http://httpbin.org/patch');
```

### delete
Returns a [Request](#Request) object with the `method` option set to `DELETE`

```js
var Request = unirest.delete('http://httpbin.org/delete');
```

## unirest.jar

Creates a container to store multiple cookies, i.e. a cookie jar.

```js
var CookieJar = unirest.jar();
CookieJar.add(unirest.cookie('some value'));
unirest.get('http://httpbin.org/get').jar(CookieJar);
```

# Request

Provides simple and easy to use methods for manipulating the request prior to being sent. This object is created when a 
Unirest Method is invoked. This object contains methods that are chainable like other libraries such as jQuery and popular 
request module Superagent (which this library is modeled after slightly).

** Example **

```js
var Request = unirest.post('http://httpbin.org/post');

Request.headers({
  'Accepts': 'application/json'
}).end(function (response) {
  ...
});
```

## Request.options

The _options_ object is where almost all of the request settings live. Each option method sugars to a field on this object to allow for chaining and ease of use. If 
you have trouble with an option method and wish to directly access the _options_ object
you are free to do so.

This object is modeled after the `request` libraries options that are passed along through its constructor.

## Request Methods

Request Methods differ from Option Methods in that these methods transform, or handle the data in a sugared way, where as Option Methods require a more _hands on_ approach.

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

```
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
Request.set({
  'Accepts': 'application/json'
, 'User-Agent': 'Unirest Node.js'
})
```

**Arguments**

```
Request.set('Accepts', 'application/json');
```

#### Request.part(Object)

**Experimental**

Similiar to `Request.multipart()` except it only allows one object to be passed at a time and does the pre-processing on necessary `body` values for you.

Each object is then appended to the `Request.options.multipart` array.

```js
Request.part({
  'content-type': 'application/json'
, body: { foo: 'bar' }
}).part({
  'content-type': 'text/html'
, body: '<strong>Hello World!</strong>'
});
```

#### Request.type(String)

Sets the header `Content-Type` through either lookup for extensions (`xml`, `png`, `json`, etc...) using `mime` or using the full value such as `application/json`. 

Uses `Request.header()` to set header value.

```js
Request.type('application/json') // Content-Type: application/json
Request.type('json') // Content-Type: application/json
Request.type('html) // Content-Type: text/html
…
```

## Request Form Methods

The following methods are sugar methods for attaching files, and form fields. Instead of handling files and processing them yourself Unirest can do that for you.

#### Request.attach(Object) or (name, path)

`Object` should consist of `name: 'path'` otherwise use `name` and `path`.

- `name` (`String`) - File field name
- `path` (`String` | `Object`) - File value, A `String` will be parsed based on its value. If `path` contains `http` or `https` Request will handle it as a `remote file`, otherwise if it contains `://` and not `http` or `https` it will consider it to be a `direct file path`. If no `://` is found it will be considered a `relative file path`. An `Object` is directly set, so you can do pre-processing if you want without worrying about the string value.

**Object**

```js
unirest.post('http://httpbin.org/post')
.headers({ 'Accept': 'application/json' })
.field({
  'parameter': 'value'
})
.attach({
  'file': 'dog.png'
, 'relative file': fs.createReadStream(path.join(__dirname, 'dog.png'),
, 'remote file: unirest.request('http://google.com/doodle.png')
})
.end(function (response) {
  console.log(response.body);
})
```

**Arguments**

```js
unirest.post('http://httpbin.org/post')
.headers({ 'Accept': 'application/json' })
.field('parameter', 'value') // Form field
.attach('file', 'dog.png') // Attachment
.attach('remote file', fs.createReadStream(path.join(__dirname, 'dog.png')) // Same as above.
.attach('remote file', unirest.request('http://google.com/doodle.png'))
.end(function (response) {
  console.log(response.body);
});
```

#### Request.field(Object) or (name, value)

`Object` should consist of `name: 'value'` otherwise use `name` and `value`

See `Request.attach` for usage.

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

#### Request.headers(Object)

Sets `headers` object on `Request.options` to the given object.

```js
Request.headers({
  'Accepts': 'application/json',
  'Content-Type': 'application/json'
});
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
  'content-type': 'application/json'
, body: JSON.stringify({
    foo: 'bar'
  })
}, {
  'content-type': 'text/html'
, body: '<strong>Hello World!</strong>'
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

#### Request.aws(Object)

Sets `aws`, AWS Signing Credentials, on `Request.options`

```js
Request.aws({ 
  key: 'AWS_S3_KEY'
, secret: 'AWS_S3_SECRET'
, bucket: 'BUCKET NAME'
});
```

#### Request.oauth(Object)

Sets `oauth`, list of oauth credentials, on `Request.options` based on given object.

```js
var Request = unirest.get('https://api.twitter.com/oauth/request_token');

Request.oauth({
  callback: 'http://mysite.com/callback/'
, consumer_key: 'CONSUMER_KEY'
, consumer_secret: 'CONSUMER_SECRET'
}).end(function (response) {
  var access_token = response.body;
  
  Request = unirest.post('https://api.twitter.com/oauth/access_token');
  Request.oauth({
    consumer_key: 'CONSUMER_KEY'
  , consumer_secret: 'CONSUMER_SECRET'
  , token: access_token.oauth_token
  , verifier: token: access_token.oauth_verifier
  }).end(function (response) {
    var token = response.body;
    
    Request = unirest.get('https://api.twitter.com/1/users/show.json');
    Request.oauth({
      consumer_key: 'CONSUMER_KEY'
    , consumer_secret: 'CONSUMER_SECRET'
    , token: token.oauth_token
    , token_secret: token.oauth_token_secret
    }).query({
      screen_name: token.screen_name
    , user_id: token.user_id
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
    key: 'werxhqb98rpaxn39848xrunpaw3489ruxnpa98w4rxn'
  , algorithm: 'sha256'
  , user: 'Steve'
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

## Request Aliases

#### Request.set

**Alias** for `Request.header()`

#### Request.redirects

**Alias** for `Request.maxRedirects()`

#### Request.redirect

**Alias** for `Request.followRedirect()`

#### Request.ssl

**Alias** for `Request.strictSSL()`

#### Request.ip

**Alias** for `Request.localAddress()`