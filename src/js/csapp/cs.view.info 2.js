define(function(require, exports, module) {
  'use strict';
  var _util = require('cs.util');
  $.widget('cs.info', {
    options: {
      // getdatainfoUrl: '/udata/mis/getdatainfo?app=flyflow&id=3',
      getcatelistUrl: '../../data/getdatainfo.json',
    },
    _create: function() {
      this.render(this.options.getcatelistUrl);
      this._bindEvents();
    },
    render: function(getcatelistUrl) {
      var self = this;
      $.ajax(getcatelistUrl).done(function(data) {
        var lists = data.data,
          h = [];

        h.push('<table class="table table-bordered table-hover"><thead class="thin-border-bottom"><tr><th>id</th><th>meta</th><th>schema_id</th><th>version</th><th>latest updated</th><th>operation</th></tr></thead>');
        _.each(lists, function(item, index) {
        	var 	meta = item.metadata.split(';');

          h.push('<tr><td>' + item.id + '</td><td><div>');
          _.each(meta, function(m, i){
          	h.push('<div>'+m+'</div>')
          });

          h.push('</div></td><td>' + item.schema_id + '</td><td>' + item.version + '</td><td>' + _util.dateFormat(item.updated_time * 1000, 'yyyy-MM-dd hh:mm:ss') + '</td><td><i class="fa fa-minus-circle category-remove"></i></td></tr>');
        });
        h.push('</table>');
        self.element.append(h.join(''));
      });
    },
    _bindEvents: function() {}
  });
  module.exports = $.cs.info;
});
