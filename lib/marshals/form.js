var request = require('request');
var utils = require('../utils');
var fs = require('fs');

/**
 * Converts JavaScript multipart object into FormData object
 *
 * @param  {FormData} form FormData Instance
 * @param  {Object}   data Multipart form data object
 * @return {FormData}
 */
exports.marshal = function (form, data) {
  for (var i = 0; i < data.length; i++) {
    var item = data[i];

    if (item.attachment && utils.is(item.value).a(String)) {
      if (utils.does(item.value).contain('http://') || utils.does(item.value).contain('https://')) {
        item.value = request(item.value);
      } else {
        item.value = fs.createReadStream(path.resolve(item.value));
      }
    }

    form.append(item.name, item.value, item.options);
  }

  return form;
};
