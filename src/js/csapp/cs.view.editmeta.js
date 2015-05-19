define(function(require, exports, module) {
  'use strict';
  require('cs.util');
  
  $.widget('cs.editmeta', {
    options: {
      getDataUrl: '../../data/getdatameta.json', //for test
      getMetaDataOptionsUrl: '../../data/getMetaDataOptions.json', //for test
      // getDataUrl: '/udata/mis/getdatameta',
      // getMetaDataOptionsUrl: '/udata/mis/getMetaDataOptions',
      app: 'flyflow',
      metaDataOptions: [],
      keyDataOptions: []
    },
    _create: function() {
      this.render();
      this._renderMetaDataOptionsElem();
      this._bindEvents();
    },
    render: function() {
      var self = this,
        options = this.options;
      $.ajax({
        url: options.getDataUrl,
        data: {
          app: options.app
        }
      }).done(
        function(data) {
          var meta = data.data,
            h = [];
          h.push('<div class="breadcrumbs">');
          h.push('<div class="breadcrumbs-content" data-rel="tooltip" title="运营导航 > 左屏导航">运营导航 &gt; 左屏导航</div>');
          h.push('<div class="table-tool">');
          h.push('<button class="btn btn-mini btn-warning"><i class="fa fa-plus"></i> 保存</button>');
          h.push('<button class="btn btn-mini btn-success"><i class="fa fa-plus"></i> 新增</button>');
          h.push('</div>');
          h.push('</div>');
          h.push('<div class="col-xs-12"><table class="table table-bordered table-hover">');
          h.push('<thead><tr><th>参数</th><th>操作符</th><th>值</th><td>操作</td></tr></thead><tbody>');
          _.each(meta, function(item, index) {
            h.push('<tr data-key="' + item.key + '" data-operator="' + item.operator + '" data-value="' + item.value + '"><td class="meta-key">' + item.key + '</td><td class="meta-operator">' + item.operator + '</td><td class="meta-value">' + item.value + '</td><td><button class="btn btn-link">删除</button></td></tr>');
          });
          h.push('<tbody></table></div>');
          self.element.append(h.join(''));
        });

    },
    _renderMetaDataOptionsElem: function() {
      var self = this,
        options = this.options;
      $.ajax({
        url: options.getMetaDataOptionsUrl,
        data: {
          app: options.app
        }
      }).done(function(data) {
        var metaDataOptions = options.metaDataOptions = data.data;
        _.each(metaDataOptions, function(item, index) {
          options.keyDataOptions.push(item.key);
        });
      });
    },
    _getListByKey: function(key, subkey) {
      var metaDataOptions = this.options.metaDataOptions;
      return _.findWhere(metaDataOptions, {
        key: key
      })[subkey];
    },
    reRender: function() {},
    _bindEvents: function() {
      this._on(this.element, {
        'click td.meta-key': this._editKey
      });
    },
    _editKey: function(event) {

      return false;
    }
  });
  module.exports = $.cs.editmeta;
});
