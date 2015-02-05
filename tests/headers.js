var should = require("should");
var Headers = require('../lib/classes/headers');
var HeadersMarshal = require('../lib/marshals/header');

var fixture = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer 9208s09gDRyGs9Sg2UNIRESTjt2ioVsWERkswioJ2e8'
};

describe('Headers.js', function () {
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
    headers.map[keys[0]].should.equal(fixture[keys[0]]);
    headers.map[keys[1]].should.equal(fixture[keys[1]]);
  });

  it('new Headers(String collection)', function () {
    var headers = new Headers(HeadersMarshal.unmarshal(fixture));
    var keys = Object.keys(fixture);

    // Check setup
    headers.map.should.be.a.Object;
    headers.map.should.have.keys(keys);
    Object.keys(headers.map).should.have.length(keys.length);

    // Value Check
    headers.map[keys[0]].should.equal(fixture[keys[0]]);
    headers.map[keys[1]].should.equal(fixture[keys[1]]);
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
    (headers.map.A === undefined).should.be.true;
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
    headers.map[keys[0]].should.equal(fixture[keys[0]]);
    headers.map[keys[1]].should.equal(fixture[keys[1]]);
  });

  it('#containsKey(key)', function () {
    var headers = new Headers(fixture);
    var keys = Object.keys(fixture);

    // Check setup
    headers.map.should.be.a.Object;
    headers.map.should.have.keys(keys);
    Object.keys(headers.map).should.have.length(keys.length);

    // Proper reporting
    headers.containsKey(keys[0]).should.equal(keys[0]);
    headers.containsKey(keys[1]).should.equal(keys[1]);

    // Case Insensitive Check
    headers.containsKey(keys[0].toLowerCase()).should.equal(keys[0]);
    headers.containsKey(keys[1].toUpperCase()).should.equal(keys[1]);
  });

  it('#containsValue(value)', function () {
    var headers = new Headers(fixture);
    var keys = Object.keys(fixture);

    // Check setup
    headers.map.should.be.a.Object;
    headers.map.should.have.keys(keys);
    Object.keys(headers.map).should.have.length(keys.length);

    // Proper reporting
    headers.containsValue(fixture[keys[0]]).should.equal(fixture[keys[0]]);
    headers.containsValue(fixture[keys[1]]).should.equal(fixture[keys[1]]);

    // Case Insensitive Check
    headers.containsValue(fixture[keys[0]].toUpperCase()).should.equal(fixture[keys[0]]);
    headers.containsValue(fixture[keys[1]].toUpperCase()).should.equal(fixture[keys[1]]);
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
    headers.map[keys[0]].should.equal(fixture[keys[0]]);
    headers.map[keys[1]].should.equal(fixture[keys[1]]);

    // String Check
    headers.toString().should.equal(HeadersMarshal.unmarshal(fixture));
  });
});