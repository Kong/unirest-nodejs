/*jshint expr: true, unused: false*/

var should = require('should')
var assert = require('assert')

// Classes
var Unirest = require('../lib/unirest')
var Request = require('../lib/request')

// Tests
describe('request.js', function () {
  describe('new Request(options)', function () {
    it('should return an instance', function () {
      var req = new Request({})
      assert(req.options.should.eql({}))
    })

    it('should create an array of lowercase header keys', function () {
      var headers = {
        'Content-Type': 'application/json',
        'Cookie': 'a=b'
      }

      var req = new Request({
        headers: headers
      })

      assert(req.lowercaseHeaders[0].should.be.type('string'))
      assert(req.lowercaseHeaders[0].should.equal('content-type'))
      assert(req.lowercaseHeaders[1].should.be.type('string'))
      assert(req.lowercaseHeaders[1].should.equal('cookie'))
    })
  })
})