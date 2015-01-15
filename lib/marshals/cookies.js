var utils = require('../utils');

/**
 * Convert array of cookies, or cookie string to a JavaScript object
 *
 * @param  {Mixed} obj Cookie array, or string
 * @return {Object}
 */
exports.marshal = function MarshalCookie (obj) {
  var cookies = {};
  var index;
  var item;

  function parse (cookie) {
    var pieces = utils.trim(cookie).split('=');
    var key = utils.trim(pieces[0]);
    var value = utils.trim(pieces.slice(1).join('='));

    if (key && key != '') {
      cookies[key] = value === '' ? true : value;
    }
  }

  if (obj) {
    if (utils.is(obj).a(Array)) {
      for (index = 0; index < obj.length; index++) {
        item = obj[index];

        if (utils.is(item).a(String) && utils.does(item).contain(';')) {
          item.split(';').forEach(parse);
        }
      }
    } else if (utils.is(obj).a(String)) {
      obj.split(';').forEach(parse);
    }
  }

  return cookies;
};
