define(function(require, exports, module) {
  'use strict';
  var _util = require('cs.util');
  var i = 0,
    level = 0;
  $.widget('cs.schema', {
    options: {
      getDataUrl: '/udata/mis/getschema',
      app: 'flyflow',
      typeSelectData: ['text', 'boolean', 'image', 'select', 'time']
    },
    _create: function() {
      this.render();
      this._bindEvents();

      this.options.typeSelectElem = _util.createSelectElem({
        data: this.options.typeSelectData
      });

      this.element.data('widgetCreated', true);
    },
    render: function() {
      var self = this,
        options = this.options;
      $.ajax({
        url: options.getDataUrl,
        data: {
          app: options.app,
          id: options.id
        }
      }).done(function(data) {
        var schema = $.parseJSON(data.data);
        self._renderSchemaElem();
        self._renderSchemaItemElem(schema);
      });
    },
    reRender:function(options){
      _.extend(this.options, options);
      this.element.addClass('hide').empty();
      this.render();
      this.element.removeClass('hide');
    },
    _renderSchemaElem: function() {
      var h = [];
      h.push('<div class="breadcrumbs">');
      h.push('<div class="breadcrumbs-content" data-rel="tooltip" title=""></div>');
      h.push('</div>');
      h.push('<div class="col-xs-12" id="schemaContent">');
      h.push('</div>');
      this.element.append(h.join(''));
    },
    _renderSchemaItemElem: function(schema) {
      var h = [],
        self = this;
      h.push('<div class="schema-table" data-type="' + schema.type + '" data-level="' + level + '"><div class="table-header');
      if (schema.type === 'item') {
        h.push(' btn-inverse');
      } else {
        h.push(' btn-primary');
      }
      h.push('">' + schema.type);
      if (level) {
        h.push('<div class="table-tool">');
        h.push('<a class="btn btn-mini btn-pink schema-add schema-addlist hide"><i class="fa fa-plus"></i> list</a>');
        h.push('<a class="btn btn-mini btn-purple schema-add schema-additem hide"><i class="fa fa-plus"></i> item</a>');
        h.push('<a class="btn btn-mini btn-success schema-addprop"><i class="fa fa-plus"></i> 属性</a>');
        h.push('<a class="btn btn-mini btn-danger schema-delschema"><i class="fa fa-trash-o"></i> 删除</a>');
        h.push('</div>');
      }
      h.push('</div>');
      h.push('<table class="table table-bordered table-hover"><thead class="thin-border-bottom"><tr>');
      h.push('<th>名称</th><th>Key</th><th>Type</th><th>附加规则</th><th>是否显示</th><th>是否下发</th><th>操作</th>');
      h.push('<tbody>');
      _.each(schema.prop, function(item, index) {
        h.push('<tr><td><textarea>' + item.desc + '</textarea></td><td><textarea>' + item.key + '</textarea></td><td><span class="schema-type">' + item.type + '</div></td><td><textarea>' + item.regx + '</textarea></td><td>');
        if (item.display == '0') {
          h.push('<input type="checkbox" class="ace ace-switch ace-switch-2"><span class="lbl middle"></span>');
        } else {
          h.push('<input checked="checked" type="checkbox" class="ace ace-switch ace-switch-2"><span class="lbl middle"></span>');
        }
        h.push('</td><td>');
        if (item.publish == '0') {
          h.push('<input type="checkbox" class="ace ace-switch ace-switch-2"><span class="lbl middle"></span>');
        } else {
          h.push('<input checked="checked" type="checkbox" class="ace ace-switch ace-switch-2"><span class="lbl middle"></span>');
        }
        h.push('</td><td><button class="btn btn-mini btn-link schema-delprop">删除</button></td></tr>');
      });
      h.push('</tbody>');
      h.push('</tr></thead>');
      h.push('</table></div>');
      this.element.find('#schemaContent').append(h.join(''));
      if (!_.isEmpty(schema.inner)) {
        level++;
        this._renderSchemaItemElem(schema.inner);
      }
    },
    _bindEvents: function() {
      this._on(this.element, {
        'click a.schema-addprop': this._addprop,
        'click button.schema-delprop': this._delprop,
        'click a.schema-delschema': this._delschema,
        'click span.schema-type': this._selecttype
      });
    },
    _addprop: function(event) {
      var h = [];
      h.push('<tr><td><textarea></textarea></td><td><textarea></textarea></td><td>');
      h.push(this.options.typeSelectElem);
      h.push('</td><td><textarea></textarea></td><td><input checked="checked" type="checkbox" class="ace ace-switch ace-switch-2"><span class="lbl middle"></span></td>');
      h.push('<td><input checked="checked" type="checkbox" class="ace ace-switch ace-switch-2"><span class="lbl middle"></span></td><td><i class="fa fa-trash schema-delprop"></i></td></tr>');
      $(event.target).closest('div.schema-table').find('tbody').prepend(h.join(''));
      return false;
    },
    _delprop: function(event) {
      $(event.target).closest('tr').remove();
      return false;
    },
    _delschema: function(event) {
      var $schemaElem = $(event.target).closest('div.schema-table'),
        type = $schemaElem.attr('data-type'),
        level = parseInt($schemaElem.attr('data-level'));

      if (type === "item") {
        $schemaElem.remove();
        $('div[data-level=' + (level - 1) + ']').find('a.schema-add').removeClass('hide');
      } else if (type === 'list') {
        $('div.schema-table').filter(function(index) {
          return index > level - 1
        }).remove();
      }
      return false;
    },
    _selecttype: function(event) {
      var $span = $(event.target),
        $td = $span.parent();
      $td.append(this.options.typeSelectElem);
      $td.find('option[value=' + $span.text() + ']').attr({
        'selected': 'selected'
      });
      $span.addClass('hide');
      return false;
    }
  });
  module.exports = $.cs.schema;
});
