define(function(require, exports, module) {
  'use strict';
  var autosize = require('../cslib/autosize.min');
  var _util = require('cs.util'),
    _contentdata,
    _cate_info,
    _schema,
    _data_info,
    level = 0;

  $.widget('cs.content', {
    options: {
      // getdata: '../../data/getdata.json', //for test
      getdata: '/udata/mis/getdata',
      app: 'flyflow'
    },
    _create: function(opt) {
      this.render(opt);
      this._bindEvents();
      this.element.data('widgetCreated', true);
    },
    render: function(opt) {
      _.extend(this.options, opt);
      var self = this,
        options = this.options;
      $.ajax({
        url: options.getdata,
        data: {
          app: options.app,
          id: options.id
        }
      }).done(function(data) {
        _contentdata = data.data;
        _cate_info = _contentdata.cate_info;
        _schema = $.parseJSON(_contentdata.schema);
        _data_info = _contentdata.data_info;

        self.element.append(self._renderListElem(options.code));

        if (self.element.hasClass('hide')) {
          self.element.removeClass('hide').addClass('current');;
        }
        $('textarea').each(function() {
          autosize($(this));
        });
      });
    },
    reRender: function(opt) {
      this.element.addClass('hide').empty();
      this.render(opt);
      this.element.removeClass('hide').addClass('current');
    },
    getPropByParentCode: function(dataTreeCode) {
      var inner = _schema.inner;
      for (var i = dataTreeCode.length - 1; i > 0; i--) {
        inner = inner.inner;
      }
      return inner.prop;
    },
    getListByParentCode: function(dataTreeCode) {
      var codeArray = dataTreeCode.split('');
      var list = _data_info.data.list;
      for (var i = 1, j = codeArray.length; i < j; i++) {
        list = list[codeArray[i]].list;
      }
      return list;
    },
    _renderListElem: function(dataTreeCode) {
      var h = [],
        prop = this.getPropByParentCode(dataTreeCode),
        list = this.getListByParentCode(dataTreeCode);
      h.push('<div class="breadcrumbs">');
      h.push('<div class="breadcrumbs-content" data-rel="tooltip" title=""></div>');
      h.push('<div class="table-tool">');
      h.push('<button class="btn btn-mini btn-danger content-save"><i class="fa fa-save"></i> 保存</button>');
      h.push('<button class="btn btn-mini btn-success content-add"><i class="fa fa-plus"></i> 新增</button>');
      h.push('<div class="btn-group">');
      h.push('<button class="btn btn-mini btn-yellow dropdown-toggle btn-import" data-toggle="dropdown">导入<i class="ace-icon fa fa-angle-down icon-on-right"></i></button>');
      h.push('<ul class="dropdown-menu dropdown-info dropdown-menu-right">');
      h.push('<li><a attr="click:showUploadDataSchema">导入新增Data和Schema</a></li>');
      h.push('<li><a attr="click:showUploadData">导入新增Data</a></li>');
      h.push('<li><a attr="click:showUploadSchema">导入更新Schema</a></li>');
      h.push('</ul>');
      h.push('</div>');
      h.push('</div>');
      h.push('</div>');
      h.push('<div class="col-xs-12"><table class="table table-bordered table-hover"><thead class="thin-border-bottom"><tr>');
      _.each(prop, function(item, index) {
        h.push('<th data-key="' + item.key + '" data-type="' + item.type + '" data-regx="' + item.regx + '">' + item.desc + '</th>');
      });
      h.push('<th>操作</th></tr></thead>');
      h.push('<tbody>');
      _.each(list, function(listitem, i) {
        h.push('<tr data-code="' + dataTreeCode + i + '">');
        _.each(prop, function(item, index) {
          h.push('<td>');
          switch (item.type) {
            case 'text':
              h.push('<textarea>' + listitem[item.key] + '</textarea>');
              break;
            case 'boolean':
              h.push('<input type="checkbox"');
              if (listitem[item.key] == '1') {
                h.push(' checked="checked"');
              }
              h.push(' class="ace ace-switch ace-switch-2"><span class="lbl middle"></span>');
              break;
          }
          h.push('</td>');
        });
        h.push('<td>');
        if (!_.isEmpty(listitem.list)) {
          h.push('<a class="btn btn-link content-expand">展开</a>');
        }
        h.push('<a class="btn btn-link content-del">删除</a>');
        h.push('</td>')
        h.push('</tr>');
      });
      h.push('</tbody>');
      h.push('</table></div>');
      return h.join('');
    },
    _bindEvents: function() {
      this._on(this.element, {
        'click a.content-expand': this._expandContent,
        'click a.content-add': this._addItem,
        'click a.content-del': this._delItem,
        'change input': this._rowpink,
        'change textarea': this._rowpink,
        'change select': this._rowpink

      });
    },

    _expandContent: function(event) {
      var options = this.options,
        code = $(event.target).closest('tr').attr('data-code'),
        router = new Backbone.Router;
      router.navigate('data/' + options.id + '/' + code, {
        trigger: true
      });
    },
    _addItem: function(event) {
      var h = [];
      h.push();
      $content = $(event.target).closest('div.content').find('tbody').prepend(h.join(''));
      return false;
    },
    _delItem: function(event) {
      $(event.target).closest('tr').remove();
      return false;
    },
    _rowpink: function(event) {
      var $row = $(event.target).closest('tr');
      if (!$row.hasClass('row-pink')) {
        $row.addClass('row-pink');
      }
      return false;
    },
  });
  module.exports = $.cs.content;
});
