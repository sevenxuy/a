define(function(require, exports, module) {
  'use strict';
  var notify = require('cs.plugin.notify'),
    autosize = require('../lib/autosize.min');

  $.widget('cs.schemaedit', {
    options: {
      // schemaget: '../../datacms/schemaget.json',
      schemaget: '/ucms/cms/schemaget',
      schemaadd: '/ucms/cms/schemaadd',
      schemaupdate: '/ucms/cms/schemaupdate',
      typeSelectData: ['text', 'link', 'boolean', 'image', 'select', 'time']
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
        url: options.schemaget,
        data: {
          m_code: options.m_code,
          schema_code: options.schema_code
        }
      }).done(function(data) {
        self.element.append(self._createSchemaEditElem(data.data));
        $('textarea').each(function() {
          autosize($(this));
        });
      }).fail(function() {});
      if (this.element.hasClass('hide')) {
        this.element.removeClass('hide').addClass('current');
      }
    },
    reRender: function(opt) {
      this.element.addClass('hide').empty();
      this.render(opt);
      this.element.removeClass('hide').addClass('current');
    },
    _createSchemaEditElem: function(data) {
      var self = this,
        options = this.options,
        id = options.id = data.id,
        m_code = options.m_code = data.m_code,
        schema_code = options.schema_code = data.schema_code,
        schema_name = options.schema_name = data.schema_name,
        typeSelectData = options.typeSelectData,
        h = [];
      h.push('<div class="breadcrumbs">');
      h.push('<div class="breadcrumbs-content" data-rel="tooltip">Schema ' + options.schema_code + '</div>');
      h.push('<div class="table-tool">');
      h.push('<button class="btn btn-mini btn-warning data-save"><i class="fa fa-save"></i> 保存</button>');
      h.push('</div>');
      h.push('</div>');
      h.push('<div class="col-xs-12">');
      h.push('<div></div>');
      h.push('<div class="schema-table"><div class="table-header">Schema Info</div>');
      h.push('<table class="table table-bordered table-hover"><thead><tr>');
      h.push('<th>id</th><th>m_code</th><th>schema_code</th><th>schema_name</th>');
      h.push('</tr></thead><tbody id="schemaedit-info">');
      h.push('<tr><td>' + id + '</td><td>' + m_code + '</td><td>' + schema_code + '</td><td><textarea id="schemaedit-name">' + schema_name + '</textarea></td></tr>');
      h.push('</tbody></table></div>');
      h.push('<div class="schema-table"><div class="table-header">Schema Content<div class="table-tool">');
      h.push('<a class="btn btn-mini btn-success schema-addprop"><i class="fa fa-plus"></i> 属性</a>');
      h.push('</div></div><table class="table table-bordered table-hover"><thead><tr>');
      h.push('<th>key</th><th>desc</th><th>type</th><th>regx</th><th>is_index</th><th>操作</th>');
      h.push('</tr></thead><tbody id="schemaedit-content">');
      if (data.schema_content) {
        options.schema_content_origin = data.schema_content;
        var schema_content = options.schema_content = $.parseJSON(data.schema_content);
        if (!_.isEmpty(schema_content)) {
          _.each(schema_content, function(item, index) {
            h.push('<tr><td data-key="key" data-value="' + item.key + '">' + item.key + '</td><td data-key="desc"><textarea>' + item.desc + '</textarea></td><td data-key="type">' + self._createSelectElem(typeSelectData, item.type) + '</td><td data-key="regx"><textarea>' + item.regx + '</textarea></td><td data-key="is_index" data-value="' + item.is_index + '">' + item.is_index + '</td><td></td></tr>');
          });
        }
      }
      h.push('</tbody></table></div></div>');
      return h.join('');
    },
    _bindEvents: function() {
      this._on(this.element, {
        'click button.data-save': this._dataSave,
        'click a.schema-addprop': this._addPropElem,
        'click a.data-del': this._dataDel,
        'change textarea': this._rowpink,
        'change select': this._rowpink
      });
    },
    _dataSave: function(event) {
      var self = this,
        options = this.options,
        $info = $('#schemaedit-info'),
        $content = $('#schemaedit-content'),
        porplist = [],
        schema_name = '',
        schema_content = '';

      $content.find('textarea').each(function() {
        $(this).parent().attr({
          'data-value': $(this).val().trim()
        })
      });
      $content.find('select.schema-type').each(function() {
        $(this).parent().attr({
          'data-value': $(this).val()
        })
      });

      //check if there are duplicate keys or empty keys in the prop list
      var keys = [];
      $content.find('td[data-key=key]').each(function() {
        var key_val = $(this).attr('data-value');
        if (!key_val) {
          notify({
            text: '请确认输入key值或删除无key属性.'
          });
          return false;
        } else {
          keys.push($(this).attr('data-value'));
        }
      });
      if (this._hasDuplicateKeys(keys)) {
        notify({
          text: '请确认key值唯一。'
        });
        return false;
      }

      //no request if no change
      if ((!$info.find('tr.row-pink').length) && (!$content.find('tr.row-pink').length)) {
        return false;
      }

      //get schema_name
      if (!$info.find('tr.row-pink').length) {
        schema_name = options.schema_name;
      } else {
        schema_name = $('#schemaedit-name').val().trim();
      }

      //get schema_content
      if (!$content.find('tr.row-pink').length) {
        schema_content = options.schema_content_origin;
      } else {
        $content.find('tr').each(function() {
          var $tr = $(this);
          var prop = {};
          $tr.find('td').each(function() {
            var $td = $(this);
            prop[$td.attr('data-key')] = $td.attr('data-value');
          });
          porplist.push(JSON.stringify(prop));
        });
        schema_content = '[' + porplist.join(',') + ']';
      }

      $.ajax({
        url: options.schemaupdate,
        data: {
          id: options.id,
          m_code: options.m_code,
          schema_code: options.schema_code,
          schema_name: schema_name,
          schema_content: schema_content
        }
      }).done(function(response) {
        if ((!response.errno) && response.data) {
          $content.find('a.data-del').remove();
          $content.find('td[data-key=key]').each(function() {
            $(this).find('textarea').remove();
            $(this).text($(this).attr('data-value'));
          });
          self.element.find('tr.row-pink').removeClass('row-pink');
        } else {
          notify({
            text: response.error
          });
        }
      }).fail(function(response) {
        notify({
          text: '保存失败，请稍后再试。'
        });
      });
      return false;
    },
    _addPropElem: function(event) {
      var options = this.options,
        h = [];
      h.push('<tr><td data-key="key"><textarea></textarea></td><td data-key="desc"><textarea></textarea></td><td data-key="type">');
      h.push(this._createSelectElem(options.typeSelectData));
      h.push('</td><td data-key="regx"><textarea></textarea></td><td data-key="is_index" data-value=""></td><td><a class="btn btn-link data-del">删除</a></td></tr>');
      $('#schemaedit-content').prepend(h.join(''));
      return false;
    },
    _dataDel: function(event) {
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
    _createSelectElem: function(typeSelectData, selected) {
      var h = [];
      h.push('<select class="schema-type">');
      if (_.isArray(typeSelectData)) {
        _.each(typeSelectData, function(item, index) {
          h.push('<option value="' + item + '"');
          if (!!selected && (selected === item)) {
            h.push(' selected="selected"')
          }
          h.push('>' + item + '</option>');
        });
      }
      h.push('</select>');
      return h.join('');
    },
    _hasDuplicateKeys: function(keys) {
      return _.uniq(keys).length !== keys.length
    }
  });
  module.exports = $.cs.schemaedit;
});
