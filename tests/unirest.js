/*jshint expr: true, unused: false*/

var should = require('should')
var assert = require('assert')
var request = require('request')

// Classes
var Constants = require('../lib/constants')
var Unirest = require('../lib/unirest')
var Request = require('../lib/request')

// Tests
describe('unirest.js', function () {
  describe('Unirest(method)', function () {
    it('should return a function', function () {
      var method = Unirest('POST')
      assert(method.should.be.type('function'))
    })

    it('should assign the method when invoked', function () {
      var req = Unirest('POST')()
      assert(req.options.method.should.equal('POST'))
    })
  })

  describe('Unirest#request()', function () {
    it('should exist as a function', function () {
      assert(Unirest.request.should.be.type('function'))
    })

    it('should be an alias to the Request#request', function () {
      assert(Unirest.request.should.equal(Request.request))
    })

    it('should be an alias to the request library', function () {
      assert(Unirest.request.should.equal(request))
    })
  })

  describe('HTTP Methods', function () {
    it('should properly have assigned all specified within constants', function () {
      for (var index = 0; index < Constants.METHODS.length; index++) {
        assert(Unirest[Constants.METHODS[index]].should.be.type('function'))
        assert(Unirest[Constants.METHODS[index]]().options.method.should.equal(Constants.METHODS[index]))
      }
    })
  })
})