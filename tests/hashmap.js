/*jshint expr: true, unused: false*/

var should = require("should");

// Classes
var HashMap = require('../lib/classes/hashmap');

// Marshals
var HashMapMarshal = require('../lib/marshals/json');

// Fixtures
var fixture = require('./fixtures/hashmap');

// Tests
describe('hashmap.js', function () {
  it('new HashMap()', function () {
    var hashmap = new HashMap();

    // Check setup
    hashmap.map.should.be.a.Object;
    hashmap.map.should.be.empty;
  });

  it('new HashMap(Object collection)', function () {
    var hashmap = new HashMap(fixture);
    var keys = Object.keys(fixture);

    // Check setup
    hashmap.map.should.be.a.Object;
    hashmap.map.should.have.keys(keys);
    Object.keys(hashmap.map).should.have.length(keys.length);

    // Value Check
    for (var index in keys) {
      hashmap.map[keys[index]].should.equal(fixture[keys[index]]);
    }
  });

  it('new HashMap(HashMap collection)', function () {
    var fixtureHashMap = new HashMap(fixture)
    var hashmap = new HashMap(fixtureHashMap);
    var keys = Object.keys(fixture);

    // Check setup
    hashmap.map.should.be.a.Object;
    hashmap.map.should.have.keys(keys);
    Object.keys(hashmap.map).should.have.length(keys.length);

    // Value Check
    for (var index in keys) {
      hashmap.map[keys[index]].should.equal(fixture[keys[index]]);
    }
  });

  it('new HashMap(String collection)', function () {
    var hashmap = new HashMap(HashMapMarshal.unmarshal(fixture));
    var keys = Object.keys(fixture);

    // Check setup
    hashmap.map.should.be.a.Object;
    hashmap.map.should.have.keys(keys);
    Object.keys(hashmap.map).should.have.length(keys.length);

    // Value Check
    for (var index in keys) {
      hashmap.map[keys[index]].should.equal(fixture[keys[index]]);
    }
  });

  it('#put(key, value)', function () {
    var hashmap = new HashMap();

    // Check setup
    hashmap.map.should.be.a.Object;
    hashmap.map.should.be.empty;

    // Initial Value Check
    hashmap.put("a", 1);
    hashmap.map.should.have.keys("a");
    hashmap.map.a.should.equal(1);

    // Overwriting Check
    hashmap.put("a", 2);
    hashmap.map.should.have.keys("a");
    hashmap.map.a.should.equal(2);

    // Case Sensitive Check
    hashmap.put("A", 3);
    hashmap.map.should.have.keys("a", "A");
    hashmap.map.a.should.equal(2);
    hashmap.map.A.should.equal(3);

    // Type Check
    hashmap.put("b", "1");
    hashmap.map.should.have.keys("a", "A", "b");
    hashmap.map.b.should.be.a.String;
    hashmap.map.b.should.equal("1");
  });

  it('#putAll(collection)', function () {
    var hashmap = new HashMap();
    var keys = Object.keys(fixture);

    // Check setup
    hashmap.map.should.be.a.Object;
    hashmap.map.should.be.empty;

    // Insertion Check
    hashmap.putAll(fixture);
    hashmap.map.should.have.keys(keys);
    Object.keys(hashmap.map).should.have.length(keys.length);

    // Value Check
    for (var index in keys) {
      hashmap.map[keys[index]].should.equal(fixture[keys[index]]);
    }
  });

  it('#get(key, value)', function () {
    var hashmap = new HashMap();

    // Check setup
    hashmap.map.should.be.a.Object;
    hashmap.map.should.be.empty;

    // Initial Value Check
    hashmap.put("a", 1);
    hashmap.get("a").should.equal(1);

    // Overwriting Check
    hashmap.put("a", 2);
    hashmap.get("a").should.equal(2);

    // Case Insensitive Check
    hashmap.put("A", 3);
    hashmap.get("A").should.equal(3);

    // Type Check
    hashmap.put("b", "1");
    hashmap.get("b").should.be.a.String;
    hashmap.get("b").should.equal("1");
  });

  it('#containsKey(key)', function () {
    var hashmap = new HashMap(fixture);
    var keys = Object.keys(fixture);

    // Check setup
    hashmap.map.should.be.a.Object;
    hashmap.map.should.have.keys(keys);
    Object.keys(hashmap.map).should.have.length(keys.length);

    // Proper reporting
    hashmap.containsKey(keys[0]).should.equal(keys[0]);
    hashmap.containsKey(keys[1]).should.equal(keys[1]);

    // Case Sensitive Check
    hashmap.containsKey(keys[0].toLowerCase()).should.be.false;
    hashmap.containsKey(keys[1].toUpperCase()).should.be.false;
  });

  it('#containsValue(value)', function () {
    var hashmap = new HashMap(fixture);
    var keys = Object.keys(fixture);

    // Check setup
    hashmap.map.should.be.a.Object;
    hashmap.map.should.have.keys(keys);
    Object.keys(hashmap.map).should.have.length(keys.length);

    // Proper reporting
    hashmap.containsValue(fixture[keys[0]]).should.equal(fixture[keys[0]]);
    hashmap.containsValue(fixture[keys[1]]).should.equal(fixture[keys[1]]);

    // Case Sensitive Check
    hashmap.containsValue(fixture[keys[0]].toUpperCase()).should.be.false;
    hashmap.containsValue(fixture[keys[1]].toUpperCase()).should.be.false;
  });

  it('#remove(key)', function () {
    var hashmap = new HashMap(fixture);
    var keys = Object.keys(fixture);

    // Check setup
    hashmap.map.should.be.a.Object;
    hashmap.map.should.have.keys(keys);
    Object.keys(hashmap.map).should.have.length(keys.length);

    // Removal check
    hashmap.remove(keys[0]).should.equal(fixture[keys[0]]);
    (hashmap.map[keys[0]] === undefined).should.be.true;

    // Case Sensitive Check
    (hashmap.remove(keys[1].toUpperCase()) === null).should.be.true;
    hashmap.map[keys[1]].should.equal(fixture[keys[1]]);
  });

  it('#clear()', function () {
    var hashmap = new HashMap(fixture);
    var keys = Object.keys(fixture);

    // Check setup
    hashmap.map.should.be.a.Object;
    hashmap.map.should.have.keys(keys);
    Object.keys(hashmap.map).should.have.length(keys.length);

    // Empty Check
    (hashmap.clear() === undefined).should.be.true;
    hashmap.map.should.be.a.Object;
    hashmap.map.should.be.empty;
  });

  it('#size()', function () {
    var hashmap = new HashMap();

    // Check setup
    hashmap.map.should.be.a.Object;
    hashmap.map.should.be.empty;

    // Check method
    hashmap.size().should.not.be.ok;

    // Check after insertion
    hashmap.put("a", 1);
    hashmap.size().should.equal(1);
  });

  it('#isEmpty()', function () {
    var hashmap = new HashMap();

    // Check setup
    hashmap.map.should.be.a.Object;
    hashmap.map.should.be.empty;

    // Check method
    hashmap.isEmpty().should.be.true;
  });

  it('#toString()', function () {
    var hashmap = new HashMap(fixture);
    var keys = Object.keys(fixture);

    // Check setup
    hashmap.map.should.be.a.Object;
    hashmap.map.should.have.keys(keys);
    Object.keys(hashmap.map).should.have.length(keys.length);

    // Value Check
    for (var index in keys) {
      hashmap.map[keys[index]].should.equal(fixture[keys[index]]);
    }

    // String Check
    hashmap.toString().should.equal(HashMapMarshal.unmarshal(fixture));
  });
});