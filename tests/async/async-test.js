var fs = require('fs')
var should = require('should')
var unirest = require('../../index')
var express = require('express')
var bodyParser = require('body-parser')

// Mock Server
var app = express()
var server


describe('Unirest', function () {
  describe('Async Await', function () {
    var host, port, url
    var fixture = {
      message: 'some message under a json object'
    }

    before(function(done) {
      app.use(bodyParser.json({
        type: 'application/vnd.api+json'
      }))

      app.get('/', function handleRoot(req, res) {
        res.set('content-type', 'application/vnd.api+json')
        res.send(fixture)
      })

      server = app.listen(3000, function liftServer () {
        host = server.address().address
        port = server.address().port
        url = 'http://localhost:3000'
        done()
      })
    })

    after(function afterAll (done) {
      server.close(function closeCallback () {
        done()
      })
    })

    it('should support async/await', async function jsonTest (done) {
      var response = await unirest.get(url).type('json')
      response.body.should.eql(fixture)
      done()
    })

    it('should support async/await and maintain promise chains', async function jsonTest () {
      var boolean = await unirest.get(url).type('json').then(function (res) {
        return true
      })
      should(boolean).eql(true)
      return true
    })

    it('should support async/await and errors should be handled in the catch statement', async function jsonTest (done) {
      var boolean = await unirest.get(url).type('json').then(function endJsonTest (response) {
        var myObject = {};
        myObject.undefinedIsNotAFunction();
      }).catch(function (err) {
        done()
      })
    })

    it('should support async/await and errors can be returned to the left hand assignment', async function jsonTest (done) {
      var oops = await unirest.get(url).type('json').then(function endJsonTest (response) {
        var myObject = {};
        myObject.undefinedIsNotAFunction();
      }).catch(function (err) {
        return 'oops'
      })
      oops.should.eql('oops')
      done()
    })

  })
})
