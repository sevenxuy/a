define(function(require, exports, module) {
  'use strict';
  require('cs.view.schemaedit');
  var notify = require('cs.plugin.notify'),
    autosize = require('../lib/autosize.min');

  $.widget('cs.schema', {
    options: {
      userinfo: '/ucms/cms/userinfo',
      // schemagetlist: '../../datacms/schemagetlist.json',
      schemagetlist: '/ucms/cms/schemagetlist',
      schemaadd: '/ucms/cms/schemaadd',
      schemadel: '/ucms/cms/schemadel'
    },
    _create: function(opt) {
      this.getUserinfo(opt);
      this._bindEvents();
      this.element.data('widgetCreated', true);
    },
    getUserinfo: function(opt) {
      _.extend(this.options, opt);
      var self = this,
        options = this.options;
      $.ajax({
        url: options.userinfo
      }).done(function(data) {
        var use_acl = data.data.use_acl;
        if (use_acl && (!_.isEmpty(use_acl))) {
          options.role = use_acl.role;
          if (use_acl.module_acl && (use_acl.module_acl != 'null')) {
            options.role_current = $.parseJSON(use_acl.module_acl)[options.m_code];
          }
          self.render(opt);
        }
      });
    },
    render: function(opt) {
      // _.extend(this.options, opt);
      var self = this,
        options = this.options;
      $.ajax({
        url: options.schemagetlist,
        data: {
          m_code: options.m_code
        }
      }).done(function(data) {
        self.element.append(self._createSchemaElem(data.data));
      }).fail(function() {});
      if (this.element.hasClass('hide')) {
        this.element.removeClass('hide').addClass('current');
      }
    },
    reRender: function(opt) {
      this.element.addClass('hide').empty();
      this.getUserinfo(opt);
      this.element.removeClass('hide').addClass('current');
    },
    _createSchemaElem: function(data) {
      var self = this,
        options = this.options,
        h = [];
      h.push('<div class="breadcrumbs">');
      h.push('<div class="breadcrumbs-content" data-rel="tooltip">Schema Pool</div>');
      h.push('<div class="table-tool">');
      if (((options.role == '1') && (options.role_current == '3')) || (options.role == '5') || (options.role == '9')) {
        h.push('<button class="btn btn-mini btn-success data-add"><i class="fa fa-plus"></i> 新增</button>');
      }
      h.push('</div>');
      h.push('</div>');
      h.push('<div class="col-xs-12"><table class="table table-bordered"><thead class="thin-border-bottom"><tr>');
      h.push('<th>id</th><th>schema_name</th><th>schema_code</th>');
      if (((options.role == '1') && (options.role_current == '3')) || (options.role == '5') || (options.role == '9')) {
        h.push('<th>操作</th>');
      }
      h.push('</tr></thead><tbody>');
      _.each(data, function(item, index) {
        h.push(self._createSchemaItemElem(item));
      });
      h.push('</tbody></table></div>');
      return h.join('');
    },
    _bindEvents: function() {
      this._on(this.element, {
        'click button.data-add': this._dataAddElem,
        'click a.data-save': this._dataSave,
        'click a.data-edit': this._dataEdit,
        'click a.data-del': this._dataDel,
        'change textarea': this._rowpink
      });
    },
    _createSchemaItemElem: function(item) {
      var h = [],
        options = this.options;
      h.push('<tr  data-schema_code="' + item.schema_code + '"><td>' + item.id + '</td><td>' + item.schema_name + '</td><td>' + item.schema_code + '</td>');
      if (((options.role == '1') && (options.role_current == '3')) || (options.role == '5') || (options.role == '9')) {
        h.push('<td>');
        h.push('<a class="btn btn-link data-edit">编辑</a>');
        h.push('<a class="btn btn-link data-del">删除</a>');
        h.push('</td>');
      }
      h.push('</tr>');
      return h.join('');
    },
    _dataAddElem: function(event) {
      var options = this.options,
        h = [];
      h.push('<tr data-schema_code=""><td></td>');
      h.push('<td><textarea class="schema_name"></textarea></td>');
      h.push('<td><textarea class="schema_code"></textarea></td>');
      h.push('<td><a class="btn btn-link data-save">保存</a><a class="btn btn-link data-del">删除</a></td></tr>');
      $('#schema').find('tbody').prepend(h.join(''));
      return false;
    },
    _dataSave: function(event) {
      var self = this,
        options = this.options,
        $savelink = $(event.target),
        $tr = $savelink.closest('tr'),
        schema_name = $tr.find('textarea.schema_name').val().trim(),
        schema_code = $tr.find('textarea.schema_code').val().trim();
      if ($tr.hasClass('row-pink') && !!schema_code) {
        $.ajax({
          url: options.schemaadd,
          data: {
            m_code: options.m_code,
            schema_name: schema_name,
            schema_code: schema_code,
            schema_content: null
          }
        }).done(function(response) {
          if (!response.errno) {
            self.element.find('tbody').prepend(self._createSchemaItemElem(response.data));
            $tr.remove();
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
      } else {
        //for empty new add item
        notify({
          text: '请确认输入。'
        });
        return false;
      }

      $()
      return false;
    },
    _dataEdit: function(event) {
      this.element.addClass('hide');
      var options = this.options,
        schema_code = $(event.target).closest('tr').attr('data-schema_code'),
        router = new Backbone.Router;
      router.navigate(options.m_code + '/schema/' + schema_code, {
        trigger: true
      });
      return false;
    },
    _dataDel: function(event) {
      var options = this.options,
        $tr = $(event.target).closest('tr'),
        schema_code = $tr.attr('data-schema_code');
      if (!!schema_code) {
        $.ajax({
          url: options.schemadel,
          data: {
            m_code: options.m_code,
            schema_code: schema_code
          }
        }).done(function(response) {
          if (!response.errno) {
            $tr.remove();
            notify({
              text: '删除成功。'
            });
          } else {
            notify({
              text: response.error
            });
          }
        }).fail(function(response) {
          notify({
            text: '删除失败，请稍后再试。'
          });
        });
      } else {
        //delete new item which is not saved
        $tr.remove();
      }
      return false;
    },
    _rowpink: function(event) {
      var $row = $(event.target).closest('tr');
      if (!$row.hasClass('row-pink')) {
        $row.addClass('row-pink');
      }
      return false;
    }
  });
  module.exports = $.cs.schema;
});
