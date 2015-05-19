define(function(require, exports, module) {
  'use strict';
  exports.dateFormat = function(timestamp, fmt) {
    var date = new Date(timestamp);
    var o = {
      "M+": date.getMonth() + 1,
      "d+": date.getDate(),
      "h+": date.getHours(),
      "m+": date.getMinutes(),
      "s+": date.getSeconds(),
    };
    if (/(y+)/.test(fmt))
      fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt))
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
  };
  exports.createSelectElem = function(options) {
    var h = [];
    if (options.multiple) {
      h.push('<select class="' + options.selectClass + '" multiple="multiple">');
    } else {
      h.push('<select class="' + options.selectClass + '">');
    }
    h.push('<option selected="selected" disabled="disabled">请选择</option>');
    if (_.isArray(options.data)) {
      _.each(options.data, function(item, index) {
        if (options.selected == item) {
          h.push('<option value="' + item + '" selected="selected">' + item + '</option>');
        } else {
          h.push('<option value="' + item + '">' + item + '</option>');
        }
      });
    } else if (_.isObject(options.data)) {
      _.each(options.data, function(value, key) {
        if (options.selected == key) {
          h.push('<option value="' + key + '" selected="selected">' + value + '</option>');
        } else {
          h.push('<option value="' + key + '">' + value + '</option>');
        }
      });
    }
    h.push('</select>');
    return h.join('');
  };

  var actor = {};
  exports.setActor = function(actor) {
    actor = actor;
  }
  exports.getActor = function(actor) {
    return actor;
  }
});
