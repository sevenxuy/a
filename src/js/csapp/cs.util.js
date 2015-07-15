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
    exports.createSelectElem = function(opt) {
        var h = [];
        if (opt.multiple) {
            h.push('<select class="' + opt.selectClass + '" multiple="multiple">');
        } else {
            h.push('<select class="' + opt.selectClass + '">');
        }
        h.push('<option selected="selected" disabled="disabled">请选择</option>');
        if (_.isArray(opt.data)) {
            _.each(opt.data, function(item, index) {
                if (opt.selected == item) {
                    h.push('<option value="' + item + '" selected="selected">' + item + '</option>');
                } else {
                    h.push('<option value="' + item + '">' + item + '</option>');
                }
            });
        } else if (_.isObject(opt.data)) {
            _.each(opt.data, function(value, key) {
                if (opt.selected == key) {
                    h.push('<option value="' + key + '" selected="selected">' + value + '</option>');
                } else {
                    h.push('<option value="' + key + '">' + value + '</option>');
                }
            });
        }
        h.push('</select>');
        return h.join('');
    };
    exports.validateId = function(str) {
        var result = str.match(/^[a-zA-Z]\w+$/);
        if (result == null) return false;
        return true;
    }
});
