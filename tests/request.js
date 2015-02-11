var should = require("should");
var Query = require('../lib/classes/request');
var Request = require('../lib/classes/request');
var QueryMarshal = require('../lib/marshals/query');

// Fixtures
var fixtureQuery = require('./fixtures/query');
var fixtureHashMap = require('./fixtures/hashmap');
var fixtureHashMapErroneous = require('./fixtures/hashmap.erroneous');

// Tests
describe('request.js', function () {
  it('new Request()', function () {
    var request = new Request();

    // Check class instantiations
    request._headers.should.be.a.Object;
    request._headers.isEmpty().should.be.true;

    request._query.should.be.a.Object;
    request._query.isEmpty().should.be.true;
  });

  it('new Request(Object defaults)', function () {

  });

  it('#query(key, value)', function () {
    var request = new Request();
    var keys = Object.keys(fixtureQuery);

    // Check class instantiations
    request._query.should.be.a.Object;
    request._query.isEmpty().should.be.true;

    // Check collection insertion
    request.query(keys[0], fixtureQuery[keys[0]]);
    request._query.containsKey(keys[0]).should.be.ok;
    request._query.get(keys[0]).should.equal(fixtureQuery[keys[0]]);
    request._query.containsKey(keys[1]).should.not.be.ok;
  });

  it('#query(Query collection)', function () {
    var request = new Request();
    var keys = Object.keys(fixtureQuery);

    // Check class instantiations
    request._query.should.be.a.Object;
    request._query.isEmpty().should.be.true;

    // Check collection insertion
    request.query(fixtureQuery);
    request._query.should.not.be.empty;
    request._query.map.should.have.keys(keys);
  });

  it('#query(Object collection)', function () {
    var request = new Request();
    var keys = Object.keys(fixtureQuery);

    // Check class instantiations
    request._query.should.be.a.Object;
    request._query.isEmpty().should.be.true;

    // Check collection insertion
    request.query(fixtureQuery);
    request._query.should.not.be.empty;
    request._query.map.should.have.keys(keys);
  });

  it('#query(String collection)', function () {
    var request = new Request();
    var keys = Object.keys(fixtureQuery);

    // Check class instantiations
    request._query.should.be.a.Object;
    request._query.isEmpty().should.be.true;

    // Check collection insertion
    request.query(QueryMarshal.unmarshal(fixtureQuery));
    request._query.should.not.be.empty;
    request._query.map.should.have.keys(keys);
  });
});