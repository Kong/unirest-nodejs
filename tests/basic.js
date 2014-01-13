var should = require("should");
var unirest = require('../index');

describe('Unirest', function () {
  describe('GET request', function () {
    it('should correctly parse JSON.', function (done) {
      unirest.get('http://httpbin.org/get').end(function (response) {
        should(response.status).equal(200);
        should(response.body).have.type('object');
        done();
      });
    });

    it('should correctly parse GZIPPED data.', function (done) {
      unirest.get('http://httpbin.org/gzip').set('Accept', 'gzip').end(function (response) {
        should(response.status).equal(200);
        should(response.body).have.type('object');
        done();
      });
    });

    it('should correctly handle redirects.', function (done) {
      unirest.get('http://httpbin.org/redirect/3').timeout(2500).end(function (response) {
        should(response.status).equal(200);
        should(response.body.url).equal('http://httpbin.org/get');
        done();
      })
    });

    it('should correctly handle timeouts.', function (done) {
      unirest.get('http://httpbin.org/redirect/3').timeout(20).end(function (response) {
        response.error.should.exist;
        response.error.code.should.equal('ETIMEDOUT');
        done();
      })
    });

    it('should correctly handle refused connections.', function (done) {
      unirest.get('http://localhost:9999').timeout(200).end(function (response) {
        response.error.should.exist;
        response.error.code.should.equal('ECONNREFUSED');
        done();
      })
    });

    it('should be able to look like unirest-php', function (done) {
      unirest.get('http://httpbin.org/gzip', { 'Accept': 'gzip' }, 'Hello World', function (response) {
        should(response.status).equal(200);
        should(response.body).have.type('object');
        done();
      });
    });
  });

  describe('POST request', function () {
    it('should correctly post FORM data.', function (done) {
      var data = {
        is: 'unirest',
        my: 'name',
        hello: 'world'
      };

      unirest.post('http://httpbin.org/post').send(data).end(function (response) {
        should(response.status).equal(200);
        should(response.body.form).have.type('object');
        should(response.body.headers['Content-Length']).equal('30');
        should(response.body.headers['Content-Type']).equal('application/x-www-form-urlencoded');
        done();
      });
    });

    it('should correctly post JSON data.', function (done) {
      var data = {
        is: 'unirest',
        my: 'name',
        hello: 'world'
      };

      unirest.post('http://httpbin.org/post').header('content-type', 'application/json').send(data).end(function (response) {
        should(response.status).equal(200);
        should(response.body.data).have.type('string');
        should(response.body.headers['Content-Type']).equal('application/json');
        done();
      });
    });


    it('should check for buffers', function (done) {
      unirest.post('http://httpbin.org/post')
      .headers({ 'Accept': 'application/json' })
      .send(new Buffer([1,2,3]))
      .end(function (response) {
        should(response.body.json).exist;
        done();
      });
    });
  });
});