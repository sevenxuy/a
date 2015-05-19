define(function(require, exports, module) {
  'use strict';
  $.widget('cs.meta', {
    options: {
      // getMetaDataOptions: '/udata/mis/getMetaDataOptions?app=flyflow',
      getMetaDataOptionsUrl: '../../data/getMetaDataOptions.json',
      selectData: ['>','>=','<<=','==','!=','in','notin','inmc','isset','notisset','v>','v<','v=','v>=','v<=']
    },
    _create: function() {
      this.render(this.options.getMetaDataOptionsUrl);
      this._bindEvents();
    },
    render: function(getMetaDataOptionsUrl) {
      var self = this;
      $.ajax(getMetaDataOptionsUrl).done(function(data) {
        var lists = data.data,
          h = [];
        h.push('<table class="table table-bordered table-hover"><thead class="thin-border-bottom"><tr><th>key</th><th>title</th><th>operator</th><th>reserved</th><th>operation</th></tr></thead>');
        _.each(lists, function(item, index) {
          h.push('<tr><td>' + item.key + '</td><td>' + item.title + '</td><td><div class="tags">');
          _.each(item.operator, function(op, index) {
            h.push('<span class="tag">' + op + '</span>');
          });
          h.push('</div></td><td>');
          if (!_.isEmpty(item.value)) {
            h.push('<div class="tags">');
            _.each(item.value, function(val, index) {
              h.push('<span class="tag">' + val + '</span>');
            });
            h.push('</div>');
          }
          h.push('</td><td></td></tr>');
        });
        self.element.append(h.join(''));
      });
    },
    _bindEvents: function() {
      this._on(this.element, {});
    }
  });
  module.exports = $.cs.meta;
});
