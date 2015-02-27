/*jshint expr: true, unused: false*/

var should = require("should");

// Classes
var Headers = require('../lib/classes/headers');
var HashMap = require('../lib/classes/hashmap');

// Marshals
var HeadersMarshal = require('../lib/marshals/headers');

// Fixtures
var fixture = require('./fixtures/hashmap');
var fixtureErroneous = require('./fixtures/hashmap.erroneous');

// Tests
describe('headers.js', function () {
  it('new Headers()', function () {
    var headers = new Headers();

    // Check setup
    headers.map.should.be.a.Object;
    headers.map.should.be.empty;
  });

  it('new Headers(Object collection)', function () {
    var headers = new Headers(fixture);
    var keys = Object.keys(fixture);

    // Check setup
    headers.map.should.be.a.Object;
    headers.map.should.have.keys(keys);
    Object.keys(headers.map).should.have.length(keys.length);

    // Value Check
    for (var index in keys) {
      headers.map[keys[index]].should.equal(fixture[keys[index]]);
    }
  });

  it('new Headers(Headers collection)', function () {
    var headersFixture = new Headers(fixture);
    var headers = new Headers(headersFixture);
    var keys = Object.keys(fixture);

    // Check setup
    headers.map.should.be.a.Object;
    headers.map.should.have.keys(keys);
    Object.keys(headers.map).should.have.length(keys.length);

    // Value Check
    for (var index in keys) {
      headers.map[keys[index]].should.equal(fixture[keys[index]]);
    }
  });

  it('new Headers(HashMap collection)', function () {
    var headersFixture = new HashMap(fixtureErroneous);
    var headers = new Headers(headersFixture);
    var keys = Object.keys(fixtureErroneous);

    // Check setup
    headers.map.should.be.a.Object;
    headers.map.should.have.keys(keys[0], keys[2]);
    Object.keys(headers.map).should.have.length(2);

    // Value Check
    headers.map[keys[0]].should.equal(fixtureErroneous[keys[1]]);
    headers.map[keys[2]].should.equal(fixtureErroneous[keys[3]]);
  });

  it('new Headers(String collection)', function () {
    var headers = new Headers(HeadersMarshal.unmarshal(fixture));
    var keys = Object.keys(fixture);

    // Check setup
    headers.map.should.be.a.Object;
    headers.map.should.have.keys(keys);
    Object.keys(headers.map).should.have.length(keys.length);

    // Value Check
    for (var index in keys) {
      headers.map[keys[index]].should.equal(fixture[keys[index]]);
    }
  });

  it('#put(key, value)', function () {
    var headers = new Headers();

    // Check setup
    headers.map.should.be.a.Object;
    headers.map.should.be.empty;

    // Initial Value Check
    headers.put("a", 1);
    headers.map.should.have.keys("a");
    headers.map.a.should.equal(1);

    // Overwriting Check
    headers.put("a", 2);
    headers.map.should.have.keys("a");
    headers.map.a.should.equal(2);

    // Case Insensitive Check
    headers.put("A", 3);
    headers.map.should.have.keys("a");
    headers.map.a.should.equal(3);

    // Type Check
    headers.put("b", "1");
    headers.map.should.have.keys("a", "b");
    headers.map.b.should.be.a.String;
    headers.map.b.should.equal("1");
  });

  it('#putAll(collection)', function () {
    var headers = new Headers();
    var keys = Object.keys(fixture);

    // Check setup
    headers.map.should.be.a.Object;
    headers.map.should.be.empty;

    // Insertion Check
    headers.putAll(fixture);
    headers.map.should.have.keys(keys);
    Object.keys(headers.map).should.have.length(keys.length);

    // Value Check
    for (var index in keys) {
      headers.map[keys[index]].should.equal(fixture[keys[index]]);
    }
  });

  it('#get(key, value)', function () {
    var headers = new Headers();

    // Check setup
    headers.map.should.be.a.Object;
    headers.map.should.be.empty;

    // Initial Value Check
    headers.put("a", 1);
    headers.get("a").should.equal(1);

    // Overwriting Check
    headers.put("a", 2);
    headers.get("a").should.equal(2);

    // Case Insensitive Check
    headers.put("A", 3);
    headers.map.should.not.have.keys("A");
    headers.get("a").should.equal(3);
    headers.get("A").should.equal(3);

    // Type Check
    headers.put("b", "1");
    headers.get("b").should.be.a.String;
    headers.get("b").should.equal("1");
  });

  it('#containsKey(key)', function () {
    var headers = new Headers(fixture);
    var keys = Object.keys(fixture);

    // Check setup
    headers.map.should.be.a.Object;
    headers.map.should.have.keys(keys);
    Object.keys(headers.map).should.have.length(keys.length);

    // Value Checks
    for (var index in keys) {
      headers.containsKey(keys[index]).should.equal(keys[index]);
      headers.containsKey(keys[index].toLowerCase()).should.equal(keys[index]);
    }
  });

  it('#containsValue(value)', function () {
    var headers = new Headers(fixture);
    var keys = Object.keys(fixture);

    // Check setup
    headers.map.should.be.a.Object;
    headers.map.should.have.keys(keys);
    Object.keys(headers.map).should.have.length(keys.length);

    // Value Checks
    for (var index in keys) {
      headers.containsKey(keys[index]).should.equal(keys[index]);
      headers.containsKey(keys[index].toUpperCase()).should.equal(keys[index]);
    }
  });

  it('#remove(key)', function () {
    var headers = new Headers(fixture);
    var keys = Object.keys(fixture);

    // Check setup
    headers.map.should.be.a.Object;
    headers.map.should.have.keys(keys);
    Object.keys(headers.map).should.have.length(keys.length);

    // Removal check
    headers.remove(keys[0]).should.equal(fixture[keys[0]]);
    (headers.map[keys[0]] === undefined).should.be.true;

    // Case Insensitive Check
    headers.remove(keys[1]).should.equal(fixture[keys[1]]);
    headers.map.should.be.empty;
  });

  it('#clear()', function () {
    var headers = new Headers(fixture);
    var keys = Object.keys(fixture);

    // Check setup
    headers.map.should.be.a.Object;
    headers.map.should.have.keys(keys);
    Object.keys(headers.map).should.have.length(keys.length);

    // Empty Check
    (headers.clear() === undefined).should.be.true;
    headers.map.should.be.a.Object;
    headers.map.should.be.empty;
  });

  it('#size()', function () {
    var headers = new Headers();

    // Check setup
    headers.map.should.be.a.Object;
    headers.map.should.be.empty;

    // Check method
    headers.size().should.not.be.ok;

    // Check after insertion
    headers.put("a", 1);
    headers.size().should.equal(1);
  });

  it('#isEmpty()', function () {
    var headers = new Headers();

    // Check setup
    headers.map.should.be.a.Object;
    headers.map.should.be.empty;

    // Check method
    headers.isEmpty().should.be.true;
  });

  it('#toString()', function () {
    var headers = new Headers(fixture);
    var keys = Object.keys(fixture);

    // Check setup
    headers.map.should.be.a.Object;
    headers.map.should.have.keys(keys);
    Object.keys(headers.map).should.have.length(keys.length);

    // Value Check
    for (var index in keys) {
      headers.map[keys[index]].should.equal(fixture[keys[index]]);
    }

    // String Check
    headers.toString().should.equal(HeadersMarshal.unmarshal(fixture));
  });
});