/*jshint expr: true, unused: false*/

var should = require("should");

// Classes
var Query = require('../lib/classes/query');
var HashMap = require('../lib/classes/hashmap');

// Marshals
var QueryMarshal = require('../lib/marshals/query');

// Fixtures
var fixture = require('./fixtures/query');

// Tests
describe('query.js', function () {
  it('new Query()', function () {
    var query = new Query();

    // Check setup
    query.map.should.be.a.Object;
    query.map.should.be.empty;
  });

  it('new Query(Object collection)', function () {
    var query = new Query(fixture);
    var keys = Object.keys(fixture);

    // Check setup
    query.map.should.be.a.Object;
    query.map.should.have.keys(keys);
    Object.keys(query.map).should.have.length(keys.length);

    // Value Check
    for (var index in keys) {
      query.map[keys[index]].should.equal(fixture[keys[index]]);
    }
  });

  it('new Query(Query collection)', function () {
    var queryFixture = new Query(fixture);
    var query = new Query(queryFixture);
    var keys = Object.keys(fixture);

    // Check setup
    query.map.should.be.a.Object;
    query.map.should.have.keys(keys);
    Object.keys(query.map).should.have.length(keys.length);

    // Value Check
    for (var index in keys) {
      query.map[keys[index]].should.equal(fixture[keys[index]]);
    }
  });

  it('new Query(HashMap collection)', function () {
    var queryFixture = new HashMap(fixture);
    var query = new Query(queryFixture);
    var keys = Object.keys(fixture);

    // Check setup
    query.map.should.be.a.Object;
    query.map.should.have.keys(keys);
    Object.keys(query.map).should.have.length(keys.length);

    // Value Check
    for (var index in keys) {
      query.map[keys[index]].should.equal(fixture[keys[index]]);
    }
  });

  it('new Query(String collection)', function () {
    var query = new Query(QueryMarshal.unmarshal(fixture));
    var keys = Object.keys(fixture);

    // Check setup
    query.map.should.be.a.Object;
    query.map.should.have.keys(keys);
    Object.keys(query.map).should.have.length(keys.length);

    // Value Check
    for (var index in keys) {
      query.map[keys[index]].should.eql(fixture[keys[index]]);
    }
  });

  it('#put(key, value)', function () {
    var query = new Query();

    // Check setup
    query.map.should.be.a.Object;
    query.map.should.be.empty;

    // Initial Value Check
    query.put("a", 1);
    query.map.should.have.keys("a");
    query.map.a.should.equal(1);

    // Overwriting Check
    query.put("a", 2);
    query.map.should.have.keys("a");
    query.map.a.should.equal(2);

    // Case Sensitive Check
    query.put("A", 3);
    query.map.should.have.keys("a", "A");
    query.map.a.should.equal(2);
    query.map.A.should.equal(3);

    // Type Check
    query.put("b", "1");
    query.map.should.have.keys("a", "A", "b");
    query.map.b.should.be.a.String;
    query.map.b.should.equal("1");
  });

  it('#putAll(collection)', function () {
    var query = new Query();
    var keys = Object.keys(fixture);

    // Check setup
    query.map.should.be.a.Object;
    query.map.should.be.empty;

    // Insertion Check
    query.putAll(fixture);
    query.map.should.have.keys(keys);
    Object.keys(query.map).should.have.length(keys.length);

    // Value Check
    for (var index in keys) {
      query.map[keys[index]].should.equal(fixture[keys[index]]);
    }
  });

  it('#get(key, value)', function () {
    var query = new Query();

    // Check setup
    query.map.should.be.a.Object;
    query.map.should.be.empty;

    // Initial Value Check
    query.put("a", 1);
    query.get("a").should.equal(1);

    // Overwriting Check
    query.put("a", 2);
    query.get("a").should.equal(2);

    // Case Insensitive Check
    query.put("A", 3);
    query.get("A").should.equal(3);

    // Type Check
    query.put("b", "1");
    query.get("b").should.be.a.String;
    query.get("b").should.equal("1");
  });

  it('#containsKey(key)', function () {
    var query = new Query(fixture);
    var keys = Object.keys(fixture);

    // Check setup
    query.map.should.be.a.Object;
    query.map.should.have.keys(keys);
    Object.keys(query.map).should.have.length(keys.length);

    // Proper reporting
    for (var index in keys) {
      query.containsKey(keys[index]).should.equal(keys[index]);
    }
  });

  it('#containsValue(value)', function () {
    var plumbers = ['Mario','Luigi', 'Wario'];
    var query = new Query(fixture);
    var keys = Object.keys(fixture);

    // Check setup
    query.map.should.be.a.Object;
    query.map.should.have.keys(keys);
    Object.keys(query.map).should.have.length(keys.length);

    // Proper reporting
    for (var index in keys) {
      query.containsValue(fixture[keys[index]]).should.equal(fixture[keys[index]]);
    }

    // Overwrite check
    query.put('plumbers', plumbers);
    query.containsValue(plumbers).should.equal(plumbers);
  });

  it('#remove(key)', function () {
    var query = new Query(fixture);
    var keys = Object.keys(fixture);

    // Check setup
    query.map.should.be.a.Object;
    query.map.should.have.keys(keys);
    Object.keys(query.map).should.have.length(keys.length);

    // Removal check
    query.remove(keys[0]).should.equal(fixture[keys[0]]);
    (query.map[keys[0]] === undefined).should.be.true;

    // Case Sensitive Check
    (query.remove(keys[1].toUpperCase()) === null).should.be.true;
    query.map[keys[1]].should.equal(fixture[keys[1]]);
  });

  it('#clear()', function () {
    var query = new Query(fixture);
    var keys = Object.keys(fixture);

    // Check setup
    query.map.should.be.a.Object;
    query.map.should.have.keys(keys);
    Object.keys(query.map).should.have.length(keys.length);

    // Empty Check
    (query.clear() === undefined).should.be.true;
    query.map.should.be.a.Object;
    query.map.should.be.empty;
  });

  it('#size()', function () {
    var query = new Query();

    // Check setup
    query.map.should.be.a.Object;
    query.map.should.be.empty;

    // Check method
    query.size().should.not.be.ok;

    // Check after insertion
    query.put("a", 1);
    query.size().should.equal(1);
  });

  it('#isEmpty()', function () {
    var query = new Query();

    // Check setup
    query.map.should.be.a.Object;
    query.map.should.be.empty;

    // Check method
    query.isEmpty().should.be.true;
  });

  it('#toString()', function () {
    var query = new Query(fixture);
    var keys = Object.keys(fixture);

    // Check setup
    query.map.should.be.a.Object;
    query.map.should.have.keys(keys);
    Object.keys(query.map).should.have.length(keys.length);

    // Value Check
    for (var index in keys) {
      query.map[keys[index]].should.equal(fixture[keys[index]]);
    }

    // String Check
    query.toString().should.equal(QueryMarshal.unmarshal(fixture));
  });
});